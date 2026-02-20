#!/usr/bin/env node
import { Command } from "commander";
import { registerInitCommand } from "./commands/init.js";
import { registerWorkspaceCommands } from "./commands/workspace.js";
import { registerProjectCommands } from "./commands/project.js";
import { registerSyncCommand } from "./commands/sync.js";
import { registerWatchCommand } from "./commands/watch.js";
import { registerStatusCommand } from "./commands/status.js";
import { registerOpenCommand } from "./commands/open.js";

const program = new Command();

program
  .name("inkstream")
  .description(
    "Sync project docs into a central Vercel-deployed documentation site"
  )
  .version("1.0.0");

registerInitCommand(program);
registerWorkspaceCommands(program);
registerProjectCommands(program);
registerSyncCommand(program);
registerWatchCommand(program);
registerStatusCommand(program);
registerOpenCommand(program);

program.parse(process.argv);
