import os
from werkzeug.utils import secure_filename

from flask import (
    Blueprint, render_template, request, redirect, url_for, flash, abort,
    send_from_directory, current_app,
)

from ..db import get_db
from .. import utils

bp = Blueprint("evidence", __name__)


def _get_action_or_404(db, action_id):
    row = db.execute("SELECT * FROM actions WHERE action_id = ?", (action_id,)).fetchone()
    if not row:
        abort(404)
    return row


def _can_upload(action_row):
    role = utils.current_role()
    return role == "Admin" or action_row["owner"] == utils.current_user()


@bp.route("/upload-evidence", methods=["GET"])
@utils.login_required
def upload_select():
    db = get_db()
    role = utils.current_role()
    if role == "Admin":
        rows = db.execute("SELECT * FROM actions ORDER BY action_id").fetchall()
    else:
        rows = db.execute(
            "SELECT * FROM actions WHERE owner = ? ORDER BY action_id", (utils.current_user(),)
        ).fetchall()
    preselect = request.args.get("action_id")
    return render_template("upload_evidence_select.html", actions=rows, preselect=preselect)


@bp.route("/upload-evidence/<action_id>", methods=["GET", "POST"])
@utils.login_required
def upload_evidence(action_id):
    db = get_db()
    action = _get_action_or_404(db, action_id)
    if not _can_upload(action):
        flash("Only the action owner or an Admin can upload evidence for this action.", "danger")
        return redirect(url_for("actions.detail", action_id=action_id))

    if request.method == "POST":
        files = request.files.getlist("files")
        evidence_type = request.form.get("evidence_type", "").strip()
        description = request.form.get("description", "").strip()

        files = [f for f in files if f and f.filename]
        if not files:
            flash("Please choose at least one file to upload.", "danger")
            return render_template("upload_evidence.html", action=action)

        folder = os.path.join(current_app.config["UPLOAD_FOLDER"], "evidence", action_id)
        os.makedirs(folder, exist_ok=True)

        existing_version = db.execute(
            "SELECT COALESCE(MAX(version), 0) AS v FROM evidence WHERE action_id = ?", (action_id,)
        ).fetchone()["v"]
        version = existing_version + 1

        created = []
        for f in files:
            evidence_id = utils.next_evidence_id(db)
            safe_name = secure_filename(f.filename)
            stored_name = f"{evidence_id}_{safe_name}"
            f.save(os.path.join(folder, stored_name))
            db.execute(
                """INSERT INTO evidence (
                    evidence_id, action_id, evidence_name, evidence_type, description,
                    uploaded_by, upload_date, version, evidence_status, file_path
                ) VALUES (?,?,?,?,?,?,?,?,?,?)""",
                (
                    evidence_id, action_id, f.filename, evidence_type, description,
                    utils.current_user(), utils.now_iso(), version, "Submitted", stored_name,
                ),
            )
            created.append(evidence_id)

        db.execute(
            "UPDATE actions SET evidence_status='Submitted', last_updated=? WHERE action_id=?",
            (utils.now_iso(), action_id),
        )
        db.execute(
            """INSERT INTO update_history (
                action_id, update_date, updated_by, previous_status, new_status,
                previous_target_date, new_target_date, comment, evidence_submitted, approval_status
            ) VALUES (?,?,?,?,?,?,?,?,?,?)""",
            (
                action_id, utils.now_iso(), utils.current_user(), action["status"], action["status"],
                action["current_target_date"], action["current_target_date"],
                f"Evidence uploaded: {', '.join(created)}", "Yes", "Pending Review",
            ),
        )
        utils.log_audit(db, utils.current_user(), "evidence_uploaded", action_id, ", ".join(created))
        utils.notify_role(db, "Reviewer", "Evidence submitted", action_id,
                          f"New evidence submitted for {action_id} \"{action['title']}\" and needs review.")
        db.commit()
        flash(f"{len(created)} evidence file(s) uploaded and submitted for review.", "success")
        return redirect(url_for("actions.detail", action_id=action_id))

    return render_template("upload_evidence.html", action=action)


@bp.route("/evidence-review")
@utils.role_required("Reviewer", "Admin")
def review_queue():
    db = get_db()
    pending = db.execute(
        """SELECT e.*, a.title AS action_title, a.owner AS action_owner
           FROM evidence e JOIN actions a ON a.action_id = e.action_id
           WHERE e.evidence_status IN ('Submitted','Under Review')
           ORDER BY e.upload_date ASC"""
    ).fetchall()
    recent = db.execute(
        """SELECT e.*, a.title AS action_title
           FROM evidence e JOIN actions a ON a.action_id = e.action_id
           WHERE e.evidence_status IN ('Accepted','Rejected')
           ORDER BY e.review_date DESC LIMIT 15"""
    ).fetchall()
    return render_template("evidence_review.html", pending=pending, recent=recent)


@bp.route("/evidence-review/<evidence_id>/decision", methods=["POST"])
@utils.role_required("Reviewer", "Admin")
def review_decision(evidence_id):
    db = get_db()
    ev = db.execute("SELECT * FROM evidence WHERE evidence_id = ?", (evidence_id,)).fetchone()
    if not ev:
        abort(404)
    action = db.execute("SELECT * FROM actions WHERE action_id = ?", (ev["action_id"],)).fetchone()

    decision = request.form.get("decision")
    reason = request.form.get("rejection_reason", "").strip()

    if decision not in ("Accepted", "Rejected"):
        flash("Invalid decision.", "danger")
        return redirect(url_for("evidence.review_queue"))
    if decision == "Rejected" and not reason:
        flash("A rejection reason is required.", "danger")
        return redirect(url_for("evidence.review_queue"))

    db.execute(
        """UPDATE evidence SET evidence_status=?, reviewer=?, review_date=?, rejection_reason=?
           WHERE evidence_id=?""",
        (decision, utils.current_user(), utils.now_iso(), reason if decision == "Rejected" else None, evidence_id),
    )
    db.execute(
        "UPDATE actions SET evidence_status=?, last_updated=? WHERE action_id=?",
        (decision, utils.now_iso(), ev["action_id"]),
    )
    db.execute(
        """INSERT INTO update_history (
            action_id, update_date, updated_by, previous_status, new_status,
            previous_target_date, new_target_date, comment, evidence_submitted, approval_status
        ) VALUES (?,?,?,?,?,?,?,?,?,?)""",
        (
            ev["action_id"], utils.now_iso(), utils.current_user(), action["status"], action["status"],
            action["current_target_date"], action["current_target_date"],
            f"Evidence {evidence_id} reviewed: {decision}" + (f" - {reason}" if reason else ""),
            "No", decision,
        ),
    )
    utils.log_audit(db, utils.current_user(), f"evidence_{decision.lower()}", ev["action_id"],
                     f"{evidence_id}: {reason}" if reason else evidence_id)

    if decision == "Accepted":
        utils.notify(db, action["owner"], "Evidence accepted", ev["action_id"],
                     f"Your evidence for {ev['action_id']} \"{action['title']}\" was accepted.")
    else:
        utils.notify(db, action["owner"], "Evidence rejected", ev["action_id"],
                     f"Your evidence for {ev['action_id']} \"{action['title']}\" was rejected: {reason}")

    db.commit()
    flash(f"Evidence {evidence_id} marked {decision}.", "success")
    return redirect(url_for("evidence.review_queue"))


@bp.route("/evidence-file/<action_id>/<path:filename>")
@utils.login_required
def evidence_file(action_id, filename):
    folder = os.path.join(current_app.config["UPLOAD_FOLDER"], "evidence", action_id)
    return send_from_directory(folder, filename)
