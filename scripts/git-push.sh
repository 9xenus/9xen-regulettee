#!/usr/bin/env bash
#
# git-push.sh — ek-command commit + push for 9xenus/9xen-regulettee (public repo)
#
# Usage:
#   bash scripts/git-push.sh "your commit message"
#   bash scripts/git-push.sh                 # message auto (date based)
#   GIT_TOKEN=ghp_xxx bash scripts/git-push.sh "msg"   # token override
#
# Token resolution order: $GIT_TOKEN -> /tmp/opencode/gh_token.txt -> $HOME/.config/9xen_token
# NOTE: repo is public. Never hardcode real secrets here.

set -euo pipefail

REPO="${GH_REPO:-9xenus/9xen-regulettee}"
BRANCH="${GH_BRANCH:-main}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

# --- 1. git HTTPS helper fix (is box-er custom git build needs GIT_EXEC_PATH) ---
if [ ! -x "$(git --exec-path)/git-remote-https" ] \
   && [ -x /home/prophet/.local/git-prefix/usr/lib/git-core/git-remote-https ]; then
  export GIT_EXEC_PATH=/home/prophet/.local/git-prefix/usr/lib/git-core
fi

# --- 2. GitHub token (PAT) ---
TOKEN="${GIT_TOKEN:-}"
if [ -z "$TOKEN" ] && [ -f /tmp/opencode/gh_token.txt ]; then
  TOKEN="$(tr -d '[:space:]' < /tmp/opencode/gh_token.txt)"
fi
if [ -z "$TOKEN" ] && [ -f "$HOME/.config/9xen_token" ]; then
  TOKEN="$(tr -d '[:space:]' < "$HOME/.config/9xen_token")"
fi
if [ -z "$TOKEN" ]; then
  echo "ERROR: GitHub token not found." >&2
  echo "  export GIT_TOKEN=ghp_xxxxxxxx    (or put it in /tmp/opencode/gh_token.txt)" >&2
  exit 1
fi
echo "Token: ****${TOKEN: -4}"

# --- 3. git identity (set once, local to this repo) ---
git config user.name  >/dev/null 2>&1 || git config user.name  "9xenus"
git config user.email >/dev/null 2>&1 || git config user.email "9xenus@users.noreply.github.com"

URL="https://x-access-token:${TOKEN}@github.com/${REPO}.git"

# --- 4. Sync remote state first (scan/push compare against latest) ---
git fetch "$URL" "+refs/heads/${BRANCH}:refs/remotes/origin/${BRANCH}" -q 2>/dev/null || true
REMOTE_SHA="$(git rev-parse --verify -q "refs/remotes/origin/${BRANCH}" || true)"

# --- 5. Stage everything (respects .gitignore) ---
git add -A

# --- 6. Secret pre-flight: GitHub push protection blocks secrets on public repos ---
PATTERNS='ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{40,}|gho_[A-Za-z0-9]{36}|sk_(live|test)_[A-Za-z0-9]{16,}|pk_(live|test)_[A-Za-z0-9]{16,}|rk_(live|test)_[A-Za-z0-9]{16,}|whsec_[A-Za-z0-9]{10,}|glpat_[A-Za-z0-9]{16,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{30,}|[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}'
HITS="$(mktemp)"
if [ -n "$REMOTE_SHA" ]; then
  git diff --name-only -z "$REMOTE_SHA" | xargs -0 -r grep -lE -- "$PATTERNS" 2>/dev/null >"$HITS" || true
else
  git diff --cached --name-only -z | xargs -0 -r grep -lE -- "$PATTERNS" 2>/dev/null >"$HITS" || true
fi
if [ -s "$HITS" ] && [ "${ALLOW_SECRET:-0}" != "1" ]; then
  echo "!! Possible secret found in these files (GitHub push protection WILL block):"
  sed 's/^/   /' "$HITS"
  echo "Replace real values with <REDACTED> placeholders, then re-run."
  echo "(override: ALLOW_SECRET=1 bash $0 \"msg\")"
  rm -f "$HITS"
  exit 1
fi
rm -f "$HITS"

# --- 7. Commit only if something changed ---
if ! git diff --cached --quiet; then
  MSG="${1:-chore: update $(date +'%Y-%m-%d %H:%M:%S')}"
  git commit -q -m "$MSG"
  echo "Committed: $(git log --oneline -1)"
else
  echo "No new changes to commit."
fi

# --- 8. Push if we are ahead of remote ---
if [ -n "$REMOTE_SHA" ] && [ "$(git rev-parse HEAD)" = "$REMOTE_SHA" ]; then
  echo "Already up to date with origin/${BRANCH}."
  exit 0
fi

echo "Pushing to ${REPO} (${BRANCH})..."
LOG="$(mktemp)"
set +e
git push "$URL" "$BRANCH" 2>&1 | tee "$LOG"
RC="${PIPESTATUS[0]}"
set -e

if [ "$RC" -eq 0 ]; then
  echo "Push OK -> https://github.com/${REPO}"
  rm -f "$LOG"
  exit 0
fi

if grep -qiE "GH013|cannot contain secret|Push cannot contain" "$LOG"; then
  echo "Push blocked by GitHub secret scanning. Redact the listed secrets and re-run." >&2
  rm -f "$LOG"; exit 1
fi

if grep -qiE "non-fast-forward|stale info" "$LOG" && [ -n "$REMOTE_SHA" ]; then
  echo "Remote history diverged (amend/rebase?) — retrying with force-with-lease..."
  if git push --force-with-lease="${BRANCH}:${REMOTE_SHA}" "$URL" "$BRANCH"; then
    echo "Push OK (force-with-lease) -> https://github.com/${REPO}"
    rm -f "$LOG"; exit 0
  fi
fi

echo "Push failed (see errors above)." >&2
rm -f "$LOG"; exit 1
