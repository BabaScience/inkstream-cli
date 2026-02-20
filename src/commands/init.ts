import { Command } from "commander";
import { prompt } from "enquirer";
import chalk from "chalk";
import fs from "fs-extra";
import {
  globalConfigExists,
  loadGlobalConfig,
  saveGlobalConfig,
  GLOBAL_CONFIG_PATH,
  WORKSPACES_DIR,
} from "../config.js";
import { cloneRepoIfNeeded } from "../git.js";
import type { GlobalConfig } from "../types.js";

interface InitAnswers {
  gitUrl: string;
  localPath: string;
}

export function registerInitCommand(program: Command): void {
  program
    .command("init")
    .description("Initialize InkStream global config and clone the docs repo")
    .action(async () => {
      console.log(chalk.bold("\n🚀 InkStream Init\n"));

      let config: GlobalConfig;

      if (await globalConfigExists()) {
        config = await loadGlobalConfig();
        console.log(
          chalk.yellow(`Config already exists at ${GLOBAL_CONFIG_PATH}`)
        );
        console.log(
          chalk.dim(
            `  docsRepo.gitUrl:    ${config.docsRepo.gitUrl}\n` +
              `  docsRepo.localPath: ${config.docsRepo.localPath}\n`
          )
        );
      } else {
        console.log(
          chalk.dim(
            "No config found. Let's set up your central docs repo.\n"
          )
        );

        const answers = await prompt<InitAnswers>([
          {
            type: "input",
            name: "gitUrl",
            message: "Docs repo git URL (e.g. git@github.com:you/inkstream-docs.git):",
            validate: (v: string) =>
              v.trim().length > 0 ? true : "Git URL is required",
          },
          {
            type: "input",
            name: "localPath",
            message: "Local path to clone into (absolute path):",
            initial: `${process.env.HOME || "~"}/dev/inkstream-docs`,
            validate: (v: string) =>
              v.trim().length > 0 ? true : "Path is required",
          },
        ]);

        config = {
          docsRepo: {
            gitUrl: answers.gitUrl.trim(),
            localPath: answers.localPath.trim(),
          },
          workspaces: [],
        };

        await fs.ensureDir(WORKSPACES_DIR);
        await saveGlobalConfig(config);
        console.log(chalk.green(`\n✓ Config written to ${GLOBAL_CONFIG_PATH}`));
      }

      // Clone docs repo if not already present
      console.log(chalk.dim("\nChecking docs repo…"));
      try {
        await cloneRepoIfNeeded(
          config.docsRepo.gitUrl,
          config.docsRepo.localPath
        );
        console.log(chalk.green("\n✓ InkStream initialized successfully!"));
        console.log(
          chalk.dim(
            "\nNext steps:\n" +
              "  inkstream workspace add personal --name \"Personal\"\n" +
              "  inkstream workspace use personal\n" +
              "  inkstream project init --workspace personal --slug <my-project>\n" +
              "  inkstream sync\n"
          )
        );
      } catch (err) {
        console.error(
          chalk.red(`\n✗ Could not clone docs repo: ${(err as Error).message}`)
        );
        console.log(
          chalk.dim(
            "Config was saved. Fix the git URL or ensure SSH keys are set up, then run init again."
          )
        );
        process.exit(1);
      }
    });
}
