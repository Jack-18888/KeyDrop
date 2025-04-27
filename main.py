from flask import Flask, render_template, request, jsonify, Response
from uuid import uuid4
from redis import Redis
import os


app = Flask(__name__)
r = Redis(host='localhost', port=6379, db=0)
save_time = 26 * 3600


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

    file_data = uploaded_file.read()  # Read file as bytes

    # Save the file bytes into Redis with 24-hour expiration
    r.setex(file_key, 24 * 3600, file_data)

    return jsonify(message='File saved successfully!', key=file_key), 200


@app.route("/api/download", methods=["GET"])
def send_zip():
    file_key = request.args.get('key')

    if not file_key:
        return jsonify(message='No key provided'), 400

    file_data = r.get(file_key)
    if not file_data:
        return jsonify(message='File not found or expired'), 404

    return Response(
        file_data,
        mimetype='application/zip',
        headers={"Content-Disposition": f"attachment;filename={file_key}.zip"}
    )


if __name__ == "__main__":
    app.run(port=8000, debug=True)