export interface ProjectActionInputs {
  source?: string | null | undefined
  projectPage?: string | null | undefined
}

export interface PrimaryAction {
  url: string
  label: string
}

export interface ProjectActionsState {
  deepLink: string | null
  primaryAction: PrimaryAction | null
  primaryIcon: 'github' | 'external'
  secondaryLinkUrl: string
  secondaryLinkLabel: 'View source'
  hasActions: boolean
}

const GITHUB_URL_RE = /^https?:\/\/(?:www\.)?github\.com\/([^/?#]+)\/([^/?#]+)/i

export function getProjectActionsState({ source, projectPage }: ProjectActionInputs): ProjectActionsState {
  const normalizedProjectPage = projectPage?.trim() ?? ''
  const normalizedSource = source?.trim() ?? ''

  let deepLink: string | null = null
  const match = GITHUB_URL_RE.exec(normalizedProjectPage)
  if (match !== null) {
    const author = match[1] ?? ''
    const repo = (match[2] ?? '').replace(/\.git$/i, '')
    if (author !== '' && repo !== '') {
      deepLink = `obtainium://add/https://github.com/${author}/${repo}`
    }
  }

  const primaryAction: PrimaryAction | null = normalizedProjectPage !== ''
    ? { url: normalizedProjectPage, label: 'Open project' }
    : normalizedSource !== ''
      ? { url: normalizedSource, label: 'Open source' }
      : null

  const secondaryLinkUrl = normalizedProjectPage !== '' ? normalizedSource : ''

  return {
    deepLink,
    primaryAction,
    primaryIcon: normalizedProjectPage.includes('github.com') ? 'github' : 'external',
    secondaryLinkUrl,
    secondaryLinkLabel: 'View source',
    hasActions: primaryAction !== null || deepLink !== null || secondaryLinkUrl !== ''
  }
}
