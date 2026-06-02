// @ts-check
/**
 * Generate release notes scoped to a single Nx project's code.
 *
 * `nx release changelog` (and GitHub's `generate_release_notes`) list every
 * commit in the tag range regardless of which app it touched, so an
 * omenstrat-trader release ends up showing babydegen / agentsfun / workspace
 * commits. This script instead walks the Nx project graph to collect the
 * project's own directory plus every workspace library it depends on, then runs
 * `git log` restricted to those paths — so the notes contain only the agent's
 * (and its shared libs') changes.
 *
 * Usage:
 *   node scripts/release-notes.mjs \
 *     --project predict-ui \
 *     --to   v0.1.20-omenstrat-trader \
 *     --not  "v0.1.19-omenstrat-trader v0.1.18-omenstrat-trader ..." \
 *     [--repo valory-xyz/agent-ui-monorepo]
 *
 * `--not` is a whitespace-separated list of every prior tag on the release
 * line; the notes then contain only commits reachable from `--to` but from
 * none of those tags — i.e. not already shipped. This is robust to tags whose
 * version order does not match commit order (these are lightweight tags and
 * are not monotonic). `--from <ref>` is also accepted for ad-hoc `from..to`
 * ranges. With neither, history is walked from the repo root (first release).
 *
 * Prints Markdown to stdout.
 */
import { execFileSync } from 'node:child_process';

import { createProjectGraphAsync } from '@nx/devkit';

const parseArgs = (argv) => {
  /** @type {Record<string, string>} */
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith('--')) out[arg.slice(2)] = argv[++i];
  }
  return out;
};

const git = (args) =>
  execFileSync('git', args, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 64 });

const resolveRepoSlug = (explicit) => {
  if (explicit) return explicit;
  const url = git(['config', '--get', 'remote.origin.url']).trim();
  const match = url.match(/github\.com[:/](.+?)(?:\.git)?$/);
  if (!match) throw new Error(`Cannot derive repo slug from remote: ${url}`);
  return match[1];
};

/** Collect the project's root plus the roots of all workspace libs it depends on. */
const collectProjectPaths = (graph, project) => {
  const roots = new Set();
  const visit = (name) => {
    const node = graph.nodes[name];
    if (!node || roots.has(node.data.root)) return;
    roots.add(node.data.root);
    for (const dep of graph.dependencies[name] ?? []) {
      // Only follow workspace projects; ignore external (npm) dependencies.
      if (graph.nodes[dep.target]) visit(dep.target);
    }
  };
  visit(project);
  return [...roots];
};

const SECTIONS = [
  { key: 'feat', title: '🚀 Features' },
  { key: 'fix', title: '🩹 Fixes' },
  { key: 'perf', title: '⚡ Performance' },
  { key: 'other', title: '🧱 Other Changes' },
];

const classify = (subject) => {
  const match = subject.match(/^(\w+)(?:\([^)]*\))?!?:\s*(.+)$/);
  if (!match) return { type: 'other', text: subject };
  const type = match[1].toLowerCase();
  const known = SECTIONS.some((s) => s.key === type);
  return { type: known ? type : 'other', text: match[2] };
};

const main = async () => {
  const {
    project,
    from,
    to = 'HEAD',
    repo,
    not,
  } = parseArgs(process.argv.slice(2));
  if (!project) throw new Error('Missing required --project');

  const slug = resolveRepoSlug(repo);
  const graph = await createProjectGraphAsync({ exitOnError: true });
  if (!graph.nodes[project]) throw new Error(`Unknown Nx project: ${project}`);

  const paths = collectProjectPaths(graph, project);
  const excludes = (not ?? '').split(/\s+/).filter(Boolean);
  // Prefer excluding every prior tag (`--not`); fall back to an explicit
  // `from..to` range, then to full history for a first release.
  const revArgs = from
    ? [`${from}..${to}`]
    : excludes.length
      ? [to, '--not', ...excludes]
      : [to];
  const raw = git([
    'log',
    '--no-merges',
    '--pretty=format:%H%x1f%s',
    ...revArgs,
    '--',
    ...paths,
  ]).trim();

  /** @type {Record<string, string[]>} */
  const buckets = Object.fromEntries(SECTIONS.map((s) => [s.key, []]));
  if (raw) {
    for (const line of raw.split('\n')) {
      const [hash, subject] = line.split('\x1f');
      const { type, text } = classify(subject);
      const short = hash.slice(0, 7);
      buckets[type].push(
        `- ${text} ([${short}](https://github.com/${slug}/commit/${hash}))`,
      );
    }
  }

  const body = SECTIONS.filter((s) => buckets[s.key].length)
    .map((s) => `### ${s.title}\n\n${buckets[s.key].join('\n')}`)
    .join('\n\n');

  process.stdout.write(
    body || `_No changes scoped to \`${project}\` in this release._\n`,
  );
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
