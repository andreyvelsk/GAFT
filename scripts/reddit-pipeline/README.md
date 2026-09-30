# Reddit Pipeline

The `scripts/reddit-pipeline` tooling scans r/AynThor, filters relevant posts and
generates/updates project pages under `content/<slug>/index.md`.

## Architecture

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

## Decision backends (`jev` vs `llm`)

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

## Comparing backends

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

## Cost report

Every run records the model usage and cost per agent (`filter`, `match`,
`category`, `create`, `update`) in the run report. The Markdown report gains a
**Cost by model** table with the backend, the model, the number of calls, the
input/output tokens and the cost in USD, plus a total row:

| Agent | Backend | Model | Calls | Input tokens | Output tokens | Cost (USD) |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| filter | jev | `typesafe/jev-1.13` | 12 | 8,400 | 1,200 | $0.000420 |
| create | — | `~deepseek/deepseek-v4-flash-latest` | 3 | 42,000 | 9,000 | $0.006300 |

- **Jev** reports its cost directly (`usage.cost`).
- **LLM** providers only report tokens, so the cost is estimated from the model
  price. The prices are loaded once at the start of the run from the OpenRouter
  `/api/v1/models` endpoint; when the request fails the run continues with
  `cost: 0` (the token counts are still recorded).

This makes the Jev-vs-LLM trade-off visible on concrete numbers: run the same
window with `--backend jev` and with `--backend llm` and compare the cost table.

## GitHub token

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

## Running the agents manually

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

## Command-line options

`npm run reddit:pipeline` accepts options that override the corresponding
environment variables (the `.env` file is still loaded as the baseline). Run
`npm run reddit:pipeline -- --help` to print the full list. Options support both
`--flag value` and `--flag=value`; an unknown option or a malformed value aborts
the run with a non-zero exit code.

```bash
# Look back 48 hours instead of the default 24 and process at most 5 posts.
npm run reddit:pipeline -- --hours 48 --max-posts 5

# Run the filter/match/category agents on the Jev (System One) backend.
npm run reddit:pipeline -- --backend jev

# Dry run with a custom report path.
npm run reddit:pipeline -- --dry-run --report plans/my-report.json
```

**Fetch window**

| Option | Aliases | Overrides | Description |
| --- | --- | --- | --- |
| `--hours <n>` | `--lookback-hours` | `REDDIT_LOOKBACK_HOURS` | Lookback window in hours (positive integer, default `24`). |
| `--max-posts <n>` | `--limit` | `REDDIT_MAX_POSTS` | Max posts to process, `0` = unlimited (default `0`). |
| `--subreddit <name>` | — | `REDDIT_SUBREDDIT` | Subreddit to scan (default `AynThor`). |
| `--batch-size <n>` | — | `REDDIT_BATCH_SIZE` | Posts per LLM batch (positive integer, default `10`). |

**Decision backend** (`filter` / `match` / `category`)

| Option | Overrides | Description |
| --- | --- | --- |
| `--backend <jev\|llm>` | `REDDIT_{FILTER,MATCH,CATEGORY}_BACKEND` | Set the backend for all three agents. |
| `--filter-backend <jev\|llm>` | `REDDIT_FILTER_BACKEND` | Backend for the filter agent. |
| `--match-backend <jev\|llm>` | `REDDIT_MATCH_BACKEND` | Backend for the match agent. |
| `--category-backend <jev\|llm>` | `REDDIT_CATEGORY_BACKEND` | Backend for the category agent. |
| `--decisions-base-url <url>` | `OPENROUTER_DECISIONS_BASE_URL` | Jev (System One) base URL. |
| `--decisions-model <m>` | `REDDIT_DECISIONS_MODEL` | Jev (System One) model. |

**Models** (`create` / `update` always use the generation engine)

| Option | Overrides | Description |
| --- | --- | --- |
| `--model <m>` | `REDDIT_*_MODEL` | Set the model for all agents. |
| `--filter-model <m>` | `REDDIT_FILTER_MODEL` | Model for the filter agent. |
| `--match-model <m>` | `REDDIT_MATCH_MODEL` | Model for the match agent. |
| `--create-model <m>` | `REDDIT_CREATE_MODEL` | Model for the create agent. |
| `--update-model <m>` | `REDDIT_UPDATE_MODEL` | Model for the update agent. |
| `--category-model <m>` | `REDDIT_CATEGORY_MODEL` | Model for the category agent. |

**Thresholds** (`0..1`)

| Option | Overrides | Description |
| --- | --- | --- |
| `--threshold <n>` | `REDDIT_*_THRESHOLD` | Set the threshold for all three agents. |
| `--filter-threshold <n>` | `REDDIT_FILTER_THRESHOLD` | Threshold for the filter agent. |
| `--match-threshold <n>` | `REDDIT_MATCH_THRESHOLD` | Threshold for the match agent. |
| `--category-threshold <n>` | `REDDIT_CATEGORY_THRESHOLD` | Threshold for the category agent. |

**Run mode and reports**

| Option | Aliases | Overrides | Description |
| --- | --- | --- | --- |
| `--dry-run` | — | `REDDIT_DRY_RUN` | Do not write any files. |
| `--no-dry-run` | — | `REDDIT_DRY_RUN` | Force writing files. |
| `--prefilter` | — | `REDDIT_PREFILTER` | Run the deterministic prefilter (default). |
| `--no-prefilter` | — | `REDDIT_PREFILTER` | Skip the deterministic prefilter: every fetched post reaches the filter agent. |
| `--report <path>` | `--report-path` | — | JSON report path (the `.md` report is derived from it). |
| `--no-report` | — | — | Do not write the report to disk. |
| `--write-report` | — | — | Force writing the report. |

**Misc**

| Option | Aliases | Description |
| --- | --- | --- |
| `--now <iso>` | — | Reference time for the fetch window (ISO-8601). |
| `-h` | `--help` | Show the usage help and exit. |

When several flags target the same setting (e.g. `--model` and
`--filter-model`), the last one wins. Boolean flags default to the environment
value when omitted.

If a run reports `401 Unauthorized`, the API key was not loaded: check that
`OPENROUTER_API_KEY` is set in `.env` (not just exported in a shell) and is not
overridden by an empty value.
