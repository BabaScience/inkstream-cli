// ─── Core domain types for InkStreamCLI ────────────────────────────────────

export interface DocsRepoConfig {
  /** Remote git URL, e.g. "git@github.com:you/inkstream-docs.git" */
  gitUrl: string;
  /** Absolute local path where the docs repo is cloned */
  localPath: string;
}

export interface GlobalConfig {
  docsRepo: DocsRepoConfig;
  /** Slug of the currently active workspace */
  currentWorkspace?: string;
  workspaces: WorkspaceRef[];
}

export interface WorkspaceRef {
  slug: string;
  name: string;
  /** Absolute path to the workspace config JSON */
  configPath: string;
}

export interface ProjectConfig {
  /** Human-readable project name */
  name: string;
  /**
   * All known absolute root paths for this project across machines.
   * Checked sequentially when resolving the project from cwd.
   */
  localPaths: string[];
  /** Relative path inside the project root where docs live (default: "docs") */
  docsRoot: string;
}

export interface WorkspaceConfig {
  slug: string;
  name: string;
  projects: Record<string, ProjectConfig>;
}

/** Resolved context once a project is matched from the current directory */
export interface ResolvedProject {
  workspaceSlug: string;
  projectSlug: string;
  projectRoot: string;
  docsSourcePath: string; // absolute path to the docs folder
  docsTargetPath: string; // absolute path inside the docs repo content/
}
