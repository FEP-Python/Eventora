from org import org_bp
from team import team_bp
from auth import auth_bp
from event import event_bp
from config import app, db

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(org_bp, url_prefix='/org')
app.register_blueprint(event_bp, url_prefix='/event')
app.register_blueprint(team_bp, url_prefix='/team')

if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(debug=True)