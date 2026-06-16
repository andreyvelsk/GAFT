/**
 * Resolves a media URL by prepending the app base URL for local paths.
 *
 * On GitHub Pages the site is served from `/<repo>/`, so a path like
 * `/content/banjo-kazooie/preview.png` must become `/<repo>/content/...`.
 * Locally the base URL is `/`, so the path stays unchanged.
 */
export const useResolveUrl = () => {
  const config = useRuntimeConfig()
  const baseUrl = (config.app?.baseURL as string) || '/'

  function resolveUrl(url: string): string {
    // Skip external URLs (http, https, data:, mailto:, etc.)
    if (/^[a-z][a-z0-9+.-]*:/i.test(url)) {
      return url
    }

    // Strip leading slash, then prepend baseUrl (which ends with /)
    const cleanPath = url.startsWith('/') ? url.slice(1) : url
    const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`

    return `${base}${cleanPath}`
  }

  return { resolveUrl }
}
