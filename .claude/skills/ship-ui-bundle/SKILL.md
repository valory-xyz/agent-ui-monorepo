---
name: ship-ui-bundle
description: Open the downstream PR that ships a built agent-ui-monorepo bundle into the agent repo that serves it (meme-ooorr / optimus / connect / trader). Takes a monorepo release tag (e.g. `v0.1.2-connect`), downloads that release's `*-ui-build.zip`, replaces the vendored bundle directory in the target repo, re-locks open-autonomy package hashes when the bundle lives under `packages/`, and opens the `chore: update …` PR. Repo-specific to agent-ui-monorepo.
argument-hint: "<release-tag> [--repo-path <existing-clone>] [--no-pr]  # e.g. v0.1.2-connect. --repo-path reuses a local clone of the target repo (skips clone + uv sync). --no-pr stops after the local commit."
disable-model-invocation: true
---

# Ship a UI bundle to its agent repo

Each app in this monorepo is **vendored as a pre-built static bundle** inside the Python agent repo that serves it. Shipping a UI change therefore takes two steps: tag a release here (CI builds the zip), then open a PR in the agent repo that swaps the vendored bundle. This skill does the second step.

Worked example: [valory-xyz/connect#32](https://github.com/valory-xyz/connect/pull/32) (simple case, no re-lock) and [valory-xyz/optimus#362](https://github.com/valory-xyz/optimus/pull/362) (with re-lock).

**Never build locally.** The bundle must be byte-identical to the release asset CI produced — that asset is what Pearl pins and what the release notes describe. If no release exists for the change you want to ship, push the tag first and wait for `_build-app.yml` to finish.

## Target map

The **tag suffix** is the whole routing key. One tag = one variant = one bundle directory.

| Release tag | App | Release asset | Target repo | Vendored bundle dir |
| --- | --- | --- | --- | --- |
| `v*-agentsfun` | agentsfun-ui | `agentsfun-ui-build.zip` | `valory-xyz/meme-ooorr` | `packages/valory/skills/memeooorr_abci/agentsfun-ui-build` |
| `v*-modius` | babydegen-ui | `babydegen-ui-build.zip` | `valory-xyz/optimus` | `packages/valory/skills/optimus_abci/modius-ui-build` |
| `v*-optimus` | babydegen-ui | `babydegen-ui-build.zip` | `valory-xyz/optimus` | `packages/valory/skills/optimus_abci/optimus-ui-build` |
| `v*-basius` | babydegen-ui | `babydegen-ui-build.zip` | `valory-xyz/optimus` | `packages/valory/skills/optimus_abci/basius-ui-build` |
| `v*-connect` | connect-ui | `connect-ui-build.zip` | `valory-xyz/connect` | `connect/assets/ui` |
| `v*-omenstrat-trader` | predict-ui | `predict-ui-build.zip` | `valory-xyz/trader` | `packages/valory/skills/trader_abci/ui-build/omenstrat` |
| `v*-polystrat-trader` | predict-ui | `predict-ui-build.zip` | `valory-xyz/trader` | `packages/valory/skills/trader_abci/ui-build/polystrat` |

Bundle directories move. Confirm the path against the target repo's tree before writing, and let §4 decide the re-lock from the actual diff — never from a memorised per-repo answer.

Notes that repeatedly trip people up:

- **agentsfun-ui ships to `meme-ooorr`, not `trader`.** Agents.fun is the `memeooorr` agent. `trader` only hosts predict-ui (both markets).
- **One zip, two/three destinations.** `babydegen-ui-build.zip` and `predict-ui-build.zip` are agent-specific builds — `REACT_APP_AGENT_NAME` is injected at build time from the tag suffix. Never copy a `-modius` zip into `optimus-ui-build/`; the bundle is not interchangeable.
- **A repo having a `packages/` directory says nothing about whether its bundle sits inside it.** `connect` has one but currently vendors at `connect/assets/ui`. §4 tests the staged diff, so a bundle that moves under `packages/` starts re-locking on its own.
- **`README.md` inside a vendored bundle dir may or may not be a build output.** `connect-ui-build.zip` ships one (a copy of `apps/connect-ui/README.md`); meme-ooorr's bundle dir has none. The §3 preserve-then-overwrite order is correct for both: the build's copy wins where the zip has one, and an agent-repo-authored one survives where it doesn't. Do not "simplify" it into a plain `rm -rf` of the whole directory.

---

## 1 — Preflight

```bash
set -euo pipefail
for cmd in gh git unzip jq; do command -v "$cmd" >/dev/null || { echo "missing: $cmd" >&2; exit 1; }; done
gh auth status >/dev/null || { echo "run: gh auth login" >&2; exit 1; }
```

Resolve the tag argument to a row in the target map. Derive:

```bash
TAG="v0.1.2-connect"            # as given
SUFFIX=${TAG#v*.*.*-}           # connect | modius | optimus | basius | agentsfun | omenstrat-trader | polystrat-trader
VERSION=${TAG#v}; VERSION=${VERSION%%-*}   # 0.1.2 — used in the §3 branch name
```

If invoked without a tag, list the recent releases on each line and ask which to ship:

```bash
gh release list --repo valory-xyz/agent-ui-monorepo --limit 20
```

If the suffix does not match a row, **stop**. Do not guess a target directory — a wrong guess writes an incompatible bundle into a live agent.

## 2 — Fetch the release asset

Verify **provenance first** — the release must be CI's build of reviewed code on `main`, not a tag pushed on a stray commit or a hand-replaced asset. `_build-app.yml` triggers on *any* pushed tag and has no ancestor-of-`main` check, so an unreviewed commit yields a legitimate-looking release with a genuine CI-built asset. Nothing later in this procedure would notice.

```bash
REPO=valory-xyz/agent-ui-monorepo
STATUS=$(gh api "repos/$REPO/compare/main...$TAG" -q .status)
[ "$STATUS" = behind ] || [ "$STATUS" = identical ] \
  || { echo "$TAG is not on main (status: $STATUS) — ship only merged, reviewed code" >&2; exit 1; }
gh api "repos/$REPO/releases/tags/$TAG" \
  -q '[.draft, .prerelease, (.assets[] | select(.name=="<ASSET>") | .uploader.login)] | @tsv'
# expect: false  false  github-actions[bot] — anything else: stop and report to the user
```

Then download:

```bash
WORK="${TMPDIR:-/tmp}/ship-ui-bundle/$TAG"
rm -rf "$WORK" && mkdir -p "$WORK/bundle"
gh release download "$TAG" --repo valory-xyz/agent-ui-monorepo \
  --pattern '<ASSET>' --dir "$WORK"
unzip -q "$WORK/<ASSET>" -d "$WORK/bundle"
```

Verify the unpacked bundle before touching the target repo:

- `index.html` exists at the root of `$WORK/bundle`.
- Every `src`/`href` in `index.html` that points at `/assets/…` resolves to a file that exists in `$WORK/bundle/assets/`.
- There is exactly one `assets/index-*.js`.

A release whose asset is missing means the build workflow failed or is still running — check `gh run list --repo valory-xyz/agent-ui-monorepo --workflow <app>-build.yml` and stop.

## 3 — Prepare the target repo

Reuse a persistent clone; `trader` and `optimus` are large and the `uv sync` in §4 is expensive to redo.

```bash
CLONE="${REPO_PATH:-$HOME/.cache/agent-ui-bundle-prs/<repo-name>}"
[ -d "$CLONE/.git" ] || gh repo clone <owner/repo> "$CLONE"

# Refuse a dirty tree BEFORE any checkout/reset — never reset over someone's work.
[ -z "$(git -C "$CLONE" status --porcelain)" ] \
  || { echo "worktree dirty: $CLONE — commit/stash first, not resetting over it" >&2; exit 1; }

git -C "$CLONE" fetch origin --prune
git -C "$CLONE" checkout main && git -C "$CLONE" reset --hard origin/main
# -B, not -b: the branch name is fully tag-derived, so a retry must reuse it
git -C "$CLONE" checkout -B "chore/update-<variant>-ui-v$VERSION"
```

Swap the bundle. Deleting first is what makes stale hashed assets disappear; a plain copy leaves orphaned `index-*.js` files behind and the bundle grows every release.

`$DEST` is built from a placeholder this skill substitutes at run time, and bundle directories move — so guard it before the recursive delete. Unguarded, an empty or wrong-but-existing substitution makes `DEST` equal `"$CLONE/"`, and `-mindepth 1 -maxdepth 1` then matches every top-level entry in the clone, `.git` included.

```bash
DEST="$CLONE/<bundle-dir>"
case "$DEST" in "$CLONE"|"$CLONE/") echo "refusing to wipe clone root: $DEST" >&2; exit 1;; esac
[ -f "$DEST/index.html" ] || { echo "no index.html in $DEST — bundle dir moved? check the repo tree" >&2; exit 1; }

# keep README.md — see the note above; the zip's copy overwrites it when present
find "$DEST" -mindepth 1 -maxdepth 1 ! -name README.md -exec rm -rf {} +
cp -r "$WORK/bundle/." "$DEST/"
git -C "$CLONE" add -A "<bundle-dir>"
git -C "$CLONE" status --short
```

Sanity-check the staged diff: an `index.html` one-line `<script src>` change, plus deleted + added hashed-asset pairs (`index-*.js`, `index-*.css`, and any other hashed asset that changed — GitHub renders these as renames), and nothing outside the bundle dir. If `README.md` shows as deleted, the `find` filter did not apply — fix before continuing.

An **empty** staged diff means the repo already vendors this exact release — not a failure. Report it and stop rather than committing nothing.

On Windows, `git add` emits `LF will be replaced by CRLF` warnings for the bundle's text files. These are benign: git normalises to LF in the index, which is why re-applying an already-shipped release yields an empty diff rather than a whole-file rewrite.

## 4 — Re-lock package hashes (only when the diff touches `packages/`)

```bash
git -C "$CLONE" diff --cached --name-only | grep -q '^packages/' && NEEDS_LOCK=1 || NEEDS_LOCK=0
```

Vendored bundles under `packages/` are part of an open-autonomy package, so their content hash is fingerprinted in `packages/packages.json` and propagated into the dependent `skill.yaml`, `aea-config.yaml` and `service.yaml` files. CI (`tomte tox -e check-hash` / `autonomy packages lock --check`) fails the PR without this step.

**Every command below is required, in order — `sync` especially.** The committed `packages/` tree is a *sparse* registry: it holds only this repo's own packages, not the third-party ones (`valory/kv_store`, `abstract_round_abci`, `mech_interact_abci`, …) that they depend on. Hashing walks the full dependency graph, so `lock` fails outright until `sync` has fetched them:

> `Error: Connection configuration not found: …/packages/valory/connections/kv_store/connection.yaml`

⚠️ `autonomy init --reset` overwrites the **machine-global** `~/.autonomy` config, so the block below runs it only when no config exists. If `~/.autonomy` is already present, leave it alone — say so and let the user decide; a customised registry setup is theirs to change, not this skill's.

```bash
cd "$CLONE"
uv sync --all-groups                    # ~2 min first run, cached after

AUTHOR=$(jq -r '.dev | keys[] | select(startswith("service/"))' packages/packages.json | head -1 | cut -d/ -f2)
[ -n "$AUTHOR" ] || { echo "could not derive author from packages.json" >&2; exit 1; }

if [ ! -d ~/.autonomy ]; then
  uv run autonomy init --reset --author "$AUTHOR" --ipfs --remote
fi

uv run autonomy packages sync           # fetches third-party packages
uv run autonomy packages lock
uv run autonomy packages lock --check   # must print "Verification successful"
```

`sync` writes only into gitignored/tracked-unchanged paths — it must not add untracked files to `git status`. If it does, stop: something is off with the registry config.

**Verify the blast radius before committing.** The lock should touch `packages/packages.json` plus exactly the yaml files whose hashes cascade from the changed bundle — the owning `skill.yaml`, and every `aea-config.yaml` / `service.yaml` that depends on it. Shipping one agent's UI updates its sibling's yaml too when they share a skill: changing **basius**'s bundle moves `optimus_abci`, both `basius` + `optimus` agents, and both services. That is correct, not a bug. Confirm with:

```bash
git -C "$CLONE" status --short          # expect bundle files + packages.json + the cascade, nothing else
```

If unrelated packages move, the clone is stale — re-fetch `main` and redo. A good pre-flight sanity check is that `lock --check` passes on **untouched** `main`; if it doesn't, the local toolchain disagrees with what the maintainers committed and nothing downstream can be trusted.

**Stage the lock output.** §3 staged only `<bundle-dir>`, but everything `lock` just rewrote — `packages/packages.json` and the cascading yaml — sits *outside* it. Skip this and §5 commits the bundle alone: `lock --check` still passes locally, the PR opens looking correct, and CI's `check-hash` fails on the very hashes §4 exists to refresh.

```bash
git -C "$CLONE" add -A
git -C "$CLONE" diff --name-only        # must be empty — nothing left unstaged
git -C "$CLONE" diff --cached --stat    # the full commit: bundle + packages.json + cascade
```

**If neither `uv` nor a working Python env is available:** do not fake the hashes and do not open the PR claiming it is ready. Commit the bundle, then stop and report that the re-lock is outstanding, quoting the two commands above.

## 5 — Commit

```bash
git -C "$CLONE" commit -m "chore: update <variant>-ui to $TAG"
```

Match the surrounding repo's commit style — these agent repos use plain `chore:` subjects with no trailer. Do **not** add a Co-Authored-By trailer unless the repo's history shows one.

## 6 — Push and open the PR

**Ask the user to confirm before pushing.** Show them the staged file list and the branch name first; pushing and opening a PR in another team's repo is outward-facing and should not happen implicitly. Skip §6 entirely under `--no-pr`.

Write the body, then push and open:

```bash
cat > "$WORK/pr-body.md" <<'EOF'
## Summary
- Update the vendored <variant> UI bundle to [`<TAG>`](https://github.com/valory-xyz/agent-ui-monorepo/releases/tag/<TAG>): swap `assets/index-<old>.js` for `assets/index-<new>.js` and repoint the `<script src>` in `index.html`.
- <list any added/removed static assets — new logos, images, fonts>
- <if §4 ran> Re-run `autonomy packages lock` so the affected skill, agents and services carry the refreshed fingerprint hashes.

Built by agent-ui-monorepo CI — the bundle is the unmodified `<ASSET>` release asset.

## Test plan
- [ ] <if §4 ran> `autonomy packages lock --check` passes in CI
- [ ] Common checks green
- [ ] Manual: run the service locally and confirm the UI loads the new bundle
EOF

git -C "$CLONE" push -u origin "chore/update-<variant>-ui-v$VERSION"
gh pr create --repo <owner/repo> --base main \
  --title "chore: update <variant>-ui to $TAG" --body-file "$WORK/pr-body.md"
```

Substitute the `<…>` placeholders before writing the file — the heredoc is quoted, so nothing expands on its own.

Include a `Reference — <monorepo PR url>` line when the release exists to ship a specific monorepo PR (trader#853 does this).

## 7 — Report back

Tell the user:

1. The PR URL.
2. Whether the re-lock ran, was unnecessary, or is **outstanding**.
3. The follow-up Pearl bump, which this skill deliberately does **not** do:
   > `valory-xyz/olas-operate-app` records the shipped UI tag in [`frontend/constants/serviceTemplates/agentUiReleases.ts`](https://github.com/valory-xyz/olas-operate-app/blob/main/frontend/constants/serviceTemplates/agentUiReleases.ts). Bump this agent's entry to `<TAG>` alongside `service_version` / `agent_release` when the agent-repo PR merges.
   >
   > This constant is **display metadata** — it feeds Pearl's Release Notes page, it does not deliver the bundle. Pearl embeds whatever UI the running agent serves. Users get the new bundle when the agent repo cuts a release and Pearl bumps `service_version` / `agent_release`; a stale entry here misreports the version but breaks nothing.

---

## Failure modes worth naming

| Symptom | Cause |
| --- | --- |
| CI `check-hash` fails, though `lock --check` passed locally | The lock output was never staged — §3 stages only the bundle dir; §4's final `git add -A` is what picks up `packages.json` + the cascading yaml |
| CI `check-hash` fails and `lock --check` also fails locally | §4 skipped, or run before the bundle was staged |
| `lock` fails with `Connection configuration not found` | `autonomy packages sync` not run — the local registry is sparse (§4) |
| Sibling agent's yaml changed and you didn't expect it | Correct: shared skill, hash cascades to every dependent agent + service |
| UI loads blank, 404 on `/assets/index-*.js` | `index.html` and the js file came from different builds — re-extract and redo §3 |
| Bundle dir keeps growing each release | Files were copied without deleting first (§3) |
| Wrong agent's UI renders | Zip from the wrong tag suffix — `babydegen`/`predict` zips are agent-specific |
| PR diff shows hundreds of `packages/` yaml changes | Stale `main`; re-fetch and re-lock |
