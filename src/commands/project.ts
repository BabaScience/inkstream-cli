import { Command } from "commander";
import path from "path";
import chalk from "chalk";
import {
  loadWorkspaceConfig,
  saveWorkspaceConfig,
} from "../config.js";
import { resolveGitRoot } from "../git.js";

export function registerProjectCommands(program: Command): void {
  const project = program
    .command("project")
    .description("Manage project registrations");

  // ── project init ───────────────────────────────────────────────────────────
  project
    .command("init")
    .description("Register the current project with a workspace")
    .requiredOption("--workspace <slug>", "Workspace slug to register under")
    .requiredOption("--slug <projectSlug>", "Project slug (URL-safe, e.g. my-app)")
    .option("--name <n>", "Human-readable project name (defaults to slug)")
    .option("--docs-root <path>", "Relative path to docs folder inside project", "docs")
    .action(
      async (opts: {
        workspace: string;
        slug: string;
        name?: string;
        docsRoot: string;
      }) => {
        const projectRoot = resolveGitRoot();
        const wsConfig = await loadWorkspaceConfig(opts.workspace);
        const projectName = opts.name ?? opts.slug;
        const normalizedRoot = path.normalize(projectRoot);

        if (wsConfig.projects[opts.slug]) {
          // Project exists — append localPath if missing
          const existing = wsConfig.projects[opts.slug];
          const paths = existing.localPaths.map(path.normalize);

          if (!paths.includes(normalizedRoot)) {
            existing.localPaths.push(normalizedRoot);
            console.log(
              chalk.green(
                `✓ Added local path to existing project "${opts.slug}": ${normalizedRoot}`
              )
            );
          } else {
            console.log(
              chalk.yellow(
                `Project "${opts.slug}" already registered with this local path. No changes.`
              )
            );
            return;
          }
        } else {
          // New project
          wsConfig.projects[opts.slug] = {
            name: projectName,
            localPaths: [normalizedRoot],
            docsRoot: opts.docsRoot,
          };
          console.log(
            chalk.green(
              `✓ Project "${projectName}" (${opts.slug}) registered under workspace "${opts.workspace}".`
            )
          );
        }

        await saveWorkspaceConfig(wsConfig);

        console.log(
          chalk.dim(
            `  Root:     ${normalizedRoot}\n` +
              `  Docs:     ${path.join(normalizedRoot, opts.docsRoot)}\n` +
              `  Target:   content/${opts.workspace}/${opts.slug}/\n` +
              `\nRun "inkstream sync" to push docs.`
          )
        );
      }
    );

  // ── project list ───────────────────────────────────────────────────────────
  project
    .command("list")
    .description("List registered projects for a workspace")
    .requiredOption("--workspace <slug>", "Workspace slug")
    .action(async (opts: { workspace: string }) => {
      const wsConfig = await loadWorkspaceConfig(opts.workspace);
      const projectEntries = Object.entries(wsConfig.projects);

      if (projectEntries.length === 0) {
        console.log(
          chalk.dim(`No projects registered in workspace "${opts.workspace}".`)
        );
        return;
      }

      for (const [slug, cfg] of projectEntries) {
        console.log(`  ${chalk.bold(slug)} — ${cfg.name}`);
        for (const p of cfg.localPaths) {
          console.log(`    ${chalk.dim(p)}`);
        }
      }
    });
}
