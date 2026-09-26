import { serializeFrontmatter, type FrontmatterData } from '../../frontmatter';
import {
  pageFrontmatterSchema,
  type PageFrontmatter,
  type PageInput,
  type PageSection,
  type PageSections,
} from './types';

/** Matches the `source: [label](url)` line added by the template. */
const SOURCE_LINE_RE = /^\s*source:\s*\[[^\]]*\]\(([^)]*)\)\s*$/i;

/** Matches the `See the project page: [label](url)` line. */
const PROJECT_LINE_RE = /^\s*see the project page:\s*\[[^\]]*\]\(([^)]*)\)\s*$/i;

/** Matches a `## <heading>` line and captures the heading. */
const HEADING_RE = /^##\s+(.+?)\s*$/;

/** Escape a string so it can be embedded in a regular expression. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Validate arbitrary data as page frontmatter, throwing a `zod` error. */
export function validateFrontmatter(data: unknown): PageFrontmatter {
  return pageFrontmatterSchema.parse(data);
}

/**
 * Assemble the markdown body of a project page from its ordered sections.
 * The `source:` line and the trailing project link are omitted when empty.
 */
export function buildPageBody(sections: PageSections): string {
  const parts: string[] = [];
  if (sections.sourceUrl !== '') {
    parts.push(`source: [reddit.com](${sections.sourceUrl})`);
  }
  for (const section of sections.sections) {
    parts.push(`## ${section.heading}\n\n${section.body.trim()}`);
  }
  if (sections.projectUrl !== '') {
    parts.push(`See the project page: [github.com](${sections.projectUrl})`);
  }
  return parts.join('\n\n');
}

/**
 * Parse a page body back into its source URL, ordered sections and project
 * URL. This is the inverse of {@link buildPageBody} and is used to preserve
 * the existing structure of a page when it is updated.
 */
export function parsePageBody(content: string): PageSections {
  const lines = content.split('\n');
  let sourceUrl = '';
  let projectUrl = '';
  const sections: PageSection[] = [];
  let current: { heading: string; lines: string[] } | null = null;

  const flush = (): void => {
    if (current !== null) {
      sections.push({
        heading: current.heading,
        body: current.lines.join('\n').trim(),
      });
      current = null;
    }
  };

  for (const line of lines) {
    const projectMatch = PROJECT_LINE_RE.exec(line);
    if (projectMatch !== null) {
      flush();
      projectUrl = projectMatch[1] ?? '';
      continue;
    }

    const sourceMatch = SOURCE_LINE_RE.exec(line);
    if (sourceMatch !== null && current === null && sections.length === 0) {
      sourceUrl = sourceMatch[1] ?? '';
      continue;
    }

    const headingMatch = HEADING_RE.exec(line);
    if (headingMatch !== null) {
      flush();
      current = { heading: headingMatch[1] ?? '', lines: [] };
      continue;
    }

    if (current !== null) {
      current.lines.push(line);
    }
  }
  flush();

  return { sourceUrl, sections, projectUrl };
}

/** Extract the body of a `## <heading>` section, or `null` when absent. */
function extractHeadingSection(text: string, heading: string): string | null {
  const pattern = new RegExp(
    `##\\s+${escapeRegExp(heading)}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)`,
  );
  const match = pattern.exec(text);
  return match?.[1] ?? null;
}

/**
 * Normalize a section body produced by a model.
 *
 * Models sometimes echo the whole page (or include the section heading) when
 * asked for a single section. This keeps only the requested section content and
 * drops the template's `source:` line, the `## …` headings and the trailing
 * project link, so {@link buildPageBody} never duplicates them.
 */
export function normalizeSectionBody(text: string, heading: string): string {
  const extracted = extractHeadingSection(text, heading);
  const body = extracted ?? text;
  const kept = body
    .split('\n')
    .filter(
      (line) =>
        !SOURCE_LINE_RE.test(line) &&
        !PROJECT_LINE_RE.test(line) &&
        !HEADING_RE.test(line),
    );
  return kept.join('\n').trim();
}

/**
 * Rewrite every release link of a repository to its canonical
 * `.../releases/latest` form, so a page never points at a specific tag.
 */
export function normalizeReleaseLinks(
  text: string,
  repoUrl: string | null,
): string {
  if (repoUrl === null || repoUrl === '') {
    return text;
  }
  const base = `${repoUrl}/releases`;
  const pattern = new RegExp(
    `${escapeRegExp(base)}(?:/latest|/tag/[^\\s)\\]]+|/download/[^\\s)\\]]+)?`,
    'g',
  );
  return text.replace(pattern, `${base}/latest`);
}

/** Convert validated frontmatter into a plain serializable record. */
function toFrontmatterData(
  frontmatter: PageFrontmatter,
  extra: Record<string, unknown> | undefined,
): FrontmatterData {
  const data: FrontmatterData = {
    title: frontmatter.title,
    description: frontmatter.description,
    date: frontmatter.date,
    slug: frontmatter.slug,
    category: frontmatter.category,
    media: frontmatter.media,
  };
  if (extra !== undefined) {
    for (const [key, value] of Object.entries(extra)) {
      if (!(key in data)) {
        data[key] = value;
      }
    }
  }
  return data;
}

/** Render a complete `index.md` document from validated page input. */
export function renderPage(input: PageInput): string {
  const frontmatter = validateFrontmatter(input.frontmatter);
  const body = buildPageBody(input.sections);
  const data = toFrontmatterData(frontmatter, input.extraFrontmatter);
  return serializeFrontmatter(data, `\n${body}\n`);
}
