#!/usr/bin/env node
/**
 * AUTO-PUSH — watches this working tree and commits + pushes changes to GitHub automatically.
 *
 *   npm run autopush               run the watcher (Ctrl-C to stop)
 *   npm run autopush -- --once     one cycle: commit + push whatever is pending, then exit
 *   npm run autopush -- --dry-run  show what WOULD be committed/pushed; changes nothing
 *   npm run autopush -- --status   show whether a watcher is running
 *
 * Options (flags or env):
 *   --interval=30      seconds between checks            (AUTOPUSH_INTERVAL)
 *   --quiet=20         seconds the tree must stay unchanged before committing, so half-saved work is not
 *                      committed                         (AUTOPUSH_QUIET)
 *   --branch=main      only run while this branch is checked out (AUTOPUSH_BRANCH; default: main)
 *   --remote=origin    remote to push to                 (AUTOPUSH_REMOTE)
 *
 * Safety rules (all enforced in code):
 *   - Pushes to the configured branch only, with a normal push. It NEVER force-pushes and never rewrites history.
 *   - Respects .gitignore. Additionally refuses to commit .env*, *.db, *.pem, *.key, *.p12 even if not ignored.
 *   - Scans every added line for credentials (GitHub/AWS/Google/Stripe/Slack tokens, private-key bodies,
 *     quoted secret assignments). A file with a hit is left out of the commit and reported; the rest still goes.
 *     To accept a reviewed false positive, list its path in .autopush-allow (one path per line).
 *   - Syncs with `git pull --rebase` before pushing. On any conflict it aborts the rebase, pauses, and tells you;
 *     it never resolves conflicts for you.
 *   - Does nothing during a merge/rebase/cherry-pick, with a detached HEAD, or on another branch.
 *   - One watcher per repository (lock file). Log: .autopush.log
 *   - Uses your existing git credentials (credential helper); no token is read, stored or put in a URL.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// ── config ───────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const flag = (name) => argv.find(a => a === `--${name}` || a.startsWith(`--${name}=`));
const opt = (name, env, dflt) => { const f = flag(name); if (f && f.includes('=')) return f.split('=').slice(1).join('='); return process.env[env] ?? dflt; };

const ROOT = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
process.chdir(ROOT);
const INTERVAL = Math.max(5, Number(opt('interval', 'AUTOPUSH_INTERVAL', 30)) || 30) * 1000;
const QUIET = Math.max(0, Number(opt('quiet', 'AUTOPUSH_QUIET', 20)) || 0) * 1000;
const BRANCH = opt('branch', 'AUTOPUSH_BRANCH', 'main');
const REMOTE = opt('remote', 'AUTOPUSH_REMOTE', 'origin');
const ONCE = !!flag('once'); const DRY = !!flag('dry-run'); const STATUS = !!flag('status');
const LOCK = path.join(ROOT, '.autopush.lock');
const LOG = path.join(ROOT, '.autopush.log');
const ALLOW_FILE = path.join(ROOT, '.autopush-allow');

// This machine's git needs its exec path for HTTPS; honour an existing setting, else the known local install.
if (!process.env.GIT_EXEC_PATH) {
  const local = '/home/nikhil/.local/git/libexec/git-core';
  if (fs.existsSync(path.join(local, 'git-remote-https'))) process.env.GIT_EXEC_PATH = local;
}
process.env.GIT_TERMINAL_PROMPT = '0';        // never hang waiting for a password

const stamp = () => new Date().toISOString().replace('T', ' ').slice(0, 19);
function log(msg) { const line = `[${stamp()}] ${msg}`; console.log(line); try { fs.appendFileSync(LOG, line + '\n'); } catch { /* ignore */ } }

function git(args, { allowFail = false, input } = {}) {
  const r = spawnSync('git', args, { encoding: 'utf8', input, maxBuffer: 64 * 1024 * 1024 });
  const out = (r.stdout || '').toString();
  if (r.status !== 0 && !allowFail) throw new Error(`git ${args.slice(0, 3).join(' ')} failed: ${((r.stderr || '') + out).trim().split('\n').slice(-3).join(' | ')}`);
  return { ok: r.status === 0, out, err: (r.stderr || '').toString() };
}

