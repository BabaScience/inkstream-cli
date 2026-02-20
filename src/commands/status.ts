import { Command } from "commander";
import chalk from "chalk";
import { resolveCurrentProject } from "../resolver.js";
import { loadGlobalConfig } from "../config.js";
import { commitsBehind } from "../git.js";

export function registerStatusCommand(program: Command): void {
  program
    .command("status")
    .description("Show sync status for the current project")
    .action(async () => {
      try {
        const project = await resolveCurrentProject();
        const globalConfig = await loadGlobalConfig();

        console.log(chalk.bold("\n📊 InkStream Status\n"));
        console.log(`  Workspace : ${chalk.cyan(project.workspaceSlug)}`);
        console.log(`  Project   : ${chalk.cyan(project.projectSlug)}`);
        console.log(`  Source    : ${chalk.dim(project.docsSourcePath)}`);
        console.log(`  Target    : ${chalk.dim(project.docsTargetPath)}`);
        console.log(`  Docs URL  : /${project.workspaceSlug}/${project.projectSlug}/<category>/<slug>`);

        // Check if docs repo is behind remote
        try {
          const behind = commitsBehind(globalConfig.docsRepo.localPath);
          if (behind > 0) {
            console.log(
              chalk.yellow(
                `\n  ⚠  Docs repo is ${behind} commit(s) behind remote. Run "inkstream sync" to update.`
              )
            );
          } else {
            console.log(chalk.green("\n  ✓ Docs repo is up to date."));
          }
        } catch {
          console.log(chalk.dim("\n  (Could not determine docs repo status)"));
        }
      } catch (err) {
        console.error(chalk.red(`\n✗ ${(err as Error).message}`));
        process.exit(1);
      }
    });
}
