# inkstream-cli

> Sync project markdown docs into a central Vercel-deployed documentation site.

## Installation

```bash
# Global install (recommended)
npm install -g inkstream-cli

# Or local install + link (for development)
cd inkstream-cli
npm install
npm run build
npm link
```

## Quick Start

```bash
# 1. Initialize — set up global config and clone your docs repo
inkstream init

# 2. Create a workspace
inkstream workspace add personal --name "Personal"
inkstream workspace use personal

# 3. Register a project (run from inside the project)
cd ~/dev/personal/my-project
inkstream project init --workspace personal --slug my-project

# 4. Sync docs to the central repo
inkstream sync

# 5. Watch for changes and auto-sync
inkstream watch
```

## Commands

### `inkstream init`
Prompts for your docs repo git URL and local path, writes `~/.inkstream/config.json`, and clones the docs repo.

### `inkstream workspace add <slug> --name "<Name>"`
Creates a workspace config at `~/.inkstream/workspaces/<slug>.json` and registers it globally.

### `inkstream workspace use <slug>`
Sets the active workspace in global config.

### `inkstream workspace list`
Lists all registered workspaces, highlighting the active one.

### `inkstream project init --workspace <slug> --slug <projectSlug> [--docs-root <path>] [--name <n>]`
Registers the current git repository as a project under the specified workspace.  
Appends the current machine's path to `localPaths` if the project is already registered.

### `inkstream project list --workspace <slug>`
Lists all projects in a workspace.

### `inkstream sync [--dry-run]`
Copies the project's `docs/` folder into the central docs repo:
```
<docsRepo>/content/<workspace>/<project>/<category>/<slug>.md
```
Then commits and pushes. Use `--dry-run` to preview without changes.

### `inkstream watch`
Watches `<projectRoot>/docs/**/*.md` and auto-syncs on a 2-second debounce. Long-running foreground process (Ctrl-C to stop).

### `inkstream status`
Shows resolved workspace/project info and whether the docs repo is up to date.

### `inkstream open [--base <url>]`
Opens your browser at the docs URL for the current project. Defaults to `http://localhost:3000`.

## Config Files

### `~/.inkstream/config.json` — GlobalConfig
```json
{
  "docsRepo": {
    "gitUrl": "git@github.com:you/inkstream-docs.git",
    "localPath": "/Users/you/dev/inkstream-docs"
  },
  "currentWorkspace": "personal",
  "workspaces": [
    {
      "slug": "personal",
      "name": "Personal",
      "configPath": "/Users/you/.inkstream/workspaces/personal.json"
    }
  ]
}
```

### `~/.inkstream/workspaces/<slug>.json` — WorkspaceConfig
```json
{
  "slug": "personal",
  "name": "Personal",
  "projects": {
    "inkstream": {
      "name": "InkStream",
      "localPaths": ["/Users/you/dev/inkstream"],
      "docsRoot": "docs"
    }
  }
}
```

### `localPaths` — Multi-machine support
Because you may work on multiple machines, `localPaths` is an array. Running `inkstream project init` again from a different machine **appends** the new path rather than replacing it. This lets the same project be recognized regardless of where it's cloned.

## Project Docs Structure

Inside each registered project, create a `docs/` folder (or custom `docsRoot`):

```
docs/
  architecture/
    high-level.md
    data-flow.md
  workflows/
    docs-pipeline.md
  api/
    auth.md
  decisions/
    2026-02-20-viewport-centering.md
```

This maps to URL paths like:
```
/personal/inkstream/architecture/high-level
/personal/inkstream/workflows/docs-pipeline
```

## Development

```bash
npm run build    # Compile TypeScript → dist/
npm run dev      # Watch mode
npm test         # Run tests
```
