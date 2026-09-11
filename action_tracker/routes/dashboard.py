import json
from collections import Counter, defaultdict

from flask import Blueprint, render_template

from ..db import get_db
from .. import utils

bp = Blueprint("dashboard", __name__)


@bp.route("/dashboard")
@utils.login_required
def dashboard():
    db = get_db()
    utils.run_reminder_checks(db)
    rows = db.execute("SELECT * FROM actions").fetchall()
    actions = [dict(r) for r in rows]
    for a in actions:
        a["days_overdue"] = utils.days_overdue(a)

    total = len(actions)
    status_counts = Counter(a["status"] for a in actions)
    completed = status_counts.get("Completed", 0) + status_counts.get("Closed", 0)
    in_progress = status_counts.get("In Progress", 0)
    not_started = status_counts.get("Not Started", 0)
    overdue = sum(1 for a in actions if a["days_overdue"] > 0)
    pending_validation = status_counts.get("Pending Validation", 0)

    reminder_days = int(utils.get_setting(db, "reminder_days_before_due", "5") or 5)
    due_soon = 0
    for a in actions:
        target = utils.parse_date(a["current_target_date"])
        if not target or a["status"] in ("Completed", "Closed"):
            continue
        delta = (target - utils.today()).days
        if 0 <= delta <= reminder_days:
            due_soon += 1

    evidence_rows = [dict(r) for r in db.execute("SELECT * FROM evidence").fetchall()]
    evidence_pending = sum(1 for e in evidence_rows if e["evidence_status"] in ("Submitted", "Under Review"))
    evidence_rejected = sum(1 for e in evidence_rows if e["evidence_status"] == "Rejected")

    completion_pct = round((completed / total) * 100) if total else 0

    by_owner = Counter(a["owner"] for a in actions)
    by_department = Counter(a["department"] or "Unassigned" for a in actions)
    by_priority = Counter(a["priority"] for a in actions)
    by_source = Counter(a["source"] or "Unspecified" for a in actions)

    monthly_trend = _monthly_completion_trend(actions)

    top_overdue = sorted(
        [a for a in actions if a["days_overdue"] > 0],
        key=lambda a: a["days_overdue"],
        reverse=True,
    )[:10]

    charts = {
        "status": {"labels": list(status_counts.keys()), "data": list(status_counts.values())},
        "owner": {"labels": list(by_owner.keys()), "data": list(by_owner.values())},
        "department": {"labels": list(by_department.keys()), "data": list(by_department.values())},
        "priority": {"labels": list(by_priority.keys()), "data": list(by_priority.values())},
        "source": {"labels": list(by_source.keys()), "data": list(by_source.values())},
        "trend": {"labels": [m for m, _ in monthly_trend], "data": [c for _, c in monthly_trend]},
    }

    kpis = dict(
        total=total, completed=completed, in_progress=in_progress, not_started=not_started,
        overdue=overdue, due_soon=due_soon, pending_validation=pending_validation,
        evidence_pending=evidence_pending, evidence_rejected=evidence_rejected,
        completion_pct=completion_pct,
    )

    return render_template(
        "dashboard.html", kpis=kpis, charts_json=json.dumps(charts), top_overdue=top_overdue,
        reminder_days=reminder_days,
    )


def _monthly_completion_trend(actions):
    counts = defaultdict(int)
    for a in actions:
        if a["status"] in ("Completed", "Closed") and a.get("closure_date"):
            month = str(a["closure_date"])[:7]
            counts[month] += 1
    months = sorted(counts.keys())
    return [(m, counts[m]) for m in months]
