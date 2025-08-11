from flask import Flask, request, jsonify

app = Flask(__name__)

# In-memory "database"
students = []

# Home route
@app.route('/')
def home():
    return jsonify({"message": "Welcome to Eventora API"}), 200

# Add student (POST)
@app.route('/student', methods=['POST'])
def add_student():
    data = request.get_json()
    name = data.get('name')
    mark = data.get('mark', -1)  # -1 means absent

    if not name:
        return jsonify({"error": "Student name is required"}), 400

    students.append({"name": name, "mark": mark})
    return jsonify({"message": "Student added successfully"}), 201

# Get all students (GET)
@app.route('/students', methods=['GET'])
def get_students():
    return jsonify(students), 200

# Get statistics (GET)
@app.route('/stats', methods=['GET'])
def get_stats():
    present_marks = [s['mark'] for s in students if s['mark'] != -1]

    if not present_marks:
        return jsonify({"error": "No marks available"}), 400

    average = sum(present_marks) / len(present_marks)
    highest = max(present_marks)
    lowest = min(present_marks)
    absent_count = len([s for s in students if s['mark'] == -1])

    return jsonify({
        "average": round(average, 2),
        "highest": highest,
        "lowest": lowest,
        "absent_count": absent_count
    }), 200

# Delete student by name (optional)
@app.route('/student/<name>', methods=['DELETE'])
def delete_student(name):
    global students
    students = [s for s in students if s['name'].lower() != name.lower()]
    return jsonify({"message": f"Student '{name}' deleted"}), 200

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
