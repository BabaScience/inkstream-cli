import path from "path";
import os from "os";
import fs from "fs-extra";
import type { GlobalConfig, WorkspaceConfig } from "./types.js";

// ─── Path resolution ─────────────────────────────────────────────────────────

export const INKSTREAM_DIR = path.join(os.homedir(), ".inkstream");
export const GLOBAL_CONFIG_PATH = path.join(INKSTREAM_DIR, "config.json");
export const WORKSPACES_DIR = path.join(INKSTREAM_DIR, "workspaces");

export function workspaceConfigPath(slug: string): string {
  return path.join(WORKSPACES_DIR, `${slug}.json`);
}

// ─── Global Config ───────────────────────────────────────────────────────────

export async function globalConfigExists(): Promise<boolean> {
  return fs.pathExists(GLOBAL_CONFIG_PATH);
}

export async function loadGlobalConfig(): Promise<GlobalConfig> {
  if (!(await globalConfigExists())) {
    throw new Error(
      `Global config not found at ${GLOBAL_CONFIG_PATH}.\n` +
        `Run "inkstream init" to set it up.`
    );
  }
  try {
    const raw = await fs.readJson(GLOBAL_CONFIG_PATH);
    return raw as GlobalConfig;
  } catch (err) {
    throw new Error(
      `Failed to parse global config at ${GLOBAL_CONFIG_PATH}: ${(err as Error).message}`
    );
  }
}

export async function saveGlobalConfig(config: GlobalConfig): Promise<void> {
  await fs.ensureDir(INKSTREAM_DIR);
  await fs.writeJson(GLOBAL_CONFIG_PATH, config, { spaces: 2 });
}

// ─── Workspace Config ────────────────────────────────────────────────────────

export async function loadWorkspaceConfig(slug: string): Promise<WorkspaceConfig> {
  const configPath = workspaceConfigPath(slug);
  if (!(await fs.pathExists(configPath))) {
    throw new Error(
      `Workspace config for "${slug}" not found at ${configPath}.\n` +
        `Run "inkstream workspace add ${slug}" to create it.`
    );
  }
  try {
    const raw = await fs.readJson(configPath);
    return raw as WorkspaceConfig;
  } catch (err) {
    throw new Error(
      `Failed to parse workspace config for "${slug}": ${(err as Error).message}`
    );
  }
}

export async function saveWorkspaceConfig(config: WorkspaceConfig): Promise<void> {
  await fs.ensureDir(WORKSPACES_DIR);
  const configPath = workspaceConfigPath(config.slug);
  await fs.writeJson(configPath, config, { spaces: 2 });
}

/** Load all workspace configs referenced in global config */
export async function loadAllWorkspaceConfigs(
  global: GlobalConfig
): Promise<WorkspaceConfig[]> {
  const configs: WorkspaceConfig[] = [];
  for (const ref of global.workspaces) {
    const cfg = await loadWorkspaceConfig(ref.slug);
    configs.push(cfg);
  }
  return configs;
}
