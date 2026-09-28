import { join } from 'node:path';

import { readContentPage as defaultReadPage } from '../../../../agents/tools/content-read';
import { updatePage as defaultUpdate } from '../../../../agents/update';
import {
  downloadMediaPlan,
  saveImage as defaultSaveImage,
} from '../../../../content/media';
import { renderPage, withoutMediaFiles } from '../../../../content/template';
import {
  CONTENT_DIR,
  PUBLIC_CONTENT_DIR,
} from '../../../../shared/lib/constants';
import { ValidationError } from '../../../../shared/lib/errors';
import { writeTextFile } from '../../../../shared/lib/fs';
import type { ReportEntry } from '../../../../shared/lib/types';
import type { UpdateStageOptions, UpdateStageResult } from './types';

/** File name of a page inside its slug directory. */
const PAGE_FILE = 'index.md';

/**
 * Update an existing page with the update agent and write it deterministically.
 * The page must exist: a missing page is a validation error (the match agent
 * must not have chosen UPDATE for a page that is not in `content/`).
 *
 * Media downloads are best-effort: a broken image is skipped (and dropped from
 * the frontmatter) instead of aborting the page.
 */
export async function runUpdateStage(
  entry: ReportEntry,
  slug: string,
  options: UpdateStageOptions = {},
): Promise<UpdateStageResult> {
  const contentDir = options.contentDir ?? CONTENT_DIR;
  const readPage = options.readPage ?? defaultReadPage;
  const page = await readPage(slug, { contentDir });
  if (page === null) {
    throw new ValidationError(`content page not found: ${slug}`, slug);
  }

  const update = options.update ?? defaultUpdate;
  const result = await update(page, entry, options.updateOptions ?? {});

  if (options.dryRun === true) {
    return {
      slug: result.slug,
      markdown: result.markdown,
      media: result.media,
      changed: result.changed,
      written: false,
    };
  }

  const publicContentDir = options.publicContentDir ?? PUBLIC_CONTENT_DIR;
  const writeFile = options.writeFile ?? writeTextFile;
  const saveImage = options.saveImage ?? defaultSaveImage;

  const failed = await downloadMediaPlan(result.media, {
    slug: result.slug,
    publicContentDir,
    saveImage,
    ...(options.onMedia !== undefined ? { onMedia: options.onMedia } : {}),
    ...(options.onMediaError !== undefined
      ? { onMediaError: options.onMediaError }
      : {}),
  });
  const markdown =
    failed.size === 0
      ? result.markdown
      : renderPage(withoutMediaFiles(result.page, failed));

  options.onWrite?.({ path: join(contentDir, result.slug, PAGE_FILE) });
  await writeFile(join(contentDir, result.slug, PAGE_FILE), markdown);

  return {
    slug: result.slug,
    markdown,
    media: result.media,
    changed: result.changed,
    written: true,
  };
}
