import os
import secrets
from flask import Flask

from . import db as db_module


def _load_secret_key(instance_path):
    """A stable per-install secret so signed-in sessions survive a restart,
    without hard-coding one shared value in source control."""
    env_key = os.environ.get("SECRET_KEY")
    if env_key:
        return env_key
    key_path = os.path.join(instance_path, "secret_key")
    if os.path.exists(key_path):
        with open(key_path) as f:
            return f.read().strip()
    key = secrets.token_hex(32)
    with open(key_path, "w") as f:
        f.write(key)
    return key


def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    os.makedirs(app.instance_path, exist_ok=True)
    app.config.from_mapping(
        SECRET_KEY=_load_secret_key(app.instance_path),
        DATABASE=os.path.join(app.instance_path, "action_tracker.db"),
        UPLOAD_FOLDER=os.path.join(app.instance_path, "uploads"),
        MAX_CONTENT_LENGTH=25 * 1024 * 1024,  # 25MB per request
    )
    if test_config:
        app.config.update(test_config)

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    os.makedirs(os.path.join(app.config["UPLOAD_FOLDER"], "evidence"), exist_ok=True)
    os.makedirs(os.path.join(app.config["UPLOAD_FOLDER"], "imports"), exist_ok=True)

    db_module.init_app(app)

    from .routes import main, actions, evidence, dashboard, register, importer, settings as settings_bp

    app.register_blueprint(main.bp)
    app.register_blueprint(actions.bp)
    app.register_blueprint(evidence.bp)
    app.register_blueprint(dashboard.bp)
    app.register_blueprint(register.bp)
    app.register_blueprint(importer.bp)
    app.register_blueprint(settings_bp.bp)

    from . import utils
    app.jinja_env.filters["dateonly"] = utils.dateonly

    return app