// ── guards ───────────────────────────────────────────────────────────────────
const NEVER = [/(^|\/)\.env($|\.)/i, /\.db$/i, /\.db-(wal|shm|journal)$/i, /\.(pem|key|p12|pfx|jks)$/i, /(^|\/)id_(rsa|ed25519|ecdsa)/i, /(^|\/)\.autopush\.(log|lock)$/];
const SECRET_PATTERNS = [
  ['GitHub token', /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36,}\b/], ['GitHub fine-grained token', /\bgithub_pat_[A-Za-z0-9_]{50,}\b/],
  ['GitLab token', /\bglpat-[A-Za-z0-9_-]{20,}\b/], ['AWS access key', /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/], ['Stripe key', /\b[sr]k_live_[A-Za-z0-9]{16,}\b/],
  ['Slack token', /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/], ['OpenAI-style key', /\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}\b/],
  ['Anthropic key', /\bsk-ant-[A-Za-z0-9_-]{32,}\b/],
  ['private key body', /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY(?: BLOCK)?-----\s*[A-Za-z0-9+/=\r\n]{40,}/],
  ['quoted secret assignment', /\b(?:secret|passw(?:or)?d|api[_-]?key|access[_-]?token|auth[_-]?token|private[_-]?key)\w*["']?\s*[:=]\s*["'](?!.*(?:example|placeholder|changeme|your[_-]|xxxx|<|\$\{|process\.env|REDACTED|dummy|test|fake|sample))[A-Za-z0-9/+_=.-]{24,}["']/i]
];
const allowList = () => { try { return new Set(fs.readFileSync(ALLOW_FILE, 'utf8').split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#'))); } catch { return new Set(); } };

function inProgressOperation() {
  const gd = git(['rev-parse', '--git-dir']).out.trim();
  for (const f of ['MERGE_HEAD', 'CHERRY_PICK_HEAD', 'REVERT_HEAD', 'rebase-merge', 'rebase-apply', 'BISECT_LOG']) if (fs.existsSync(path.join(ROOT, gd, f))) return f;
  return null;
}

function scanStagedFile(file) {
  const added = git(['diff', '--cached', '-U0', '--no-color', '--', file], { allowFail: true }).out.split('\n').filter(l => l.startsWith('+') && !l.startsWith('+++')).map(l => l.slice(1)).join('\n');
  if (!added) return null;
  for (const [name, re] of SECRET_PATTERNS) if (re.test(added)) return name;
  return null;
}

// ── one cycle ────────────────────────────────────────────────────────────────
let paused = null;      // reason string when we stopped for human attention
let lastSig = ''; let lastChange = Date.now(); let lastReported = ''; let lastHeld = '';

function report(msg) { if (msg !== lastReported) { log(msg); lastReported = msg; } }

function cycle() {
  if (paused) { report(`PAUSED: ${paused} — fix it, then restart the watcher.`); return false; }
  const op = inProgressOperation(); if (op) { report(`skipping: a git operation is in progress (${op})`); return false; }
  const branch = git(['symbolic-ref', '--short', '-q', 'HEAD'], { allowFail: true }).out.trim();
  if (!branch) { report('skipping: detached HEAD'); return false; }
  if (branch !== BRANCH) { report(`skipping: on branch "${branch}", auto-push only runs on "${BRANCH}"`); return false; }

  // Untracked protected files (.env, keys…) are never committed, so they must not keep re-triggering cycles.
  const status = git(['status', '--porcelain=v1', '-z', '--untracked-files=all']).out.split('\0').filter(e => e && !(e.startsWith('?? ') && NEVER.some(re => re.test(e.slice(3))))).join('\0');
  const ahead = Number(git(['rev-list', '--count', `${REMOTE}/${BRANCH}..HEAD`], { allowFail: true }).out.trim()) || 0;
  if (!status && !ahead) { lastReported = ''; return false; }

  // wait for the tree to settle so half-written files are not committed
  if (status) {
    const sig = status + '|' + status.split('\0').filter(Boolean).map(e => e.slice(3)).map(f => { try { const s = fs.statSync(f); return `${f}:${s.size}:${s.mtimeMs}`; } catch { return `${f}:gone`; } }).join(',');
    if (sig !== lastSig) { lastSig = sig; lastChange = Date.now(); }
    if (!ONCE && !DRY && Date.now() - lastChange < QUIET) { report(`changes detected; waiting for ${QUIET / 1000}s of quiet before committing`); return false; }
  }

  let committed = false;
  if (status) {
    git(['add', '-A']);
    const staged = git(['diff', '--cached', '--name-only', '-z']).out.split('\0').filter(Boolean);
    const allow = allowList(); const skipped = [];
    for (const f of staged) {
      if (NEVER.some(re => re.test(f))) { git(['reset', '-q', 'HEAD', '--', f]); skipped.push(`${f} (protected file type)`); continue; }
      if (allow.has(f)) continue;
      const hit = scanStagedFile(f);
      if (hit) { git(['reset', '-q', 'HEAD', '--', f]); skipped.push(`${f} (looks like a credential: ${hit})`); }
    }
    const heldKey = skipped.join('|');
    if (!skipped.length) lastHeld = '';
    else if (heldKey !== lastHeld) { lastHeld = heldKey; log(`NOT committed — ${skipped.length} file(s) held back:\n   ${skipped.join('\n   ')}\n   Remove the credential, or add the path to .autopush-allow if it is a reviewed false positive.`); }

    const final = git(['diff', '--cached', '--name-status']).out.trim().split('\n').filter(Boolean);
    if (final.length) {
      const names = final.map(l => l.split('\t').pop());
      const msg = `chore(auto): update ${final.length} file${final.length === 1 ? '' : 's'}\n\n${final.slice(0, 40).join('\n')}${final.length > 40 ? `\n… and ${final.length - 40} more` : ''}\n\nAutomated commit by scripts/auto-push.mjs`;
      if (DRY) { log(`[dry-run] would commit ${final.length} file(s): ${names.slice(0, 8).join(', ')}${names.length > 8 ? ', …' : ''}`); git(['reset', '-q']); }
      else {
        git(['commit', '-q', '-m', msg]); committed = true;
        log(`committed ${final.length} file(s): ${names.slice(0, 6).join(', ')}${names.length > 6 ? ', …' : ''}`);
      }
    } else if (!DRY) git(['reset', '-q']);
  }

  const aheadNow = Number(git(['rev-list', '--count', `${REMOTE}/${BRANCH}..HEAD`], { allowFail: true }).out.trim()) || 0;
  if (DRY) { if (aheadNow) log(`[dry-run] ${aheadNow} unpushed commit(s) would be pushed to ${REMOTE}/${BRANCH}`); return false; }
  if (!committed && !aheadNow) return false;

  // sync, then push (never forced)
  const fetch = git(['fetch', REMOTE, BRANCH], { allowFail: true });
  if (!fetch.ok) { report(`fetch failed (offline or credentials?): ${fetch.err.trim().split('\n').pop()} — will retry`); return false; }
  const behind = Number(git(['rev-list', '--count', `HEAD..${REMOTE}/${BRANCH}`]).out.trim()) || 0;
  if (behind) {
    log(`remote has ${behind} new commit(s); rebasing local work on top`);
    const rb = git(['pull', '--rebase', '--autostash', REMOTE, BRANCH], { allowFail: true });
    if (!rb.ok) { git(['rebase', '--abort'], { allowFail: true }); paused = 'rebase conflict with remote changes (rebase aborted, nothing lost, nothing pushed)'; log(`PAUSED: ${paused}\n   ${rb.err.trim().split('\n').slice(-3).join('\n   ')}`); return false; }
  }
  const push = git(['push', REMOTE, `HEAD:${BRANCH}`], { allowFail: true });
  if (push.ok) { log(`pushed to ${REMOTE}/${BRANCH} @ ${git(['rev-parse', '--short', 'HEAD']).out.trim()}`); lastReported = ''; return true; }
  const why = push.err.trim();
  if (/GH013|secret|push protection/i.test(why)) { paused = 'GitHub push protection rejected the push (it found a secret). Remove it from the commit history, then restart'; log(`PAUSED: ${paused}\n   ${why.split('\n').slice(0, 6).join('\n   ')}`); return false; }
  if (/non-fast-forward|rejected|fetch first/i.test(why)) { report('push rejected (remote moved); will re-sync and retry next cycle'); return false; }
  if (/protected branch|denied|403|permission/i.test(why)) { paused = `push refused by GitHub (branch protection or permissions): ${why.split('\n').pop()}`; log(`PAUSED: ${paused}`); return false; }
  report(`push failed: ${why.split('\n').slice(-2).join(' ')} — will retry`);
  return false;
}

// ── lock + main ──────────────────────────────────────────────────────────────
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch { return false; } };
function readLock() { try { return Number(fs.readFileSync(LOCK, 'utf8').trim()); } catch { return 0; } }

if (STATUS) {
  const pid = readLock();
  console.log(pid && alive(pid) ? `auto-push is running (pid ${pid}) on branch "${BRANCH}"` : 'auto-push is not running');
  try { console.log('\nlast log lines:\n' + fs.readFileSync(LOG, 'utf8').trim().split('\n').slice(-8).join('\n')); } catch { /* no log yet */ }
  process.exit(0);
}

if (!ONCE && !DRY) {
  const pid = readLock();
  if (pid && alive(pid)) { console.error(`auto-push is already running (pid ${pid}). Stop it first (kill ${pid}).`); process.exit(1); }
  fs.writeFileSync(LOCK, String(process.pid));
  const cleanup = () => { try { if (readLock() === process.pid) fs.unlinkSync(LOCK); } catch { /* ignore */ } process.exit(0); };
  process.on('SIGINT', cleanup); process.on('SIGTERM', cleanup); process.on('exit', () => { try { if (readLock() === process.pid) fs.unlinkSync(LOCK); } catch { /* ignore */ } });
}

log(`auto-push ${ONCE ? 'single run' : DRY ? 'dry run' : 'watching'} — ${REMOTE}/${BRANCH}, every ${INTERVAL / 1000}s, ${QUIET / 1000}s quiet period${DRY ? ' (no changes will be made)' : ''}`);
const safeCycle = () => { try { cycle(); } catch (e) { report(`error: ${e.message}`); } };
safeCycle();
if (!ONCE && !DRY) setInterval(safeCycle, INTERVAL);
