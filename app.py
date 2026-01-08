from flask import Flask, request, jsonify, session, abort
from flask_cors import CORS
import sqlite3
import uuid
import qrcode
from datetime import datetime, date

app = Flask(__name__, static_url_path="", static_folder="frontend")
app.secret_key = "hackathon-secret-key"
CORS(app)

DB = "database.db"

# -------------------- DATABASE --------------------

def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    db = get_db()
    db.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        role TEXT,
        phone TEXT,
        language TEXT
    );

    CREATE TABLE IF NOT EXISTS health_ids (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        health_uuid TEXT UNIQUE
    );

    CREATE TABLE IF NOT EXISTS medical_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        health_uuid TEXT,
        diagnosis TEXT,
        prescription TEXT,
        blood_group TEXT,
        blood_summary TEXT,
        injuries TEXT,
        allergies TEXT,
        remarks TEXT,
        next_visit DATE,
        doctor_id INTEGER,
        created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        message TEXT,
        language TEXT,
        is_read INTEGER DEFAULT 0
    );
    """)
    db.commit()

def migrate_db():
    db = get_db()
    # Attempt to add columns if they don't exist (SQLite doesn't support IF NOT EXISTS for ADD COLUMN directly, so we use try/except block equivalent or just ignore error)
    cols = ["blood_group", "blood_summary", "injuries", "allergies", "remarks"]
    for col in cols:
        try:
            db.execute(f"ALTER TABLE medical_records ADD COLUMN {col} TEXT")
        except sqlite3.OperationalError:
            pass # Column likely exists
    db.commit()

init_db()
migrate_db()

# -------------------- LANGUAGE --------------------

MESSAGES = {
    "en": "Your next doctor visit is on {date}",
    "ta": "உங்கள் அடுத்த மருத்துவர் சந்திப்பு {date}",
    "hi": "आपकी अगली डॉक्टर की मुलाकात {date} को है"
}

def get_message(lang, date):
    if lang not in MESSAGES:
        lang = "en"
    return MESSAGES[lang].format(date=date)

# -------------------- AUTH HELPERS --------------------

def login_required(role=None):
    def wrapper(func):
        def inner(*args, **kwargs):
            if "user_id" not in session:
                abort(401)
            if role and session.get("role") != role:
                abort(403)
            return func(*args, **kwargs)
        inner.__name__ = func.__name__
        return inner
    return wrapper

# -------------------- AUTH --------------------

@app.route("/")
def index():
    return app.send_static_file("login.html")

@app.route("/login", methods=["POST"])
def login():
    phone = str(request.json.get("phone")).strip()
    db = get_db()
    user = db.execute("SELECT * FROM users WHERE phone=?", (phone,)).fetchone()
    if not user:
        abort(401)
    session["user_id"] = user["id"]
    session["role"] = user["role"]
    return jsonify({"role": user["role"]})

@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    name = data.get("name")
    phone = str(data.get("phone")).strip()
    language = data.get("language", "en")
    role = data.get("role", "worker") # Default to worker, but allow doctor for demo

    db = get_db()
    
    # Check if user already exists
    existing = db.execute("SELECT * FROM users WHERE phone=?", (phone,)).fetchone()
    if existing:
        return jsonify({"error": "User already exists"}), 400

    db.execute(
        "INSERT INTO users (name, role, phone, language) VALUES (?, ?, ?, ?)",
        (name, role, phone, language)
    )
    user_id = db.execute("SELECT last_insert_rowid()").fetchone()[0]

    if role == "worker":
        health_uuid = "HID-" + str(uuid.uuid4())
        db.execute(
            "INSERT INTO health_ids (user_id, health_uuid) VALUES (?, ?)",
            (user_id, health_uuid)
        )
        health_id = health_uuid
    else:
        health_id = None

    db.commit()
    
    # Auto-login
    session["user_id"] = user_id
    session["role"] = role
    
    return jsonify({"role": role, "health_id": health_id, "status": "success"})

# -------------------- ADMIN --------------------

@app.route("/admin/register_worker", methods=["POST"])
@login_required("admin")
def register_worker():
    data = request.json
    name = data["name"]
    phone = data["phone"]
    lang = data.get("language", "en")

    db = get_db()
    db.execute(
        "INSERT INTO users (name, role, phone, language) VALUES (?, 'worker', ?, ?)",
        (name, phone, lang)
    )
    user_id = db.execute("SELECT last_insert_rowid()").fetchone()[0]

    health_uuid = "HID-" + str(uuid.uuid4())
    db.execute(
        "INSERT INTO health_ids (user_id, health_uuid) VALUES (?, ?)",
        (user_id, health_uuid)
    )

    img = qrcode.make(health_uuid)
    # img.save(f"{health_uuid}.png") # Disable saving image to disk to avoid clutter

    db.commit()
    return jsonify({"health_id": health_uuid})

# -------------------- DOCTOR --------------------

@app.route("/doctor/get_patient", methods=["POST"])
@login_required("doctor")
def get_patient():
    health_uuid = request.json.get("health_id")
    db = get_db()
    
    # Get User Details
    user = db.execute("""
        SELECT users.name, users.phone, users.language 
        FROM users 
        JOIN health_ids ON users.id = health_ids.user_id 
        WHERE health_ids.health_uuid = ?
    """, (health_uuid,)).fetchone()
    
    if not user:
        abort(404)
        
    # Get Medical History
    history = db.execute("""
        SELECT diagnosis, prescription, blood_group, blood_summary, injuries, allergies, remarks, next_visit, created_at 
        FROM medical_records 
        WHERE health_uuid = ? 
        ORDER BY created_at DESC 
        LIMIT 10
    """, (health_uuid,)).fetchall()
    
    return jsonify({
        "name": user["name"],
        "phone": user["phone"],
        "language": user["language"],
        "history": [dict(row) for row in history]
    })

@app.route("/doctor/add_record", methods=["POST"])
@login_required("doctor")
def add_record():
    data = request.json
    health_uuid = data["health_id"]

    # Validate UUID format
    if not health_uuid.startswith("HID-"):
        abort(400)

    next_visit = data.get("next_visit")
    if next_visit:
        try:
            next_date = datetime.strptime(next_visit, "%Y-%m-%d").date()
            if next_date < date.today():
                abort(400)
        except ValueError:
            next_visit = None # If invalid format, treat as None or handle error. Assuming simple optionality here.

    db = get_db()
    record = db.execute(
        "SELECT * FROM health_ids WHERE health_uuid=?", (health_uuid,)
    ).fetchone()

    if not record:
        abort(404)

    db.execute("""
        INSERT INTO medical_records
        (health_uuid, diagnosis, prescription, blood_group, blood_summary, injuries, allergies, remarks, next_visit, doctor_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        health_uuid,
        data.get("diagnosis", ""),
        data.get("prescription", ""),
        data.get("blood_group", ""),
        data.get("blood_summary", ""),
        data.get("injuries", ""),
        data.get("allergies", ""),
        data.get("remarks", ""),
        next_visit,
        session["user_id"],
        datetime.now().isoformat()
    ))

    if next_visit:
        worker = db.execute("""
            SELECT users.id, users.language FROM users
            JOIN health_ids ON users.id = health_ids.user_id
            WHERE health_ids.health_uuid=?
        """, (health_uuid,)).fetchone()

        msg = get_message(worker["language"], next_visit)
        db.execute(
            "INSERT INTO notifications (user_id, message, language) VALUES (?, ?, ?)",
            (worker["id"], msg, worker["language"])
        )

    db.commit()
    return jsonify({"status": "record added"})

