"""Seed sample users, settings and demo actions so the prototype is usable
immediately. Safe to call repeatedly - only seeds when tables are empty."""
from datetime import date, timedelta


def run(db):
    _seed_users(db)
    _seed_settings(db)
    _seed_actions(db)
    db.commit()


def _seed_users(db):
    count = db.execute("SELECT COUNT(*) AS c FROM users").fetchone()["c"]
    if count:
        return
    users = [
        ("Manal Albalushi", "manal.h.albalushi@outlook.com", "Admin", "Executive"),
        ("Sara Al Hinai", "sara.alhinai@example.com", "Reviewer", "Risk & Compliance"),
        ("Ahmed Al Balushi", "ahmed.albalushi@example.com", "Owner", "IT Security"),
        ("Fatma Al Siyabi", "fatma.alsiyabi@example.com", "Owner", "Finance"),
        ("Yousuf Al Harthy", "yousuf.alharthy@example.com", "Owner", "Operations"),
        ("Layla Al Kindi", "layla.alkindi@example.com", "Management", "Executive"),
    ]
    db.executemany(
        "INSERT INTO users (name, email, role, department) VALUES (?, ?, ?, ?)",
        users,
    )


def _seed_settings(db):
    count = db.execute("SELECT COUNT(*) AS c FROM settings").fetchone()["c"]
    if count:
        return
    db.execute(
        "INSERT INTO settings (key, value) VALUES (?, ?)",
        ("reminder_days_before_due", "5"),
    )


def _seed_actions(db):
    count = db.execute("SELECT COUNT(*) AS c FROM actions").fetchone()["c"]
    if count:
        return

    today = date.today()

    def d(offset):
        return (today + timedelta(days=offset)).isoformat()

    now = date.today().isoformat()

    demo = [
        dict(
            action_id="ACTION-0001",
            title="Remediate critical vulnerability on external firewall",
            description="Patch CVE flagged in Q3 penetration test on the perimeter firewall cluster.",
            owner="Ahmed Al Balushi",
            department="IT Security",
            priority="Critical",
            source="Penetration Test 2026",
            date_raised=d(-40),
            original_target_date=d(-10),
            current_target_date=d(-10),
            status="Overdue",
            completion_pct=60,
            latest_comment="Patch scheduled for next maintenance window, delayed due to change freeze.",
            evidence_required="Yes",
            evidence_status="Not Submitted",
        ),
        dict(
            action_id="ACTION-0002",
            title="Update Business Continuity Plan contact list",
            description="Refresh emergency contact list following Q2 reorganisation.",
            owner="Fatma Al Siyabi",
            department="Finance",
            priority="Medium",
            source="Internal Audit",
            date_raised=d(-20),
            original_target_date=d(15),
            current_target_date=d(15),
            status="In Progress",
            completion_pct=40,
            latest_comment="Draft list circulated for confirmation.",
            evidence_required="Yes",
            evidence_status="Not Submitted",
        ),
        dict(
            action_id="ACTION-0003",
            title="Complete annual access recertification for ERP system",
            description="Review and confirm user access rights for the ERP platform.",
            owner="Yousuf Al Harthy",
            department="Operations",
            priority="High",
            source="ISO 27001 Audit",
            date_raised=d(-15),
            original_target_date=d(3),
            current_target_date=d(3),
            status="Pending Validation",
            completion_pct=90,
            latest_comment="Recertification completed, evidence submitted for review.",
            evidence_required="Yes",
            evidence_status="Submitted",
        ),
        dict(
            action_id="ACTION-0004",
            title="Deploy MFA for all privileged accounts",
            description="Enforce multi-factor authentication on all domain admin accounts.",
            owner="Ahmed Al Balushi",
            department="IT Security",
            priority="Critical",
            source="Risk Assessment",
            date_raised=d(-60),
            original_target_date=d(-30),
            current_target_date=d(-30),
            status="Completed",
            completion_pct=100,
            latest_comment="MFA enforced and validated across all privileged accounts.",
            evidence_required="Yes",
            evidence_status="Accepted",
            closure_date=d(-25),
        ),
        dict(
            action_id="ACTION-0005",
            title="Vendor due diligence questionnaire - new payroll provider",
            description="Complete third-party risk assessment before contract signature.",
            owner="Fatma Al Siyabi",
            department="Finance",
            priority="Medium",
            source="Third Party Risk Review",
            date_raised=d(-5),
            original_target_date=d(25),
            current_target_date=d(25),
            status="Not Started",
            completion_pct=0,
            latest_comment=None,
            evidence_required="No",
            evidence_status="Not Submitted",
        ),
    ]

    for a in demo:
        db.execute(
            """INSERT INTO actions (
                action_id, title, description, owner, department, priority, source,
                date_raised, original_target_date, current_target_date, status,
                completion_pct, latest_comment, last_updated, evidence_required,
                evidence_status, closure_date, legacy_id, created_at, created_by
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (
                a["action_id"], a["title"], a["description"], a["owner"], a["department"],
                a["priority"], a["source"], a["date_raised"], a["original_target_date"],
                a["current_target_date"], a["status"], a["completion_pct"], a["latest_comment"],
                now, a["evidence_required"], a["evidence_status"], a.get("closure_date"),
                None, now, "System (seed)",
            ),
        )
        db.execute(
            """INSERT INTO update_history (
                action_id, update_date, updated_by, previous_status, new_status,
                previous_target_date, new_target_date, comment, evidence_submitted, approval_status
            ) VALUES (?,?,?,?,?,?,?,?,?,?)""",
            (
                a["action_id"], now, "System (seed)", None, "Not Started",
                None, a["original_target_date"], "Action created.", "No", None,
            ),
        )

    # Evidence for the completed / pending-validation actions
    db.execute(
        """INSERT INTO evidence (
            evidence_id, action_id, evidence_name, evidence_type, description,
            uploaded_by, upload_date, version, evidence_status, reviewer, review_date,
            rejection_reason, file_path
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (
            "EVD-0001", "ACTION-0004", "MFA enforcement screenshot report.pdf", "Screenshot/Report",
            "Export from Entra ID showing MFA enforced on all privileged accounts.",
            "Ahmed Al Balushi", d(-27), 1, "Accepted", "Sara Al Hinai", d(-26), None, None,
        ),
    )
    db.execute(
        """INSERT INTO evidence (
            evidence_id, action_id, evidence_name, evidence_type, description,
            uploaded_by, upload_date, version, evidence_status, reviewer, review_date,
            rejection_reason, file_path
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (
            "EVD-0002", "ACTION-0003", "ERP access recertification sign-off.xlsx", "Sign-off document",
            "Completed recertification spreadsheet signed by department heads.",
            "Yousuf Al Harthy", d(-1), 1, "Submitted", None, None, None, None,
        ),
    )
