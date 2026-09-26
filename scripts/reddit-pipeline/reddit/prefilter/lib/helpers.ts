import type { ReportEntry } from '../../../shared/lib/types';
import type { PrefilterReason } from './types';

/** Titles that start with a question word / request phrase. */
const QUESTION_TITLE_RE =
  /^\s*(how|what|which|why|when|where|who|is|are|does|do|can|could|should|would|will|any|help|need|looking for|recommend)\b/i;

/** Links that signal a real project (repo, release, store, video). */
const PROJECT_LINK_RE =
  /(github\.com|gitlab\.com|\.apk\b|releases?\/|play\.google\.com|youtu\.be|youtube\.com)/i;

/** Phrases that signal the author built something for the dual screen. */
const PROJECT_SIGNAL_RE =
  /(dual[\s-]?screen|second[\s-]?screen|bottom[\s-]?screen|companion app|\bi (made|built|ported|released|created|developed)\b|\bmy (app|project|port|mod|game)\b)/i;

/** Flairs that always mark a non-project post. */
const REJECT_FLAIRS = new Set(['support', 'question', 'help']);

/** Return a reason to drop a normalized post, or `null` to keep it. */
export function prefilterReason(entry: ReportEntry): PrefilterReason {
  const flair = entry.flair.trim().toLowerCase();
  const title = entry.title;
  const selftext = entry.selftext;
  const external = entry.external_url;

  const hasLink = external !== '' || PROJECT_LINK_RE.test(selftext);
  const hasSignal =
    PROJECT_SIGNAL_RE.test(selftext) || PROJECT_SIGNAL_RE.test(title);

  if (REJECT_FLAIRS.has(flair)) {
    return `flair=${flair}`;
  }
  if (title.trimEnd().endsWith('?') && !hasLink && !hasSignal) {
    return 'question title without project link/signal';
  }
  if (QUESTION_TITLE_RE.test(title) && !hasLink && !hasSignal) {
    return 'question-style title without project link/signal';
  }
  return null;
}
