import os
from flask import Flask

from . import db as db_module


def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY="dev-secret-change-in-production",
        DATABASE=os.path.join(app.instance_path, "action_tracker.db"),
        UPLOAD_FOLDER=os.path.join(app.instance_path, "uploads"),
        MAX_CONTENT_LENGTH=25 * 1024 * 1024,  # 25MB per request
    )
    if test_config:
        app.config.update(test_config)

    os.makedirs(app.instance_path, exist_ok=True)
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
