"""
Batch geocode all unique pincodes from Centers.xlsx using OpenStreetMap Nominatim.
Saves results to data/pincode_coords.json for offline Haversine distance calculation.

Nominatim is free, no API key needed, rate limit = 1 request/second.
380 pincodes = ~7 minutes one-time generation.
"""
import os
import sys
import json
import re
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Fix Windows terminal encoding
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass
site_packages = os.path.join(ROOT, "Lib", "site-packages")
if os.path.exists(site_packages):
    sys.path.insert(0, site_packages)

import requests
import openpyxl

XLSX_PATH = os.path.join(ROOT, "data", "Centers.xlsx")
OUTPUT_PATH = os.path.join(ROOT, "data", "pincode_coords.json")

def extract_unique_pincodes():
    """Extract all unique 6-digit pincodes from Centers.xlsx."""
    wb = openpyxl.load_workbook(XLSX_PATH, read_only=True)
    pincodes = set()
    for sheet_name in wb.sheetnames:
        ws = wb[sheet_name]
        first = True
        for row in ws.iter_rows(values_only=True):
            if first:
                first = False
                continue
            if len(row) > 2 and row[2]:
                p = str(row[2]).strip()
                if re.match(r'^\d{6}$', p):
                    pincodes.add(p)
    wb.close()
    return sorted(pincodes)


def geocode_pincode(pincode, retries=2):
    """
    Geocode a single Indian pincode via OpenStreetMap Nominatim.
    Returns (lat, lon) or None on failure.
    """
    url = "https://nominatim.openstreetmap.org/search"
    headers = {"User-Agent": "LegalDoc-Hackathon-App/1.0 (educational project)"}
    params = {
        "postalcode": pincode,
        "country": "India",
        "format": "json",
        "limit": 1
    }

    for attempt in range(retries + 1):
        try:
            resp = requests.get(url, params=params, headers=headers, timeout=8)
            if resp.status_code == 429:
                # Rate limited, wait and retry
                time.sleep(2)
                continue
            data = resp.json()
            if data:
                return {
                    "lat": float(data[0]["lat"]),
                    "lon": float(data[0]["lon"]),
                    "display": data[0].get("display_name", "")[:80]
                }
            # If postalcode search fails, try freeform query
            params2 = {"q": f"{pincode}, India", "format": "json", "limit": 1}
            resp2 = requests.get(url, params=params2, headers=headers, timeout=8)
            data2 = resp2.json()
            if data2:
                return {
                    "lat": float(data2[0]["lat"]),
                    "lon": float(data2[0]["lon"]),
                    "display": data2[0].get("display_name", "")[:80]
                }
        except Exception as e:
            if attempt < retries:
                time.sleep(1)
                continue
            print(f"  [ERROR] Pincode {pincode}: {e}")
    return None


def main():
    # Load existing progress if script was interrupted
    existing = {}
    if os.path.exists(OUTPUT_PATH):
        with open(OUTPUT_PATH, "r", encoding="utf-8") as f:
            existing = json.load(f)
        print(f"[Resume] Loaded {len(existing)} already-geocoded pincodes from previous run.")

    pincodes = extract_unique_pincodes()
    print(f"[Start] Found {len(pincodes)} unique pincodes in Centers.xlsx.")

    remaining = [p for p in pincodes if p not in existing]
    print(f"[Start] {len(remaining)} pincodes left to geocode.")

    coords = dict(existing)
    success = 0
    failed = []

    for i, pin in enumerate(remaining):
        result = geocode_pincode(pin)
        if result:
            coords[pin] = result
            success += 1
            safe_display = result['display'][:40].encode('ascii', errors='replace').decode('ascii')
            print(f"  [{i+1}/{len(remaining)}] {pin} -> ({result['lat']:.4f}, {result['lon']:.4f}) {safe_display}")
        else:
            failed.append(pin)
            print(f"  [{i+1}/{len(remaining)}] {pin} -> FAILED (will use area centroid fallback)")

        # Save progress every 20 pincodes (resume-safe)
        if (i + 1) % 20 == 0 or (i + 1) == len(remaining):
            with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
                json.dump(coords, f, indent=2)

        # Nominatim rate limit: 1 request/second
        time.sleep(1.1)

    # Final save
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(coords, f, indent=2)

    print(f"\n[Done] Geocoded {success}/{len(remaining)} new pincodes. Total in file: {len(coords)}.")
    if failed:
        print(f"[Warning] {len(failed)} pincodes failed: {failed[:10]}...")
    print(f"[Saved] {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
