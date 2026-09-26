# GAFT — Games & Apps For Thor

A curated collection of games and apps that truly shine on the **AYN Thor** dual-screen handheld console — from companion app pairings to native dual-screen Android ports.

Built with **Nuxt 3** (SSG), **@nuxt/content**, **Tailwind CSS**, and **Firebase**.

🔗 **Live site:** [GAFT](https://andreyvelsk.github.io/GAFT/)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18
- [npm](https://www.npmjs.com/) (or pnpm / yarn)
- A [Firebase](https://console.firebase.google.com/) project

### Environment Variables

Create a `.env` file based on [`.env.example`](.env.example). Need for Firebase integration.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Generate static site
npm run generate

# Preview the generated site
npm run preview
```

---

## Adding New Content

See the [How to Add](content/how-to/index.md) guide for detailed instructions.

---

## Reddit Pipeline

The `scripts/reddit-pipeline` tooling scans r/AynThor, filters relevant posts and
generates/updates project pages under `content/<slug>/index.md`.

### GitHub token

The pipeline reads repositories, READMEs and releases through the GitHub REST
API. Without a token the API is limited to **60 requests per hour per IP**,
which a single run can exhaust. Set a personal access token to raise the limit
to 5000 requests/hour:

```bash
export GITHUB_TOKEN=ghp_xxx
```

Use a classic PAT with the `public_repo` scope (or a fine-grained token with
read-only **Contents** access). In GitHub Actions the token is provided
automatically. When the token is missing the pipeline logs a one-time warning
and continues in the degraded mode.
