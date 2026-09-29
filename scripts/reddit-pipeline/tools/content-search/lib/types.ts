/** A content page discovered in the blog's `content/` database. */
export interface ContentCandidate {
  /** Page slug (frontmatter `slug`, falling back to the directory name). */
  slug: string;

  /** Page title from the frontmatter (empty string when absent). */
  title: string;

  /** Page description from the frontmatter (empty string when absent). */
  description: string;

  /** Absolute path of the page's `index.md`. */
  path: string;

  /** Canonical project URL extracted from the body (empty when absent). */
  projectUrl: string;

  /** Source Reddit permalink extracted from the body (empty when absent). */
  sourceUrl: string;
}

/** Options accepted by the content-search tool. */
export interface ContentSearchOptions {
  /** Directory holding the pages (defaults to the shared `CONTENT_DIR`). */
  contentDir?: string;

  /** Pre-loaded index; when provided the filesystem is not read. */
  index?: readonly ContentCandidate[];
}
