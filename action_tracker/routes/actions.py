from flask import Blueprint, render_template, request, redirect, url_for, flash, abort

from ..db import get_db
from .. import utils

bp = Blueprint("actions", __name__)


def _get_action_or_404(db, action_id):
    row = db.execute("SELECT * FROM actions WHERE action_id = ?", (action_id,)).fetchone()
    if not row:
        abort(404)
    return row


def _can_edit(action_row):
    role = utils.current_role()
    return role == "Admin" or action_row["owner"] == utils.current_user()


@bp.route("/action/<action_id>")
@utils.login_required
def detail(action_id):
    db = get_db()
    action = _get_action_or_404(db, action_id)
    history = db.execute(
        "SELECT * FROM update_history WHERE action_id = ? ORDER BY update_date DESC, id DESC",
        (action_id,),
    ).fetchall()
    evidence = db.execute(
        "SELECT * FROM evidence WHERE action_id = ? ORDER BY upload_date DESC, evidence_id DESC",
        (action_id,),
    ).fetchall()
    return render_template(
        "action_detail.html",
        action=action,
        history=history,
        evidence=evidence,
        days_open=utils.days_open(action),
        days_overdue=utils.days_overdue(action),
        can_edit=_can_edit(action),
    )


@bp.route("/update-action", methods=["GET"])
@utils.login_required
def update_action_select():
    db = get_db()
    role = utils.current_role()
    if role == "Admin":
        rows = db.execute("SELECT * FROM actions ORDER BY action_id").fetchall()
    else:
        rows = db.execute(
            "SELECT * FROM actions WHERE owner = ? ORDER BY action_id", (utils.current_user(),)
        ).fetchall()
    preselect = request.args.get("action_id")
    return render_template("update_action_select.html", actions=rows, preselect=preselect)


@bp.route("/update-action/<action_id>", methods=["GET", "POST"])
@utils.login_required
def update_action(action_id):
    db = get_db()
    action = _get_action_or_404(db, action_id)

    if not _can_edit(action):
        flash("Only the action owner or an Admin can update this action.", "danger")
        return redirect(url_for("actions.detail", action_id=action_id))

    if request.method == "POST":
        new_status = request.form.get("status", "").strip()
        comment = request.form.get("comment", "").strip()
        new_target_date = request.form.get("current_target_date", "").strip() or action["current_target_date"]
        completion_pct = request.form.get("completion_pct", "").strip()
        override = request.form.get("override_closure") == "on"
        override_reason = request.form.get("override_reason", "").strip()

        errors = []
        if new_status not in utils.STATUS_OPTIONS:
            errors.append("Please choose a valid status.")
        if not comment:
            errors.append("A progress comment is required for every update.")
        try:
            completion_pct = max(0, min(100, int(completion_pct)))
        except (ValueError, TypeError):
            errors.append("Completion % must be a number between 0 and 100.")
            completion_pct = action["completion_pct"]

        if new_status == "Closed":
            needs_evidence = action["evidence_required"] == "Yes" and action["evidence_status"] != "Accepted"
            if needs_evidence:
                if utils.current_role() == "Admin" and override:
                    if not override_reason:
                        errors.append("An override reason is required to close without accepted evidence.")
                else:
                    errors.append(
                        "This action requires accepted evidence before it can be closed. "
                        "An Admin can override this with a reason."
                    )

        if errors:
            for e in errors:
                flash(e, "danger")
            return render_template(
                "update_action.html", action=action, statuses=utils.STATUS_OPTIONS, form=request.form
            )

        previous_status = action["status"]
        previous_target = action["current_target_date"]
        closure_date = action["closure_date"]
        if new_status == "Closed" and previous_status != "Closed":
            closure_date = utils.today_str()

        db.execute(
            """UPDATE actions SET status=?, completion_pct=?, latest_comment=?,
               current_target_date=?, last_updated=?, closure_date=? WHERE action_id=?""",
            (new_status, completion_pct, comment, new_target_date, utils.now_iso(), closure_date, action_id),
        )
        db.execute(
            """INSERT INTO update_history (
                action_id, update_date, updated_by, previous_status, new_status,
                previous_target_date, new_target_date, comment, evidence_submitted, approval_status
            ) VALUES (?,?,?,?,?,?,?,?,?,?)""",
            (
                action_id, utils.now_iso(), utils.current_user(), previous_status, new_status,
                previous_target, new_target_date, comment, "No", None,
            ),
        )
        utils.log_audit(db, utils.current_user(), "action_updated", action_id,
                         f"Status {previous_status} -> {new_status}, completion {completion_pct}%")

        if new_status == "Closed" and previous_status != "Closed":
            if override:
                utils.log_audit(db, utils.current_user(), "closure_override", action_id, override_reason)
            utils.notify(db, action["owner"], "Action closed", action_id,
                         f"{action_id} \"{action['title']}\" has been closed.")
            utils.notify_role(db, "Management", "Action closed", action_id,
                              f"{action_id} \"{action['title']}\" has been closed.", exclude=action["owner"])

        db.commit()
        flash("Action updated successfully.", "success")
        return redirect(url_for("actions.detail", action_id=action_id))

    return render_template("update_action.html", action=action, statuses=utils.STATUS_OPTIONS, form=None)
