import type { UpdateOptions, UpdateResult } from '../../../../agents/update';
import type {
  ContentPage,
  ContentReadOptions,
} from '../../../../tools/content-read';
import type {
  DownloadImageOptions,
  MediaPlanItem,
  MediaResult,
} from '../../../../content/media';
import type { ReportEntry } from '../../../../shared/lib/types';

/** Options accepted by the update stage. */
export interface UpdateStageOptions {
  /** Options forwarded to the update agent (model, generator, context, …). */
  updateOptions?: UpdateOptions;

  /** Injected page updater (used by tests). */
  update?: (
    page: ContentPage,
    entry: ReportEntry,
    options: UpdateOptions,
  ) => Promise<UpdateResult>;

  /** Injected page reader (used by tests). */
  readPage?: (
    slug: string,
    options: ContentReadOptions,
  ) => Promise<ContentPage | null>;

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

  /** Callback invoked when a media download fails (the image is skipped). */
  onMediaError?: (info: {
    url: string;
    fileName: string;
    error: string;
  }) => void;

  /** Progress callback invoked right before the page file is written. */
  onWrite?: (info: { path: string }) => void;
}

/** Result of the update stage. */
export interface UpdateStageResult {
  /** Page slug. */
  slug: string;

  /** Rendered `index.md` document. */
  markdown: string;

  /** Media files to download for the page. */
  media: MediaPlanItem[];

  /** Names of the fields that actually changed. */
  changed: string[];

  /** Whether the files were actually written. */
  written: boolean;
}
