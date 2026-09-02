import os
import sqlite3
from typing import Optional, List, Dict

DB_PATH = "leads.db"
DATABASE_URL = os.environ.get("DATABASE_URL")

# If using PostgreSQL (Render / Heroku)
if DATABASE_URL:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    
    def get_conn():
        return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

    def _execute(query: str, params: tuple = (), commit: bool = False, fetchone=False, fetchall=False, lastrowid=False):
        # Convert SQLite '?' to PostgreSQL '%s'
        query = query.replace("?", "%s")
        
        conn = get_conn()
        c = conn.cursor()
        
        try:
            if "scrape_progress (id, progress" in query:
                # Postgres "ON CONFLICT DO NOTHING"
                query += " ON CONFLICT (id) DO NOTHING"

            c.execute(query, params)
            
            res = None
            if fetchone:
                res = c.fetchone()
            elif fetchall:
                res = c.fetchall()
            elif lastrowid:
                # Postgres needs RETURNING id for lastrowid, but let's just do a manual fetch if possible
                # Simple hack for this app: return c.fetchone()['id'] if we add RETURNING id
                pass
                
            if commit:
                conn.commit()
            
            # Extract lastrowid for PostgreSQL
            rowid = None
            if lastrowid and "INSERT" in query:
                c.execute("SELECT LASTVAL()")
                rowid = c.fetchone()['lastval']
                
            return res if not lastrowid else rowid
            
        except Exception as e:
            if commit:
                conn.rollback()
            raise e
        finally:
            c.close()
            conn.close()

else:
    # Local SQLite
    def get_conn():
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    def _execute(query: str, params: tuple = (), commit: bool = False, fetchone=False, fetchall=False, lastrowid=False):
        conn = get_conn()
        c = conn.cursor()
        try:
            c.execute(query, params)
            res = None
            if fetchone:
                res = c.fetchone()
            elif fetchall:
                res = c.fetchall()
                
            rowid = c.lastrowid
            
            if commit:
                conn.commit()
                
            return res if not lastrowid else rowid
        finally:
            c.close()
            conn.close()


def init_db():
    if DATABASE_URL:
        # PostgreSQL DDL
        _execute('''
            CREATE TABLE IF NOT EXISTS leads (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                phone TEXT DEFAULT '',
                email TEXT DEFAULT '',
                college TEXT DEFAULT '',
                course_interest TEXT DEFAULT '',
                linkedin_url TEXT DEFAULT '',
                instagram_url TEXT DEFAULT '',
                location TEXT DEFAULT 'Nagpur',
                source TEXT DEFAULT 'Manual',
                score INTEGER DEFAULT 0,
                status TEXT DEFAULT 'new',
                notes TEXT DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''', commit=True)
        try:
            _execute("ALTER TABLE leads ADD COLUMN instagram_url TEXT DEFAULT ''", commit=True)
        except Exception:
            pass
        _execute('''
            CREATE TABLE IF NOT EXISTS templates (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                platform TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''', commit=True)
        _execute('''
            CREATE TABLE IF NOT EXISTS scrape_progress (
                id INTEGER PRIMARY KEY,
                progress INTEGER DEFAULT 0,
                message TEXT DEFAULT 'Idle',
                is_running INTEGER DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''', commit=True)
        _execute("INSERT INTO scrape_progress (id, progress, message, is_running) VALUES (1, 0, 'Idle', 0) ON CONFLICT (id) DO NOTHING", commit=True)

    else:
        # SQLite DDL
        _execute('''
            CREATE TABLE IF NOT EXISTS leads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT DEFAULT '',
                email TEXT DEFAULT '',
                college TEXT DEFAULT '',
                course_interest TEXT DEFAULT '',
                linkedin_url TEXT DEFAULT '',
                instagram_url TEXT DEFAULT '',
                location TEXT DEFAULT 'Nagpur',
                source TEXT DEFAULT 'Manual',
                score INTEGER DEFAULT 0,
                status TEXT DEFAULT 'new',
                notes TEXT DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''', commit=True)
        try:
            _execute("ALTER TABLE leads ADD COLUMN instagram_url TEXT DEFAULT ''", commit=True)
        except Exception:
            pass
        _execute('''
            CREATE TABLE IF NOT EXISTS templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                platform TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''', commit=True)
        _execute('''
            CREATE TABLE IF NOT EXISTS scrape_progress (
                id INTEGER PRIMARY KEY,
                progress INTEGER DEFAULT 0,
                message TEXT DEFAULT 'Idle',
                is_running INTEGER DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''', commit=True)
        _execute('INSERT OR IGNORE INTO scrape_progress (id, progress, message, is_running) VALUES (1, 0, "Idle", 0)', commit=True)

    wa_template = """Hello {name}! 👋\n\nI came across your profile and wanted to reach out personally.\n\n🎓 We offer *premium IT courses* with *DIRECT PLACEMENT GUARANTEE* in Nagpur!\nIncluding Data Analytics, Python, Java, Web Dev, and MIM.\n\n💼 *500+ students already placed in top companies!*\n\n📍 Located in Nagpur — perfect for local students!\n\nInterested? Just reply *YES* and I'll share all details including fees, schedule & placement record!\n\nLooking forward to hearing from you 😊"""
    li_template = """Hi {name},\n\nI noticed your profile and wanted to connect with a special opportunity!\n\nWe're offering industry-leading IT courses from Nagpur with DIRECT PLACEMENT ASSISTANCE (Data Analytics, Python, Java, Web Dev, MIM).\n\nOur students from {college} and across Nagpur have landed jobs at top MNCs!\n\nWould you be open to a quick 10-minute call to discuss how we can help accelerate your career?\n\nBest regards"""

    count_res = _execute("SELECT COUNT(*) as count FROM templates", fetchone=True)
    count = count_res['count'] if isinstance(count_res, dict) else count_res[0]

    if count == 0:
        _execute("INSERT INTO templates (name, platform, content) VALUES (?, ?, ?)",
                  ("IT Course Pitch – WhatsApp", "whatsapp", wa_template), commit=True)
        _execute("INSERT INTO templates (name, platform, content) VALUES (?, ?, ?)",
                  ("IT Course Pitch – LinkedIn", "linkedin", li_template), commit=True)


