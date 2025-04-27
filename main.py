from flask import Flask, render_template, request, send_file

app = Flask(__name__)

@app.route("/", methods=["GET"])
def get_upload_page():
    return render_template("upload.html")

@app.route("/download", methods=["GET"])
def get_download_page():
    return render_template("download.html")

if __name__ == "__main__":
    app.run(port=8000, debug=True)