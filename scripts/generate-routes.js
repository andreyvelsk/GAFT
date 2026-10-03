import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

import { ARTICLES_PER_PAGE } from '../lib/constants'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const contentDir = path.resolve(__dirname, '../content')

/** System pages are excluded from the project listing and category routes. */
const SYSTEM_CATEGORIES = new Set(['page'])

/**
 * Dynamically generates prerender routes by reading slugs
 * from frontmatter of all entries in content/
 */
export function generateRoutes() {
  const routes = ['/']

  if (!fs.existsSync(contentDir)) {
    console.warn('[generate-routes] Content directory not found:', contentDir)
    return routes
  }

  const entries = fs.readdirSync(contentDir, { withFileTypes: true })
  const dirs = entries
    .filter(entry => entry.isDirectory())
    .map(dir => dir.name)
    .sort()

  // Category name -> number of project pages that belong to it
  const categoryCounts = new Map()

  for (const dir of dirs) {
    const mdPath = path.join(contentDir, dir, 'index.md')

    if (!fs.existsSync(mdPath)) {
      console.warn(`[generate-routes] index.md not found in ${dir}`)
      continue
    }

    try {
      const fileContent = fs.readFileSync(mdPath, 'utf-8')
      const { data } = matter(fileContent)

      if (data && data.slug) {
        const route = `/project/${data.slug}`
        routes.push(route)
        console.log(`[generate-routes] Route added: ${route}`)
      } else {
        console.warn(`[generate-routes] slug not found in ${dir}/index.md`)
      }

      if (data && typeof data.category === 'string' && !SYSTEM_CATEGORIES.has(data.category)) {
        categoryCounts.set(data.category, (categoryCounts.get(data.category) ?? 0) + 1)
      }
    } catch (err) {
      console.error(`[generate-routes] Error reading ${mdPath}:`, err.message)
    }
  }

  // Category filter pages and their pagination (e.g. /category/game, /category/game/page/2)
  for (const [category, count] of categoryCounts) {
    routes.push(`/category/${category}`)
    const totalPages = Math.ceil(count / ARTICLES_PER_PAGE)
    for (let page = 2; page <= totalPages; page++) {
      routes.push(`/category/${category}/page/${page}`)
    }
  }

  return routes
}
