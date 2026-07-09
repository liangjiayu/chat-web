import { spawnSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';

const SCRIPT_EXTENSIONS = /\.(?:js|ts|tsx)$/;
const FORMAT_EXTENSIONS = /\.(?:js|ts|tsx|json|css|md)$/;

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: options.capture ? 'pipe' : 'inherit',
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  return result.stdout ?? '';
};

const listGitFiles = (args) => run('git', args, { capture: true }).split('\0').filter(Boolean);

const changedFiles = [
  ...listGitFiles(['diff', '--name-only', '--diff-filter=ACMR', '-z', 'HEAD', '--']),
  ...listGitFiles(['ls-files', '--others', '--exclude-standard', '-z']),
];

const files = [...new Set(changedFiles)].filter(
  (file) => existsSync(file) && statSync(file).isFile(),
);
const lintFiles = files.filter((file) => SCRIPT_EXTENSIONS.test(file));
const formatFiles = files.filter((file) => FORMAT_EXTENSIONS.test(file));

if (formatFiles.length === 0) {
  console.log('No changed files to lint.');
  process.exit(0);
}

if (lintFiles.length > 0) {
  run('oxlint', ['--fix', ...lintFiles]);
}

run('oxfmt', ['--write', ...formatFiles]);
