from flask import Flask, render_template, request, jsonify, send_file
from uuid import uuid4
from redis import Redis
import os
import threading
import time

app = Flask(__name__)
r = Redis(host='localhost', port=6379, db=0)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

EXPIRY_TIME = 24 * 3600  # 24 hours in seconds
CLEANUP_INTERVAL = 3600  # Cleanup every 1 hour

# Optional: limit maximum upload size
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max

@app.route("/", methods=["GET"])
def get_upload_page():
    return render_template("upload.html")

@app.route("/download", methods=["GET"])
def get_download_page():
    return render_template("download.html")

@app.route("/api/upload", methods=["POST"])
def save_zip():
    uploaded_file = request.files['file']

    if uploaded_file.filename == '':
        return jsonify(message='No selected file'), 400

    file_key = str(uuid4())
    filename = f"{file_key}.zip"
    save_path = os.path.join(UPLOAD_FOLDER, filename)
    
    uploaded_file.save(save_path)

    # Save mapping: file_key -> filepath
    r.setex(file_key, EXPIRY_TIME, save_path)

    return jsonify(message='File saved successfully!', key=file_key), 200

@app.route("/api/download", methods=["GET"])
def send_zip():
    file_key = request.args.get('key')

    if not file_key:
        return jsonify(message='No key provided'), 400

    save_path = r.get(file_key)
    if not save_path:
        return jsonify(message='File not found or expired'), 404

    save_path = save_path.decode()

    if not os.path.exists(save_path):
        return jsonify(message='File missing on server'), 404

    return send_file(save_path, as_attachment=True)

# Background cleanup thread
def cleanup_files():
    while True:
        print("Running cleanup...")
        for filename in os.listdir(UPLOAD_FOLDER):
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file_key = filename.rsplit('.', 1)[0]  # remove '.zip'
            if not r.exists(file_key):
                print(f"Deleting expired file: {filename}")
                os.remove(filepath)
        time.sleep(CLEANUP_INTERVAL)

if __name__ == "__main__":
    # Start background cleanup thread
    threading.Thread(target=cleanup_files, daemon=True).start()
    app.run(port=8000, debug=True)
