# Developer Hub

A lightweight, JSON-driven directory for engineering resources. It is a static website designed for GitHub Pages.

## Features

- Resource groups and cards rendered from `data/catalog.json`
- Optional descriptions, Lucide icons, tags and source-repository links
- Search across resource names, descriptions, IDs, groups and tags
- Light, dark and system themes, with the selection saved in local storage
- Responsive layout and keyboard shortcut (`/`) to focus search
- Catalog validation in GitHub Actions
- No frontend framework, build step, npm dependencies or runtime backend

## Add a resource

Edit `data/catalog.json` and add an item to the appropriate group's `items` array:

```json
{
  "id": "my-tool",
  "name": "My Tool",
  "description": "A short explanation of what it does.",
  "url": "https://example.com/docs/",
  "repository": "https://github.com/owner/my-tool",
  "icon": "package",
  "tags": ["tooling", "automation"]
}
```

Required item fields: `id`, `name`, `url`.

Optional item fields: `description`, `repository`, `icon`, `tags`.

Group fields: `id`, `name`, `items` are required. `description` and `icon` are optional.

IDs must be unique across groups and items. Use lowercase kebab-case IDs. URLs must use HTTP or HTTPS.

### Icons

The `icon` value is a Lucide icon name in kebab-case, for example:

- `book-up` — publishing documentation
- `book-open` — documentation or reference material
- `workflow` — workflows and automation
- `git-commit` — commit-related tooling
- `package` — libraries and packages
- `files` — templates and starter projects

See the [Lucide icon library](https://lucide.dev/icons/) for available names. Unknown or invalid icon names fall back to `box` in the browser.

## Run locally

Because the page loads JSON with `fetch()`, serve it over HTTP rather than opening `index.html` directly.

With Python:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Publish with GitHub Pages

1. Push this repository to GitHub.
2. Open **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. Ensure the default branch is `main` (or update `.github/workflows/pages.yml`).
5. Push to `main` or run the **Deploy Developer Hub** workflow manually.

The workflow validates the catalog before publishing the repository root to GitHub Pages.

## Validation

Run locally:

```bash
python scripts/validate_catalog.py
```

The validation workflow runs on pull requests and pushes that change the catalog or its validator.

Check the actual documentation and repository URLs locally:

```bash
python scripts/check_links.py
```

The link-check workflow also runs weekly (Monday morning UTC), on catalog changes and manually. External sites can occasionally rate-limit automated requests, so treat an isolated failure as something to verify before changing a URL.

## Project structure

```text
.
├── .github/workflows/
│   ├── pages.yml
│   ├── validate.yml
│   └── check-links.yml
├── data/
│   └── catalog.json
├── scripts/
│   ├── validate_catalog.py
│   └── check_links.py
├── src/
│   ├── css/
│   │   └── main.css
│   └── js/
│       ├── app.js
│       ├── catalog.js
│       ├── search.js
│       └── theme.js
├── index.html
└── README.md
```

## Notes

- The Lucide browser script and Google Fonts are loaded from public CDNs. The site itself has no package installation or build step.
- Resource URLs open in a new tab. The source link is shown only when `repository` is provided.
- The catalog is intentionally explicit: add and maintain entries yourself rather than relying on automatic GitHub repository discovery.
