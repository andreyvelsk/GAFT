# GAFT — Games & Apps For Thor

A curated collection of games and apps that truly shine on the **AYN Thor** dual-screen handheld console — from companion app pairings to native dual-screen Android ports.

Projects are discovered automatically from the [/AynThor subreddit](https://www.reddit.com/r/AynThor/) via the [reddit-pipeline](scripts/reddit-pipeline/README.md).

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
generates/updates project pages under `content/<slug>/index.md`. See
[`scripts/reddit-pipeline/README.md`](scripts/reddit-pipeline/README.md) for the
architecture, decision backends and command-line options.
