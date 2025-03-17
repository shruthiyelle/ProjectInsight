from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import os
import cv2
import pymongo
import face_recognition
import pickle
import smtplib
from email.message import EmailMessage
import ssl
import base64
from io import BytesIO
import numpy as np
from PIL import Image

app = Flask(__name__)
CORS(app)

class AttendanceSystem:
    def __init__(self):
        self.newUserEncoding = []
        self.most_recent_capture_arr = None
        self.most_recent_capture_pil = None
        self.is_registered = False

    def send_email(self, email, name):
        sender_email = "dheerajveerlapati123@gmail.com"
        email_pass = "wsuw jxqz onmu npjs"
        receiver_email = email

        subject = "Welcome to FaceRecognition Based Attendance System"
        message = (
            f"Dear <b>{name}</b>,</span>\n\n"
            "Welcome to our face recognition based attendance system! 🎉 "
            "We are thrilled to have you join us. "
            "If you have any questions, feel free to reach out. "
            "<b>Thank You for joining us</b>"
        )

        em = EmailMessage()
        em["From"] = sender_email
        em["To"] = receiver_email
        em["Subject"] = subject
        em.add_alternative(message, subtype='html')

        context = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as smtp:
            smtp.login(sender_email, email_pass)
            smtp.sendmail(sender_email, receiver_email, em.as_string())

attendance_system = AttendanceSystem()

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    roll = data.get('roll')
    division = data.get('division')
    department = data.get('department')
    year = data.get('year')
    email = data.get('email')

    client = pymongo.MongoClient("mongodb://localhost:27017")
    db = client[department]
    collection = db[year]

    if collection.find_one({"_id": roll}):
        return jsonify({"error": "Duplicate Roll ID"}), 400

    if not all([name, roll, division, department, year, email]):
        return jsonify({"error": "All fields are required"}), 400

    time_stamp = datetime.now()
    data = {
        "_id": roll,
        "name": name,
        "division": division,
        "email": email,
        "time": time_stamp.strftime("%H:%M:%S"),
        "Attendance_Count": 0,
        "last_attendance_time": time_stamp.strftime("%Y-%m-%d %H:%M:%S")
    }
    collection.insert_one(data)
    attendance_system.send_email(email, name)
    return jsonify({"message": "Registered successfully, proceed to capture"}), 200


@app.route('/capture', methods=['POST'])
def capture():
    data = request.json
    department = data.get('department')
    year = data.get('year')
    roll = data.get('roll')
    image_base64 = data.get('image')  # Expect Base64 image from frontend

    if not image_base64:
        return jsonify({"error": "No image provided"}), 400

    # Decode Base64 image
    frame = cv2.imdecode(np.frombuffer(base64.b64decode(image_base64), np.uint8), cv2.IMREAD_COLOR)
    if frame is None:
        return jsonify({"error": "Invalid image data"}), 400

    # Debugging: Check image dimensions and content
    print(f"Image shape: {frame.shape}")
    cv2.imwrite("debug_original.png", frame)  # Save original image for inspection

    # Reduce size less aggressively (e.g., 50% instead of 25%)
    frameS = cv2.resize(frame, (0, 0), fx=0.5, fy=0.5)
    frameS = cv2.cvtColor(frameS, cv2.COLOR_BGR2RGB)
    print(f"Resized image shape: {frameS.shape}")

    # Attempt face detection
    user_encoding = face_recognition.face_encodings(frameS)
    if not user_encoding:
        return jsonify({"error": "No face detected in the captured frame"}), 400

    try:
        with open("encodingOfKnow.p", "rb") as file:
            attendance_system.newUserEncoding = pickle.load(file)
    except (EOFError, FileNotFoundError):
        attendance_system.newUserEncoding = []

    for saved_encoding, db_info in attendance_system.newUserEncoding:
        if face_recognition.compare_faces([saved_encoding], user_encoding[0])[0]:
            return jsonify({"message": "Already registered"}), 200

    # Save the image
    image_filename = f"captureWebcam/{department}_{year}_{roll}.png"
    os.makedirs("captureWebcam", exist_ok=True)
    print(f"Saving image to: {os.path.abspath(image_filename)}")  # Debug the absolute path
    success = cv2.imwrite(image_filename, frame)
    if not success:
        print(f"Failed to save image to {image_filename}")
        return jsonify({"error": "Failed to save image"}), 500

    encode = face_recognition.face_encodings(cv2.cvtColor(cv2.imread(image_filename), cv2.COLOR_BGR2RGB))[0]
    attendance_system.newUserEncoding.append([encode, f"{department}_{year}_{roll}"])
    with open("encodingOfKnow.p", "wb") as file:
        pickle.dump(attendance_system.newUserEncoding, file)

    return jsonify({"message": "Capture successful"}), 200


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    department = data.get('department')
    year = data.get('year')
    image_base64 = data.get('image')

    if not image_base64:
        return jsonify({"error": "No image provided"}), 400

    if not department or not year:
        return jsonify({"error": "Department and year are required"}), 400

    # Decode Base64 image
    frame = cv2.imdecode(np.frombuffer(base64.b64decode(image_base64), np.uint8), cv2.IMREAD_COLOR)
    if frame is None:
        return jsonify({"error": "Invalid image data"}), 400

    # Debugging: Save the login image
    cv2.imwrite("debug_login.png", frame)
    print(f"Login image shape: {frame.shape}")

    frameS = cv2.resize(frame, (0, 0), fx=0.5, fy=0.5)
    frameS = cv2.cvtColor(frameS, cv2.COLOR_BGR2RGB)
    user_encoding = face_recognition.face_encodings(frameS)

    if not user_encoding:
        print("No face detected in login image")
        return jsonify({"error": "No face detected"}), 400

    print(f"Detected {len(user_encoding)} face(s) in login image")

    try:
        with open("encodingOfKnow.p", "rb") as file:
            attendance_system.newUserEncoding = pickle.load(file)
    except (EOFError, FileNotFoundError):
        print("No registered users found in encodingOfKnow.p")
        return jsonify({"error": "No registered users"}), 404

    print(f"Loaded {len(attendance_system.newUserEncoding)} known encodings")

    for saved_encoding, db_info in attendance_system.newUserEncoding:
        print(f"Comparing with encoding for {db_info}")
        if face_recognition.compare_faces([saved_encoding], user_encoding[0])[0]:
            dept, yr, roll = db_info.split("_")
            if dept != department or yr != year:
                print(f"Department/year mismatch: {dept}/{yr} vs {department}/{year}")
                continue

            client = pymongo.MongoClient("mongodb://localhost:27017")
            collection = client[dept][yr]
            document = collection.find_one({"_id": roll})

            if document:
                current_time = datetime.now()
                last_time = datetime.strptime(document["last_attendance_time"], "%Y-%m-%d %H:%M:%S")
                if (current_time - last_time).total_seconds() > 20:
                    collection.update_one({"_id": roll}, {
                        "$set": {
                            "last_attendance_time": current_time.strftime("%Y-%m-%d %H:%M:%S"),
                            "time": current_time.strftime("%H:%M:%S")
                        },
                        "$inc": {"Attendance_Count": 1}
                    })
                    # Fetch the updated document
                    updated_doc = collection.find_one({"_id": roll})
                    print(f"Login successful for {roll}")
                    # Convert MongoDB document to a JSON-serializable format
                    user_details = {
                        "roll": updated_doc["_id"],
                        "name": updated_doc["name"],
                        "division": updated_doc["division"],
                        "email": updated_doc["email"],
                        "time": updated_doc["time"],
                        "attendance_count": updated_doc["Attendance_Count"],
                        "last_attendance_time": updated_doc["last_attendance_time"]
                    }
                    return jsonify({
                        "message": "Login successful",
                        "user": user_details
                    }), 200
                print("Wait 20 seconds before next login")
                return jsonify({"message": "Wait 20 seconds"}), 429
            print(f"Student {roll} not found in MongoDB")
            return jsonify({"error": "User not found"}), 404

    print("No matching face found")
    return jsonify({"error": "User not recognized"}), 404

