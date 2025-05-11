# KeyDrop

<p align="center">
  <a href="https://www.python.org/"><img src="https://img.shields.io/badge/Python-3.10+-blue.svg" alt="Python"></a>
  <a href="https://flask.palletsprojects.com/"><img src="https://img.shields.io/badge/Flask-3.1-orange.svg" alt="Flask"></a>
  <a href="https://redis.io/"><img src="https://img.shields.io/badge/Redis-5.2-red.svg" alt="Redis"></a>
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License">
</p>

---

**KeyDrop** is a simple and secure file sharing platform built with Flask and Redis.  
Users can upload files, get a unique key, and use it to securely download the file within 24 hours.

## Features

- 🔐 Secure file upload and download with unique keys.
- 🗑️ Automatic file cleanup after expiry.
- 🛆 Supports multiple file uploads packed into a `.zip`.
- 💥 Modern UI and UX with SweetAlert2, Poppins font, and smooth transitions.
- 🛡️ Fallback to in-memory storage if Redis server is unavailable.
- ✨ Real-time upload progress bar with SweetAlert2 animations.
- ✨ Smooth loading animation during download preparation.

## Tech Stack

- **Backend:** Python, Flask, Redis (or in-memory fallback)
- **Frontend:** HTML, CSS, JavaScript (with SweetAlert2)
- **Libraries Used:**
  - Flask
  - Redis
  - SweetAlert2
  - C

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Jack-18888/KeyDrop.git
   cd KeyDrop
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Make sure Redis is running** (optional but recommended):
   ```bash
   redis-server
   ```

4. **Compile the C uploading/downloading fle**
    ```bash
    gcc -shared -o fastReadAndWrite.so -fPIC file_handle.c
    ```

5. **Run the Flask server:**
   ```bash
   python main.py
   ```

6. **Access the app:**
   Open your browser and go to `http://localhost:8000`.

7. **Deploy with Gunicorn:**
    ```bash
    ./start_server.sh
    ```

## Project Structure

```
.
├── main.py           # Flask application
├── safeRedis.py      # Safe Redis wrapper with in-memory fallback
├── templates/
│   ├── upload.html
│   └── download.html
├── static/
│   ├── css/
│   │   ├── upload.css
│   │   └── download.css
│   ├── js/
│   │   ├── upload.js
│   │   └── download.js
├── uploads/          # Uploaded ZIP files (gitignored)
├── .gitignore
├── README.md
├── requirements.txt
└── start_server.sh
```

## Notes

- Uploaded files are stored in the `uploads/` directory and automatically removed after 24 hours.
- Each upload session generates a **unique key** used for downloading.
- Max upload size is set to **5GB**.
- Files are zipped dynamically on upload and delivered as a .zip during download.
- Upload progress and download preparation are visually tracked with animated SweetAlerts.

## License

This project is licensed under the [MIT License](LICENSE) – feel free to use, modify, and distribute.

