import { join } from 'node:path';

import { createCategoryAgent } from '../../../../agents/category';
import {
  createPage as defaultCreate,
  type CreateOptions,
} from '../../../../agents/create';
import {
  downloadMediaPlan,
  saveImage as defaultSaveImage,
} from '../../../../content/media';
import { renderPage, withoutMediaFiles } from '../../../../content/template';
import {
  CONTENT_DIR,
  PUBLIC_CONTENT_DIR,
} from '../../../../shared/lib/constants';
import { writeTextFile } from '../../../../shared/lib/fs';
import { createLogger } from '../../../../shared/lib/logger';
import type { ReportEntry } from '../../../../shared/lib/types';
import type { ProjectCategory } from '../../../../../../lib/categories';
import type { CreateStageOptions, CreateStageResult } from './types';

/** File name of a page inside its slug directory. */
const PAGE_FILE = 'index.md';

/**
 * Resolve the page category via the category agent. A failure of the agent (or
 * of an injected classifier) is logged and swallowed — returning `undefined` —
 * so the create agent can fall back to the category the model picks itself and
 * a missing category never aborts the page generation.
 */
async function resolveCategoryOverride(
  entry: ReportEntry,
  options: CreateStageOptions,
): Promise<ProjectCategory | undefined> {
  const logger =
    options.categoryOptions?.logger ??
    options.createOptions?.logger ??
    createLogger();
  try {
    if (options.classifyCategory !== undefined) {
      return await options.classifyCategory(entry);
    }
    const agent = createCategoryAgent({ ...options.categoryOptions });
    return await agent.classifyCategory(entry);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn(
      'create: category classification failed; keeping the model category',
      { id: entry.id, error: message },
    );
    return undefined;
  }
}

/**
 * Generate a new page with the create agent and write it deterministically:
 * the agent only returns structured content, the file layout and the media
 * download are handled here. In dry-run mode nothing is written.
 *
 * Media downloads are best-effort: a broken image is skipped (and dropped from
 * the frontmatter) instead of aborting the page.
 */
export async function runCreateStage(
  entry: ReportEntry,
  options: CreateStageOptions = {},
): Promise<CreateStageResult> {
  const create = options.create ?? defaultCreate;
  const categoryOverride = await resolveCategoryOverride(entry, options);
  const createOptions: CreateOptions = {
    ...options.createOptions,
    ...(categoryOverride !== undefined ? { categoryOverride } : {}),
  };
  const result = await create(entry, createOptions);

  if (options.dryRun === true) {
    return {
      slug: result.slug,
      markdown: result.markdown,
      media: result.media,
      written: false,
    };
  }

  const contentDir = options.contentDir ?? CONTENT_DIR;
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
    written: true,
  };
}