@app.route('/admin/remove', methods=['POST'])
def remove_user():
    data = request.json
    department = data.get('department')
    year = data.get('year')
    roll = data.get('roll')

    client = pymongo.MongoClient("mongodb://localhost:27017")
    collection = client[department][year]
    collection.delete_one({"_id": roll})

    user_id = f"{department}_{year}_{roll}"
    image_path = f"captureWebcam/{user_id}.png"
    if os.path.exists(image_path):
        os.remove(image_path)

    try:
        with open("encodingOfKnow.p", "rb") as file:
            encodings = pickle.load(file)
        updated_encodings = [e for e in encodings if e[1] != user_id]
        with open("encodingOfKnow.p", "wb") as file:
            pickle.dump(updated_encodings, file)
    except:
        pass

    return jsonify({"message": "User removed"}), 200

@app.route('/admin/attendance', methods=['POST'])
def get_attendance():
    data = request.json
    department = data.get('department')
    year = data.get('year')
    roll = data.get('roll')

    client = pymongo.MongoClient("mongodb://localhost:27017")
    collection = client[department][year]
    document = collection.find_one({"_id": roll})

    if document:
        return jsonify({"name": document["name"], "attendance": document["Attendance_Count"]}), 200
    return jsonify({"error": "User not found"}), 404

@app.route('/admin/group', methods=['POST'])
def group_attendance():
    data = request.form
    department = data.get('department')
    year = data.get('year')
    file = request.files.get('image')

    group_image = cv2.imdecode(np.frombuffer(file.read(), np.uint8), cv2.IMREAD_COLOR)
    group_image_rgb = cv2.cvtColor(group_image, cv2.COLOR_BGR2RGB)
    face_encodings = face_recognition.face_encodings(group_image_rgb)

    if not face_encodings:
        return jsonify({"error": "No faces detected"}), 400

    with open("encodingOfKnow.p", "rb") as file:
        all_encodings = pickle.load(file)

    registered = [e for e in all_encodings if e[1].startswith(f"{department}_{year}_")]
    presentees = []
    all_registered = {e[1]: False for e in registered}

    for face_encoding in face_encodings:
        for saved_encoding, user_info in registered:
            if face_recognition.compare_faces([saved_encoding], face_encoding, tolerance=0.6)[0]:
                presentees.append(user_info)
                all_registered[user_info] = True

    absentees = [user_info for user_info, present in all_registered.items() if not present]
    client = pymongo.MongoClient("mongodb://localhost:27017")
    collection = client[department][year]

    presentee_details = [collection.find_one({"_id": u.split("_")[2]}) for u in presentees]
    absentee_details = [collection.find_one({"_id": u.split("_")[2]}) for u in absentees]

    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    for user_info in presentees:
        roll = user_info.split("_")[2]
        collection.update_one({"_id": roll},
                              {"$inc": {"Attendance_Count": 1}, "$set": {"last_attendance_time": current_time}})

    return jsonify({
        "presentees": [{"roll": d["_id"], "name": d["name"]} for d in presentee_details if d],
        "absentees": [{"roll": d["_id"], "name": d["name"]} for d in absentee_details if d]
    }), 200

if __name__ == "__main__":
    app.run(debug=True, port=5000)