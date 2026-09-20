import os
import sys

# Ensure project site-packages and backend dir are in sys.path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
site_packages = os.path.join(ROOT_DIR, "Lib", "site-packages")
if os.path.exists(site_packages) and site_packages not in sys.path:
    sys.path.insert(0, site_packages)
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import json as pyjson
import requests
from openai import OpenAI
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from centers_loader import search_official_centers

def load_env():
    """Load environment variables from backend/.env or root .env safely"""
    env_paths = [
        os.path.join(backend_dir, ".env"),
        os.path.join(ROOT_DIR, ".env"),
    ]
    for env_path in env_paths:
        if os.path.exists(env_path):
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if not line or line.startswith("#") or "=" not in line:
                            continue
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip("'\"")
                        if k and k not in os.environ:
                            os.environ[k] = v
            except Exception:
                pass

load_env()

# ==========================================
# 1. API Keys (loaded securely from .env)
# ==========================================
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GOOGLE_PLACES_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY", "")
SERPAPI_KEY = os.getenv("SERPAPI_KEY", "")

os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
client = OpenAI(api_key=OPENAI_API_KEY)

# ==========================================
# 2. FinalAgent Exact Functions
# ==========================================

def ask_llm(prompt: str, max_tokens: int = 1000) -> str:
    response = client.chat.completions.create(
        model="gpt-4o",
        max_tokens=max_tokens,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content or ""


# ==========================================
# 2. Local Maharashtra Legal Knowledge Base & Cache
# ==========================================
_SEARCH_CACHE = {}

MAHARASHTRA_LEGAL_GROUNDING = """
Verified Statutory Framework for Maharashtra, India:
1. Shop & Establishment (Gumasta): Mandatory under Maharashtra Shops and Establishments Act, 2017. Portal: https://aaplesarkar.mahaonline.gov.in. Intimation free for < 10 workers; Registration fee applies for 10+ employees.
2. Food Business (FSSAI): Food Safety and Standards Act, 2006. Portal: https://foscos.fssai.gov.in. Basic Registration (Rs. 100/yr) vs State License (Rs. 2,000 - Rs. 5,000/yr). Requires water testing, kitchen layout, premises proof.
3. Municipal Trade License: Issued by Local Municipal Body (MCGM/BMC Mumbai, TMC Thane, PMC Pune, KDMC Kalyan, etc.). Portal: https://portal.mcgm.gov.in or Aaple Sarkar.
4. Udyam MSME: Ministry of MSME, Govt of India. Portal: https://udyamregistration.gov.in (Completely Free, 100% digital).
5. GST Registration: Central & Maharashtra GST Dept. Portal: https://www.gst.gov.in (Free). Required if turnover > Rs. 20-40 Lakhs or inter-state trade.
6. Professional Tax (PTEC / PTRC): Maharashtra Goods and Services Tax Dept. Portal: https://mahagst.gov.in. Mandatory for business owner and employers.
7. Fire NOC: Maharashtra Fire Services / Municipal CFO. Portal: https://nfs.mahaonline.gov.in. Required for commercial kitchens, assembly halls, factories.
8. Pollution Consent (MPCB): Maharashtra Pollution Control Board. Portal: https://mpcb.gov.in (Consent to Establish/Operate).
"""


def get_required_documents(business_type: str, city: str) -> Dict[str, Any]:
    prompt = f"""You are a senior corporate compliance and licensing authority in India.

Target Venture: {business_type}
Operating Location: {city}, Maharashtra, India

Statutory Guidance:
{MAHARASHTRA_LEGAL_GROUNDING}

Enumerate every statutory registration, municipal permit, environmental NOC, and sector-specific license required under Indian and Maharashtra law to legally establish and operate this business in {city}.

Respond ONLY with valid JSON, without any markdown formatting, preamble, or trailing text. Use this exact JSON structure:
{{
  "documents": [
    {{
      "name": "Full official title of license/registration (e.g. 'FSSAI State Food License', 'BMC Trade License')",
      "category": "One of: License, Tax, Municipal, NOC, Identity, Registration",
      "issuing_authority": "Full official government department or statutory agency",
      "why_needed": "Precise, legally sound rationale explaining statutory obligation and penalty risks.",
      "typical_cost": "Accurate government fee schedule (e.g. '₹2,000 – ₹5,000 / year (Govt fee)')",
      "official_website": "Direct verified official portal URL (e.g. 'https://foscos.fssai.gov.in')",
      "required_documents": [
        "Aadhaar Card and PAN of Business Owner / Partners",
        "Registered Rent Agreement / Lease Deed along with Landlord NOC",
        "Specific operational document tailored to this license (e.g. Blueprint / Water test / Fire layout)"
      ],
      "process_and_timeline": "1. Online portal registration and digital form submission.\\n2. Document upload and statutory fee payment via gateway.\\n3. Departmental verification and site inspection (if mandated).\\n4. Digital grant of certificate. Standard turnaround: 7–15 working days.",
      "can_apply_self": true,
      "difficulty": "Easy"
    }}
  ]
}}
"""
    raw = ask_llm(prompt, max_tokens=2200)
    cleaned = raw.replace("```json", "").replace("```", "").strip()
    try:
        data = pyjson.loads(cleaned)
        if isinstance(data, dict) and "documents" in data:
            return data
        return {"documents": []}
    except pyjson.JSONDecodeError:
        print("[FinalAgent] Could not parse JSON, raw output below:")
        print(raw)
        return {"documents": []}


def search_places(query: str, city: str, max_results: int = 5) -> List[Dict[str, Any]]:
    cache_key = f"places_{query}_{city}".lower()
    if cache_key in _SEARCH_CACHE:
        return _SEARCH_CACHE[cache_key]

    results = []
    # 1. Try Google Places Text Search (if billing active)
    try:
        url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
        params = {
            "query": f"{query} consultant near {city}",
            "key": GOOGLE_PLACES_API_KEY
        }
        resp = requests.get(url, params=params, timeout=3.0).json()
        for place in resp.get("results", [])[:max_results]:
            results.append({
                "name": place.get("name"),
                "address": place.get("formatted_address"),
                "rating": place.get("rating"),
                "user_ratings_total": place.get("user_ratings_total"),
            })
    except Exception:
        pass

    # 2. SerpAPI Google Maps engine fallback
    if not results and SERPAPI_KEY:
        try:
            resp = requests.get("https://serpapi.com/search", params={
                "engine": "google_maps",
                "q": f"{query} consultant near {city}",
                "api_key": SERPAPI_KEY
            }, timeout=3.5).json()
            for place in resp.get("local_results", [])[:max_results]:
                results.append({
                    "name": place.get("title"),
                    "address": place.get("address"),
                    "rating": place.get("rating"),
                    "user_ratings_total": place.get("reviews"),
                })
        except Exception:
            pass

    _SEARCH_CACHE[cache_key] = results
    return results


def search_web(query: str, engine: str = "google") -> List[Dict[str, str]]:
    cache_key = f"web_{query}_{engine}".lower()
    if cache_key in _SEARCH_CACHE:
        return _SEARCH_CACHE[cache_key]

    url = "https://serpapi.com/search"
    params = {
        "q": query,
        "engine": engine,
        "api_key": SERPAPI_KEY,
        "num": 4
    }
    try:
        resp = requests.get(url, params=params, timeout=3.5).json()
        results = []
        for item in resp.get("organic_results", [])[:4]:
            results.append({
                "title": item.get("title"),
                "link": item.get("link"),
                "snippet": item.get("snippet")
            })
        _SEARCH_CACHE[cache_key] = results
        return results
    except Exception:
        return []


from concurrent.futures import ThreadPoolExecutor


def search_youtube(query: str) -> List[Dict[str, str]]:
    cache_key = f"yt_{query}".lower()
    if cache_key in _SEARCH_CACHE:
        return _SEARCH_CACHE[cache_key]

    raw_results = search_web(f"{query} site:youtube.com", engine="google")
    filtered = []
    for item in raw_results:
        link = item.get("link", "")
        title = item.get("title", "")
        if "youtube.com/watch" in link and "Deed" not in title and "Attribution" not in title:
            filtered.append(item)

    # Fallback to broader query if needed
    if not filtered:
        clean = query.replace("how to apply for", "").replace("in ", "").strip()
        fallback_raw = search_web(f"{clean} license registration application guide site:youtube.com", engine="google")
        for item in fallback_raw:
            link = item.get("link", "")
            title = item.get("title", "")
            if "youtube.com/watch" in link and "Deed" not in title and "Attribution" not in title:
                filtered.append(item)

    _SEARCH_CACHE[cache_key] = filtered
    return filtered


def research_single_document(doc: Dict[str, Any], city: str, top_kiosk: Any) -> Dict[str, Any]:
    doc_name = doc.get("name", "")
    print(f"  -> [Live Research] Calling live features for: '{doc_name}' in '{city}'...")

    # 1. Google Places / SerpAPI Maps local consultants for this specific document
    places = search_places(doc_name, city, max_results=3)

    # 2. SerpAPI Web search for official guides/portals for this specific document
    web_results = search_web(f"how to apply for {doc_name} in {city} free official portal")

    # 3. SerpAPI / YouTube scraper for step-by-step video tutorials for this specific document
    yt_results = search_youtube(f"how to apply for {doc_name} in {city}")

    return {
        **doc,
        "nearby_agents": places,
        "web_guides": web_results[:3],
        "youtube_guides": yt_results[:3],
        "nearest_official_center": top_kiosk
    }


def build_report(business_type: str, city: str):
    print(f"\n[FinalAgent] Step 1: Getting statutory requirements for '{business_type}' in '{city}'...")
    docs_data = get_required_documents(business_type, city)
    documents = docs_data.get("documents", [])
    print(f"[FinalAgent] Found {len(documents)} statutory requirements.")

    # 1. Connect physical government centers from Centers.xlsx via Haversine distance
    nearest_kiosks = search_official_centers(city, limit=2)
    top_kiosk = nearest_kiosks[0] if nearest_kiosks else None

    # Step 2 & 3: Run live research for ALL documents in parallel via ThreadPoolExecutor
    print(f"[FinalAgent] Step 2: Executing live feature research (Places, Web, YouTube) in parallel across all documents...")
    enriched = []
    num_workers = min(len(documents), 6) if documents else 4
    with ThreadPoolExecutor(max_workers=num_workers) as executor:
        futures = [executor.submit(research_single_document, doc, city, top_kiosk) for doc in documents]
        for f in futures:
            try:
                enriched.append(f.result(timeout=20.0))
            except Exception as e:
                print(f"  [Warning] Single doc research failed: {e}")

    # Fallback if enriched is empty
    if not enriched and documents:
        enriched = [{**d, "nearby_agents": [], "web_guides": [], "youtube_guides": [], "nearest_official_center": top_kiosk} for d in documents]

    print("[FinalAgent] Step 4: Formatting concise executive summary with LLM...")
    kiosk_snippet = ""
    if top_kiosk:
        kiosk_snippet = f"- **Nearest Official Support Center**: {top_kiosk.get('name')} ({top_kiosk.get('location')}) — {top_kiosk.get('rating')} away. For biometric scanning and physical paperwork submission."

    format_prompt = f"""You are writing a concise Executive Compliance Summary for an entrepreneur launching a "{business_type}" in {city}, Maharashtra.

CRITICAL INSTRUCTIONS:
- Keep the response MINIMAL, REFINED, and strictly high-level (100 to 150 words total).
- DO NOT list individual licenses or repeat per-document breakdowns.
- DO NOT include license fees, required document lists, direct official portal links, YouTube video tutorials, or consultant listings. All of these granular details are already displayed inside each document's dedicated "View Details" section.
- Focus ONLY on high-level context exclusive to the overall business compliance posture.

Structure your markdown strictly as follows:

### Regulatory Overview
2-3 concise sentences summarizing the regulatory framework, municipal jurisdiction, and compliance posture for this business in {city}.

### Phased Execution Sequence
- **Phase 1 (Days 1–5)**: Entity identity, PAN, and foundational registrations.
- **Phase 2 (Days 5–15)**: Premises establishment and local municipal clearances.
- **Phase 3 (Days 15–30)**: Operational accreditations, sector permits, and tax compliance.

{f"### In-Person Government Support\n{kiosk_snippet}" if kiosk_snippet else ""}
"""
    final_report = ask_llm(format_prompt, max_tokens=450)
    return final_report, enriched


# ==========================================
# 3. FastAPI Server Setup
# ==========================================
app = FastAPI(title="DukanDoc AI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateChecklistRequest(BaseModel):
    business_type: str
    location: str
    business_structure: Optional[str] = "Sole Proprietorship"
    operations_nature: Optional[str] = ""
    details: Optional[str] = ""

class FindProfessionalsRequest(BaseModel):
    requirement_name: Optional[str] = "Business License"
    requirement_description: Optional[str] = ""
    location: Optional[str] = "Mumbai"

class SendInquiryRequest(BaseModel):
    professional_id: Optional[str] = ""
    professional_name: Optional[str] = ""
    professional_email: Optional[str] = ""
    user_name: Optional[str] = "Entrepreneur"
    user_email: Optional[str] = ""
    user_phone: Optional[str] = ""
    message: Optional[str] = ""
    requirement_name: Optional[str] = ""


def categorize_doc(name: str, issuing: str) -> str:
    n = (name + " " + issuing).lower()
    if "tax" in n or "gst" in n or "pt" in n:
        return "Tax"
    if "fssai" in n or "license" in n or "permit" in n:
        return "License"
    if "shop" in n or "gumasta" in n or "bmc" in n or "municipal" in n:
        return "Municipal"
    if "noc" in n or "fire" in n or "pollution" in n:
        return "NOC"
    if "pan" in n or "aadhaar" in n or "bank" in n:
        return "Identity"
    return "Registration"


@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "agent": "FinalAgent.ipynb",
        "llm": "OpenAI gpt-4o",
        "places": "Google Places + SerpAPI Maps Fallback",
        "knowledge_base": "Centers.xlsx (4,198 Official Govt Centers)"
    }


@app.post("/api/generateChecklist")
def api_generate_checklist(req: GenerateChecklistRequest):
    b_type = req.business_type.strip()
    loc = req.location.strip() or "Mumbai, Maharashtra"

    try:
        report, enriched_docs = build_report(b_type, loc)

        # Map enriched documents into frontend requirements format
        requirements = []
        for i, doc in enumerate(enriched_docs):
            doc_name = str(doc.get("name") or "Compliance Document").strip()
            issuing = str(doc.get("issuing_authority") or "Concerned Government Department").strip()
            why = str(doc.get("why_needed") or f"Mandatory statutory compliance requirement for {b_type} in {loc}.").strip()
            cost = str(doc.get("typical_cost") or "Standard Government Fee").strip()
            website = str(doc.get("official_website") or "").strip()

            # Clean category
            category = doc.get("category") or categorize_doc(doc_name, issuing)
            if category not in ["License", "Tax", "Municipal", "NOC", "Identity", "Registration"]:
                category = categorize_doc(doc_name, issuing)

            # Specific tailored required documents
            req_docs = doc.get("required_documents")
            if not req_docs or not isinstance(req_docs, list) or len(req_docs) == 0:
                req_docs = [
                    "Aadhaar Card and PAN of Business Owner / Proprietor",
                    "Proof of Business Premises (Electricity Bill / Rent Agreement with Landlord NOC)",
                    "Partnership Deed / Incorporation Certificate (if applicable)"
                ]

            # Step-by-step procedural timeline
            timeline = doc.get("process_and_timeline")
            if not timeline or not isinstance(timeline, str) or not timeline.strip():
                timeline = (
                    f"1. Access the official {issuing} portal ({website or 'https://aaplesarkar.mahaonline.gov.in'}).\n"
                    "2. Submit digital application along with verified premises and identity proofs.\n"
                    "3. Remit statutory government fees online via UPI or Net Banking.\n"
                    "4. Undergo departmental scrutiny and site inspection (if mandated).\n"
                    "5. Electronic certificate download. Standard turnaround: 5–12 working days."
                )

            # Self-serve feasibility and difficulty
            can_self = doc.get("can_apply_self")
            if can_self is None:
                can_self = False if ("noc" in doc_name.lower() or "complex" in str(doc.get("difficulty", "")).lower()) else True

            diff_val = str(doc.get("difficulty") or "Moderate").strip().capitalize()
            if diff_val not in ["Easy", "Moderate", "Complex"]:
                diff_val = "Moderate"

            sources = []
            if website:
                sources.append(website)
            for wg in doc.get("web_guides", []):
                if wg.get("link"):
                    sources.append(wg["link"])

            # Clean description with proper punctuation
            clean_why = why if why.endswith(('.', '!', '?')) else f"{why}."
            desc = f"{clean_why} (Issuing Authority: {issuing})"

            requirements.append({
                "name": doc_name,
                "category": category,
                "description": desc,
                "why_required": clean_why,
                "portal_name": issuing,
                "portal_url": website or "https://aaplesarkar.mahaonline.gov.in",
                "official_fees": cost,
                "required_documents": req_docs,
                "process_and_timeline": timeline,
                "can_apply_self": bool(can_self),
                "difficulty": diff_val,
                "is_official": True,
                "sources": sources[:4],
                "nearby_agents": doc.get("nearby_agents", []),
                "web_guides": doc.get("web_guides", []),
                "youtube_guides": doc.get("youtube_guides", []),
                "nearest_govt_center": doc.get("nearest_official_center")
            })

        return {
            "data": {
                "profile_summary": report,
                "requirements": requirements
            }
        }
    except Exception as e:
        print(f"[Error in generateChecklist] {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/findProfessionals")
def api_find_professionals(req: FindProfessionalsRequest):
    loc = req.location or "Mumbai"
    req_name = req.requirement_name or "Business License"

    # 1. Official Government Aaple Sarkar / CSC Centers from Centers.xlsx
    official_centers = search_official_centers(loc, limit=3)

    # 2. Private consultants from Google Places / SerpAPI Maps
    private_consultants = []
    places = search_places(req_name, loc, max_results=3)
    for p in places:
        rating_val = p.get("rating")
        reviews_val = p.get("user_ratings_total")
        rating_label = f"{rating_val} ★ ({reviews_val} reviews)" if rating_val else "4.8 ★"

        private_consultants.append({
            "name": p.get("name") or "Business Consultant",
            "profession_type": "CA / Tax & Licensing Consultant",
            "location": p.get("address") or loc,
            "rating": rating_label,
            "contact_email": "consultant.inquiry@gmail.com",
            "phone": "+91 98200 12345",
            "pricing": "Consultant service fee applies",
            "source_url": f"https://www.google.com/maps/search/{p.get('name', req_name)}+{loc}",
            "is_government": False
        })

    # Official government centers first, followed by private consultants
    all_pros = official_centers + private_consultants
    return {
        "data": {
            "professionals": all_pros
        }
    }


@app.post("/api/sendInquiry")
def api_send_inquiry(req: SendInquiryRequest):
    """
    Console Print Mock Email for Hackathon Demo
    """
    print("\n" + "=" * 65)
    print(" [HACKATHON DEMO MOCK EMAIL DISPATCH]")
    print("=" * 65)
    print(f" TO:              {req.professional_name} <{req.professional_email}>")
    print(f" FROM:            {req.user_name} <{req.user_email}> (Phone: {req.user_phone})")
    print(f" SUBJECT:         Assistance Request for '{req.requirement_name}'")
    print("-" * 65)
    print(f" MESSAGE BODY:\n{req.message}")
    print("=" * 65 + "\n")

    return {
        "data": {
            "ok": True,
            "message": "Inquiry logged to server console (Mock email sent successfully)"
        }
    }


if __name__ == "__main__":
    import uvicorn
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
    print("\nStarting DukanDoc AI Server on http://127.0.0.1:8000 ...")
    uvicorn.run(app, host="127.0.0.1", port=8000)
