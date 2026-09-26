/**
 * Временный скрипт ручной проверки (не коммитится).
 *
 * Запуск:
 *   npx tsx scripts/reddit-pipeline/scripts/manual-check.ts posts [--hours 24] [--limit 10] [--json]
 *   npx tsx scripts/reddit-pipeline/scripts/manual-check.ts normalize [--hours 24] [--limit 5] [--json]
 *   npx tsx scripts/reddit-pipeline/scripts/manual-check.ts prefilter [--hours 24] [--limit 20]
 *   npx tsx scripts/reddit-pipeline/scripts/manual-check.ts media [--url https://...]
 *
 * Сценарии:
 *   posts     — реальные посты через fetchPosts (дата, id, заголовок, ссылка).
 *   normalize — посты через postToReport (external_url, images, video).
 *   prefilter — посты через postToReport + prefilterReason (DROP/KEEP).
 *   media     — скачать тестовое изображение через saveImage и показать метаданные.
 */
/* eslint-disable no-console */

import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import sharp from 'sharp';

import { saveImage } from '../content/media';
import { fetchPosts } from '../reddit/client';
import type { FetchWindow } from '../reddit/client/lib/types';
import { postToReport } from '../reddit/normalize';
import { prefilterReason } from '../reddit/prefilter';
import {
  DEFAULT_LOOKBACK_HOURS,
  DEFAULT_SUBREDDIT,
} from '../shared/lib/constants';
import type { RawPost, ReportEntry } from '../shared/lib/types';

/** URL тестового изображения по умолчанию для сценария `media`. */
const DEFAULT_TEST_IMAGE_URL = 'https://www.gstatic.com/webp/gallery/1.jpg';

/** Регулярное выражение для распознавания видео-ссылок. */
const VIDEO_URL_RE = /(youtu\.be|youtube\.com|v\.redd\.it|streamable\.com)/i;

/** Разобранные аргументы командной строки. */
interface CliOptions {
  scenario: string;
  hours: number;
  limit: number | null;
  json: boolean;
  url: string;
}

/** Преобразовать строку в конечное число или вернуть запасное значение. */
function toFiniteNumber(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Разобрать аргументы командной строки вручную (без зависимостей). */
function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    scenario: argv[0] ?? '',
    hours: DEFAULT_LOOKBACK_HOURS,
    limit: null,
    json: false,
    url: DEFAULT_TEST_IMAGE_URL,
  };

  for (let index = 1; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--hours') {
      const value = argv[index + 1];
      if (value !== undefined) {
        options.hours = toFiniteNumber(value, options.hours);
        index += 1;
      }
    } else if (arg === '--limit') {
      const value = argv[index + 1];
      if (value !== undefined) {
        const parsed = Number(value);
        if (Number.isFinite(parsed) && parsed > 0) {
          options.limit = parsed;
        }
        index += 1;
      }
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--url') {
      const value = argv[index + 1];
      if (value !== undefined) {
        options.url = value;
        index += 1;
      }
    }
  }

  return options;
}

/** Построить окно выборки (Unix-секунды) за последние `hours` часов. */
function buildWindow(hours: number): FetchWindow {
  const before = Math.floor(Date.now() / 1000);
  const after = before - Math.trunc(hours * 3600);
  return { subreddit: DEFAULT_SUBREDDIT, after, before };
}

/** Ограничить список постов первыми `limit` элементами (`null` — без лимита). */
function applyLimit(posts: RawPost[], limit: number | null): RawPost[] {
  return limit === null ? posts : posts.slice(0, limit);
}

/** Построить публичную ссылку на пост Reddit. */
function redditLink(post: RawPost): string {
  const permalink = post.permalink ?? `/r/AynThor/comments/${post.id}/`;
  return permalink.startsWith('http')
    ? permalink
    : `https://reddit.com${permalink}`;
}

/** Усечь строку до `max` символов, добавив многоточие. */
function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

