# Felix in Bytes

Minimal personal blog built with Astro and hosted on GitHub Pages.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown by Astro to preview the site.

## Create a new blog post

1. Add a markdown file in `src/content/blog/` (example: `my-post.md`).
2. Include this frontmatter:

```md
---
title: "My Post Title"
description: "One sentence summary."
date: 2026-05-27
updated: 2026-05-27 # optional
draft: false
---
```

3. Write your markdown content below it.
4. Commit and push to `main` to trigger deployment.

## Build

```bash
npm run build
npm run preview
```

The production output is generated in `dist/`.

## Deployment

The workflow lives in `.github/workflows/deploy.yml`.

In repository settings, configure GitHub Pages source to **GitHub Actions**.
