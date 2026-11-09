#!/usr/bin/env python3
"""Check documentation and repository URLs listed in the catalog."""
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

CATALOG = Path(__file__).resolve().parents[1] / "data" / "catalog.json"
TIMEOUT_SECONDS = 15
USER_AGENT = "Developer-Hub-Link-Checker/1.0"


def check_url(url: str) -> tuple[bool, str]:
    # Some hosts reject HEAD requests; retry with a small ranged GET.
    for method in ("HEAD", "GET"):
        request = urllib.request.Request(
            url,
            method=method,
            headers={"User-Agent": USER_AGENT, "Range": "bytes=0-0"},
        )
        try:
            with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as response:
                return response.status < 400, f"HTTP {response.status}"
        except urllib.error.HTTPError as exc:
            if method == "HEAD" and exc.code in (405, 501):
                continue
            return False, f"HTTP {exc.code}"
        except (urllib.error.URLError, TimeoutError) as exc:
            return False, str(exc)
    return False, "HEAD and GET requests were not accepted"


def main() -> None:
    data = json.loads(CATALOG.read_text(encoding="utf-8"))
    failures = []
    checked = 0

    for group in data["groups"]:
        for item in group["items"]:
            for field in ("url", "repository"):
                url = item.get(field)
                if not url:
                    continue
                checked += 1
                ok, detail = check_url(url)
                label = f'{item["id"]} ({field})'
                print(f'{"OK" if ok else "FAIL"}: {label}: {detail} - {url}')
                if not ok:
                    failures.append(label)

    print(f"\nChecked {checked} URLs; {len(failures)} failed.")
    if failures:
        print("Failed entries: " + ", ".join(failures), file=sys.stderr)
        raise SystemExit(1)


if __name__ == "__main__":
    main()
