from src.org import org_bp
from src.user import user_bp
from src.task import task_bp
from src.team import team_bp
from src.auth import auth_bp
from src.event import event_bp
from src.budget import budget_bp
from src.config import app, db

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(user_bp, url_prefix='/api/user')
app.register_blueprint(org_bp, url_prefix='/api/org')
app.register_blueprint(team_bp, url_prefix='/api/team')
app.register_blueprint(task_bp, url_prefix='/api/task')
app.register_blueprint(event_bp, url_prefix='/api/event')
app.register_blueprint(budget_bp, url_prefix='/api/budget')

if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(host="0.0.0.0", port=5000)
