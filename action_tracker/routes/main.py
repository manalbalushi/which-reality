from flask import Blueprint, render_template, request, redirect, url_for, session, flash

from ..db import get_db
from .. import utils

bp = Blueprint("main", __name__)


@bp.route("/")
def home():
    db = get_db()
    utils.run_reminder_checks(db)
    user_row = utils.get_current_user_row(db)
    unread = 0
    if user_row:
        unread = db.execute(
            "SELECT COUNT(*) AS c FROM notifications WHERE recipient = ? AND is_read = 0",
            (user_row["name"],),
        ).fetchone()["c"]
    return render_template("home.html", unread=unread)


@bp.route("/login", methods=["GET", "POST"])
def login():
    db = get_db()
    users = db.execute("SELECT * FROM users ORDER BY name").fetchall()
    next_url = request.args.get("next") or request.form.get("next") or url_for("main.home")
    if request.method == "POST":
        user_id = request.form.get("user_id")
        user = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if not user:
            flash("Please select a valid user.", "danger")
            return render_template("login.html", users=users, next_url=next_url)
        session["user_name"] = user["name"]
        session["role"] = user["role"]
        session["department"] = user["department"]
        flash(f"Signed in as {user['name']} ({user['role']}).", "success")
        return redirect(next_url)
    return render_template("login.html", users=users, next_url=next_url)


@bp.route("/logout")
def logout():
    session.clear()
    flash("Signed out.", "success")
    return redirect(url_for("main.home"))


@bp.route("/my-actions")
@utils.login_required
def my_actions():
    db = get_db()
    utils.run_reminder_checks(db)
    user = utils.current_user()
    rows = db.execute(
        "SELECT * FROM actions WHERE owner = ? ORDER BY current_target_date ASC", (user,)
    ).fetchall()
    actions = [_augment(r) for r in rows]
    return render_template("my_actions.html", actions=actions)


@bp.route("/notifications")
@utils.login_required
def notifications():
    db = get_db()
    user = utils.current_user()
    role = utils.current_role()
    if role in ("Admin", "Management"):
        rows = db.execute(
            "SELECT * FROM notifications ORDER BY created_at DESC LIMIT 200"
        ).fetchall()
    else:
        rows = db.execute(
            "SELECT * FROM notifications WHERE recipient = ? ORDER BY created_at DESC LIMIT 200",
            (user,),
        ).fetchall()
    db.execute("UPDATE notifications SET is_read = 1 WHERE recipient = ?", (user,))
    db.commit()
    return render_template("notifications.html", notifications=rows)


def _augment(row):
    d = dict(row)
    d["days_open"] = utils.days_open(row)
    d["days_overdue"] = utils.days_overdue(row)
    return d
