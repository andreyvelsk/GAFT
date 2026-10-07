import type { AppConfig, PipelineMode } from '../config/lib/types';
import type { DecisionBackend } from '../engines/decision';
import type { OrchestratorOptions } from '../pipeline/orchestrator';
import type { CliArgs } from './types';

/** Type guard narrowing a raw string to a supported decision backend. */
function isBackend(value: string): value is DecisionBackend {
  return value === 'jev' || value === 'llm';
}

/** Type guard narrowing a raw string to a CLI-selectable pipeline mode. */
function isCliMode(value: string): value is 'review' | 'full' {
  return value === 'review' || value === 'full';
}

/** Parse a pipeline mode, rejecting unknown values. */
function parseMode(value: string, flag: string): PipelineMode {
  if (isCliMode(value)) {
    return value;
  }
  throw new Error(
    `invalid value for ${flag}: "${value}" (expected "review" or "full")`,
  );
}

/** Parse a comma/space separated list of Reddit post ids. */
function parseIds(value: string, flag: string): string[] {
  const ids = value.split(/[\s,]+/).filter((id) => id.length > 0);
  if (ids.length === 0) {
    throw new Error(
      `invalid value for ${flag}: "${value}" (expected at least one post id)`,
    );
  }
  return ids;
}

/** Parse a decision backend, rejecting unknown values. */
function parseBackend(value: string, flag: string): DecisionBackend {
  if (isBackend(value)) {
    return value;
  }
  throw new Error(
    `invalid value for ${flag}: "${value}" (expected "jev" or "llm")`,
  );
}

/** Parse a finite number, rejecting non-numeric values. */
function parseNumber(value: string, flag: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`invalid value for ${flag}: "${value}" (expected a number)`);
  }
  return parsed;
}

/** Parse a strictly positive integer. */
function parsePositiveInt(value: string, flag: string): number {
  const parsed = parseNumber(value, flag);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(
      `invalid value for ${flag}: "${value}" (expected a positive integer)`,
    );
  }
  return parsed;
}

/** Parse a non-negative integer (`0` allowed). */
function parseNonNegativeInt(value: string, flag: string): number {
  const parsed = parseNumber(value, flag);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(
      `invalid value for ${flag}: "${value}" (expected a non-negative integer)`,
    );
  }
  return parsed;
}

/** Parse a confidence threshold in the `0..1` range. */
function parseThreshold(value: string, flag: string): number {
  const parsed = parseNumber(value, flag);
  if (parsed < 0 || parsed > 1) {
    throw new Error(
      `invalid value for ${flag}: "${value}" (expected a number between 0 and 1)`,
    );
  }
  return parsed;
}

/** Parse an ISO-8601 date. */
function parseDate(value: string, flag: string): Date {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(
      `invalid value for ${flag}: "${value}" (expected an ISO-8601 date)`,
    );
  }
  return parsed;
}

/**
 * Parse the raw command-line arguments into {@link CliArgs}.
 *
 * Supports both `--flag value` and `--flag=value` forms. Positional arguments
 * (tokens not starting with `-`) and a bare `--` separator are ignored, so the
 * parser is safe to call with the arguments of a wrapping runner (e.g. Vitest).
 * Unknown options and malformed values throw an {@link Error} with a
 * human-readable message.
 */
