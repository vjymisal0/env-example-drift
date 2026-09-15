#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';

function help() {
  console.log(`Usage: env-example-drift [--example .env.example] [--env .env]\n\nFails when .env and .env.example have different variable names. Values are ignored.`);
}

function parseArgs(argv) {
  const args = { example: '.env.example', env: '.env' };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') return { help: true };
    if (arg === '--example') args.example = argv[++i];
    else if (arg === '--env') args.env = argv[++i];
    else throw new Error(`unknown argument: ${arg}`);
  }
  return args;
}

function keys(text) {
  const found = new Set();
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/.exec(line);
    if (match) found.add(match[1]);
  }
  return found;
}

function difference(left, right) {
  return [...left].filter((key) => !right.has(key)).sort();
}

try {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    help();
    process.exit(0);
  }

  const [exampleText, envText] = await Promise.all([
    readFile(path.resolve(args.example), 'utf8'),
    readFile(path.resolve(args.env), 'utf8'),
  ]);

  const exampleKeys = keys(exampleText);
  const envKeys = keys(envText);
  const missingInEnv = difference(exampleKeys, envKeys);
  const missingInExample = difference(envKeys, exampleKeys);

  if (missingInEnv.length || missingInExample.length) {
    if (missingInEnv.length) console.error(`Missing in ${args.env}: ${missingInEnv.join(', ')}`);
    if (missingInExample.length) console.error(`Missing in ${args.example}: ${missingInExample.join(', ')}`);
    process.exit(1);
  }

  console.log(`env-example-drift: ${exampleKeys.size} variable${exampleKeys.size === 1 ? '' : 's'} OK`);
} catch (error) {
  console.error(`env-example-drift: ${error.message}`);
  process.exit(1);
}
