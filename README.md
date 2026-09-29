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

### Architecture

The pipeline is layered so that the domain logic is testable in isolation and the
model backends can be swapped:

- **`engines/`** — the low-level capabilities shared by the agents:
  - `generation/` — the LLM generation port (`createProvider`,
    `generateStructured` with repair-retry);
  - `decision/` — the decision port (`DecisionPort`) with two adapters: the Jev
    System One adapter and the legacy LLM adapter, wired by
    `createDecisionEngine`;
  - `model/` — model resolution per agent (`resolveModel`,
    `resolveDecisionModel`).
- **`agents/`** — task-specific agents, each exposing a factory in addition to
  its low-level helpers:
  - `filter/` → `createFilterAgent`;
  - `match/` → `createMatchAgent`;
  - `category/` → `createCategoryAgent`;
  - `create/` → `createCreateAgent`;
  - `update/` → `createUpdateAgent`.
- **`tools/`** — top-level tools used by the agents: `github-search`,
  `github-readme`, `github-release`, `content-read`, `content-search` and
  `image-download`.

### Decision backends (`jev` vs `llm`)

The `filter`, `match` and `category` agents classify posts through the
`DecisionPort` and can run on either backend, selected per agent via
`REDDIT_<AGENT>_BACKEND` (`jev` or `llm`, default `llm`):

- `llm` — the legacy behaviour: the same prompts and `generateStructured()` call
  over the configured OpenRouter model;
- `jev` — the System One (Jev) backend at `OPENROUTER_DECISIONS_BASE_URL` using
  `REDDIT_DECISIONS_MODEL`.

Each backend returns a confidence score. A decision counts as positive when the
score reaches `REDDIT_<AGENT>_THRESHOLD` (default `0.8`). The `create` and
`update` agents always use the generation engine (`GenerationPort`) because they
produce page content rather than a decision.

### Comparing backends

The comparison harness runs the `filter`, `match` and `category` agents through
both the Jev and the LLM backends on the labelled post fixtures and prints a
confusion matrix, the derived metrics (accuracy / precision / recall / F1) and
the agreement between the two backends:

```bash
# Compare one agent (default: filter), optionally overriding the decision
# threshold and limiting the number of posts:
yarn reddit:compare --agent=filter --threshold=0.8 --limit=20
yarn reddit:compare --agent=match
yarn reddit:compare --agent=category
```

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

### Running the agents manually

The `.env` file at the project root is loaded automatically by the pipeline
config, so **no `--env-file` flag is needed**. Make sure `OPENROUTER_API_KEY`
and (ideally) `GITHUB_TOKEN` are set in `.env`, then run:

```bash
# Create a page for one post (prints the generated index.md to stdout).
npm run reddit:create -- https://www.reddit.com/r/AynThor/comments/<id>/<slug>/

# Create pages for a list of links (one per line, lines starting with # ignored).
npm run reddit:create -- --file scripts/reddit-pipeline/scripts/tmp-links.txt

# Update an existing page from a new post.
npm run reddit:update -- <slug> https://www.reddit.com/r/AynThor/comments/<id>/<slug>/

# Full pipeline: fetch → filter → match → create/update.
npm run reddit:pipeline
```

`manual-agents.ts` only prints the result — it does not write files (writing is
done by the pipeline stage). Batch mode continues on a per-post error and exits
with a non-zero code if any post failed.

If a run reports `401 Unauthorized`, the API key was not loaded: check that
`OPENROUTER_API_KEY` is set in `.env` (not just exported in a shell) and is not
overridden by an empty value.
