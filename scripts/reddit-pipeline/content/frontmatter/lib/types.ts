/** Frontmatter data as parsed from a markdown document. */
export type FrontmatterData = Record<string, unknown>;

/** A markdown document split into its frontmatter data and body. */
export interface ParsedDocument {
  /** Parsed frontmatter key/value pairs. */
  data: FrontmatterData;

  /** Markdown body that follows the frontmatter block. */
  content: string;
}
