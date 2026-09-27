import { join } from 'node:path';

import { createPage as defaultCreate } from '../../../../agents/create';
import { saveImage as defaultSaveImage } from '../../../../content/media';
import {
  CONTENT_DIR,
  PUBLIC_CONTENT_DIR,
} from '../../../../shared/lib/constants';
import { writeTextFile } from '../../../../shared/lib/fs';
import type { ReportEntry } from '../../../../shared/lib/types';
import type { CreateStageOptions, CreateStageResult } from './types';

/** File name of a page inside its slug directory. */
const PAGE_FILE = 'index.md';

/**
 * Generate a new page with the create agent and write it deterministically:
 * the agent only returns structured content, the file layout and the media
 * download are handled here. In dry-run mode nothing is written.
 */
export async function runCreateStage(
  entry: ReportEntry,
  options: CreateStageOptions = {},
): Promise<CreateStageResult> {
  const create = options.create ?? defaultCreate;
  const result = await create(entry, options.createOptions ?? {});

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

  await writeFile(join(contentDir, result.slug, PAGE_FILE), result.markdown);
  for (const item of result.media) {
    await saveImage({
      url: item.url,
      outputPath: join(publicContentDir, result.slug, item.fileName),
    });
  }

  return {
    slug: result.slug,
    markdown: result.markdown,
    media: result.media,
    written: true,
  };
}