# -------------------- WORKER --------------------

@app.route("/worker/dashboard")
@login_required("worker")
def worker_dashboard():
    db = get_db()
    
    # 1. Get Health ID
    hid_row = db.execute(
        "SELECT health_uuid FROM health_ids WHERE user_id=?", 
        (session["user_id"],)
    ).fetchone()
    health_id = hid_row["health_uuid"] if hid_row else None

    # 2. Get Latest Medical Record (if HID exists)
    latest_record = None
    if health_id:
        rec_row = db.execute("""
            SELECT diagnosis, prescription, blood_group, blood_summary, injuries, allergies, remarks, created_at, next_visit 
            FROM medical_records 
            WHERE health_uuid=? 
            ORDER BY created_at DESC 
            LIMIT 1
        """, (health_id,)).fetchone()
        if rec_row:
            latest_record = dict(rec_row)

    # 3. Get Notifications
    notes = db.execute(
        "SELECT message, is_read FROM notifications WHERE user_id=?",
        (session["user_id"],)
    ).fetchall()

    return jsonify({
        "health_id": health_id,
        "medical_record": latest_record,
        "notifications": [dict(n) for n in notes]
    })

# -------------------- SEED USERS --------------------

@app.route("/seed")
def seed():
    db = get_db()
    # Check if admin already exists
    if not db.execute("SELECT * FROM users WHERE role='admin'").fetchone():
        db.execute("INSERT INTO users (name, role, phone, language) VALUES ('Admin', 'admin', '111', 'en')")
    # Check if doctor already exists
    if not db.execute("SELECT * FROM users WHERE role='doctor'").fetchone():
        db.execute("INSERT INTO users (name, role, phone, language) VALUES ('Doctor', 'doctor', '222', 'en')")
    db.commit()
    return "Seeded admin & doctor"

# --------------------

if __name__ == "__main__":
    app.run(debug=True)
