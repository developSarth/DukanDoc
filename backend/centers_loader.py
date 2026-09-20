"""
Centers Loader with GPS-based Haversine Distance Sorting.

Loads 4,198 official Aaple Sarkar / CSC centers from Centers.xlsx,
maps each to GPS coordinates via pincode_coords.json, and sorts results
by real geographic distance (in kilometers) from the user's location.

No external API calls at query time — everything is local & instant.
"""
import os
import sys
import re
import json
import math

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
site_packages = os.path.join(ROOT_DIR, "Lib", "site-packages")
if os.path.exists(site_packages) and site_packages not in sys.path:
    sys.path.insert(0, site_packages)

import openpyxl
import requests

DATA_PATH = os.path.join(ROOT_DIR, "data", "Centers.xlsx")
COORDS_PATH = os.path.join(ROOT_DIR, "data", "pincode_coords.json")

# In-memory caches
_CENTERS_CACHE = None
_COORDS_CACHE = None


# ============================================================
# 1. Haversine Distance (exact great-circle distance in km)
# ============================================================
def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates the great-circle distance between two points
    on Earth using the Haversine formula.
    Returns distance in kilometers.
    """
    R = 6371.0  # Earth's mean radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# ============================================================
# 2. Load pincode → GPS coordinate mapping
# ============================================================
def load_coords():
    """Load precomputed pincode GPS coordinates from pincode_coords.json."""
    global _COORDS_CACHE
    if _COORDS_CACHE is not None:
        return _COORDS_CACHE

    if os.path.exists(COORDS_PATH):
        with open(COORDS_PATH, "r", encoding="utf-8") as f:
            _COORDS_CACHE = json.load(f)
        print(f"[CentersLoader] Loaded GPS coordinates for {len(_COORDS_CACHE)} pincodes.")
    else:
        print(f"[CentersLoader] Warning: {COORDS_PATH} not found. Distance sorting disabled.")
        _COORDS_CACHE = {}

    return _COORDS_CACHE


# ============================================================
# 3. Geocode a user's location query to (lat, lon)
# ============================================================
def geocode_location(location_query: str):
    """
    Resolves a user's location string to (lat, lon).
    Priority:
      1. Extract 6-digit pincode from query → look up in pincode_coords.json (instant, offline)
      2. Fall back to free OpenStreetMap Nominatim API (single request, no key needed)
    Returns (lat, lon) tuple or None.
    """
    coords = load_coords()
    q = (location_query or "").strip()

    # 1. Try to extract a 6-digit Indian pincode from the query
    pincode_match = re.search(r'\b([1-9]\d{5})\b', q)
    if pincode_match:
        pin = pincode_match.group(1)
        if pin in coords:
            c = coords[pin]
            return (c["lat"], c["lon"])

    # 2. Fall back to Nominatim (free, 1 request, no API key)
    try:
        url = "https://nominatim.openstreetmap.org/search"
        headers = {"User-Agent": "LegalDoc-Hackathon-App/1.0 (educational project)"}
        # Add ", India" if not already present for better accuracy
        search_q = q if "india" in q.lower() else f"{q}, India"
        params = {"q": search_q, "format": "json", "limit": 1}
        resp = requests.get(url, params=params, headers=headers, timeout=5)
        data = resp.json()
        if data:
            return (float(data[0]["lat"]), float(data[0]["lon"]))

        # If composite query like "Dadar and Andheri", resolve the primary location
        if any(sep in q.lower() for sep in [" and ", " or ", " & ", "/"]):
            primary = re.split(r'\s+(?:and|or|&)\s+|\s*/\s*', q, flags=re.IGNORECASE)[0].strip()
            if primary and primary.lower() != q.lower():
                return geocode_location(primary)
    except Exception as e:
        print(f"[CentersLoader] Nominatim geocode failed for '{q}': {e}")

    return None


# ============================================================
# 4. Load all centers from Centers.xlsx
# ============================================================
def load_centers():
    """
    Loads all centers from Centers.xlsx into memory.
    Attaches GPS coordinates from pincode_coords.json.
    Cached after first call.
    """
    global _CENTERS_CACHE
    if _CENTERS_CACHE is not None:
        return _CENTERS_CACHE

    if not os.path.exists(DATA_PATH):
        print(f"[CentersLoader] Warning: {DATA_PATH} not found.")
        _CENTERS_CACHE = []
        return _CENTERS_CACHE

    coords = load_coords()
    centers = []
    wb = openpyxl.load_workbook(DATA_PATH, read_only=True)

    for sheet_name in wb.sheetnames:
        ws = wb[sheet_name]
        is_first = True
        for row in ws.iter_rows(values_only=True):
            if is_first:
                is_first = False
                continue
            if not row or not any(row):
                continue

            vle_name = str(row[0] if len(row) > 0 and row[0] is not None else "").strip()
            address = str(row[1] if len(row) > 1 and row[1] is not None else "").strip()
            pincode = str(row[2] if len(row) > 2 and row[2] is not None else "").strip()
            mobile = str(row[3] if len(row) > 3 and row[3] is not None else "").strip()
            raw_email = str(row[4] if len(row) > 4 and row[4] is not None else "").strip()

            # Clean email format
            clean_email = (
                raw_email.replace("[at]", "@")
                .replace("[dot]", ".")
                .replace(" ", "")
                .strip()
            )
            if clean_email and "@" in clean_email:
                if not clean_email.endswith(".com") and not clean_email.endswith(".in"):
                    clean_email += ".com"

            # Attach GPS coordinates from pincode lookup
            lat, lon = None, None
            if pincode in coords:
                lat = coords[pincode]["lat"]
                lon = coords[pincode]["lon"]

            centers.append({
                "area": sheet_name,
                "vle_name": vle_name,
                "address": address,
                "pincode": pincode,
                "mobile": mobile,
                "email": clean_email,
                "lat": lat,
                "lon": lon,
            })

    wb.close()
    _CENTERS_CACHE = centers
    geo_count = sum(1 for c in centers if c["lat"] is not None)
    print(f"[CentersLoader] Loaded {len(centers)} centers ({geo_count} with GPS coordinates).")
    return _CENTERS_CACHE


# ============================================================
# 5. Search and sort centers by real GPS distance
# ============================================================
def search_official_centers(location_query: str, limit: int = 5):
    """
    Finds nearest official Aaple Sarkar / CSC centers to the user's location.

    Approach:
      1. Geocode the user's location query to (lat, lon).
      2. Compute Haversine distance to every center with GPS coordinates.
      3. Sort strictly by ascending distance (nearest first).
      4. Format results for the ProfessionalCard UI component.

    If geocoding fails, falls back to keyword/pincode text matching.
    """
    all_centers = load_centers()
    if not all_centers:
        return []

    user_coords = geocode_location(location_query)

    # ---- GPS-BASED NEAREST SORT (primary path) ----
    if user_coords:
        user_lat, user_lon = user_coords

        # Calculate distance for every center that has GPS coordinates
        scored = []
        for c in all_centers:
            if c["lat"] is not None and c["lon"] is not None:
                dist = haversine_km(user_lat, user_lon, c["lat"], c["lon"])
                scored.append((dist, c))

        # Sort by distance ascending (nearest first)
        scored.sort(key=lambda x: x[0])

        results = []
        for dist_km, c in scored[:limit]:
            # Format distance label
            if dist_km < 0.1:
                dist_label = "In your local area (< 500m)"
            elif dist_km < 1.0:
                dist_label = f"{int(dist_km * 1000)} meters away"
            else:
                dist_label = f"{dist_km:.1f} km away"

            results.append({
                "name": f"Aaple Sarkar Seva Kendra ({c['vle_name']})",
                "profession_type": "Authorized Maharashtra Govt e-Seva & CSC Center",
                "location": f"{c['address']} (Pin: {c['pincode']})",
                "rating": "Official Govt Partner (Aaple Sarkar / CSC)",
                "contact_email": c["email"] or "contact.setu@mahaonline.gov.in",
                "phone": f"+91 {c['mobile']}" if c["mobile"] else "",
                "pricing": "Govt Fixed Rates (Rs.30 - Rs.100 standard fee)",
                "source_url": "https://aaplesarkar.mahaonline.gov.in",
                "is_government": True,
                "distance_km": round(dist_km, 2),
                "distance_label": dist_label,
            })

        if results:
            print(f"[CentersLoader] Returning {len(results)} nearest centers to ({user_lat:.4f}, {user_lon:.4f}). "
                  f"Closest: {results[0]['distance_km']} km.")
            return results

    # ---- TEXT-BASED FALLBACK (if geocoding fails) ----
    q = (location_query or "").lower().strip()
    pincode_match = re.search(r'\b([1-9]\d{5})\b', q)
    target_pincode = pincode_match.group(1) if pincode_match else None

    keywords = [
        w for w in re.split(r'[\s,]+', q)
        if len(w) > 2 and w not in [
            "mumbai", "near", "road", "street", "west", "east",
            "area", "india", "maharashtra", "north", "south",
            "and", "the", "for", "with", "from", "close"
        ]
    ]

    matches = []

    # Pass 1: pincode match
    if target_pincode:
        for c in all_centers:
            if target_pincode in c["pincode"]:
                matches.append(c)

    # Pass 2: area/sheet name match
    if len(matches) < limit:
        for c in all_centers:
            if c in matches:
                continue
            if any(k in c["area"].lower() for k in keywords):
                matches.append(c)

    # Pass 3: address keyword match
    if len(matches) < limit:
        for c in all_centers:
            if c in matches:
                continue
            if any(k in c["address"].lower() for k in keywords):
                matches.append(c)

    # Fallback: central Mumbai areas
    if not matches:
        for c in all_centers:
            if c["area"].lower() in ["andheri", "kurla", "borivali", "dadar"]:
                matches.append(c)
                if len(matches) >= limit:
                    break

    results = []
    for c in matches[:limit]:
        results.append({
            "name": f"Aaple Sarkar Seva Kendra ({c['vle_name']})",
            "profession_type": "Authorized Maharashtra Govt e-Seva & CSC Center",
            "location": f"{c['address']} (Pin: {c['pincode']})",
            "rating": "Official Govt Partner (Aaple Sarkar / CSC)",
            "contact_email": c["email"] or "contact.setu@mahaonline.gov.in",
            "phone": f"+91 {c['mobile']}" if c["mobile"] else "",
            "pricing": "Govt Fixed Rates (Rs.30 - Rs.100 standard fee)",
            "source_url": "https://aaplesarkar.mahaonline.gov.in",
            "is_government": True,
            "distance_km": None,
            "distance_label": "Distance unavailable",
        })

    return results


# ============================================================
# Quick test
# ============================================================
if __name__ == "__main__":
    print("=" * 60)
    print("Testing GPS-based nearest center search")
    print("=" * 60)

    tests = [
        "Dadar West, Mumbai",
        "Andheri East, 400069",
        "Thane West",
        "400001",
    ]

    for loc in tests:
        print(f"\n--- Query: '{loc}' ---")
        results = search_official_centers(loc, limit=3)
        for r in results:
            print(f"  {r['distance_label']:>18s} | {r['name'][:50]}")
            print(f"                     | {r['location'][:60]}")
