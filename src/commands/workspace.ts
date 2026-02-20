import { Command } from "commander";
import chalk from "chalk";
import {
  loadGlobalConfig,
  saveGlobalConfig,
  saveWorkspaceConfig,
  loadWorkspaceConfig,
  workspaceConfigPath,
} from "../config.js";
import type { WorkspaceConfig } from "../types.js";

export function registerWorkspaceCommands(program: Command): void {
  const workspace = program
    .command("workspace")
    .description("Manage workspaces");

  // ── workspace add ──────────────────────────────────────────────────────────
  workspace
    .command("add <slug>")
    .description('Add a new workspace (e.g. inkstream workspace add personal --name "Personal")')
    .requiredOption("--name <name>", "Human-readable workspace name")
    .action(async (slug: string, opts: { name: string }) => {
      const globalConfig = await loadGlobalConfig();

      // Check for duplicate
      const existing = globalConfig.workspaces.find((w) => w.slug === slug);
      if (existing) {
        console.log(
          chalk.yellow(`Workspace "${slug}" already exists. No changes made.`)
        );
        return;
      }

      const wsConfig: WorkspaceConfig = {
        slug,
        name: opts.name,
        projects: {},
      };

      await saveWorkspaceConfig(wsConfig);

      globalConfig.workspaces.push({
        slug,
        name: opts.name,
        configPath: workspaceConfigPath(slug),
      });

      await saveGlobalConfig(globalConfig);

      console.log(
        chalk.green(`✓ Workspace "${opts.name}" (${slug}) created.`)
      );
      console.log(
        chalk.dim(
          `  Config: ${workspaceConfigPath(slug)}\n` +
            `\nTo activate: inkstream workspace use ${slug}`
        )
      );
    });

  // ── workspace use ──────────────────────────────────────────────────────────
  workspace
    .command("use <slug>")
    .description("Set the active workspace")
    .action(async (slug: string) => {
      const globalConfig = await loadGlobalConfig();

      const exists = globalConfig.workspaces.some((w) => w.slug === slug);
      if (!exists) {
        console.error(
          chalk.red(
            `✗ Workspace "${slug}" not found.\n` +
              `Run "inkstream workspace add ${slug} --name <Name>" first.`
          )
        );
        process.exit(1);
      }

      globalConfig.currentWorkspace = slug;
      await saveGlobalConfig(globalConfig);
      console.log(chalk.green(`✓ Active workspace set to "${slug}".`));
    });

  // ── workspace list ─────────────────────────────────────────────────────────
  workspace
    .command("list")
    .description("List all registered workspaces")
    .action(async () => {
      const globalConfig = await loadGlobalConfig();

      if (globalConfig.workspaces.length === 0) {
        console.log(chalk.dim("No workspaces registered yet."));
        return;
      }

      for (const ws of globalConfig.workspaces) {
        const active = ws.slug === globalConfig.currentWorkspace ? " ← active" : "";
        console.log(`  ${chalk.bold(ws.slug)} — ${ws.name}${chalk.green(active)}`);
      }
    });
}
