#!/usr/bin/env python
"""Verify that the IndexNow key file is publicly accessible."""
import urllib.request
import urllib.error

URL = "https://www.concasaya.com/b678cced33e54befb1a4fe9e27ee5bbd.txt"
EXPECTED_KEY = "b678cced33e54befb1a4fe9e27ee5bbd"

print(f"GET {URL}")
try:
    with urllib.request.urlopen(URL, timeout=15) as resp:
        status = resp.status
        reason = resp.reason
        body = resp.read().decode("utf-8").strip()
        print(f"STATUS: {status} {reason}")
        print(f"BODY: {body!r}")
        match = body == EXPECTED_KEY
        print(f"KEY MATCH: {match}")
        if not match:
            print(f"Expected: {EXPECTED_KEY!r}")
            print(f"Got:      {body!r}")
except urllib.error.HTTPError as e:
    print(f"HTTP ERROR: {e.code} {e.reason}")
    print("The key file is NOT yet reachable. If the deploy is in progress, wait a minute and re-run.")
except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")
