import { Command } from "commander";
import chalk from "chalk";
import { resolveCurrentProject } from "../resolver.js";
import { syncProject } from "../sync.js";

export function registerSyncCommand(program: Command): void {
  program
    .command("sync")
    .description("Sync docs from the current project into the central docs repo")
    .option("--dry-run", "Preview changes without modifying files or git state")
    .action(async (opts: { dryRun?: boolean }) => {
      try {
        console.log(chalk.bold("\n📄 InkStream Sync\n"));

        const project = await resolveCurrentProject();

        console.log(
          chalk.dim(
            `  Workspace: ${project.workspaceSlug}\n` +
              `  Project:   ${project.projectSlug}\n` +
              `  Source:    ${project.docsSourcePath}\n` +
              `  Target:    ${project.docsTargetPath}\n`
          )
        );

        if (opts.dryRun) {
          console.log(chalk.yellow("  [dry-run mode — no files will be written]\n"));
        }

        const result = await syncProject(project, { dryRun: opts.dryRun });

        if (opts.dryRun) {
          const total =
            result.added.length + result.updated.length + result.deleted.length;
          if (total === 0) {
            console.log(chalk.green("\n  ✓ Nothing to sync — docs are up to date."));
          } else {
            console.log(
              chalk.yellow(
                `\n  Would sync: +${result.added.length} added, ` +
                  `~${result.updated.length} updated, ` +
                  `-${result.deleted.length} deleted`
              )
            );
          }
        }
      } catch (err) {
        console.error(chalk.red(`\n✗ Sync failed: ${(err as Error).message}`));
        process.exit(1);
      }
    });
}
