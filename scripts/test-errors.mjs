// Runs vitest with the JSON reporter into a temp file, then prints ONLY failures.
// Goal: minimal token consumption for agents — no full test output.
import { spawnSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const tmp = join(tmpdir(), `vitest-results-${Date.now()}.json`);

const run = spawnSync('npx', ['vitest', 'run', '--reporter=json', `--outputFile=${tmp}`], {
  stdio: 'ignore', // suppress all vitest console noise
  shell: process.platform === 'win32',
});

let report;
try {
  report = JSON.parse(readFileSync(tmp, 'utf8'));
} catch {
  console.error('Failed to read vitest JSON report (tests may not have run).');
  process.exit(1);
} finally {
  rmSync(tmp, { force: true });
}

const failures = [];
for (const tr of report.testResults ?? []) {
  for (const a of tr.assertionResults ?? []) {
    if (a.status === 'failed') failures.push({ ...a, file: tr.name });
  }
}

console.log(`Tests: ${report.numTotalTests} total, ${report.numPassedTests} passed, ${failures.length} failed`);

if (failures.length === 0) process.exit(0);

for (const f of failures) {
  console.log(`\nFAIL: ${f.fullName}\n  File: ${f.file}`);
  for (const m of f.failureMessages ?? []) {
    // Print only the essential error lines (skip long stack traces).
    const lines = m.split('\n').filter((l) => !l.trim().startsWith('at '));
    console.log(lines.slice(0, 15).join('\n'));
  }
}

process.exit(run.status ?? 1);
