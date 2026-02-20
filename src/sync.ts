import path from "path";
import fs from "fs-extra";
import { glob } from "glob";
import type { ResolvedProject } from "./types.js";
import { loadGlobalConfig } from "./config.js";
import { cloneRepoIfNeeded, pullLatest, commitAndPush } from "./git.js";
import chalk from "chalk";

export interface SyncOptions {
  dryRun?: boolean;
}

export interface SyncResult {
  added: string[];
  updated: string[];
  deleted: string[];
}

/**
 * Perform a full sync cycle:
 *   1. Ensure docs repo is cloned and up-to-date.
 *   2. Diff source vs target.
 *   3. Copy/delete files.
 *   4. Commit and push (unless --dry-run).
 */
export async function syncProject(
  project: ResolvedProject,
  opts: SyncOptions = {}
): Promise<SyncResult> {
  const globalConfig = await loadGlobalConfig();
  const { docsRepo } = globalConfig;
  const { docsSourcePath, docsTargetPath, workspaceSlug, projectSlug } = project;

  // ── 1. Ensure docs repo is available ──────────────────────────────────────
  if (!opts.dryRun) {
    await cloneRepoIfNeeded(docsRepo.gitUrl, docsRepo.localPath);
    console.log(chalk.dim("  Pulling latest docs repo changes…"));
    pullLatest(docsRepo.localPath);
  }

  // ── 2. Check source exists ─────────────────────────────────────────────────
  if (!(await fs.pathExists(docsSourcePath))) {
    throw new Error(
      `Docs source directory not found: ${docsSourcePath}\n` +
        `Create a docs/ folder in your project root and add markdown files.`
    );
  }

  // ── 3. Gather source files ─────────────────────────────────────────────────
  const sourceFiles = await glob("**/*.md", {
    cwd: docsSourcePath,
    nodir: true,
  });

  // ── 4. Gather existing target files ───────────────────────────────────────
  let targetFiles: string[] = [];
  if (await fs.pathExists(docsTargetPath)) {
    targetFiles = await glob("**/*.md", {
      cwd: docsTargetPath,
      nodir: true,
    });
  }

  const sourceSet = new Set(sourceFiles);
  const targetSet = new Set(targetFiles);

  const result: SyncResult = { added: [], updated: [], deleted: [] };

  // ── 5. Copy new / modified files ───────────────────────────────────────────
  for (const relFile of sourceFiles) {
    const src = path.join(docsSourcePath, relFile);
    const dest = path.join(docsTargetPath, relFile);

    const isNew = !targetSet.has(relFile);
    const srcStat = await fs.stat(src);
    let isDifferent = isNew;

    if (!isNew) {
      try {
        const destStat = await fs.stat(dest);
        isDifferent = srcStat.mtimeMs > destStat.mtimeMs;
        // Also do a content comparison as mtime can be unreliable across machines
        if (!isDifferent) {
          const [srcContent, destContent] = await Promise.all([
            fs.readFile(src, "utf-8"),
            fs.readFile(dest, "utf-8"),
          ]);
          isDifferent = srcContent !== destContent;
        }
      } catch {
        isDifferent = true;
      }
    }

    if (isDifferent) {
      if (opts.dryRun) {
        console.log(
          chalk.cyan(`  [dry-run] ${isNew ? "ADD" : "UPDATE"} ${relFile}`)
        );
      } else {
        await fs.ensureDir(path.dirname(dest));
        await fs.copyFile(src, dest);
      }
      if (isNew) result.added.push(relFile);
      else result.updated.push(relFile);
    }
  }

  // ── 6. Delete files removed from source ───────────────────────────────────
  for (const relFile of targetFiles) {
    if (!sourceSet.has(relFile)) {
      if (opts.dryRun) {
        console.log(chalk.red(`  [dry-run] DELETE ${relFile}`));
      } else {
        await fs.remove(path.join(docsTargetPath, relFile));
      }
      result.deleted.push(relFile);
    }
  }

  // ── 7. Commit and push ─────────────────────────────────────────────────────
  if (!opts.dryRun) {
    const changedCount =
      result.added.length + result.updated.length + result.deleted.length;
    if (changedCount > 0) {
      const commitMsg = buildCommitMessage(workspaceSlug, projectSlug, result);
      console.log(chalk.dim(`  Committing: ${commitMsg}`));
      commitAndPush(docsRepo.localPath, commitMsg);
      console.log(
        chalk.green(
          `  ✓ Synced ${changedCount} file(s) → ${workspaceSlug}/${projectSlug}`
        )
      );
    } else {
      console.log(chalk.dim(`  No changes to sync for ${workspaceSlug}/${projectSlug}`));
    }
  }

  return result;
}

function buildCommitMessage(
  workspace: string,
  project: string,
  result: SyncResult
): string {
  const scope = `${workspace}/${project}`;
  const parts: string[] = [];
  if (result.added.length) parts.push(`+${result.added.length} added`);
  if (result.updated.length) parts.push(`~${result.updated.length} updated`);
  if (result.deleted.length) parts.push(`-${result.deleted.length} deleted`);
  const summary = parts.length ? ` (${parts.join(", ")})` : "";
  return `docs(${scope}): sync docs${summary}`;
}
