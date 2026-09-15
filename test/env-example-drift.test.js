import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const cli = path.resolve('bin/env-example-drift.js');

async function fixture(example, env) {
  const dir = await mkdtemp(path.join(tmpdir(), 'env-example-drift-'));
  await writeFile(path.join(dir, '.env.example'), example);
  await writeFile(path.join(dir, '.env'), env);
  return dir;
}

test('prints help', () => {
  const result = spawnSync(process.execPath, [cli, '--help'], { encoding: 'utf8' });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Usage: env-example-drift/);
});

test('passes when keys match', async () => {
  const dir = await fixture('DATABASE_URL=\nPORT=3000\n', 'PORT=1234\nDATABASE_URL=x\n');
  const result = spawnSync(process.execPath, [cli], { cwd: dir, encoding: 'utf8' });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /2 variables OK/);
});

test('fails when keys drift', async () => {
  const dir = await fixture('DATABASE_URL=\nPORT=3000\n', 'DATABASE_URL=x\nDEBUG=true\n');
  const result = spawnSync(process.execPath, [cli], { cwd: dir, encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Missing in \.env: PORT/);
  assert.match(result.stderr, /Missing in \.env\.example: DEBUG/);
});
