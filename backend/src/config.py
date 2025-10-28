from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)
CORS(app)

SECRET_KEY = "testing_secret"
DATABASE_URI = os.getenv("DATABASE_URI");
# DATABASE_URI = "postgresql://postgres:ved@31052006@db.gunayisrofhplorrkllf.supabase.co:5432/postgres"

app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", SECRET_KEY)
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
