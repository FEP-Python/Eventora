from config import db
from lib import generate_token
from models import User, UserRole
from sqlalchemy.exc import IntegrityError
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint('auth', __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    first_name = request.json.get("firstName")
    last_name = request.json.get("lastName")
    email = request.json.get("email")
    password = request.json.get("password")
    role = request.json.get("role", UserRole.MEMBER)

    if not all([first_name, last_name, email, password, role]):
        return jsonify({"message": "All fields are required!"}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"message": "Email is already registered"}), 409

    hashed_password = generate_password_hash(password)

    new_user = User(
        first_name=first_name,
        last_name=last_name,
        email=email,
        password=hashed_password,
        role=role,
    )

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User created"}, 201)
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Database integrity error"}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify(({"message": str(e)}), 400)

@auth_bp.route("/login", methods=["POST"])
def login():
    email = request.json.get("email")
    password = request.json.get("password")

    if not email or not password:
        return jsonify({"message": "All fields are required!"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "Invalid credentials"}), 404

    if not check_password_hash(user.password, password):
        return jsonify({"message": "Invalid credentials"}), 401

    token = generate_token(user_id=user.id, email=email)

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": user.to_json()
    }), 200