from flask import Flask, render_template, request, jsonify
import os
import uuid

app = Flask(__name__)


def generate_filename(folder, extension="zip"):
    while True:
        filename = f"{uuid.uuid4()}.{extension}"
        if not os.path.exists(os.path.join(folder, filename)):
            return filename


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

    save_folder = 'uploads'
    filename = generate_filename(save_folder)
    os.makedirs(save_folder, exist_ok=True)  # Create folder if it doesn't exist
    save_path = os.path.join(save_folder, filename)
    uploaded_file.save(save_path)

    return jsonify(message='File saved successfully!'), 200


@app.route("/api/download")
def send_zip():
    pass


if __name__ == "__main__":
    app.run(port=8000, debug=True)