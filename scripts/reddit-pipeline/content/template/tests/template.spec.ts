import { describe, expect, it } from 'vitest';

import {
  buildPageBody,
  dropNonFactualSections,
  isNonFactualSectionHeading,
  normalizeReleaseLinks,
  normalizeSectionBody,
  parsePageBody,
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

/** Build `count` image media items. */
function images(count: number): { type: string; url: string }[] {
  return Array.from({ length: count }, (_, index) => ({
    type: 'image',
    url: `/content/test-app/screenshot-${index}.webp`,
  }));
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

  it('accepts up to the hard image limit', () => {
    const parsed = validateFrontmatter(makeFrontmatter({ media: images(3) }));

    expect(parsed.media).toHaveLength(3);
  });

  it('rejects more than the hard image limit', () => {
    expect(() =>
      validateFrontmatter(makeFrontmatter({ media: images(4) })),
    ).toThrow();
  });

  it('rejects more than one video', () => {
    const media = [
      { type: 'video', url: 'https://example.com/a.mp4' },
      { type: 'video', url: 'https://example.com/b.mp4' },
    ];

    expect(() => validateFrontmatter(makeFrontmatter({ media }))).toThrow();
  });

  it('treats a null media as an empty array', () => {
    const parsed = validateFrontmatter(makeFrontmatter({ media: null }));

    expect(parsed.media).toEqual([]);
  });

  it('treats a missing media as an empty array', () => {
    const parsed = validateFrontmatter(makeFrontmatter({ media: undefined }));

    expect(parsed.media).toEqual([]);
  });
});

describe('buildPageBody', () => {
  it('renders the source line, sections and project link', () => {
    const body = buildPageBody({
      sourceUrl: 'https://www.reddit.com/r/AynThor/comments/abc/',
      sections: [
        { heading: 'Description', body: 'A test app.' },
        { heading: 'Setup guide', body: '1. Install it.' },
      ],
      projectUrl: 'https://github.com/user/repo',
    });

    expect(body).toContain(
      'source: [reddit.com](https://www.reddit.com/r/AynThor/comments/abc/)',
    );
    expect(body).toContain('## Description\n\nA test app.');
    expect(body).toContain('## Setup guide\n\n1. Install it.');
    expect(body).toContain(
      'See the project page: [github.com](https://github.com/user/repo)',
    );
  });

  it('omits the source line and project link when empty', () => {
    const body = buildPageBody({
      sourceUrl: '',
      sections: [{ heading: 'Description', body: 'A test app.' }],
      projectUrl: '',
    });

    expect(body).not.toContain('source:');
    expect(body).not.toContain('See the project page:');
    expect(body).toBe('## Description\n\nA test app.');
  });

  it('labels the project link from the URL host', () => {
    const cases: [string, string][] = [
      ['https://github.com/user/repo', 'github.com'],
      ['https://gitlab.com/user/repo', 'gitlab.com'],
      ['https://play.google.com/store/apps/details?id=x', 'play.google.com'],
      ['https://user.itch.io/game', 'itch.io'],
      ['https://example.com/app', 'example.com'],
    ];

    for (const [url, label] of cases) {
      const body = buildPageBody({
        sourceUrl: '',
        sections: [{ heading: 'Description', body: 'x' }],
        projectUrl: url,
      });

      expect(body).toContain(`See the project page: [${label}](${url})`);
    }
  });
});

