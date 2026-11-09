#!/usr/bin/env python3
"""Validate the Developer Hub JSON catalog using only the Python standard library."""
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

CATALOG = Path(__file__).resolve().parents[1] / "data" / "catalog.json"
ID_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
ICON_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def valid_url(value: object) -> bool:
    if not isinstance(value, str):
        return False
    parsed = urlparse(value)
    return parsed.scheme in {"https", "http"} and bool(parsed.netloc)


def main() -> None:
    try:
        data = json.loads(CATALOG.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        fail(f"Cannot read valid JSON from {CATALOG}: {exc}")

    if not isinstance(data, dict) or not isinstance(data.get("groups"), list):
        fail('Root object must contain a "groups" array.')

    seen = set()
    resources = 0
    for group_index, group in enumerate(data["groups"]):
        if not isinstance(group, dict):
            fail(f"Group at index {group_index} must be an object.")
        for field in ("id", "name", "items"):
            if field not in group:
                fail(f'Group at index {group_index} is missing "{field}".')
        if not isinstance(group["id"], str) or not ID_PATTERN.fullmatch(group["id"]):
            fail(f"Invalid group id: {group.get('id')!r}")
        if group["id"] in seen:
            fail(f"Duplicate id: {group['id']}")
        seen.add(group["id"])
        if not isinstance(group["name"], str) or not group["name"].strip():
            fail(f'Group "{group["id"]}" needs a non-empty name.')
        if not isinstance(group["items"], list):
            fail(f'Group "{group["id"]}" items must be an array.')
        if "icon" in group and (not isinstance(group["icon"], str) or not ICON_PATTERN.fullmatch(group["icon"])):
            fail(f'Invalid icon identifier in group "{group["id"]}".')

        for item in group["items"]:
            if not isinstance(item, dict):
                fail(f'An item in group "{group["id"]}" must be an object.')
            for field in ("id", "name", "url"):
                if field not in item:
                    fail(f'An item in group "{group["id"]}" is missing "{field}".')
            item_id = item["id"]
            if not isinstance(item_id, str) or not ID_PATTERN.fullmatch(item_id):
                fail(f"Invalid item id: {item_id!r}")
            if item_id in seen:
                fail(f"Duplicate id: {item_id}")
            seen.add(item_id)
            if not isinstance(item["name"], str) or not item["name"].strip():
                fail(f'Item "{item_id}" needs a non-empty name.')
            if not valid_url(item["url"]):
                fail(f'Item "{item_id}" has an invalid URL: {item["url"]!r}')
            if "repository" in item and not valid_url(item["repository"]):
                fail(f'Item "{item_id}" has an invalid repository URL.')
            if "description" in item and not isinstance(item["description"], str):
                fail(f'Item "{item_id}" description must be a string.')
            if "icon" in item and (not isinstance(item["icon"], str) or not ICON_PATTERN.fullmatch(item["icon"])):
                fail(f'Item "{item_id}" has an invalid icon identifier.')
            if "tags" in item:
                if not isinstance(item["tags"], list) or not all(isinstance(tag, str) for tag in item["tags"]):
                    fail(f'Item "{item_id}" tags must be an array of strings.')
            resources += 1

    print(f"Catalog is valid: {len(data['groups'])} groups, {resources} resources.")


if __name__ == "__main__":
    main()