def get_leads(status: Optional[str] = None, search: Optional[str] = None) -> List[Dict]:
    query = "SELECT * FROM leads WHERE 1=1"
    params = []

    if status and status != "all":
        query += " AND status = ?"
        params.append(status)

    if search:
        like = f"%{search}%"
        query += " AND (name LIKE ? OR phone LIKE ? OR college LIKE ? OR email LIKE ? OR notes LIKE ?)"
        params.extend([like, like, like, like, like])

    query += " ORDER BY score DESC, created_at DESC"
    rows = _execute(query, tuple(params), fetchall=True)
    return [dict(r) for r in rows] if rows else []


def get_lead_by_id(lead_id: int) -> Optional[Dict]:
    row = _execute("SELECT * FROM leads WHERE id = ?", (lead_id,), fetchone=True)
    return dict(row) if row else None


def add_lead(data: Dict) -> int:
    phone = data.get("phone", "").strip()
    if phone:
        exists = _execute("SELECT id FROM leads WHERE phone = ? AND phone != ''", (phone,), fetchone=True)
        if exists:
            return -1

    lead_id = _execute('''
        INSERT INTO leads (name, phone, email, college, course_interest,
            linkedin_url, instagram_url, location, source, score, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data.get("name", "Unknown"), phone, data.get("email", ""), data.get("college", ""),
        data.get("course_interest", ""), data.get("linkedin_url", ""), data.get("instagram_url", ""),
        data.get("location", "Nagpur"), data.get("source", "Manual"), data.get("score", 0),
        data.get("status", "new"), data.get("notes", ""),
    ), commit=True, lastrowid=True)
    return lead_id


def update_lead(lead_id: int, data: Dict):
    _execute('''
        UPDATE leads SET name=?, phone=?, email=?, college=?, course_interest=?,
            linkedin_url=?, instagram_url=?, notes=?, status=?
        WHERE id=?
    ''', (
        data.get("name"), data.get("phone"), data.get("email"), data.get("college"), data.get("course_interest"),
        data.get("linkedin_url"), data.get("instagram_url"), data.get("notes"), data.get("status"), lead_id,
    ), commit=True)


def update_lead_status(lead_id: int, status: str):
    _execute("UPDATE leads SET status = ? WHERE id = ?", (status, lead_id), commit=True)


def delete_lead(lead_id: int):
    _execute("DELETE FROM leads WHERE id = ?", (lead_id,), commit=True)


def delete_all_leads():
    _execute("DELETE FROM leads", commit=True)


def get_stats() -> Dict:
    stats = {}
    for col in ["total", "new", "contacted", "interested", "converted", "not_interested"]:
        if col == "total":
            row = _execute("SELECT COUNT(*) as count FROM leads", fetchone=True)
        else:
            row = _execute("SELECT COUNT(*) as count FROM leads WHERE status = ?", (col,), fetchone=True)
        stats[col] = row['count'] if isinstance(row, dict) else row[0]
    return stats


def update_scrape_progress(progress: int, message: str, is_running: int = 1):
    _execute(
        "UPDATE scrape_progress SET progress=?, message=?, is_running=?, updated_at=CURRENT_TIMESTAMP WHERE id=1",
        (progress, message, is_running), commit=True
    )


def get_scrape_progress() -> Dict:
    row = _execute("SELECT * FROM scrape_progress WHERE id = 1", fetchone=True)
    if row:
        return dict(row)
    return {"progress": 0, "message": "Idle", "is_running": 0}


def get_templates() -> List[Dict]:
    rows = _execute("SELECT * FROM templates ORDER BY created_at DESC", fetchall=True)
    return [dict(r) for r in rows] if rows else []


def add_template(name: str, platform: str, content: str) -> int:
    return _execute("INSERT INTO templates (name, platform, content) VALUES (?, ?, ?)",
                    (name, platform, content), commit=True, lastrowid=True)


def update_template(tid: int, name: str, platform: str, content: str):
    _execute("UPDATE templates SET name=?, platform=?, content=? WHERE id=?",
             (name, platform, content, tid), commit=True)


def delete_template(tid: int):
    _execute("DELETE FROM templates WHERE id = ?", (tid,), commit=True)
