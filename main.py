from flask import Flask, render_template, request, jsonify, send_file, Response
from safeRedis import SafeRedis
from uuid import uuid4
import zipstream
import os
import threading
import time
import zipfile
import io

app = Flask(__name__)
r = SafeRedis()

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

EXPIRY_TIME = 24 * 3600  # 24 hours
CLEANUP_INTERVAL = 3600  # 1 hour

# Set large max upload size (5GB example)
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024 * 1024

@app.route("/", methods=["GET"])
def get_upload_page():
    return render_template("upload.html")

@app.route("/download", methods=["GET"])
def get_download_page():
    return render_template("download.html")

@app.route("/api/upload", methods=["POST"])
def save_files():
    uploaded_files = request.files.getlist('files')  # Accept multiple files

    if not uploaded_files:
        return jsonify(message='No files selected'), 400

    file_key = str(uuid4())
    folder_path = os.path.join(UPLOAD_FOLDER, file_key)
    os.makedirs(folder_path, exist_ok=True)

    for file in uploaded_files:
        save_path = os.path.join(folder_path, file.filename)
        with open(save_path, 'wb') as f:
            while chunk := file.stream.read(4096):
                f.write(chunk)

    # Save folder path to Redis
    r.setex(file_key, EXPIRY_TIME, folder_path)

    return jsonify(message='Files saved successfully!', key=file_key), 200

@app.route("/api/download", methods=["GET"])
def send_zip():
    file_key = request.args.get('key')

    if not file_key:
        return jsonify(message='No key provided'), 400

    folder_path = r.get(file_key)
    if not folder_path:
        return jsonify(message='Files not found or expired'), 404

    folder_path = folder_path.decode()

    if not os.path.exists(folder_path):
        return jsonify(message='Files missing on server'), 404

    z = zipstream.ZipFile(mode='w', compression=zipstream.ZIP_DEFLATED)

    for root, dirs, files in os.walk(folder_path):
        for file in files:
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, folder_path)
            z.write(file_path, arcname)

    return Response(
        z,
        mimetype='application/zip',
        headers={'Content-Disposition': f'attachment; filename={file_key}.zip'},
        direct_passthrough=True
    )

# Cleanup expired folders
def cleanup_files():
    while True:
        print("Running cleanup...")
        for folder_name in os.listdir(UPLOAD_FOLDER):
            folder_path = os.path.join(UPLOAD_FOLDER, folder_name)
            if os.path.isdir(folder_path):
                file_key = folder_name  # Folder name == file_key
                if not r.exists(file_key):
                    print(f"Deleting expired folder: {folder_path}")
                    for root, dirs, files in os.walk(folder_path, topdown=False):
                        for file in files:
                            os.remove(os.path.join(root, file))
                        for dir in dirs:
                            os.rmdir(os.path.join(root, dir))
                    os.rmdir(folder_path)
        time.sleep(CLEANUP_INTERVAL)

if __name__ == "__main__":
    threading.Thread(target=cleanup_files, daemon=True).start()
    app.run(port=8000, threaded=True)  # threaded=True for concurrent uploads in dev