export function parseArgs(argv: readonly string[]): CliArgs {
  const args: CliArgs = { help: false };

  for (let index = 0; index < argv.length; index += 1) {
    const raw = argv[index];
    if (raw === undefined || raw === '') {
      continue;
    }

    let flag = raw;
    let inline: string | undefined;
    const equalsAt = raw.indexOf('=');
    if (raw.startsWith('--') && equalsAt !== -1) {
      flag = raw.slice(0, equalsAt);
      inline = raw.slice(equalsAt + 1);
    }

    /** Read the option value (inline `--flag=value` or the next token). */
    const value = (): string => {
      if (inline !== undefined) {
        return inline;
      }
      const next = argv[index + 1];
      if (next === undefined) {
        throw new Error(`missing value for ${flag}`);
      }
      index += 1;
      return next;
    };

    switch (flag) {
      case '--help':
      case '-h':
        args.help = true;
        break;

      // --- Reddit fetch window ---
      case '--hours':
      case '--lookback-hours':
        args.lookbackHours = parsePositiveInt(value(), flag);
        break;
      case '--max-posts':
      case '--limit':
        args.maxPosts = parseNonNegativeInt(value(), flag);
        break;
      case '--subreddit':
        args.subreddit = value();
        break;
      case '--batch-size':
        args.batchSize = parsePositiveInt(value(), flag);
        break;

      // --- Run mode ---
      case '--dry-run':
        args.dryRun = true;
        break;
      case '--no-dry-run':
        args.dryRun = false;
        break;
      case '--prefilter':
        args.prefilter = true;
        break;
      case '--no-prefilter':
        args.prefilter = false;
        break;
      case '--mode':
        args.mode = parseMode(value(), flag);
        break;
      case '--approve':
        args.approveIds = parseIds(value(), flag);
        args.mode = 'approve';
        break;

      // --- Decision backends ---
      case '--backend': {
        const backend = parseBackend(value(), flag);
        args.filterBackend = backend;
        args.matchBackend = backend;
        args.categoryBackend = backend;
        break;
      }
      case '--filter-backend':
        args.filterBackend = parseBackend(value(), flag);
        break;
      case '--match-backend':
        args.matchBackend = parseBackend(value(), flag);
        break;
      case '--category-backend':
        args.categoryBackend = parseBackend(value(), flag);
        break;

      // --- Decision (Jev / System One) connection ---
      case '--decisions-base-url':
        args.decisionsBaseUrl = value();
        break;
      case '--decisions-model':
        args.decisionsModel = value();
        break;

      // --- Models ---
      case '--model': {
        const model = value();
        args.filterModel = model;
        args.matchModel = model;
        args.createModel = model;
        args.updateModel = model;
        args.categoryModel = model;
        break;
      }
      case '--filter-model':
        args.filterModel = value();
        break;
      case '--match-model':
        args.matchModel = value();
        break;
      case '--create-model':
        args.createModel = value();
        break;
      case '--update-model':
        args.updateModel = value();
        break;
      case '--category-model':
        args.categoryModel = value();
        break;

      // --- Thresholds ---
      case '--threshold': {
        const threshold = parseThreshold(value(), flag);
        args.filterThreshold = threshold;
        args.matchThreshold = threshold;
        args.categoryThreshold = threshold;
        break;
      }
      case '--filter-threshold':
        args.filterThreshold = parseThreshold(value(), flag);
        break;
      case '--match-threshold':
        args.matchThreshold = parseThreshold(value(), flag);
        break;
      case '--category-threshold':
        args.categoryThreshold = parseThreshold(value(), flag);
        break;

      // --- Reports ---
      case '--report':
      case '--report-path':
        args.reportPath = value();
        break;
      case '--no-report':
        args.writeReport = false;
        break;
      case '--write-report':
        args.writeReport = true;
        break;

      // --- Misc ---
      case '--now':
        args.now = parseDate(value(), flag);
        break;

      case '--':
        // Conventional end-of-options separator: ignore it.
        break;

      default:
        if (!flag.startsWith('-')) {
          // Positional arguments are not used by the pipeline: ignore them.
          break;
        }
        throw new Error(`unknown option: ${flag}`);
    }
  }

  return args;
}

/**
 * Apply the parsed command-line overrides on top of the resolved configuration.
 * Fields absent from {@link CliArgs} keep the environment-derived value.
 */
