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
