# AGENTS.md

Guidelines for AI agents working with this project (Nuxt 3 blog with @nuxt/content, Firebase, Vitest).

## Verification commands

Run these after making changes. All commands run from the project root. Use Yarn only for package management and project commands; do not use npm.

```sh
# Lint (ESLint)
yarn lint

# Lint with auto-fix
yarn lint:fix

# TypeScript check (plain tsc, no emit)
yarn tsc

# Full Nuxt typecheck (vue-tsc, slower but covers .vue files)
yarn typecheck

# Tests (run once)
yarn test
```

### Tests — errors only

To see only failures/errors without full test output:

```sh
yarn test:errors
```

- Runs `scripts/test-errors.mjs` (a wrapper around `vitest run --reporter=json`).
- Prints a compact summary: total/passed/failed counts, then only failing test names with short error messages. No full test output, no report files.
- Use this instead of `yarn test` when you only need to know what's broken.

## Project structure

- `pages/` — Nuxt pages (Vue SFC), including dynamic routes (`pages/project/[slug].vue`, `pages/category/[category]/...`)
- `components/` — Vue components
- `composables/` — Vue composables (`useArticles.ts`, `useLikes.ts`, etc.)
- `content/` — Markdown articles (`content/<slug>/index.md`), one directory per project/article
- `public/content/` — static assets for articles (previews, screenshots as `.webp`)
- `lib/` — shared utilities (`categories.ts`, `constants.ts`, `firebase.ts`)
- `scripts/reddit-pipeline/` — standalone TypeScript pipeline (run via `tsx`), has its own tests under `*/tests/*.spec.ts`
- `layouts/`, `plugins/`, `assets/` — standard Nuxt directories

## Conventions

- Content articles live in `content/<slug>/index.md` with frontmatter; preview images go to `public/content/<slug>/preview.webp`.
- Images should be `.webp` (use `yarn convert:previews` to convert).
- Tests use Vitest and live next to the code in `tests/` directories (`*.spec.ts`).
- ESLint config: `eslint.config.mjs` (flat config, vue + typescript-eslint).
- Firebase setup documented in `FIREBASE_SETUP.md`; env vars in `.env.example`.

## Notes for agents

- Prefer `yarn tsc` for quick checks; use `yarn typecheck` before finalizing changes touching `.vue` files.
- Do not run `yarn dev`/`build` unless explicitly asked — they are long-running.
- Reddit pipeline scripts require env vars (see `.env.example` and `scripts/reddit-pipeline/README.md`).
