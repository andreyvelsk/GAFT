import type { FrontmatterData } from '../../../content/frontmatter';

/** A fully read content page. */
export interface ContentPage {
  /** Page slug used to locate the page. */
  slug: string;

  /** Absolute path of the page's `index.md`. */
  path: string;

  /** Parsed frontmatter key/value pairs. */
  frontmatter: FrontmatterData;

  /** Markdown body that follows the frontmatter block. */
  content: string;

  /** Raw document as read from disk. */
  raw: string;
}

/** Options accepted by the content-read tool. */
export interface ContentReadOptions {
  /** Directory holding the pages (defaults to the shared `CONTENT_DIR`). */
  contentDir?: string;
}
