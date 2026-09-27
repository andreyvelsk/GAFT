import type { CreateOptions, CreateResult } from '../../../../agents/create';
import type {
  DownloadImageOptions,
  MediaPlanItem,
  MediaResult,
} from '../../../../content/media';
import type { ReportEntry } from '../../../../shared/lib/types';

/** Options accepted by the create stage. */
export interface CreateStageOptions {
  /** Options forwarded to the create agent (model, generator, context, …). */
  createOptions?: CreateOptions;

  /** Injected page generator (used by tests). */
  create?: (
    entry: ReportEntry,
    options: CreateOptions,
  ) => Promise<CreateResult>;

  /** When `true`, no content or media file is written. */
  dryRun?: boolean;

  /** Directory holding the pages (defaults to the shared `CONTENT_DIR`). */
  contentDir?: string;

  /** Directory holding the media (defaults to `PUBLIC_CONTENT_DIR`). */
  publicContentDir?: string;

  /** Injected image writer (used by tests). */
  saveImage?: (options: DownloadImageOptions) => Promise<MediaResult>;

  /** Injected text writer (used by tests). */
  writeFile?: (path: string, content: string) => Promise<void>;

  /** Progress callback invoked for every media download. */
  onMedia?: (info: {
    url: string;
    fileName: string;
    index: number;
    total: number;
  }) => void;

  /** Progress callback invoked right before the page file is written. */
  onWrite?: (info: { path: string }) => void;
}

/** Result of the create stage. */
export interface CreateStageResult {
  /** Resolved page slug. */
  slug: string;

  /** Rendered `index.md` document. */
  markdown: string;

  /** Media files to download for the page. */
  media: MediaPlanItem[];

  /** Whether the files were actually written. */
  written: boolean;
}
