import { execSync, ExecSyncOptions } from "child_process";
import path from "path";
import fs from "fs-extra";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function exec(cmd: string, opts: ExecSyncOptions = {}): string {
  try {
    const result = execSync(cmd, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      ...opts,
    });
    return (result as string).trim();
  } catch (err: unknown) {
    const e = err as { stderr?: Buffer | string; message?: string };
    const stderr = e.stderr?.toString().trim() ?? "";
    const msg = stderr || e.message || String(err);
    throw new Error(`Git command failed: ${cmd}\n${msg}`);
  }
}

// ─── Project root detection ──────────────────────────────────────────────────

/**
 * Resolve the git root of the current working directory.
 * Throws a user-friendly error if not in a git repo.
 */
export function resolveGitRoot(cwd: string = process.cwd()): string {
  try {
    return exec("git rev-parse --show-toplevel", { cwd });
  } catch {
    throw new Error(
      `Not inside a git repository (cwd: ${cwd}).\n` +
        `Navigate to a project directory with a .git folder.`
    );
  }
}

// ─── Docs repo management ────────────────────────────────────────────────────

/** Clone a remote git repo to localPath if it doesn't already exist. */
export async function cloneRepoIfNeeded(
  gitUrl: string,
  localPath: string
): Promise<void> {
  if (await fs.pathExists(localPath)) {
    // Verify it's actually a git repo
    try {
      exec("git rev-parse --git-dir", { cwd: localPath });
      console.log(`  Docs repo already exists at ${localPath}`);
    } catch {
      throw new Error(
        `Path ${localPath} exists but is not a git repository.\n` +
          `Please remove it or choose a different path.`
      );
    }
    return;
  }

  console.log(`  Cloning docs repo from ${gitUrl} → ${localPath}…`);
  await fs.ensureDir(path.dirname(localPath));
  exec(`git clone "${gitUrl}" "${localPath}"`);
  console.log(`  Clone complete.`);
}

/** Pull the latest changes via fetch + rebase on the default branch. */
export function pullLatest(repoPath: string): void {
  exec("git fetch origin", { cwd: repoPath });
  try {
    exec("git pull --rebase origin main", { cwd: repoPath });
  } catch (err) {
    const msg = (err as Error).message;
    // Empty repo: no remote ref for main yet — skip pull, first push will create it
    if (msg.includes("couldn't find remote ref") || msg.includes("ref main")) {
      return;
    }
    throw err;
  }
}

/** Stage all changes, commit with message, and push to origin/main. */
export function commitAndPush(repoPath: string, message: string): void {
  const status = exec("git status --porcelain", { cwd: repoPath });
  if (!status) {
    // Nothing to commit
    return;
  }
  exec("git add -A", { cwd: repoPath });
  exec(`git commit -m "${message.replace(/"/g, '\\"')}"`, { cwd: repoPath });
  exec("git push -u origin main", { cwd: repoPath });
}

/** Return true if the working tree has uncommitted changes. */
export function hasChanges(repoPath: string): boolean {
  const status = exec("git status --porcelain", { cwd: repoPath });
  return status.length > 0;
}

/** Get the current branch name. */
export function currentBranch(repoPath: string): string {
  return exec("git rev-parse --abbrev-ref HEAD", { cwd: repoPath });
}

/** Check if remote main is ahead of local. Returns number of commits behind. */
export function commitsBehind(repoPath: string): number {
  try {
    exec("git fetch origin main --quiet", { cwd: repoPath });
    const result = exec(
      "git rev-list HEAD..origin/main --count",
      { cwd: repoPath }
    );
    return parseInt(result, 10);
  } catch {
    return 0;
  }
}
