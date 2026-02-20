import path from "path";
import type { GlobalConfig, WorkspaceConfig, ResolvedProject } from "./types.js";
import { loadAllWorkspaceConfigs, loadGlobalConfig } from "./config.js";
import { resolveGitRoot } from "./git.js";

/**
 * Attempt to resolve the current working directory to a registered project.
 *
 * Strategy:
 *   1. Determine the git root of cwd.
 *   2. Iterate over all workspaces and their projects.
 *   3. Match the git root against each project's `localPaths`.
 *   4. Return exactly one match or throw a descriptive error.
 */
export async function resolveCurrentProject(
  cwd: string = process.cwd()
): Promise<ResolvedProject> {
  const gitRoot = resolveGitRoot(cwd);
  const globalConfig = await loadGlobalConfig();
  const workspaceConfigs = await loadAllWorkspaceConfigs(globalConfig);

  type Match = {
    workspaceSlug: string;
    projectSlug: string;
    config: WorkspaceConfig;
  };

  const matches: Match[] = [];

  for (const wsConfig of workspaceConfigs) {
    for (const [projectSlug, projectConfig] of Object.entries(wsConfig.projects)) {
      const normalizedPaths = projectConfig.localPaths.map((p) =>
        path.normalize(p)
      );
      if (normalizedPaths.includes(path.normalize(gitRoot))) {
        matches.push({
          workspaceSlug: wsConfig.slug,
          projectSlug,
          config: wsConfig,
        });
      }
    }
  }

  if (matches.length === 0) {
    throw new Error(
      `No registered project found for git root: ${gitRoot}\n\n` +
        `Tip: Run "inkstream project init --workspace <slug> --slug <project>" ` +
        `from inside this project to register it.`
    );
  }

  if (matches.length > 1) {
    const listing = matches
      .map((m) => `  • ${m.workspaceSlug}/${m.projectSlug}`)
      .join("\n");
    throw new Error(
      `Multiple projects match git root ${gitRoot}:\n${listing}\n\n` +
        `Resolve conflicting localPaths in your workspace configs.`
    );
  }

  const { workspaceSlug, projectSlug, config } = matches[0];
  const projectConfig = config.projects[projectSlug];
  const docsSourcePath = path.join(gitRoot, projectConfig.docsRoot);
  const docsTargetPath = path.join(
    globalConfig.docsRepo.localPath,
    "content",
    workspaceSlug,
    projectSlug
  );

  return {
    workspaceSlug,
    projectSlug,
    projectRoot: gitRoot,
    docsSourcePath,
    docsTargetPath,
  };
}

/**
 * Pure function: map a docs source path and resolved project to a docs repo
 * content path. Useful for testing without filesystem access.
 */
export function mapDocsPath(
  docsRepoLocalPath: string,
  workspaceSlug: string,
  projectSlug: string
): string {
  return path.join(docsRepoLocalPath, "content", workspaceSlug, projectSlug);
}