describe('parsePageBody', () => {
  it('parses the source URL, sections and project URL', () => {
    const body = [
      'source: [reddit.com](https://www.reddit.com/r/AynThor/comments/abc/)',
      '',
      '## Description',
      '',
      'A test app.',
      '',
      '## Supported games',
      '',
      '- Game one',
      '',
      '## Setup guide',
      '',
      '1. Install it.',
      '',
      'See the project page: [github.com](https://github.com/user/repo)',
    ].join('\n');

    expect(parsePageBody(body)).toEqual({
      sourceUrl: 'https://www.reddit.com/r/AynThor/comments/abc/',
      sections: [
        { heading: 'Description', body: 'A test app.' },
        { heading: 'Supported games', body: '- Game one' },
        { heading: 'Setup guide', body: '1. Install it.' },
      ],
      projectUrl: 'https://github.com/user/repo',
    });
  });

  it('round-trips through buildPageBody', () => {
    const sections = {
      sourceUrl: 'https://www.reddit.com/r/AynThor/comments/abc/',
      sections: [
        { heading: 'Description', body: 'A test app.' },
        { heading: 'Setup guide', body: '1. Install it.' },
      ],
      projectUrl: 'https://github.com/user/repo',
    };

    expect(parsePageBody(buildPageBody(sections))).toEqual(sections);
  });

  it('handles a body without a source line or project link', () => {
    expect(parsePageBody('## Description\n\nA test app.')).toEqual({
      sourceUrl: '',
      sections: [{ heading: 'Description', body: 'A test app.' }],
      projectUrl: '',
    });
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

  it('keeps a "## …" line inside a fenced code block', () => {
    const text = [
      'Intro.',
      '',
      '```bash',
      '## this is a comment',
      'echo hi',
      '```',
      '',
      'Outro.',
    ].join('\n');

    expect(normalizeSectionBody(text, 'Description')).toBe(text);
  });

  it('still strips a heading outside a code block', () => {
    const text = ['## Description', 'Body.', '## Setup guide', 'More.'].join('\n');

    expect(normalizeSectionBody(text, 'Description')).toBe('Body.');
  });
});

describe('normalizeReleaseLinks', () => {
  const repoUrl = 'https://github.com/user/repo';

  it('rewrites a tag URL to the latest release URL', () => {
    expect(
      normalizeReleaseLinks(`See ${repoUrl}/releases/tag/v1.2.0 now.`, repoUrl),
    ).toBe(`See ${repoUrl}/releases/latest now.`);
  });

  it('rewrites a bare releases URL to the latest release URL', () => {
    expect(normalizeReleaseLinks(`See ${repoUrl}/releases.`, repoUrl)).toBe(
      `See ${repoUrl}/releases/latest.`,
    );
  });

  it('keeps an existing latest release URL unchanged', () => {
    const text = `See ${repoUrl}/releases/latest.`;

    expect(normalizeReleaseLinks(text, repoUrl)).toBe(text);
  });

  it('leaves the text unchanged when there is no repository', () => {
    const text = `See ${repoUrl}/releases/tag/v1.2.0.`;

    expect(normalizeReleaseLinks(text, null)).toBe(text);
  });
});

describe('dropNonFactualSections', () => {
  it('flags progress-update and feelings headings as non-factual', () => {
    for (const heading of [
      'Status',
      'status',
      'News',
      'Roadmap',
      'Future plans',
      'About',
      'About the developer',
      'Community',
      'Feedback',
      'Changelog',
    ]) {
      expect(isNonFactualSectionHeading(heading)).toBe(true);
    }
  });

  it('keeps factual product headings', () => {
    for (const heading of [
      'Description',
      'Features',
      'Requirements',
      'Supported games',
      'Known issues',
      'Setup guide',
    ]) {
      expect(isNonFactualSectionHeading(heading)).toBe(false);
    }
  });

  it('drops non-factual sections and preserves the order of the rest', () => {
    const sections = [
      { heading: 'Description', body: 'D.' },
      { heading: 'Features', body: '- A' },
      { heading: 'Status', body: 'The developer is happy.' },
      { heading: 'Setup guide', body: '1. Install.' },
    ];

    expect(dropNonFactualSections(sections).map((s) => s.heading)).toEqual([
      'Description',
      'Features',
      'Setup guide',
    ]);
  });
});

describe('renderPage', () => {
  it('renders a complete index.md document', () => {
    const output = renderPage({
      frontmatter: validateFrontmatter(validFrontmatter),
      sections: {
        sourceUrl: 'https://www.reddit.com/r/AynThor/comments/abc/',
        sections: [
          { heading: 'Description', body: 'A test app.' },
          { heading: 'Setup guide', body: '1. Install it.' },
        ],
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

  it('renders an empty media array as "media: []"', () => {
    const output = renderPage({
      frontmatter: validateFrontmatter(makeFrontmatter({ media: [] })),
      sections: {
        sourceUrl: '',
        sections: [{ heading: 'Description', body: 'A test app.' }],
        projectUrl: '',
      },
    });

    expect(output).toContain('media: []');
  });

  it('preserves extra frontmatter keys', () => {
    const output = renderPage({
      frontmatter: validateFrontmatter(validFrontmatter),
      sections: {
        sourceUrl: '',
        sections: [{ heading: 'Description', body: 'A test app.' }],
        projectUrl: '',
      },
      extraFrontmatter: { tags: ['a', 'b'] },
    });

    expect(output).toContain('tags:');
    expect(output).toContain('- "a"');
  });
});
