import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const repo = 'Mohaiminul-Ayon/Sorted';
const origin = `https://github.com/${repo}.git`;
const plan = JSON.parse(readFileSync(resolve(root, '.github/features.json'), 'utf8'));
const gitArgs = ['-c', `safe.directory=${root.replaceAll('\\', '/').replace(/\/$/, '')}`];
function run(command, args, capture = false) {
  return execFileSync(command, command === 'git' ? [...gitArgs, ...args] : args, {
    cwd: root, encoding: 'utf8', stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  })?.trim();
}
function attempt(command, args) {
  return spawnSync(command, command === 'git' ? [...gitArgs, ...args] : args, { cwd: root, encoding: 'utf8' });
}

assert.equal(plan.repository, repo);
const branches = new Set();
const issues = [];
for (const feature of plan.features) {
  assert.match(feature.branch, /^feature\/[a-z0-9-]+$/);
  assert.ok(!branches.has(feature.branch), `Duplicate branch: ${feature.branch}`);
  branches.add(feature.branch);
  if (feature.issue) {
    assert.match(feature.issue, /^\d{2}-[a-z-]+\.md$/);
    const bodyFile = resolve(root, '.github/next-work', feature.issue);
    const body = readFileSync(bodyFile, 'utf8');
    assert.match(body, /^# .+/);
    assert.ok(body.includes('## Acceptance') && body.includes(feature.branch));
    issues.push({ title: body.split('\n')[0].slice(2).trim(), bodyFile });
  }
}
const candidates = run('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], true).split('\0').filter(Boolean);
assert.ok(candidates.length, 'Project files are missing.');
for (const name of candidates) {
  assert.ok(!/(^|\/)(?:node_modules|dist|\.publish-tmp)\//.test(name), `Build/cache file tracked: ${name}`);
  assert.ok(!/(^|\/)\.env(?:\..*)?$/.test(name) || name === '.env.example', `Private environment file tracked: ${name}`);
  const data = readFileSync(resolve(root, name), 'utf8');
  if (name.endsWith('.md')) assert.ok(!/^(?:<<<<<<< |=======\r?$|>>>>>>> )/m.test(data), `Unresolved merge markers in ${name}.`);
  assert.ok(!/AIza[0-9A-Za-z_-]{25,}|gh[pousr]_[0-9A-Za-z]{25,}|github_pat_[0-9A-Za-z_]{25,}/.test(data), `Possible credential in ${name}; remove it before publishing.`);
}
assert.ok(existsSync(resolve(root, '.github/workflows/pages.yml')));
console.log(`Checked ${candidates.length} source files, ${branches.size} feature branches and ${issues.length} issue descriptions; no detected credential patterns.`);
if (process.argv.includes('--check')) process.exit(0);

run('gh', ['auth', 'status']);
const repository = JSON.parse(run('gh', ['repo', 'view', repo, '--json', 'nameWithOwner,defaultBranchRef,hasIssuesEnabled'], true));
assert.equal(repository.nameWithOwner.toLowerCase(), repo.toLowerCase());
assert.equal(run('git', ['branch', '--show-current'], true), 'main', 'Switch to main before publishing.');
if (existsSync(resolve(root, '.git/MERGE_HEAD'))) {
  const unresolved = run('git', ['diff', '--name-only', '--diff-filter=U'], true).split('\n').filter(Boolean);
  assert.ok(unresolved.every(name => name === 'README.md'), 'Resolve the pending merge before publishing.');
  const readme = readFileSync(resolve(root, 'README.md'), 'utf8');
  assert.ok(!/^(?:<<<<<<< |=======\r?$|>>>>>>> )/m.test(readme), 'Resolve README merge markers before publishing.');
  if (unresolved.length) run('git', ['add', '--', 'README.md']);
  run('git', ['commit', '--no-edit']);
}
run('git', ['add', '--', '.env.example', '.gitignore', 'AGENTS.md', 'README.md', 'index.html', 'package.json', 'package-lock.json', 'src', 'server', 'docs', '.github', 'scripts', ...readdirSync(root).filter(name => name.endsWith('.docx'))]);
if (attempt('git', ['diff', '--cached', '--quiet']).status !== 0) run('git', ['commit', '-m', 'feat: add Sorted task planner and client demonstration']);
assert.equal(run('git', ['status', '--porcelain'], true), '', 'Resolve remaining local changes before publishing.');
const currentOrigin = attempt('git', ['remote', 'get-url', 'origin']);
if (currentOrigin.status === 0) assert.equal(currentOrigin.stdout.trim(), origin, 'Origin differs from the requested repository.');
else run('git', ['remote', 'add', 'origin', origin]);

run('git', ['fetch', 'origin']);
const base = repository.defaultBranchRef?.name;
if (base && run('git', ['ls-remote', '--heads', 'origin', `refs/heads/${base}`], true)) {
  // Keep remote history; conflicts stop publication for a normal resolution, never a force push.
  run('git', ['merge', '--no-edit', '--allow-unrelated-histories', `origin/${base}`]);
}
run('git', ['push', '--set-upstream', 'origin', 'main']);
run('gh', ['repo', 'edit', repo, '--default-branch', 'main', '--enable-issues', '--description', 'Turn messages into separate, reviewable task plans or create tasks manually. Keep context, organise Projects and Meetings, review and export your plan.']);

const remoteBranches = run('git', ['ls-remote', '--heads', 'origin'], true);
const newBranches = [];
for (const branch of branches) {
  if (attempt('git', ['show-ref', '--verify', '--quiet', `refs/heads/${branch}`]).status !== 0) run('git', ['branch', branch, 'main']);
  if (!remoteBranches.split('\n').some(line => line.endsWith(`refs/heads/${branch}`))) newBranches.push(branch);
}
if (newBranches.length) run('git', ['push', 'origin', ...newBranches]);

const existing = JSON.parse(run('gh', ['issue', 'list', '--repo', repo, '--state', 'all', '--limit', '1000', '--json', 'title,number'], true));
for (const issue of issues) {
  if (existing.some(item => item.title === issue.title)) console.log(`Issue already exists: ${issue.title}`);
  else run('gh', ['issue', 'create', '--repo', repo, '--title', issue.title, '--body-file', issue.bodyFile]);
}

const pagesPath = `repos/${repo}/pages`;
const pages = attempt('gh', ['api', pagesPath]);
if (pages.status === 0) run('gh', ['api', '--method', 'PUT', pagesPath, '-f', 'build_type=workflow']);
else if ((pages.stderr || '').includes('404')) run('gh', ['api', '--method', 'POST', pagesPath, '-f', 'build_type=workflow']);
else throw new Error('Could not inspect Pages permissions. Confirm repository admin access and rerun.');

run('gh', ['workflow', 'run', 'pages.yml', '--repo', repo, '--ref', 'main']);
let workflow;
for (let i = 0; i < 12; i++) {
  const runs = JSON.parse(run('gh', ['run', 'list', '--repo', repo, '--workflow', 'pages.yml', '--branch', 'main', '--event', 'workflow_dispatch', '--limit', '1', '--json', 'databaseId,headSha'], true));
  if (runs[0]?.headSha === run('git', ['rev-parse', 'HEAD'], true)) { workflow = runs[0].databaseId; break; }
  await new Promise(resolve => setTimeout(resolve, 2500));
}
assert.ok(workflow, 'Workflow was dispatched but is not visible yet. Check GitHub Actions before retrying publication.');
run('gh', ['run', 'watch', String(workflow), '--repo', repo, '--exit-status', '--interval', '5']);
const url = run('gh', ['api', pagesPath, '--jq', '.html_url'], true);
assert.ok(url.startsWith('https://'), 'Pages did not return its HTTPS URL.');
const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
assert.equal(response.status, 200, 'Pages deployment succeeded but the site did not return HTTP 200 yet.');
run('gh', ['repo', 'edit', repo, '--homepage', url]);
console.log(`Published project, feature branches and issues. Verified demo: ${url}`);
