import { Command } from "commander";
import { execSync } from "child_process";
import chalk from "chalk";
import { resolveCurrentProject } from "../resolver.js";

function openBrowser(url: string): void {
  const platform = process.platform;
  const cmd =
    platform === "darwin"
      ? `open "${url}"`
      : platform === "win32"
      ? `start "${url}"`
      : `xdg-open "${url}"`;
  execSync(cmd);
}

export function registerOpenCommand(program: Command): void {
  program
    .command("open")
    .description("Open the docs site for the current project in your browser")
    .option("--base <url>", "Base URL of the docs site", "http://localhost:3000")
    .action(async (opts: { base: string }) => {
      try {
        const project = await resolveCurrentProject();
        const url = `${opts.base}/${project.workspaceSlug}/${project.projectSlug}`;
        console.log(chalk.dim(`  Opening ${url}…`));
        openBrowser(url);
      } catch (err) {
        console.error(chalk.red(`\n✗ ${(err as Error).message}`));
        process.exit(1);
      }
    });
}
