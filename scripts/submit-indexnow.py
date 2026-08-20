#!/usr/bin/env python
"""
Submit sitemap URLs to IndexNow API for concasaya.com.
API key file: b678cced33e54befb1a4fe9e27ee5bbd.txt (must be hosted at https://www.concasaya.com/)
"""
import json
import urllib.request
import urllib.error
import sys
from pathlib import Path

WORKSPACE = Path(r"C:/Workspace/concasaya")
PAYLOAD = WORKSPACE / "indexnow-payload.json"
KEY_FILE = WORKSPACE / "b678cced33e54befb1a4fe9e27ee5bbd.txt"

# 1. Sanity: ensure key file exists locally
if not KEY_FILE.exists():
    print(f"ERROR: key file not found at {KEY_FILE}")
    sys.exit(1)
print(f"Key file OK: {KEY_FILE.name} ({KEY_FILE.stat().st_size} bytes)")

# 2. Load payload
with open(PAYLOAD, "r", encoding="utf-8") as f:
    payload = json.load(f)
print(f"Payload: host={payload['host']}, urls={len(payload['urlList'])}")

# 3. Submit to IndexNow
url = "https://api.indexnow.org/IndexNow"
data = json.dumps(payload).encode("utf-8")
req = urllib.request.Request(
    url,
    data=data,
    headers={"Content-Type": "application/json; charset=utf-8"},
    method="POST",
)
print(f"POST {url}")
try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        status = resp.status
        reason = resp.reason
        body = resp.read().decode("utf-8")
        print(f"STATUS: {status} {reason}")
        print(f"BODY: {body if body else '(empty)'}")
except urllib.error.HTTPError as e:
    print(f"HTTP ERROR: {e.code} {e.reason}")
    print(f"BODY: {e.read().decode('utf-8', errors='replace')}")
    sys.exit(1)
except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")
    sys.exit(1)

# 4. Reference: IndexNow status codes
# 200 = all URLs submitted OK
# 202 = accepted (may process later)
# 400 = bad format
# 403 = invalid key (key file missing or content mismatch)
# 422 = URLs not from the host declared
# 429 = rate limited
print()
print("Status reference:")
print("  200 = all URLs indexed")
print("  202 = accepted, processing later")
print("  403 = key invalid (check key file at domain root)")
print("  422 = URLs don't belong to the declared host")
