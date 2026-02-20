import chokidar from "chokidar";
import path from "path";
import chalk from "chalk";
import type { ResolvedProject } from "./types.js";
import { syncProject } from "./sync.js";

const DEBOUNCE_MS = 2000;

/**
 * Watch the project's docs folder for changes and automatically sync
 * on a debounced batch basis.
 *
 * Runs as a long-lived foreground process (Ctrl-C to stop).
 */
export function watchProject(project: ResolvedProject): void {
  const { docsSourcePath, workspaceSlug, projectSlug } = project;

  console.log(
    chalk.blue(
      `  Watching ${docsSourcePath}\n` +
        `  → ${workspaceSlug}/${projectSlug} (debounce: ${DEBOUNCE_MS}ms)\n` +
        `  Press Ctrl-C to stop.\n`
    )
  );

  const pendingFiles = new Set<string>();
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const watcher = chokidar.watch(path.join(docsSourcePath, "**/*.md"), {
    ignoreInitial: true,
    persistent: true,
    awaitWriteFinish: {
      stabilityThreshold: 500,
      pollInterval: 100,
    },
  });

  const scheduleSync = (filePath: string, event: string): void => {
    const rel = path.relative(docsSourcePath, filePath);
    pendingFiles.add(rel);
    console.log(chalk.dim(`  [${event}] ${rel}`));

    // Reset debounce window
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const batch = [...pendingFiles];
      pendingFiles.clear();
      debounceTimer = null;

      console.log(chalk.yellow(`  Syncing batch of ${batch.length} file(s)…`));
      try {
        const result = await syncProject(project);
        const total =
          result.added.length + result.updated.length + result.deleted.length;
        if (total > 0) {
          console.log(
            chalk.green(
              `  ✓ Synced ${total} file(s) → ${workspaceSlug}/${projectSlug}`
            )
          );
        } else {
          console.log(chalk.dim("  No net changes after batch."));
        }
      } catch (err) {
        console.error(chalk.red(`  Sync failed: ${(err as Error).message}`));
      }
    }, DEBOUNCE_MS);
  };

  watcher.on("add", (fp) => scheduleSync(fp, "add"));
  watcher.on("change", (fp) => scheduleSync(fp, "change"));
  watcher.on("unlink", (fp) => scheduleSync(fp, "unlink"));

  watcher.on("error", (err) => {
    console.error(chalk.red(`  Watcher error: ${err.message}`));
  });

  // Keep the process alive
  process.on("SIGINT", () => {
    console.log(chalk.dim("\n  Watcher stopped."));
    watcher.close();
    process.exit(0);
  });
}
