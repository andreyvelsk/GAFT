import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { CONTENT_DIR } from '../../../shared/lib/constants';
import { parseFrontmatter, serializeFrontmatter } from '../index';

describe('parseFrontmatter', () => {
  it('splits frontmatter data from the body', () => {
    const raw = '---\ntitle: "Hello"\n---\n\nbody\n';
    const parsed = parseFrontmatter(raw);

    expect(parsed.data.title).toBe('Hello');
    expect(parsed.content).toBe('\nbody\n');
  });
});

describe('serializeFrontmatter', () => {
  it('quotes string scalars and renders media as a block sequence', () => {
    const output = serializeFrontmatter(
      {
        title: 'Hello',
        media: [{ type: 'image', url: '/content/hello/preview.webp' }],
      },
      '\nbody\n',
    );

    expect(output).toBe(
      '---\ntitle: "Hello"\nmedia:\n  - type: "image"\n    url: "/content/hello/preview.webp"\n---\n\nbody\n',
    );
  });

  it('escapes double quotes inside string scalars', () => {
    const output = serializeFrontmatter({ title: 'a "b" c' }, '');

    expect(output).toBe('---\ntitle: "a \\"b\\" c"\n---\n');
  });

  it('serializes an empty array as "key: []"', () => {
    const output = serializeFrontmatter({ title: 'Hello', media: [] }, '');

    expect(output).toBe('---\ntitle: "Hello"\nmedia: []\n---\n');
  });
});

describe('empty array round-trip', () => {
  it('parses and re-serializes an empty media array', () => {
    const raw = '---\ntitle: "Hello"\nmedia: []\n---\n\nbody\n';
    const parsed = parseFrontmatter(raw);

    expect(parsed.data.media).toEqual([]);
    expect(serializeFrontmatter(parsed.data, parsed.content)).toBe(raw);
  });
});

describe('frontmatter round-trip', () => {
  it('re-serializes content/pixel-navigator/index.md identically', () => {
    const path = join(CONTENT_DIR, 'pixel-navigator', 'index.md');
    const raw = readFileSync(path, 'utf8');
    const parsed = parseFrontmatter(raw);
    const output = serializeFrontmatter(parsed.data, parsed.content);

    expect(output).toBe(raw);
  });
});
