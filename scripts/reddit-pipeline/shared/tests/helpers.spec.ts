import { describe, expect, it } from 'vitest';

import {
  humanizeRepoName,
  isRemovedSelftext,
  normalizeUrlScheme,
  projectLinkLabel,
  projectUrlFromEntry,
  repoSearchQueries,
  resolveProjectUrl,
} from '../lib/helpers';
import type { ReportEntry } from '../lib/types';

/** Build a report entry from a base payload plus overrides. */
function makeEntry(overrides: Partial<ReportEntry> = {}): ReportEntry {
  return {
    id: 'abc',
    title: 'T',
    author: 'a',
    created_utc: 0,
    permalink: 'https://www.reddit.com/r/AynThor/comments/abc/',
    selftext: '',
    external_url: '',
    flair: '',
    images: [],
    ...overrides,
  };
}

describe('normalizeUrlScheme', () => {
  it('upgrades http to https', () => {
    expect(normalizeUrlScheme('http://github.com/user/repo')).toBe(
      'https://github.com/user/repo',
    );
  });

  it('keeps https unchanged', () => {
    expect(normalizeUrlScheme('https://github.com/user/repo')).toBe(
      'https://github.com/user/repo',
    );
  });

  it('keeps non-http schemes unchanged', () => {
    expect(normalizeUrlScheme('ftp://example.com')).toBe('ftp://example.com');
  });
});

describe('projectLinkLabel', () => {
  it('labels well-known hosts', () => {
    expect(projectLinkLabel('https://github.com/user/repo')).toBe('github.com');
    expect(projectLinkLabel('https://gitlab.com/user/repo')).toBe('gitlab.com');
    expect(
      projectLinkLabel('https://play.google.com/store/apps/details?id=x'),
    ).toBe('play.google.com');
    expect(projectLinkLabel('https://user.itch.io/game')).toBe('itch.io');
  });

  it('falls back to the hostname for an unknown host', () => {
    expect(projectLinkLabel('https://example.com/app')).toBe('example.com');
  });

  it('falls back to a generic label for an invalid URL', () => {
    expect(projectLinkLabel('not a url')).toBe('project page');
  });
});

describe('humanizeRepoName', () => {
  it('splits camelCase boundaries', () => {
    expect(humanizeRepoName('PixelNavigator')).toBe('Pixel Navigator');
  });

  it('replaces separators with spaces', () => {
    expect(humanizeRepoName('goldeneye-007-recomp')).toBe('goldeneye 007 recomp');
    expect(humanizeRepoName('DOOM_1993')).toBe('DOOM 1993');
  });
});

describe('projectUrlFromEntry', () => {
  it('normalizes an http external URL to https', () => {
    expect(
      projectUrlFromEntry(makeEntry({ external_url: 'http://example.com/app' })),
    ).toBe('https://example.com/app');
  });

  it('returns an empty string for an image URL', () => {
    expect(
      projectUrlFromEntry(makeEntry({ external_url: 'https://i.redd.it/a.jpg' })),
    ).toBe('');
  });
});

describe('resolveProjectUrl', () => {
  it('normalizes the repository URL', () => {
    expect(
      resolveProjectUrl('http://github.com/user/repo', undefined, makeEntry()),
    ).toBe('https://github.com/user/repo');
  });

  it('normalizes the candidate URL', () => {
    expect(
      resolveProjectUrl(null, 'http://example.com/app', makeEntry()),
    ).toBe('https://example.com/app');
  });
});

describe('isRemovedSelftext', () => {
  it('detects the Reddit placeholders', () => {
    expect(isRemovedSelftext('[removed]')).toBe(true);
    expect(isRemovedSelftext('  [deleted]  ')).toBe(true);
    expect(isRemovedSelftext('[Removed]')).toBe(true);
  });

  it('keeps a real body', () => {
    expect(isRemovedSelftext('A real post body')).toBe(false);
    expect(isRemovedSelftext('')).toBe(false);
  });
});

describe('repoSearchQueries', () => {
  it('combines the project name with "thor"', () => {
    expect(
      repoSearchQueries('Wayfinder 1.0 The BIG update! Now a 100% shizuku less!'),
    ).toEqual(['Wayfinder thor', 'Wayfinder BIG thor', 'Wayfinder BIG']);
  });

  it('does not duplicate "thor" when the title starts with it', () => {
    expect(repoSearchQueries('Thor Pathfinder: a free screen swapper')).toEqual([
      'Thor Pathfinder thor',
      'Thor Pathfinder',
    ]);
  });

  it('returns no query for a title without meaningful words', () => {
    expect(repoSearchQueries('1.0 the new update')).toEqual([]);
  });
});
