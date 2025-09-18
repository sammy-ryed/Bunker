# migrate_classmates.py
import pymysql
from passlib.context import CryptContext

# === CONFIG - edit ===
DB_HOST = "localhost"
DB_USER = "bunker_user"
DB_PASSWORD = "password"
DB_NAME = "bunker_db"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"   # change immediately after creation
# ======================

pwdctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

conn = pymysql.connect(
    host=DB_HOST,
    user=DB_USER,
    password=DB_PASSWORD,
    db=DB_NAME,
    charset="utf8mb4",
    autocommit=True
)
cur = conn.cursor()

def safe_execute(sql, params=None):
    try:
        cur.execute(sql, params or ())
        print("OK:", sql.splitlines()[0])
    except Exception as e:
        print("SKIP/ERR:", e)

print(">>> Migration started (backup first!)")

# 1) Rename ra_number -> registration_no if exists
try:
    cur.execute("SHOW COLUMNS FROM classmates LIKE 'ra_number'")
    if cur.fetchone():
        safe_execute("ALTER TABLE classmates CHANGE COLUMN ra_number registration_no VARCHAR(20) NOT NULL")
    else:
        print("No ra_number column found — assuming registration_no already present.")
except Exception as e:
    print("Rename check failed:", e)

# 2) Add missing columns
cols = {
    "username": "VARCHAR(50)",
    "password_hash": "VARCHAR(255)",
    "is_admin": "TINYINT(1) NOT NULL DEFAULT 0"
}
# fetch existing columns
cur.execute("SHOW COLUMNS FROM classmates")
existing_cols = [r[0] for r in cur.fetchall()]

for col, cdef in cols.items():
    if col not in existing_cols:
        safe_execute(f"ALTER TABLE classmates ADD COLUMN {col} {cdef}")

# 3) Populate username where empty: username = lower(registration_no)
safe_execute("""
    UPDATE classmates
    SET username = LOWER(registration_no)
    WHERE username IS NULL OR username = ''
""")

# 4) Populate password_hash where empty: default password = registration_no
cur.execute("SELECT id, registration_no, username FROM classmates WHERE password_hash IS NULL OR password_hash = ''")
rows = cur.fetchall()
for r in rows:
    _id, regno, username = r
    if not regno:
        print("Skipping id", _id, "no registration_no")
        continue
    hashed = pwdctx.hash(str(regno))   # default password
    safe_execute("UPDATE classmates SET password_hash=%s WHERE id=%s", (hashed, _id))

# 5) Create UNIQUE index on username if no duplicates
cur.execute("""
    SELECT username, COUNT(*) AS c FROM classmates
    WHERE username IS NOT NULL AND username <> ''
    GROUP BY username HAVING c > 1
""")
dups = cur.fetchall()
if dups:
    print("Cannot create UNIQUE index: duplicate usernames found. Sample:")
    print(dups[:10])
    print("Resolve duplicates first (e.g. append suffixes) then add UNIQUE index.")
else:
    try:
        safe_execute("ALTER TABLE classmates ADD UNIQUE INDEX ux_classmates_username (username)")
    except Exception as e:
        print("Could not add UNIQUE index (maybe exists):", e)

# 6) Create queue/results/settings tables if not present
safe_execute("""
CREATE TABLE IF NOT EXISTS queue_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL UNIQUE,
  entered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES classmates(id) ON DELETE CASCADE
)
""")
safe_execute("""
CREATE TABLE IF NOT EXISTS results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  accepted TINYINT(1) NOT NULL,
  position INT NOT NULL,
  processed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES classmates(id) ON DELETE CASCADE
)
""")
safe_execute("""
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  keyname VARCHAR(100) NOT NULL UNIQUE,
  value VARCHAR(255) NOT NULL
)
""")
safe_execute("INSERT INTO settings (keyname, value) VALUES ('bunker_capacity', '10') ON DUPLICATE KEY UPDATE value=value")

# 7) Create admin account if none exists
cur.execute("SELECT COUNT(*) FROM classmates WHERE is_admin = 1")
if cur.fetchone()[0] == 0:
    admin_hashed = pwdctx.hash(ADMIN_PASSWORD)
    safe_execute("""
      INSERT INTO classmates (registration_no, name, username, password_hash, occupation, description, quirk, priority, is_admin)
      VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """, ("ADMIN", "Administrator", ADMIN_USERNAME, admin_hashed, "Admin", "System administrator", "", 0, 1))
    print("Admin account created: username =", ADMIN_USERNAME)
else:
    print("Admin account(s) already exist. Skipping creation.")

print(">>> Migration complete. Please CHANGE the default admin password now.")
cur.close()
conn.close()
