import { Command } from "commander";
import path from "path";
import chalk from "chalk";
import fs from "fs-extra";
import { prompt } from "enquirer";
import {
  loadWorkspaceConfig,
  saveWorkspaceConfig,
} from "../config.js";
import { resolveGitRoot } from "../git.js";
import type { AgentType } from "../templates/index.js";
import {
  AGENT_CHOICES,
  generateCursorRules,
  generateCursorAgentsMd,
  generateClaudeMd,
  generateClaudeRulesDocumentation,
  generateClaudeRulesHtmlTemplate,
  generateClaudeSettingsJson,
} from "../templates/index.js";

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
    .option("--agent <type>", "AI agent to configure: cursor or claude-code")
    .action(
      async (opts: {
        workspace: string;
        slug: string;
        name?: string;
        docsRoot: string;
        agent?: string;
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
              `  Target:   content/${opts.workspace}/${opts.slug}/\n`
          )
        );

        // ── Agent Configuration ────────────────────────────────────────────
        let agentType: AgentType | undefined;

        if (opts.agent) {
          // Validate the provided agent type
          const valid = AGENT_CHOICES.map((c) => c.value);
          if (!valid.includes(opts.agent as AgentType)) {
            console.error(
              chalk.red(
                `✗ Invalid agent type "${opts.agent}". Valid options: ${valid.join(", ")}`
              )
            );
            process.exit(1);
          }
          agentType = opts.agent as AgentType;
        } else {
          // Interactive prompt: ask which agent to configure
          try {
            const answer = await prompt<{ agent: string }>({
              type: "select",
              name: "agent",
              message: "Which AI agent do you want to configure for this project?",
              choices: [
                ...AGENT_CHOICES.map((c) => ({
                  name: c.value,
                  message: `${c.name} — ${c.description}`,
                })),
                { name: "none", message: "Skip — I'll configure it later" },
              ],
            });

            if (answer.agent !== "none") {
              agentType = answer.agent as AgentType;
            }
          } catch {
            // User cancelled the prompt (Ctrl+C)
            console.log(chalk.dim("  Skipped agent configuration."));
          }
        }

        if (agentType) {
          await writeAgentFiles(
            projectRoot,
            opts.workspace,
            opts.slug,
            opts.docsRoot,
            agentType
          );
        }

        console.log(
          chalk.dim(`\nRun "inkstream sync" to push docs.`)
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

  // ── project setup-agent ────────────────────────────────────────────────────
  project
    .command("setup-agent")
    .description("Generate AI agent rule files for an existing project")
    .requiredOption("--agent <type>", "Agent type: cursor or claude-code")
    .option("--workspace <slug>", "Workspace slug (auto-detected if omitted)")
    .option("--slug <projectSlug>", "Project slug (auto-detected if omitted)")
    .option("--docs-root <path>", "Docs folder path", "docs")
    .action(
      async (opts: {
        agent: string;
        workspace?: string;
        slug?: string;
        docsRoot: string;
      }) => {
        const valid: AgentType[] = ["cursor", "claude-code"];
        if (!valid.includes(opts.agent as AgentType)) {
          console.error(
            chalk.red(
              `✗ Invalid agent type "${opts.agent}". Valid options: ${valid.join(", ")}`
            )
          );
          process.exit(1);
        }

        const projectRoot = resolveGitRoot();
        const workspaceSlug = opts.workspace ?? "default";
        const projectSlug = opts.slug ?? path.basename(projectRoot);

        await writeAgentFiles(
          projectRoot,
          workspaceSlug,
          projectSlug,
          opts.docsRoot,
          opts.agent as AgentType
        );

        console.log(
          chalk.green(`\n✓ Agent files generated for ${opts.agent}.`)
        );
      }
    );
}


// ─── Agent File Writer ─────────────────────────────────────────────────────────

async function writeAgentFiles(
  projectRoot: string,
  workspaceSlug: string,
  projectSlug: string,
  docsRoot: string,
  agent: AgentType
): Promise<void> {
  console.log(
    chalk.bold(`\n📝 Setting up ${agent} agent rules...\n`)
  );

  const filesWritten: string[] = [];

  if (agent === "cursor") {
    // ── .cursorrules ──────────────────────────────────────────────────────
    const cursorRulesPath = path.join(projectRoot, ".cursorrules");
    const cursorRulesContent = generateCursorRules(workspaceSlug, projectSlug, docsRoot);
    await fs.writeFile(cursorRulesPath, cursorRulesContent, "utf-8");
    filesWritten.push(".cursorrules");

    // ── docs/AGENTS.md ───────────────────────────────────────────────────
    const agentsMdDir = path.join(projectRoot, docsRoot);
    await fs.ensureDir(agentsMdDir);
    const agentsMdPath = path.join(agentsMdDir, "AGENTS.md");
    const agentsMdContent = generateCursorAgentsMd(workspaceSlug, projectSlug, docsRoot);
    await fs.writeFile(agentsMdPath, agentsMdContent, "utf-8");
    filesWritten.push(`${docsRoot}/AGENTS.md`);

    // ── Ensure docs-html directory exists ─────────────────────────────────
    const docsHtmlDir = path.join(projectRoot, `${docsRoot}-html`);
    await fs.ensureDir(docsHtmlDir);
    const gitkeepPath = path.join(docsHtmlDir, ".gitkeep");
    if (!(await fs.pathExists(gitkeepPath))) {
      await fs.writeFile(gitkeepPath, "", "utf-8");
      filesWritten.push(`${docsRoot}-html/.gitkeep`);
    }

  } else if (agent === "claude-code") {
    // ── CLAUDE.md ────────────────────────────────────────────────────────
    const claudeMdPath = path.join(projectRoot, "CLAUDE.md");
    const claudeMdContent = generateClaudeMd(workspaceSlug, projectSlug, docsRoot);
    await fs.writeFile(claudeMdPath, claudeMdContent, "utf-8");
    filesWritten.push("CLAUDE.md");

    // ── .claude/ directory ────────────────────────────────────────────────
    const claudeDir = path.join(projectRoot, ".claude");
    await fs.ensureDir(claudeDir);

    // ── .claude/rules/ ───────────────────────────────────────────────────
    const rulesDir = path.join(claudeDir, "rules");
    await fs.ensureDir(rulesDir);

    const docRulesPath = path.join(rulesDir, "documentation.md");
    const docRulesContent = generateClaudeRulesDocumentation(docsRoot);
    await fs.writeFile(docRulesPath, docRulesContent, "utf-8");
    filesWritten.push(".claude/rules/documentation.md");

    const htmlRulesPath = path.join(rulesDir, "html-template.md");
    const htmlRulesContent = generateClaudeRulesHtmlTemplate(
      workspaceSlug,
      projectSlug,
      docsRoot
    );
    await fs.writeFile(htmlRulesPath, htmlRulesContent, "utf-8");
    filesWritten.push(".claude/rules/html-template.md");

    // ── .claude/settings.json ────────────────────────────────────────────
    const settingsPath = path.join(claudeDir, "settings.json");
    const settingsContent = generateClaudeSettingsJson();
    await fs.writeFile(settingsPath, settingsContent, "utf-8");
    filesWritten.push(".claude/settings.json");

    // ── docs/AGENTS.md (also works as cross-agent fallback) ──────────────
    const agentsMdDir = path.join(projectRoot, docsRoot);
    await fs.ensureDir(agentsMdDir);
    const agentsMdPath = path.join(agentsMdDir, "AGENTS.md");
    if (!(await fs.pathExists(agentsMdPath))) {
      const { generateCursorAgentsMd: genAgentsMd } = await import("../templates/cursor.js");
      const agentsMdContent = genAgentsMd(workspaceSlug, projectSlug, docsRoot);
      await fs.writeFile(agentsMdPath, agentsMdContent, "utf-8");
      filesWritten.push(`${docsRoot}/AGENTS.md`);
    }

    // ── Ensure docs-html directory exists ─────────────────────────────────
    const docsHtmlDir = path.join(projectRoot, `${docsRoot}-html`);
    await fs.ensureDir(docsHtmlDir);
    const gitkeepPath = path.join(docsHtmlDir, ".gitkeep");
    if (!(await fs.pathExists(gitkeepPath))) {
      await fs.writeFile(gitkeepPath, "", "utf-8");
      filesWritten.push(`${docsRoot}-html/.gitkeep`);
    }
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  for (const file of filesWritten) {
    console.log(chalk.green(`  ✓ ${file}`));
  }

  console.log(
    chalk.dim(
      `\n  Agent: ${agent}\n` +
        `  Files created: ${filesWritten.length}\n` +
        `  Docs folder:   ${docsRoot}/\n` +
        `  HTML folder:   ${docsRoot}-html/`
    )
  );
}
