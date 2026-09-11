import functools
from datetime import date, datetime

from flask import session, redirect, url_for, flash, request

from .db import get_db

STATUS_OPTIONS = [
    "Not Started",
    "In Progress",
    "Pending Validation",
    "Completed",
    "Overdue",
    "Closed",
]
PRIORITY_OPTIONS = ["Low", "Medium", "High", "Critical"]
EVIDENCE_STATUS_OPTIONS = ["Not Submitted", "Submitted", "Under Review", "Accepted", "Rejected"]
EVIDENCE_REVIEW_STATES = ["Submitted", "Under Review"]
YES_NO = ["Yes", "No"]
ROLES = ["Owner", "Reviewer", "Admin", "Management"]

OPEN_STATUSES = ("Not Started", "In Progress", "Pending Validation", "Overdue")


def now_iso():
    return datetime.now().isoformat(timespec="seconds")


def today():
    return date.today()


def today_str():
    return date.today().isoformat()


def dateonly(value):
    if not value:
        return "-"
    return str(value)[:10]


def parse_date(value):
    if not value:
        return None
    try:
        return datetime.strptime(value[:10], "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return None


def days_open(action_row):
    raised = parse_date(action_row["date_raised"])
    if not raised:
        return None
    end = today()
    if action_row["status"] in ("Completed", "Closed"):
        end = parse_date(action_row["closure_date"]) or end
    return (end - raised).days


def days_overdue(action_row):
    if action_row["status"] in ("Completed", "Closed"):
        return 0
    target = parse_date(action_row["current_target_date"])
    if not target:
        return 0
    delta = (today() - target).days
    return delta if delta > 0 else 0


def next_id(db, table, id_column, prefix):
    row = db.execute(
        f"SELECT {id_column} FROM {table} WHERE {id_column} LIKE ? ORDER BY {id_column} DESC LIMIT 1",
        (f"{prefix}-%",),
    ).fetchone()
    if not row:
        return f"{prefix}-0001"
    last_num = int(row[id_column].split("-")[-1])
    return f"{prefix}-{last_num + 1:04d}"


def next_action_id(db):
    return next_id(db, "actions", "action_id", "ACTION")


def next_evidence_id(db):
    return next_id(db, "evidence", "evidence_id", "EVD")


def get_setting(db, key, default=None):
    row = db.execute("SELECT value FROM settings WHERE key = ?", (key,)).fetchone()
    return row["value"] if row else default


def set_setting(db, key, value):
    db.execute(
        "INSERT INTO settings (key, value) VALUES (?, ?) "
        "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        (key, value),
    )


def log_audit(db, actor, action_type, action_id, details):
    db.execute(
        "INSERT INTO audit_log (timestamp, actor, action_type, action_id, details) VALUES (?,?,?,?,?)",
        (now_iso(), actor, action_type, action_id, details),
    )


def notify(db, recipient, event_type, action_id, message):
    if not recipient:
        return
    db.execute(
        "INSERT INTO notifications (recipient, event_type, action_id, message, created_at) "
        "VALUES (?,?,?,?,?)",
        (recipient, event_type, action_id, message, now_iso()),
    )


def notify_role(db, role, event_type, action_id, message, exclude=None):
    users = db.execute("SELECT name FROM users WHERE role = ?", (role,)).fetchall()
    for u in users:
        if exclude and u["name"] == exclude:
            continue
        notify(db, u["name"], event_type, action_id, message)


def current_user():
    return session.get("user_name")


def current_role():
    return session.get("role")


def get_current_user_row(db):
    name = current_user()
    if not name:
        return None
    return db.execute("SELECT * FROM users WHERE name = ?", (name,)).fetchone()


def login_required(view):
    @functools.wraps(view)
    def wrapped(*args, **kwargs):
        if not current_user():
            flash("Please choose a user to sign in as.", "warning")
            return redirect(url_for("main.login", next=request.path))
        return view(*args, **kwargs)
    return wrapped


def role_required(*roles):
    def decorator(view):
        @functools.wraps(view)
        @login_required
        def wrapped(*args, **kwargs):
            if current_role() not in roles:
                flash(f"That action requires one of these roles: {', '.join(roles)}.", "danger")
                return redirect(url_for("main.home"))
            return view(*args, **kwargs)
        return wrapped
    return decorator


def run_reminder_checks(db):
    """Idempotent, per-day reminder/overdue notification generation."""
    reminder_days = int(get_setting(db, "reminder_days_before_due", "5") or 5)
    actions = db.execute(
        "SELECT * FROM actions WHERE status NOT IN ('Completed','Closed')"
    ).fetchall()
    today_iso = today_str()
    for a in actions:
        target = parse_date(a["current_target_date"])
        if not target:
            continue
        delta = (target - today()).days

        if 0 <= delta <= reminder_days:
            _notify_once(db, a, "Target date approaching", today_iso,
                         f"{a['action_id']} \"{a['title']}\" is due on {a['current_target_date']} "
                         f"({delta} day(s) left).")
        elif delta < 0 and a["status"] != "Overdue":
            db.execute(
                "UPDATE actions SET status = 'Overdue', last_updated = ? WHERE action_id = ?",
                (now_iso(), a["action_id"]),
            )
            _notify_once(db, a, "Action overdue", today_iso,
                         f"{a['action_id']} \"{a['title']}\" is now overdue "
                         f"(target date was {a['current_target_date']}).")
        elif delta < 0:
            _notify_once(db, a, "Action overdue", today_iso,
                         f"{a['action_id']} \"{a['title']}\" is still overdue "
                         f"(target date was {a['current_target_date']}).")
    db.commit()


def _notify_once(db, action_row, event_type, today_iso, message):
    existing = db.execute(
        "SELECT id FROM notifications WHERE action_id = ? AND event_type = ? "
        "AND substr(created_at,1,10) = ?",
        (action_row["action_id"], event_type, today_iso),
    ).fetchone()
    if existing:
        return
    notify(db, action_row["owner"], event_type, action_row["action_id"], message)
