/** Resolve after the given number of milliseconds. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** Split an array into consecutive chunks of at most `size` items. */
export function chunk<T>(items: readonly T[], size: number): T[][] {
  if (size <= 0) {
    throw new RangeError('chunk size must be greater than 0');
  }
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

/** Remove duplicates while preserving the original order. */
export function unique<T>(items: readonly T[]): T[] {
  return [...new Set(items)];
}

/** Type guard for a non-empty (after trimming) string. */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/** Convert an arbitrary label into a kebab-case slug. */
export function kebabCase(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

/** File name of the n-th screenshot (1-based index). */
export function screenshotFileName(index: number): string {
  return `screenshot-${index}.webp`;
}

/** Current time as a Unix timestamp in seconds. */
export function nowUnixSeconds(): number {
  return Math.floor(Date.now() / 1000);
}
