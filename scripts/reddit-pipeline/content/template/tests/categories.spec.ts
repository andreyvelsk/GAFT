import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { parseFrontmatter } from '../../frontmatter';
import {
  CATEGORY_DEFINITIONS,
  CATEGORY_LABELS,
  CATEGORY_PROMPT_GUIDE,
  PAGE_CATEGORIES,
  PROJECT_CATEGORIES,
  SYSTEM_CATEGORIES,
  isPageCategory,
  isProjectCategory,
  isSystemCategory,
  pageCategorySchema,
  projectCategorySchema,
} from '../index';

/** Absolute path of the `content/` directory at the repository root. */
const CONTENT_DIR = fileURLToPath(
  new URL('../../../../../content/', import.meta.url),
);

/** A content page and the raw category read from its frontmatter. */
interface ScannedPage {
  slug: string;
  category: unknown;
}

/** Read every `<slug>/index.md` under `content/` and its category. */
function scanContentPages(): ScannedPage[] {
  const pages: ScannedPage[] = [];
  for (const entry of readdirSync(CONTENT_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }
    const indexPath = join(CONTENT_DIR, entry.name, 'index.md');
    // Some directories hold shared assets rather than a page.
    if (!existsSync(indexPath)) {
      continue;
    }
    const raw = readFileSync(indexPath, 'utf8');
    const { data } = parseFrontmatter(raw);
    pages.push({ slug: entry.name, category: data.category });
  }
  return pages;
}

/** Legacy categories that were merged into the current vocabulary. */
const LEGACY_CATEGORIES = ['port', 'guide', 'emulation'];

describe('category vocabulary', () => {
  it('exposes a project vocabulary and a separate system vocabulary', () => {
    expect(PROJECT_CATEGORIES).toContain('game');
    expect(PROJECT_CATEGORIES).toContain('app');
    expect(PROJECT_CATEGORIES).toContain('companion');
    expect(PROJECT_CATEGORIES).toContain('emulator');
    expect(PROJECT_CATEGORIES).toContain('tool');
    expect(SYSTEM_CATEGORIES).toEqual(['page']);
    expect(PAGE_CATEGORIES).toEqual([
      ...PROJECT_CATEGORIES,
      ...SYSTEM_CATEGORIES,
    ]);
  });

  it('does not expose any legacy category', () => {
    for (const legacy of LEGACY_CATEGORIES) {
      expect(PAGE_CATEGORIES).not.toContain(legacy);
      expect(PROJECT_CATEGORIES).not.toContain(legacy);
    }
  });

  it('has a definition and a label for every category', () => {
    for (const category of PAGE_CATEGORIES) {
      expect(CATEGORY_DEFINITIONS[category]).toBeTruthy();
      expect(CATEGORY_LABELS[category]).toBeTruthy();
    }
  });

  it('accepts every category in the page schema', () => {
    for (const category of PAGE_CATEGORIES) {
      expect(pageCategorySchema.parse(category)).toBe(category);
    }
  });

  it('rejects legacy and unknown values in the page schema', () => {
    for (const legacy of [...LEGACY_CATEGORIES, 'unknown']) {
      expect(() => pageCategorySchema.parse(legacy)).toThrow();
    }
  });

  it('accepts only project categories in the project schema', () => {
    for (const category of PROJECT_CATEGORIES) {
      expect(projectCategorySchema.parse(category)).toBe(category);
    }
    expect(() => projectCategorySchema.parse('page')).toThrow();
  });

  it('reports membership through the type guards', () => {
    expect(isProjectCategory('game')).toBe(true);
    expect(isProjectCategory('page')).toBe(false);
    expect(isSystemCategory('page')).toBe(true);
    expect(isSystemCategory('game')).toBe(false);
    expect(isPageCategory('companion')).toBe(true);
    expect(isPageCategory('port')).toBe(false);
    expect(isPageCategory(42)).toBe(false);
  });

  it('describes every project category in the agent prompt guide', () => {
    for (const category of PROJECT_CATEGORIES) {
      expect(CATEGORY_PROMPT_GUIDE).toContain(`"${category}"`);
      expect(CATEGORY_PROMPT_GUIDE).toContain(CATEGORY_DEFINITIONS[category]);
    }
    expect(CATEGORY_PROMPT_GUIDE).not.toContain('"port"');
  });
});

describe('content pages', () => {
  const pages = scanContentPages();

  it('finds every content page', () => {
    expect(pages.length).toBeGreaterThan(0);
  });

  it('gives every page a valid category', () => {
    for (const page of pages) {
      expect(
        isPageCategory(page.category),
        `${page.slug}: ${String(page.category)}`,
      ).toBe(true);
    }
  });

  it('uses project categories for project pages', () => {
    for (const page of pages) {
      if (!isProjectCategory(page.category)) {
        continue;
      }
      expect(PROJECT_CATEGORIES).toContain(page.category);
    }
  });

  it('never uses a legacy category', () => {
    const legacy = pages.filter((page) =>
      LEGACY_CATEGORIES.includes(String(page.category)),
    );
    expect(legacy).toEqual([]);
  });

  it('marks the how-to guide as a system page', () => {
    const howTo = pages.find((page) => page.slug === 'how-to');
    expect(howTo?.category).toBe('page');
  });
});

describe('how-to documentation', () => {
  const raw = readFileSync(join(CONTENT_DIR, 'how-to', 'index.md'), 'utf8');

  it('lists every project category', () => {
    for (const category of PROJECT_CATEGORIES) {
      expect(raw).toContain(`\`${category}\``);
    }
  });

  it('documents every project category definition', () => {
    for (const category of PROJECT_CATEGORIES) {
      expect(raw).toContain(CATEGORY_DEFINITIONS[category]);
    }
  });

  it('does not mention legacy categories', () => {
    for (const legacy of LEGACY_CATEGORIES) {
      expect(raw).not.toContain(`\`${legacy}\``);
    }
  });
});
