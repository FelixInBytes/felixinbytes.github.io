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

## Add a GitHub project

1. Add a markdown file in `src/content/projects/` (example: `my-app.md`).
2. Include this frontmatter:

```md
---
title: "My App" # optional, defaults to GitHub repo name
github: "felixinbytes/my-app" # or full https://github.com/... URL
order: 1 # optional sort order
draft: false
---
```

3. Write your short review as markdown below the frontmatter.
4. At build time, repo metadata (description, language, stars, forks, last push) is fetched from the GitHub API.

Optional: set `GITHUB_TOKEN` in GitHub Actions secrets for higher API rate limits during deploys.

## Build

```bash
npm run build
npm run preview
```

The production output is generated in `dist/`.

## Deployment

The workflow lives in `.github/workflows/deploy.yml`.

In repository settings, configure GitHub Pages source to **GitHub Actions**.
