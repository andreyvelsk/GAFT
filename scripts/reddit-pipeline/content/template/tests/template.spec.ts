import { describe, expect, it } from 'vitest';

import {
  normalizeSectionBody,
  renderPage,
  validateFrontmatter,
} from '../index';

/** A valid frontmatter payload used as the base for the tests. */
const validFrontmatter: Record<string, unknown> = {
  title: 'Test App',
  description: 'A test app.',
  date: '2026-09-26 10:16',
  slug: 'test-app',
  category: 'app',
  media: [{ type: 'image', url: '/content/test-app/preview.webp' }],
};

/** Build a frontmatter payload from the valid base plus overrides. */
function makeFrontmatter(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return { ...validFrontmatter, ...overrides };
}

describe('validateFrontmatter', () => {
  it('accepts a valid frontmatter', () => {
    const parsed = validateFrontmatter(validFrontmatter);

    expect(parsed.slug).toBe('test-app');
    expect(parsed.media).toHaveLength(1);
  });

  it('rejects a missing title', () => {
    expect(() => validateFrontmatter(makeFrontmatter({ title: undefined }))).toThrow();
  });

  it('rejects a missing slug', () => {
    expect(() => validateFrontmatter(makeFrontmatter({ slug: undefined }))).toThrow();
  });

  it('rejects a missing category', () => {
    expect(() =>
      validateFrontmatter(makeFrontmatter({ category: undefined })),
    ).toThrow();
  });

  it('rejects more than three images', () => {
    const media = Array.from({ length: 4 }, (_, index) => ({
      type: 'image',
      url: `/content/test-app/screenshot-${index}.webp`,
    }));

    expect(() => validateFrontmatter(makeFrontmatter({ media }))).toThrow();
  });

  it('rejects more than one video', () => {
    const media = [
      { type: 'video', url: 'https://example.com/a.mp4' },
      { type: 'video', url: 'https://example.com/b.mp4' },
    ];

    expect(() => validateFrontmatter(makeFrontmatter({ media }))).toThrow();
  });
});

describe('normalizeSectionBody', () => {
  it('keeps a plain section body unchanged', () => {
    expect(normalizeSectionBody('Just the text.', 'Description')).toBe(
      'Just the text.',
    );
  });

  it('extracts the requested section from an echoed full page', () => {
    const full = [
      'source: [reddit.com](https://www.reddit.com/r/AynThor/comments/abc/)',
      '',
      '## Description',
      '',
      'The description.',
      '',
      '## Setup guide',
      '',
      '1. Install it.',
      '',
      'See the project page: [github.com](https://github.com/user/repo)',
    ].join('\n');

    expect(normalizeSectionBody(full, 'Description')).toBe('The description.');
    expect(normalizeSectionBody(full, 'Setup guide')).toBe('1. Install it.');
  });

  it('strips the source line, headings and project link', () => {
    const text = [
      'source: [reddit.com](https://www.reddit.com/r/AynThor/comments/abc/)',
      '## Description',
      'The description.',
      'See the project page: [github.com](https://github.com/user/repo)',
    ].join('\n');

    expect(normalizeSectionBody(text, 'Description')).toBe('The description.');
  });
});

describe('renderPage', () => {
  it('renders a complete index.md document', () => {
    const output = renderPage({
      frontmatter: validateFrontmatter(validFrontmatter),
      sections: {
        sourceUrl: 'https://www.reddit.com/r/AynThor/comments/abc/',
        description: 'A test app.',
        setupGuide: '1. Install it.',
        projectUrl: 'https://github.com/user/repo',
      },
    });

    expect(output.startsWith('---\ntitle: "Test App"\n')).toBe(true);
    expect(output).toContain('## Description');
    expect(output).toContain('## Setup guide');
    expect(output).toContain(
      'See the project page: [github.com](https://github.com/user/repo)',
    );
  });
});
