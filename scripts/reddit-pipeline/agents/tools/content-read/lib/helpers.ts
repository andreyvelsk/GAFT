import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { parseFrontmatter } from '../../../../content/frontmatter';
import { CONTENT_DIR } from '../../../../shared/lib/constants';
import type { ContentPage, ContentReadOptions } from './types';

/** File name of a page inside its slug directory. */
const PAGE_FILE = 'index.md';

/** Read a single content page by slug; `null` when it does not exist. */
export async function readContentPage(
  slug: string,
  options: ContentReadOptions = {},
): Promise<ContentPage | null> {
  const dir = options.contentDir ?? CONTENT_DIR;
  const path = join(dir, slug, PAGE_FILE);

  let raw: string;
  try {
    raw = await readFile(path, 'utf8');
  } catch {
    return null;
  }

  const { data, content } = parseFrontmatter(raw);
  return { slug, path, frontmatter: data, content, raw };
}

/** Whether a content page with the given slug exists. */
export async function contentPageExists(
  slug: string,
  options: ContentReadOptions = {},
): Promise<boolean> {
  return (await readContentPage(slug, options)) !== null;
}
