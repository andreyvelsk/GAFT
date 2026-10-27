/**
 * Generate a blog page from a GitHub repository.
 *
 * Usage:
 *   npm run github:create -- <owner/repo>
 *   npm run github:create -- <owner/repo> --write
 *   npm run github:create -- <GitHub URL>
 *   npm run github:create -- <GitHub URL> --write
 *
 * Options:
 *   <owner/repo>     Exact repository reference, for example `owner/project`.
 *   <GitHub URL>     Repository URL, for example `https://github.com/owner/project`.
 *   --write          Persist the generated page and downloaded media. Without
 *                    this flag the command only prints `index.md` (dry run).
 *
 * Media behavior:
 *   Images hosted by GitHub remain external links in the generated frontmatter.
 *   Images hosted elsewhere are downloaded and converted to WebP by the existing
 *   media pipeline. Failed downloads are skipped without aborting the page.
 *
 * Examples:
 *   npm run github:create -- owner/project
 *   npm run github:create -- owner/project --write
 */
/* eslint-disable no-console */
import { join } from 'node:path';

import { createPage, type CreateContext } from './reddit-pipeline/agents/create';
import { downloadMediaPlan } from './reddit-pipeline/content/media';
import { renderPage, withoutMediaFiles } from './reddit-pipeline/content/template';
import { getRepo, latestRelease, parseRepoRef, readReadme } from './reddit-pipeline/github/repo';
import { CONTENT_DIR, PUBLIC_CONTENT_DIR } from './reddit-pipeline/shared/lib/constants';
import { writeTextFile } from './reddit-pipeline/shared/lib/fs';
import type { ReportEntry } from './reddit-pipeline/shared/lib/types';

const GITHUB_IMAGE_HOSTS = new Set([
  'github.com',
  'raw.githubusercontent.com',
  'user-images.githubusercontent.com',
  'github-production-user-asset-1a22f2.s3.amazonaws.com',
]);
const PAGE_FILE = 'index.md';

function imageUrlsFromReadme(
  readme: string,
  repoUrl: string,
  branch: string,
  owner: string,
  name: string,
): string[] {
  const base = `https://raw.githubusercontent.com/${owner}/${name}/${encodeURIComponent(branch)}/`;
  const urls: string[] = [];
  const pattern = /!\[[^\]]*\]\(([^\s)]+)(?:\s+[^)]*)?\)|<img[^>]+src=["']([^"']+)["']/gi;
  for (const match of readme.matchAll(pattern)) {
    const source = match[1] ?? match[2];
    if (source === undefined || source.startsWith('data:')) continue;
    try {
      urls.push(new URL(source, base).toString());
    } catch {
      // Ignore malformed README image references.
    }
  }
  return [...new Set(urls)].filter((url) => url !== repoUrl);
}

function isGithubHosted(url: string): boolean {
  try {
    return GITHUB_IMAGE_HOSTS.has(new URL(url).hostname.toLowerCase());
  } catch {
    return false;
  }
}

function makeEntry(
  repoUrl: string,
  title: string,
  readme: string,
  images: string[],
): ReportEntry {
  return {
    id: repoUrl,
    title,
    author: '',
    created_utc: Date.now() / 1000,
    permalink: repoUrl,
    selftext: readme,
    external_url: repoUrl,
    flair: '',
    images,
  };
}

const input = process.argv[2] ?? '';
const ref = parseRepoRef(input);
if (ref === null) {
  throw new Error(
    'usage: npm run github:create -- <owner/repo|GitHub URL> [--write]',
  );
}
const write = process.argv.includes('--write');
const repo = await getRepo(ref.owner, ref.repo);
const readme = (await readReadme(ref.owner, ref.repo)) ?? '';
const images = imageUrlsFromReadme(
  readme,
  repo.htmlUrl,
  repo.defaultBranch,
  ref.owner,
  ref.repo,
);
const entry = makeEntry(repo.htmlUrl, repo.fullName, readme, images);
const release = await latestRelease(ref.owner, ref.repo);
const context: CreateContext = { repo, readme, release };
const result = await createPage(entry, { context });

const remoteMedia = result.media.filter((item) => isGithubHosted(item.url));
const localMedia = result.media.filter((item) => !isGithubHosted(item.url));
const remoteByFile = new Map(
  remoteMedia.map((item) => [item.fileName, item.url]),
);
const media = result.page.frontmatter.media.map((item) => {
  const fileName = item.url.split('/').pop() ?? '';
  const remoteUrl = remoteByFile.get(fileName);
  return remoteUrl === undefined ? item : { ...item, url: remoteUrl };
});
const page = {
  ...result.page,
  frontmatter: {
    ...result.page.frontmatter,
    media,
  },
};
const markdown = renderPage(page);
console.log('repo:', repo.fullName);
console.log('slug:', result.slug);
console.log('github media:', remoteMedia.length);
console.log('downloaded media:', localMedia.length);
if (write) {
  const failed = await downloadMediaPlan(localMedia, {
    slug: result.slug,
    publicContentDir: PUBLIC_CONTENT_DIR,
    onMedia: ({ fileName, index, total }) => {
      console.log(`media ${index}/${total}: ${fileName}`);
    },
    onMediaError: ({ fileName, error }) => {
      console.error(`media failed: ${fileName}: ${error}`);
    },
  });
  const finalMarkdown =
    failed.size === 0 ? markdown : renderPage(withoutMediaFiles(page, failed));
  const path = join(CONTENT_DIR, result.slug, PAGE_FILE);
  await writeTextFile(path, finalMarkdown);
  console.log('written:', path);
} else {
  console.log(`--- index.md ---\n${markdown}`);
}
