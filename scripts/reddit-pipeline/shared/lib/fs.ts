import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

/** Create a directory (and its parents) when it does not exist yet. */
export async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

/** Write a UTF-8 text file, creating its parent directory when needed. */
export async function writeTextFile(
  path: string,
  content: string,
): Promise<void> {
  await ensureDir(dirname(path));
  await writeFile(path, content, 'utf8');
}

/** Read a UTF-8 text file. */
export async function readTextFile(path: string): Promise<string> {
  return await readFile(path, 'utf8');
}

/** Whether a path exists and is accessible. */
export async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
