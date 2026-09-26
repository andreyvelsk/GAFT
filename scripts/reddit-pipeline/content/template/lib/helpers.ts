import { serializeFrontmatter, type FrontmatterData } from '../../frontmatter';
import {
  pageFrontmatterSchema,
  type PageFrontmatter,
  type PageInput,
  type PageSections,
} from './types';

/** Validate arbitrary data as page frontmatter, throwing a `zod` error. */
export function validateFrontmatter(data: unknown): PageFrontmatter {
  return pageFrontmatterSchema.parse(data);
}

/** Assemble the standard markdown body of a project page. */
export function buildPageBody(sections: PageSections): string {
  return [
    `source: [reddit.com](${sections.sourceUrl})`,
    '',
    '## Description',
    '',
    sections.description.trim(),
    '',
    '## Setup guide',
    '',
    sections.setupGuide.trim(),
    '',
    `See the project page: [github.com](${sections.projectUrl})`,
  ].join('\n');
}

/** Matches the `source: [reddit.com](...)` line added by the template. */
const SOURCE_LINE_RE = /^\s*source:\s*\[reddit\.com\]/i;

/** Matches the `See the project page: [github.com](...)` line. */
const PROJECT_LINE_RE = /^\s*see the project page:/i;

/** Matches a `## Description` / `## Setup guide` heading line. */
const HEADING_LINE_RE = /^\s*##\s+(description|setup guide)\s*$/i;

/** Extract the body of a `## <heading>` section, or `null` when absent. */
function extractHeadingSection(text: string, heading: string): string | null {
  const pattern = new RegExp(
    `##\\s+${heading}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)`,
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
        !HEADING_LINE_RE.test(line),
    );
  return kept.join('\n').trim();
}

/** Convert validated frontmatter into a plain serializable record. */
function toFrontmatterData(frontmatter: PageFrontmatter): FrontmatterData {
  return {
    title: frontmatter.title,
    description: frontmatter.description,
    date: frontmatter.date,
    slug: frontmatter.slug,
    category: frontmatter.category,
    media: frontmatter.media,
  };
}

/** Render a complete `index.md` document from validated page input. */
export function renderPage(input: PageInput): string {
  const frontmatter = validateFrontmatter(input.frontmatter);
  const body = buildPageBody(input.sections);
  return serializeFrontmatter(toFrontmatterData(frontmatter), `\n${body}\n`);
}
