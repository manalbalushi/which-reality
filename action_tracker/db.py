import sqlite3
import click
from flask import current_app, g

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    role TEXT NOT NULL CHECK(role IN ('Owner','Reviewer','Admin','Management')),
    department TEXT
);

CREATE TABLE IF NOT EXISTS actions (
    action_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    owner TEXT NOT NULL,
    department TEXT,
    priority TEXT NOT NULL DEFAULT 'Medium',
    source TEXT,
    date_raised TEXT NOT NULL,
    original_target_date TEXT,
    current_target_date TEXT,
    status TEXT NOT NULL DEFAULT 'Not Started',
    completion_pct INTEGER NOT NULL DEFAULT 0,
    latest_comment TEXT,
    last_updated TEXT,
    evidence_required TEXT NOT NULL DEFAULT 'Yes',
    evidence_status TEXT NOT NULL DEFAULT 'Not Submitted',
    closure_date TEXT,
    legacy_id TEXT,
    created_at TEXT,
    created_by TEXT
);

CREATE TABLE IF NOT EXISTS update_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action_id TEXT NOT NULL,
    update_date TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    previous_status TEXT,
    new_status TEXT,
    previous_target_date TEXT,
    new_target_date TEXT,
    comment TEXT,
    evidence_submitted TEXT,
    approval_status TEXT,
    FOREIGN KEY(action_id) REFERENCES actions(action_id)
);

CREATE TABLE IF NOT EXISTS evidence (
    evidence_id TEXT PRIMARY KEY,
    action_id TEXT NOT NULL,
    evidence_name TEXT NOT NULL,
    evidence_type TEXT,
    description TEXT,
    uploaded_by TEXT,
    upload_date TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    evidence_status TEXT NOT NULL DEFAULT 'Submitted',
    reviewer TEXT,
    review_date TEXT,
    rejection_reason TEXT,
    file_path TEXT,
    FOREIGN KEY(action_id) REFERENCES actions(action_id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient TEXT,
    event_type TEXT,
    action_id TEXT,
    message TEXT,
    created_at TEXT,
    is_read INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT,
    actor TEXT,
    action_type TEXT,
    action_id TEXT,
    details TEXT
);

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
);

CREATE INDEX IF NOT EXISTS idx_history_action ON update_history(action_id);
CREATE INDEX IF NOT EXISTS idx_evidence_action ON evidence(action_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient);
"""


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(
            current_app.config["DATABASE"], detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


def close_db(e=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    db = get_db()
    db.executescript(SCHEMA)
    db.commit()
    from . import seed
    seed.run(db)


@click.command("init-db")
def init_db_command():
    """Create tables and seed sample data."""
    init_db()
    click.echo("Database initialised.")


def init_app(app):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)
    with app.app_context():
        import os
        db_exists = os.path.exists(app.config["DATABASE"])
        if not db_exists:
            init_db()