export function applyArgs(config: AppConfig, args: CliArgs): AppConfig {
  return {
    ...config,
    decisions: {
      baseUrl: args.decisionsBaseUrl ?? config.decisions.baseUrl,
      model: args.decisionsModel ?? config.decisions.model,
    },
    backends: {
      filter: args.filterBackend ?? config.backends.filter,
      match: args.matchBackend ?? config.backends.match,
      category: args.categoryBackend ?? config.backends.category,
    },
    thresholds: {
      filter: args.filterThreshold ?? config.thresholds.filter,
      match: args.matchThreshold ?? config.thresholds.match,
      category: args.categoryThreshold ?? config.thresholds.category,
    },
    models: {
      filter: args.filterModel ?? config.models.filter,
      match: args.matchModel ?? config.models.match,
      create: args.createModel ?? config.models.create,
      update: args.updateModel ?? config.models.update,
      category: args.categoryModel ?? config.models.category,
    },
    reddit: {
      subreddit: args.subreddit ?? config.reddit.subreddit,
      lookbackHours: args.lookbackHours ?? config.reddit.lookbackHours,
      batchSize: args.batchSize ?? config.reddit.batchSize,
      maxPosts: args.maxPosts ?? config.reddit.maxPosts,
      dryRun: args.dryRun ?? config.reddit.dryRun,
      prefilter: args.prefilter ?? config.reddit.prefilter,
      mode: args.mode ?? config.reddit.mode,
    },
  };
}

/**
 * Extract the orchestrator options controlled by the command line (report
 * destination, the reference time and the approved post ids). Absent fields are
 * omitted so the orchestrator keeps its own defaults.
 */
export function orchestratorOptionsFromArgs(
  args: CliArgs,
): Pick<OrchestratorOptions, 'reportPath' | 'writeReport' | 'now'> & {
  approvePostIds?: readonly string[];
} {
  return {
    ...(args.reportPath !== undefined ? { reportPath: args.reportPath } : {}),
    ...(args.writeReport !== undefined ? { writeReport: args.writeReport } : {}),
    ...(args.now !== undefined ? { now: args.now } : {}),
    ...(args.approveIds !== undefined
      ? { approvePostIds: args.approveIds }
      : {}),
  };
}

/** Usage help printed by `--help` and on argument errors. */
export const USAGE = `Reddit pipeline — fetch r/AynThor posts and create/update project pages.

Usage:
  npm run reddit:pipeline -- [options]

Fetch window:
  --hours <n>               Lookback window in hours (default: 24)
  --max-posts <n>           Max posts to process, 0 = unlimited (default: 0)
  --subreddit <name>        Subreddit to scan (default: AynThor)
  --batch-size <n>          Posts per LLM batch (default: 10)
  --prefilter               Run the deterministic prefilter (default: on)
  --no-prefilter            Skip the deterministic prefilter

Decision backend (filter / match / category):
  --backend <jev|llm>       Set the backend for all three agents
  --filter-backend <b>      Backend for the filter agent
  --match-backend <b>       Backend for the match agent
  --category-backend <b>    Backend for the category agent
  --decisions-base-url <u>  Jev (System One) base URL
  --decisions-model <m>     Jev (System One) model

Models (create/update always use the generation engine):
  --model <m>               Set the model for all agents
  --filter-model <m>        Model for the filter agent
  --match-model <m>         Model for the match agent
  --create-model <m>        Model for the create agent
  --update-model <m>        Model for the update agent
  --category-model <m>      Model for the category agent

Thresholds (0..1):
  --threshold <n>           Set the threshold for all three agents
  --filter-threshold <n>    Threshold for the filter agent
  --match-threshold <n>     Threshold for the match agent
  --category-threshold <n>  Threshold for the category agent

Run mode:
  --mode <review|full>      Pipeline mode (default: review)
  --approve <id1,id2>       Approve the listed Reddit post ids (enables approve mode)
  --dry-run                 Do not write any files
  --no-dry-run              Force writing files

Modes:
  review   fetch -> prefilter -> filter; record the relevant posts in the review
           ledger (plans/reddit-pipeline-review.json/.md) and stop.
  full     fetch -> filter -> match -> create/update (the full cycle).
  approve  fetch the ids given to --approve (no prefilter/filter) and run
           match -> create/update. In CI this is triggered by commenting
           "/approved <id> [<id> ...]" on the pipeline pull request.

Reports:
  --report <path>           JSON report path (Markdown is derived from it)
  --no-report               Do not write the report to disk
  --write-report            Force writing the report

Misc:
  --now <iso>               Reference time for the fetch window (ISO-8601)
  -h, --help                Show this help

Every option overrides the corresponding environment variable
(REDDIT_LOOKBACK_HOURS, REDDIT_MAX_POSTS, REDDIT_<AGENT>_BACKEND, …).
`;
