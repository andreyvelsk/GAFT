import { describe, expect, it } from 'vitest';

import type { ReportEntry } from '../../../shared/lib/types';
import { prefilterReason } from '../index';

/** Build a report entry from a base payload plus overrides. */
function makeEntry(overrides: Partial<ReportEntry> = {}): ReportEntry {
  return {
    id: 'abc123',
    title: 'My dual screen app',
    author: 'someone',
    created_utc: 1700000000,
    permalink: 'https://www.reddit.com/r/AynThor/comments/abc123/',
    selftext: '',
    external_url: '',
    flair: '',
    images: [],
    ...overrides,
  };
}

describe('prefilterReason', () => {
  it('drops a question title without project links or signals', () => {
    const reason = prefilterReason(
      makeEntry({ title: 'How do I install this?' }),
    );

    expect(reason).not.toBeNull();
  });

  it('drops a question-style title without a question mark', () => {
    const reason = prefilterReason(
      makeEntry({ title: 'What emulator should I use' }),
    );

    expect(reason).not.toBeNull();
  });

  it('keeps a post with a GitHub link', () => {
    const reason = prefilterReason(
      makeEntry({
        title: 'My new port',
        selftext: 'Check it out: https://github.com/user/repo',
      }),
    );

    expect(reason).toBeNull();
  });

  it('keeps a question title when an external link is present', () => {
    const reason = prefilterReason(
      makeEntry({
        title: 'How do I install this?',
        external_url: 'https://github.com/user/repo',
      }),
    );

    expect(reason).toBeNull();
  });

  it('keeps a question title when a project signal is present', () => {
    const reason = prefilterReason(
      makeEntry({ title: 'How does the second screen work?' }),
    );

    expect(reason).toBeNull();
  });

  it('drops posts with a Support flair', () => {
    const reason = prefilterReason(makeEntry({ flair: 'Support' }));

    expect(reason).toBe('flair=support');
  });

  it('drops posts with a Question flair regardless of links', () => {
    const reason = prefilterReason(
      makeEntry({
        flair: 'Question',
        external_url: 'https://github.com/user/repo',
      }),
    );

    expect(reason).toBe('flair=question');
  });

  it('keeps a normal project post', () => {
    const reason = prefilterReason(
      makeEntry({ title: 'I built a companion app for the Thor' }),
    );

    expect(reason).toBeNull();
  });
});
