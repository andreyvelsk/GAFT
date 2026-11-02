import { describe, expect, it } from 'vitest'
import { getProjectActionsState } from './useProjectActions'

describe('getProjectActionsState', () => {
  it('creates GitHub project, Obtainium, and source actions', () => {
    expect(getProjectActionsState({
      projectPage: ' https://github.com/owner/repo.git ',
      source: 'https://example.com/source'
    })).toEqual({
      deepLink: 'obtainium://add/https://github.com/owner/repo',
      primaryAction: { url: 'https://github.com/owner/repo.git', label: 'Open project' },
      primaryIcon: 'github',
      secondaryLinkUrl: 'https://example.com/source',
      secondaryLinkLabel: 'View source',
      hasActions: true
    })
  })

  it('uses source as the primary action when no project page exists', () => {
    expect(getProjectActionsState({ source: ' https://example.com/source ' })).toMatchObject({
      deepLink: null,
      primaryAction: { url: 'https://example.com/source', label: 'Open source' },
      primaryIcon: 'external',
      secondaryLinkUrl: '',
      hasActions: true
    })
  })

  it('rejects non-GitHub project pages for Obtainium', () => {
    expect(getProjectActionsState({ projectPage: 'https://gitlab.com/owner/repo' })).toMatchObject({
      deepLink: null,
      primaryAction: { url: 'https://gitlab.com/owner/repo', label: 'Open project' },
      primaryIcon: 'external',
      secondaryLinkUrl: '',
      hasActions: true
    })
  })

  it('has no actions for empty or whitespace-only inputs', () => {
    expect(getProjectActionsState({ source: '  ', projectPage: null })).toMatchObject({
      deepLink: null,
      primaryAction: null,
      secondaryLinkUrl: '',
      hasActions: false
    })
  })
})
