import jwt
import string
import random
from models import  User
from functools import wraps
from config import SECRET_KEY
from flask import request, jsonify
from datetime import datetime, timedelta


def generate_code(org_name, length=8):
    org_prefix = ''.join(c.upper() for c in org_name if c.isalpha())[:3]

    if len(org_prefix) < 3:
        org_prefix = org_prefix.ljust(3, 'X')

    remaining_length = length - 3
    random_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=remaining_length))

    return org_prefix + random_suffix

def generate_token(user_id, email):
    payload = {
        "id": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(days=1)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")

        if not token:
            return jsonify({"message": "Token is missing"}), 401

        if token.startswith("Bearer "):
            token = token.split(" ")[1]

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user = User.query.get(data["id"])
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401

        return f(current_user, *args, **kwargs)

    return decorated