/** Вернуть видео-ссылку отчёта или `null`, если её нет. */
function videoUrl(entry: ReportEntry): string | null {
  return VIDEO_URL_RE.test(entry.external_url) ? entry.external_url : null;
}

/** Сценарий `posts`: реальные посты через `fetchPosts`. */
async function runPosts(options: CliOptions): Promise<void> {
  const posts = await fetchPosts(buildWindow(options.hours));
  const shown = applyLimit(posts, options.limit);

  if (options.json) {
    console.dir(shown, { depth: null });
    return;
  }

  console.log(`Всего постов: ${posts.length}, показано: ${shown.length}`);
  for (const post of shown) {
    const date = new Date(post.created_utc * 1000).toISOString();
    console.log(`- ${date} | ${post.id} | ${post.title}`);
    console.log(`  ${redditLink(post)}`);
  }
}

/** Сценарий `normalize`: посты через `postToReport`. */
async function runNormalize(options: CliOptions): Promise<void> {
  const posts = await fetchPosts(buildWindow(options.hours));
  const reports = applyLimit(posts, options.limit).map((post) =>
    postToReport(post),
  );

  if (options.json) {
    console.dir(reports, { depth: null });
    return;
  }

  console.log(`Отчётов: ${reports.length}`);
  for (const report of reports) {
    const video = videoUrl(report);
    console.log(`- ${report.id} | ${report.title}`);
    console.log(
      `  external_url: ${report.external_url === '' ? '(нет)' : report.external_url}`,
    );
    console.log(`  images: ${report.images.length}`);
    for (const image of report.images) {
      console.log(`    ${image}`);
    }
    console.log(`  video: ${video ?? 'нет'}`);
  }
}

/** Сценарий `prefilter`: посты через `postToReport` + `prefilterReason`. */
async function runPrefilter(options: CliOptions): Promise<void> {
  const posts = await fetchPosts(buildWindow(options.hours));
  const shown = applyLimit(posts, options.limit);

  console.log(`Проверено постов: ${shown.length}`);
  for (const post of shown) {
    const report = postToReport(post);
    const reason = prefilterReason(report);
    const verdict = reason === null ? 'KEEP' : `DROP (${reason})`;
    console.log(
      `- ${report.id} | ${truncate(report.title, 60)} | flair="${report.flair}" | ${verdict}`,
    );
  }
}

/** Сценарий `media`: скачать тестовое изображение и показать метаданные. */
async function runMedia(options: CliOptions): Promise<void> {
  const dir = await mkdtemp(join(tmpdir(), 'manual-check-media-'));
  try {
    const outputPath = join(dir, 'preview.webp');
    const result = await saveImage({ url: options.url, outputPath });
    const metadata = await sharp(result.outputPath).metadata();

    console.log(`URL: ${options.url}`);
    console.log(`Файл: ${result.outputPath}`);
    console.log(`Размер: ${result.bytes} байт`);
    console.log(`Формат: ${metadata.format ?? 'unknown'}`);
    console.log(`Размеры: ${metadata.width ?? '?'}x${metadata.height ?? '?'}`);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/** Напечатать подсказку по использованию. */
function printUsage(): void {
  console.log(
    'Использование: npx tsx scripts/reddit-pipeline/scripts/manual-check.ts <scenario> [options]',
  );
  console.log('Сценарии: posts | normalize | prefilter | media');
  console.log('Опции: --hours N, --limit N, --json, --url <url>');
}

/** Точка входа: выбрать сценарий по первому позиционному аргументу. */
async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  switch (options.scenario) {
    case 'posts':
      await runPosts(options);
      break;
    case 'normalize':
      await runNormalize(options);
      break;
    case 'prefilter':
      await runPrefilter(options);
      break;
    case 'media':
      await runMedia(options);
      break;
    default:
      printUsage();
      process.exitCode = 1;
  }
}

await main();
