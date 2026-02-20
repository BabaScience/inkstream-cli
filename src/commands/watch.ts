import { Command } from "commander";
import chalk from "chalk";
import { resolveCurrentProject } from "../resolver.js";
import { watchProject } from "../watch.js";

export function registerWatchCommand(program: Command): void {
  program
    .command("watch")
    .description("Watch the current project's docs folder and auto-sync on changes")
    .action(async () => {
      try {
        console.log(chalk.bold("\n👁  InkStream Watch\n"));

        const project = await resolveCurrentProject();

        console.log(
          chalk.dim(
            `  Workspace: ${project.workspaceSlug}\n` +
              `  Project:   ${project.projectSlug}\n`
          )
        );

        watchProject(project);
      } catch (err) {
        console.error(chalk.red(`\n✗ Watch failed: ${(err as Error).message}`));
        process.exit(1);
      }
    });
}
