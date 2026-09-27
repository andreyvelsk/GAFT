import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { PROJECT_ROOT } from './constants';

/**
 * Clean a raw value: remove surrounding quotes and, for unquoted values, drop
 * a trailing inline comment (`FOO=bar   # note` → `bar`). A `#` inside quotes
 * is preserved.
 */
function parseValue(value: string): string {
  // Detect the inline comment on the raw value: trimming first would turn a
  // comment-only value (`KEY=   # note`) into the literal `# note`.
  const commentAt = value.indexOf(' #');
  const withoutComment = commentAt === -1 ? value : value.slice(0, commentAt);
  const trimmed = withoutComment.trim();
  if (
    trimmed.length >= 2 &&
    ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'")))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

/**
 * Load a `.env` file into `process.env` without pulling in an external
 * dependency. Existing variables are never overwritten, so an explicitly
 * exported value always wins. Missing or unreadable files are ignored.
 */
export function loadDotenv(path: string = join(PROJECT_ROOT, '.env')): void {
  if (!existsSync(path)) {
    return;
  }
  let raw: string;
  try {
    raw = readFileSync(path, 'utf8');
  } catch {
    return;
  }
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('#')) {
      continue;
    }
    const separator = trimmed.indexOf('=');
    if (separator === -1) {
      continue;
    }
    const key = trimmed.slice(0, separator).trim();
    const value = parseValue(trimmed.slice(separator + 1));
    if (key !== '' && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
