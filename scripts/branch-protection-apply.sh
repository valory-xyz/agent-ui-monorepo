#!/usr/bin/env bash
# Apply the branch-protection ruleset described in Phase 3.6 of the
# supply-chain plan. Read SUPPLY-CHAIN-SECURITY.md and confirm with the
# team BEFORE running this — it changes shared-repo behaviour.
#
# Prerequisites:
#   - gh CLI installed and authenticated as a repo admin.
#   - All required status checks (listed below) have run green on `main`
#     at least once. Without that, the rule will block every PR.
#
# Usage:
#   ./scripts/branch-protection-apply.sh                    # apply
#   ./scripts/branch-protection-apply.sh --dry-run          # print payload, no API call
#   ./scripts/branch-protection-apply.sh --get              # show current protection
#   ./scripts/branch-protection-apply.sh --remove           # remove protection (admin only)
#
# Required status check contexts (must match the job *names* in workflow YAML):
#   - "All checks passed"              (Check Pull Request workflow aggregator — lint + test)
#   - "Supply chain checks passed"     (Supply Chain workflow aggregator — audit + install-hooks + lockfile-lint)
#   - "Run Gitleaks"                   (Gitleaks workflow)
#
# Cross-workflow `needs:` is not supported, so the three contexts must all
# be declared individually here — that's the load-bearing reason the
# two aggregator patterns exist in `check-pull-request.yml` and
# `supply-chain.yml`. The names are deliberately distinct so each context
# resolves to exactly one job at branch-protection time.

set -euo pipefail

REPO="${REPO:-valory-xyz/agent-ui-monorepo}"
BRANCH="main"

CONTEXTS=(
  "All checks passed"
  "Supply chain checks passed"
  "Run Gitleaks"
)

build_payload() {
  local checks_json
  checks_json=$(printf '%s\n' "${CONTEXTS[@]}" | jq -R . | jq -s 'map({context: .})')

  jq -n \
    --argjson checks "$checks_json" \
    '{
      required_status_checks: {
        strict: true,
        checks: $checks
      },
      enforce_admins: null,
      required_pull_request_reviews: {
        dismiss_stale_reviews: true,
        require_code_owner_reviews: true,
        required_approving_review_count: 1
      },
      restrictions: null,
      required_linear_history: true,
      allow_force_pushes: false,
      allow_deletions: false,
      block_creations: false,
      required_conversation_resolution: true,
      lock_branch: false,
      allow_fork_syncing: false
    }'
}

case "${1:-}" in
  --dry-run)
    echo "Would PUT https://api.github.com/repos/${REPO}/branches/${BRANCH}/protection with:"
    build_payload | jq .
    ;;
  --get)
    gh api "repos/${REPO}/branches/${BRANCH}/protection" --jq '.' || {
      echo "Branch protection is not currently set on ${REPO}#${BRANCH}." >&2
    }
    ;;
  --remove)
    read -r -p "REMOVE branch protection from ${REPO}#${BRANCH}? Type 'yes' to confirm: " confirm
    [[ "$confirm" == "yes" ]] || { echo "Aborted."; exit 1; }
    gh api -X DELETE "repos/${REPO}/branches/${BRANCH}/protection"
    echo "✅ Protection removed."
    ;;
  ""|--apply)
    echo "About to apply branch protection to ${REPO}#${BRANCH}."
    echo "Required status check contexts:"
    printf '  - %s\n' "${CONTEXTS[@]}"
    echo
    echo "Verifying contexts have at least one green run on main…"
    missing=()
    for ctx in "${CONTEXTS[@]}"; do
      # Look back ~50 recent main runs; conclusion=success and matching name.
      if ! gh run list --repo "$REPO" --branch main --limit 50 --json name,conclusion \
            --jq ".[] | select(.conclusion == \"success\" and (.name | contains(\"$ctx\")))" \
          | grep -q .; then
        missing+=("$ctx")
      fi
    done

    if [[ ${#missing[@]} -gt 0 ]]; then
      echo "⚠️  No successful main runs found for: ${missing[*]}"
      echo "    Enabling protection now would block every PR until one lands."
      read -r -p "Proceed anyway? Type 'yes' to confirm: " confirm
      [[ "$confirm" == "yes" ]] || { echo "Aborted."; exit 1; }
    fi

    payload=$(build_payload)
    echo "$payload" | gh api \
      -X PUT \
      "repos/${REPO}/branches/${BRANCH}/protection" \
      --input -
    echo "✅ Branch protection applied to ${REPO}#${BRANCH}."
    ;;
  *)
    echo "Usage: $0 [--apply|--dry-run|--get|--remove]" >&2
    exit 2
    ;;
esac
