from flask import Blueprint, render_template, request, redirect, url_for, flash

from ..db import get_db
from .. import utils

bp = Blueprint("settings", __name__)


@bp.route("/settings", methods=["GET", "POST"])
@utils.role_required("Admin")
def settings():
    db = get_db()
    if request.method == "POST":
        reminder_days = request.form.get("reminder_days_before_due", "5").strip()
        try:
            value = max(1, int(reminder_days))
        except ValueError:
            flash("Reminder days must be a whole number.", "danger")
            return redirect(url_for("settings.settings"))
        utils.set_setting(db, "reminder_days_before_due", str(value))
        utils.log_audit(db, utils.current_user(), "settings_updated", None,
                         f"reminder_days_before_due = {value}")
        db.commit()
        flash("Settings updated.", "success")
        return redirect(url_for("settings.settings"))

    reminder_days = utils.get_setting(db, "reminder_days_before_due", "5")
    users = db.execute("SELECT * FROM users ORDER BY role, name").fetchall()
    audit = db.execute("SELECT * FROM audit_log ORDER BY id DESC LIMIT 50").fetchall()
    return render_template("settings.html", reminder_days=reminder_days, users=users, audit=audit)
