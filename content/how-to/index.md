---
title: "How to Add a Project"
description: "Step-by-step guide on how to contribute a new project to the Games & Apps for AYN Thor collection via GitHub Pull Request."
date: "2026-06-15 00:00"
slug: "how-to"
category: "page"
media: []
---

## Overview

This guide walks you through the process of adding a new project (game or app) to the collection. All contributions are made via **GitHub Pull Requests**.

## Prerequisites

- A [GitHub](https://github.com) account
- [Git](https://git-scm.com/) installed on your machine
- A text editor (VS Code, Sublime Text, etc.)

## Step 1 — Fork the Repository

1. Navigate to the [repository on GitHub](https://github.com/andreyvelsk/GAFT).
2. Click the **Fork** button in the top-right corner.
3. A copy of the repository will be created under your GitHub account.

## Step 2 — Clone Your Fork

```bash
git clone https://github.com/andreyvelsk/GAFT.git
cd GAFT
```

## Step 3 — Create a New Branch

```bash
git checkout -b add-<project-slug>
```

Replace `<project-slug>` with a short, URL-friendly identifier for your project (e.g. `add-my-cool-game`).

## Step 4 — Create the Content File

Create a new directory under `content/` with your project slug and add an `index.md` file inside it:

```
content/
└── your-project-slug/
    └── index.md
```

### Template

Copy the template below and fill in the fields:

```markdown
---
title: "Project Title"
description: "A short one-line description of the project."
date: "YYYY-MM-DD HH:MM"
slug: "your-project-slug"
category: "companion"
project_page: "https://github.com/username/repository"
media:
  - type: "image"
    url: "https://example.com/screenshot.png"
  - type: "video"
    url: "https://www.youtube.com/watch?v=VIDEO_ID"
tags:
  - tag1
  - tag2
---

## Setup guide

Explain how to install and run the project.

## Tips

- List any useful tips or recommendations.

## Known issues

- Document any known limitations or bugs.
```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `title` | ✅ | Project name displayed as the page heading |
| `description` | ✅ | Short description shown on the card and in SEO meta |
| `date` | ✅ | Publication date in `YYYY-MM-DD HH:MM` format |
| `slug` | ✅ | URL-friendly identifier (must match the directory name) |
| `category` | ✅ | One of the project categories listed below |
| `project_page` | ❌ | Direct link to the project itself (e.g. GitHub repo or release page). Used as the main "Open project" button |
| `media` | ❌ | List of images or videos for the carousel |
| `tags` | ❌ | List of tags for categorization |

### Categories

Each project page must use exactly one of the following categories:

| Category | Meaning |
|----------|---------|
| `game` | A standalone, self-contained game. |
| `app` | A standalone application that makes use of both screens. |
| `companion` | An app used together with a game to show useful information. It may be synced with the game in real time or act as an offline reference. |
| `emulator` | An emulator of a system that has a feature using the second screen. |
| `tool` | A utility for flexible configuration or for improving how the system works overall. |

### Media Items

Each media entry supports two types:

- **Image**: `type: "image"` with a direct URL to the image file
- **Video**: `type: "video"` with a YouTube URL

### Project Link

The optional `project_page` field points to the project itself (a GitHub repository, a release page, a store listing, etc.). It is used as the main **Open project** button on the project page, so it should lead directly to the source code or the download.

```yaml
project_page: "https://github.com/username/repository"
```

If the project has no dedicated page yet, the field can simply be omitted.

> **Note about the "Add to Obtainium" button**
> The button is rendered **only** from `project_page`, and only when that value is a link to a GitHub repository (`https://github.com/<author>/<repo>`). If `project_page` is missing, points to a non-GitHub URL, or the repository is private, the button is not shown. To make it appear, make sure `project_page` contains a direct GitHub repository link, e.g. `https://github.com/username/repository`.

## Step 5 — Preview Locally (Optional)

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and navigate to your project page at `/project/<your-project-slug>`.

## Step 6 — Commit and Push

```bash
git add .
git commit -m "Add <project title>"
git push origin add-<project-slug>
```

## Step 7 — Open a Pull Request

1. Go to the original repository on GitHub.
2. You should see a banner suggesting to create a Pull Request from your recently pushed branch — click **Compare & pull request**.
3. Fill in the PR title and description:
   - **Title**: `Add <Project Title>`
   - **Description**: A brief summary of what the project does and why it fits the collection.
4. Click **Create pull request**.

## Step 8 — Review

A maintainer will review your PR. You may be asked to make changes. Once approved, the PR will be merged and the project will appear on the site automatically after the next deployment.
