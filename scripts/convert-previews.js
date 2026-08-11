#!/usr/bin/env node

/**
 * convert-previews.js
 *
 * Converts preview images in public/content/ to WebP format
 * and updates the corresponding URLs in .md frontmatter.
 *
 * Two modes:
 *   (default) — process only files changed in git (staged + unstaged)
 *   --all     — process all images across all .md files
 *
 * Usage:
 *   node scripts/convert-previews.js
 *   node scripts/convert-previews.js --all
 */

import { execSync } from 'child_process';
import { existsSync, unlinkSync, readdirSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content');

const WEBP_QUALITY = 85;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function run(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8', cwd: ROOT }).trim();
  } catch {
    return '';
  }
}

/**
 * Parse frontmatter from raw markdown.
 * Returns { rawFrontmatter, body, fullMatch } or null.
 */
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return null;
  return {
    rawFrontmatter: match[1],
    body: match[2],
    fullMatch: match[0],
  };
}

/**
 * Find all `url: "/content/slug/preview.EXT"` entries in frontmatter
 * where EXT is png/jpg/jpeg (not webp). Returns new frontmatter string
 * and a list of changes: [{ oldUrl, newUrl }].
 */
function replaceImageUrlInFrontmatter(rawFm) {
  const regex = /^(\s*url:\s*")(\/content\/[^"]+\.)(png|jpe?g)(")/gm;
  const changes = [];

  const newFm = rawFm.replace(regex, (match, prefix, base, ext, suffix) => {
    changes.push({
      oldUrl: base + ext,
      newUrl: base + 'webp',
    });
    return prefix + base + 'webp' + suffix;
  });

  return { frontmatter: newFm, changes };
}

/**
 * Convert a URL like "/content/banjo-kazooie/preview.png"
 * to an absolute path under public/.
 */
function urlToPublicPath(url) {
  return path.join(ROOT, 'public', url);
}

/**
 * Convert a single image to webp using cwebp. Returns the output path.
 */
function convertToWebp(inputPath) {
  const parsed = path.parse(inputPath);
  const outputPath = path.join(parsed.dir, `${parsed.name}.webp`);
  const relIn = path.relative(ROOT, inputPath);
  const relOut = path.relative(ROOT, outputPath);
  console.log(`  Converting: ${relIn} → ${relOut}`);
  run(`cwebp -q ${WEBP_QUALITY} "${inputPath}" -o "${outputPath}"`);
  return outputPath;
}

/** Remove the old non-webp file. */
function removeOldFile(inputPath) {
  if (existsSync(inputPath)) {
    unlinkSync(inputPath);
    console.log(`  Removed: ${path.relative(ROOT, inputPath)}`);
  }
}

// ---------------------------------------------------------------------------
// Core logic
// ---------------------------------------------------------------------------

/**
 * Process a single .md file: find non-webp image references in frontmatter,
 * convert referenced images to webp, update .md.
 *
 * @returns {number} count of converted images
 */
async function processMdFile(mdPath) {
  const raw = await readFile(mdPath, 'utf-8');
  const parsed = parseFrontmatter(raw);
  if (!parsed) return 0;

  const { frontmatter: newFm, changes } = replaceImageUrlInFrontmatter(parsed.rawFrontmatter);
  if (changes.length === 0) return 0;

  let converted = 0;

  for (const change of changes) {
    const publicPath = urlToPublicPath(change.oldUrl);
    if (!existsSync(publicPath)) {
      console.log(`  File not found: ${change.oldUrl} (skipping)`);
      continue;
    }
    convertToWebp(publicPath);
    removeOldFile(publicPath);
    converted++;
  }

  if (converted > 0) {
    const newRaw = raw.replace(parsed.fullMatch, `---\n${newFm}\n---\n${parsed.body}`);
    await writeFile(mdPath, newRaw, 'utf-8');
    console.log(`  Updated: ${path.relative(ROOT, mdPath)}`);
  }

  return converted;
}

/**
 * Get lists of changed files from git (staged + unstaged).
 */
function getGitChangedFiles() {
  const staged = run('git diff --cached --name-only');
  const unstaged = run('git diff --name-only');
  const all = [...new Set([...staged.split('\n'), ...unstaged.split('\n')])].filter(Boolean);

  const imageFiles = [];
  const mdFiles = [];

  for (const file of all) {
    const ext = path.extname(file).toLowerCase();
    const absPath = path.join(ROOT, file);

    // Image files in public/content/ (non-webp)
    if (['.png', '.jpeg', '.jpg'].includes(ext) && file.startsWith('public/content/')) {
      imageFiles.push(absPath);
    }
    // Markdown files
    if (ext === '.md' && file.startsWith('content/')) {
      mdFiles.push(absPath);
    }
  }

  return { imageFiles, mdFiles };
}

/**
 * Recursively find all index.md files inside content/.
 */
function findAllMdFiles(dir = CONTENT_DIR) {
  const result = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...findAllMdFiles(full));
    } else if (entry.name === 'index.md') {
      result.push(full);
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const isAllMode = args.includes('--all');

  console.log('');
  console.log(
    isAllMode
      ? 'Mode: processing ALL images'
      : 'Mode: processing only git-changed files (staged + unstaged)',
  );
  console.log('');

  let mdFilesToProcess = [];

  if (isAllMode) {
    mdFilesToProcess = findAllMdFiles();
  } else {
    const { imageFiles, mdFiles } = getGitChangedFiles();

    // 1. Convert new image files found directly in git changes
    for (const imgPath of imageFiles) {
      // Skip files that no longer exist on disk (e.g. already deleted by --all run)
      if (!existsSync(imgPath)) {
        console.log(`  Already removed: ${path.relative(ROOT, imgPath)}`);
        continue;
      }
      const ext = path.extname(imgPath).toLowerCase();
      if (ext === '.webp') {
        console.log(`  Already webp: ${path.relative(ROOT, imgPath)}`);
        continue;
      }
      convertToWebp(imgPath);
      removeOldFile(imgPath);
    }

    mdFilesToProcess = mdFiles;

    // 2. If there are new image files, find .md files referencing them
    //    and make sure they also get processed.
    if (imageFiles.length > 0) {
      const allMdFiles = findAllMdFiles();
      for (const imgPath of imageFiles) {
        // Build the URL path as it appears in .md: "/content/slug/preview.ext"
        const urlPath = '/' + path.relative(path.join(ROOT, 'public'), imgPath);
        for (const mdFile of allMdFiles) {
          if (mdFilesToProcess.includes(mdFile)) continue;
          const raw = await readFile(mdFile, 'utf-8');
          if (raw.includes(urlPath)) {
            mdFilesToProcess.push(mdFile);
          }
        }
      }
    }
  }

  // Process .md files — convert images they reference + update URLs
  let totalConverted = 0;
  for (const mdPath of mdFilesToProcess) {
    if (!existsSync(mdPath)) continue;
    console.log(`Processing: ${path.relative(ROOT, mdPath)}`);
    totalConverted += await processMdFile(mdPath);
  }

  console.log('');
  if (totalConverted === 0) {
    console.log('All images are already in webp format — nothing to convert.');
  } else {
    console.log(`Done! Converted images: ${totalConverted}`);
  }
  console.log('');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});