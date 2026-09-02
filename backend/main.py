import asyncio
import urllib.parse
from typing import Optional

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import (
    init_db, get_leads, get_lead_by_id, add_lead, update_lead,
    update_lead_status, delete_lead, delete_all_leads, get_stats,
    update_scrape_progress, get_scrape_progress,
    get_templates, add_template, update_template, delete_template,
)
from lead_filter import LeadFilter

app = FastAPI(title="Student Lead Generator API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    init_db()
    update_scrape_progress(0, "Idle", is_running=0)


# ═══════════════════════════════════════════════════════════════
#  Pydantic Models
# ═══════════════════════════════════════════════════════════════

class SearchRequest(BaseModel):
    course: Optional[str] = "IT / Tech Courses"
    keywords: str = ""
    max_leads: int = 60


class LeadCreate(BaseModel):
    name: str
    phone: Optional[str] = ""
    email: Optional[str] = ""
    college: Optional[str] = ""
    course_interest: Optional[str] = ""
    linkedin_url: Optional[str] = ""
    instagram_url: Optional[str] = ""
    notes: Optional[str] = ""
    status: Optional[str] = "new"


class LeadUpdateModel(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    college: Optional[str] = None
    course_interest: Optional[str] = None
    linkedin_url: Optional[str] = None
    instagram_url: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None


class StatusUpdate(BaseModel):
    status: str


class MessageRequest(BaseModel):
    lead_id: int
    platform: str   # "whatsapp" | "linkedin"
    message: str


class TemplatePayload(BaseModel):
    name: str
    platform: str
    content: str


# ═══════════════════════════════════════════════════════════════
#  Lead Endpoints
# ═══════════════════════════════════════════════════════════════

@app.get("/api/leads")
async def list_leads(status: Optional[str] = None, search: Optional[str] = None):
    leads = get_leads(status=status, search=search)
    return {"leads": leads, "count": len(leads)}


@app.post("/api/leads", status_code=201)
async def create_lead(body: LeadCreate):
    lf = LeadFilter()
    data = body.dict()
    data.update({"location": "Nagpur", "source": "Manual", "score": lf.calculate_score(data)})
    lid = add_lead(data)
    if lid == -1:
        raise HTTPException(400, "A lead with this phone number already exists.")
    return {"id": lid, "message": "Lead created"}


@app.put("/api/leads/{lead_id}")
async def update_lead_endpoint(lead_id: int, body: LeadUpdateModel):
    existing = get_lead_by_id(lead_id)
    if not existing:
        raise HTTPException(404, "Lead not found")
    merged = {**existing, **{k: v for k, v in body.dict().items() if v is not None}}
    update_lead(lead_id, merged)
    return {"message": "Lead updated"}


@app.put("/api/leads/{lead_id}/status")
async def change_status(lead_id: int, body: StatusUpdate):
    update_lead_status(lead_id, body.status)
    return {"message": "Status updated"}


@app.delete("/api/leads/{lead_id}")
async def remove_lead(lead_id: int):
    delete_lead(lead_id)
    return {"message": "Lead deleted"}


@app.delete("/api/leads")
async def remove_all():
    delete_all_leads()
    return {"message": "All leads cleared"}


@app.get("/api/stats")
async def statistics():
    return get_stats()


# ═══════════════════════════════════════════════════════════════
#  Search / Scrape Endpoints
# ═══════════════════════════════════════════════════════════════

@app.post("/api/search-leads")
async def search_leads(body: SearchRequest, background_tasks: BackgroundTasks):
    prog = get_scrape_progress()
    if prog.get("is_running"):
        raise HTTPException(409, "A search is already in progress.")
    update_scrape_progress(1, "🚀 Starting search engine...", is_running=1)
    background_tasks.add_task(_run_scrapers, body.course, body.keywords, body.max_leads)
    return {"message": "Search started"}


@app.get("/api/search-status")
async def search_status():
    return get_scrape_progress()


# ═══════════════════════════════════════════════════════════════
#  Message Endpoints
# ═══════════════════════════════════════════════════════════════

@app.post("/api/send-message")
async def send_message(body: MessageRequest):
    lead = get_lead_by_id(body.lead_id)
    if not lead:
        raise HTTPException(404, "Lead not found")

    # Personalise message
    msg = body.message
    msg = msg.replace("{name}", lead.get("name") or "Friend")
    msg = msg.replace("{college}", lead.get("college") or "your college")
    msg = msg.replace("{course}", lead.get("course_interest") or "IT courses")

    url = ""
    if body.platform == "whatsapp":
        phone = (lead.get("phone") or "").strip().replace(" ", "").replace("-", "")
        if not phone:
            raise HTTPException(400, "No phone number for this lead.")
        if phone.startswith("+"):
            phone = phone[1:]
        elif not phone.startswith("91"):
            phone = "91" + phone
        url = f"https://wa.me/{phone}?text={urllib.parse.quote(msg)}"

    elif body.platform == "linkedin":
        li = lead.get("linkedin_url") or ""
        if li:
            url = li
        else:
            name_q = urllib.parse.quote(f"{lead.get('name', '')} Nagpur")
            url = f"https://www.linkedin.com/search/results/people/?keywords={name_q}"

    elif body.platform == "instagram":
        ig = lead.get("instagram_url") or ""
        username = ""
        if ig:
            ig = ig.rstrip('/')
            username = ig.split('/')[-1]
            if username.startswith('@'):
                username = username[1:]
        
        if username:
            url = f"https://ig.me/m/{username}"
        else:
            name_q = urllib.parse.quote(f"{lead.get('name', '')} Nagpur")
            url = f"https://www.instagram.com/explore/tags/nagpur/"

    update_lead_status(body.lead_id, "contacted")
    return {"url": url, "message": msg}


# ═══════════════════════════════════════════════════════════════
#  Template Endpoints
# ═══════════════════════════════════════════════════════════════

@app.get("/api/templates")
async def list_templates():
    return {"templates": get_templates()}


@app.post("/api/templates", status_code=201)
async def create_template(body: TemplatePayload):
    tid = add_template(body.name, body.platform, body.content)
    return {"id": tid, "message": "Template created"}


@app.put("/api/templates/{tid}")
async def update_template_ep(tid: int, body: TemplatePayload):
    update_template(tid, body.name, body.platform, body.content)
    return {"message": "Template updated"}


@app.delete("/api/templates/{tid}")
async def delete_template_ep(tid: int):
    delete_template(tid)
    return {"message": "Template deleted"}


# ═══════════════════════════════════════════════════════════════
#  Background scraping task
# ═══════════════════════════════════════════════════════════════

async def _run_scrapers(course: str, keywords: str, max_leads: int):
    from scrapers.google_scraper import GoogleScraper
    from scrapers.internshala_scraper import InternshalaScraper
    from scrapers.college_scraper import CollegeScraper

    scraper_list = [
        (GoogleScraper(),       "🌐 Google Search",      50),
        (InternshalaScraper(),  "📋 Internshala",         25),
        (CollegeScraper(),      "🏫 Nagpur Colleges",     25),
    ]

    all_leads = []
    n = len(scraper_list)

    for i, (scraper, label, _) in enumerate(scraper_list):
        pct = 10 + int((i / n) * 65)
        update_scrape_progress(pct, f"{label}...")
        try:
            chunk = await scraper.search(course, keywords, max_leads // n)
            all_leads.extend(chunk)
        except Exception as e:
            print(f"[Scraper Error] {label}: {e}")

    update_scrape_progress(80, "⚡ Filtering & scoring leads...")
    lf = LeadFilter()
    scored = lf.filter_and_score(all_leads)

    update_scrape_progress(92, "💾 Saving to database...")
    saved = 0
    for lead in scored[:max_leads]:
        result = add_lead(lead)
        if result != -1:
            saved += 1

    update_scrape_progress(100, f"✅ Done! {saved} new leads found.", is_running=0)
