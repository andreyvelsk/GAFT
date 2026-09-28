import matter from 'gray-matter';

import type { FrontmatterData, ParsedDocument } from './types';

/** Preferred order of the well-known frontmatter keys. */
const KEY_ORDER = [
  'title',
  'description',
  'date',
  'slug',
  'category',
  'generated',
  'media',
] as const;

/** Set view of {@link KEY_ORDER} for fast membership checks. */
const KEY_ORDER_SET = new Set<string>(KEY_ORDER);

/** Escape a string for a double-quoted YAML scalar. */
function quote(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

/** Serialize a scalar value into its YAML representation. */
function serializeScalar(value: unknown): string {
  if (typeof value === 'string') {
    return quote(value);
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (value === null || value === undefined) {
    return 'null';
  }
  throw new Error(`unsupported frontmatter scalar: ${typeof value}`);
}

/** Type guard for a plain (non-array, non-null) object. */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Serialize a flat object as an indented YAML mapping. */
function serializeMapping(
  entries: [string, unknown][],
  indent: string,
): string[] {
  const lines: string[] = [];
  for (const [key, value] of entries) {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${indent}${key}: []`);
      } else {
        lines.push(`${indent}${key}:`);
        lines.push(...serializeArray(value, `${indent}  `));
      }
    } else if (isPlainObject(value)) {
      lines.push(`${indent}${key}:`);
      lines.push(...serializeMapping(Object.entries(value), `${indent}  `));
    } else {
      lines.push(`${indent}${key}: ${serializeScalar(value)}`);
    }
  }
  return lines;
}

/** Serialize an array as an indented YAML block sequence. */
function serializeArray(items: unknown[], indent: string): string[] {
  const lines: string[] = [];
  for (const item of items) {
    if (isPlainObject(item)) {
      const entries = Object.entries(item);
      const first = entries[0];
      if (first === undefined) {
        lines.push(`${indent}- {}`);
        continue;
      }
      lines.push(`${indent}- ${first[0]}: ${serializeScalar(first[1])}`);
      for (const [key, value] of entries.slice(1)) {
        lines.push(`${indent}  ${key}: ${serializeScalar(value)}`);
      }
    } else {
      lines.push(`${indent}- ${serializeScalar(item)}`);
    }
  }
  return lines;
}

/** Order frontmatter entries: well-known keys first, then the rest. */
function orderedEntries(data: FrontmatterData): [string, unknown][] {
  const known: [string, unknown][] = [];
  for (const key of KEY_ORDER) {
    if (key in data) {
      known.push([key, data[key]]);
    }
  }
  const rest = Object.entries(data).filter(
    ([key]) => !KEY_ORDER_SET.has(key),
  );
  return [...known, ...rest];
}

/** Parse a markdown document into frontmatter data and body. */
export function parseFrontmatter(raw: string): ParsedDocument {
  const parsed = matter(raw);
  const data: FrontmatterData = parsed.data;
  return { data, content: parsed.content };
}

/** Serialize frontmatter data and a body back into a markdown document. */
export function serializeFrontmatter(
  data: FrontmatterData,
  content: string,
): string {
  const lines = serializeMapping(orderedEntries(data), '');
  return `---\n${lines.join('\n')}\n---\n${content}`;
}
