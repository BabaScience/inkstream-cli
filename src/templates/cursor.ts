// ─── Cursor Agent Templates ──────────────────────────────────────────────────
// Generates .cursorrules and docs/AGENTS.md for Cursor AI integration

export function generateCursorRules(
  workspaceSlug: string,
  projectSlug: string,
  docsRoot: string
): string {
  return `# InkStreamCLI — Cursor Rules
# Project: ${projectSlug} | Workspace: ${workspaceSlug}
# ─────────────────────────────────────────────────────────────────────────────

You are working in a codebase that uses InkStreamCLI (inkstream-cli) to
sync documentation to a central docs site deployed from a separate repo.

Your primary responsibilities here are:
  1. Write and maintain high-quality documentation in ${docsRoot}/.
  2. Generate paired .md and .html files for every documentation page.
  3. Optionally trigger inkstream to sync docs after meaningful changes.
  4. NEVER touch the central docs repo directly from this project.


## Documentation Structure

All project documentation MUST live under the \`${docsRoot}/\` directory at the project root.

Use these subfolders and naming conventions:

  ${docsRoot}/architecture/<slug>.md   — System design, data flow, component diagrams
  ${docsRoot}/workflows/<slug>.md      — Developer workflows, CI/CD, deployment
  ${docsRoot}/api/<slug>.md            — API reference, endpoints, SDK usage
  ${docsRoot}/notes/<slug>.md          — General notes, environment variables, config
  ${docsRoot}/decisions/<date>-<slug>.md — ADRs (Architecture Decision Records)
  ${docsRoot}/features/<slug>.md       — Feature docs, user stories, specs

### File Naming Rules
  - Use kebab-case for all filenames: \`high-level.md\`, \`data-flow.md\`.
  - Decision logs MUST include dates: \`2026-02-20-viewport-strategy.md\`.
  - All doc files MUST use \`.md\` extension.
  - Do NOT use \`.mdx\`, \`.txt\`, or other extensions for documentation.


## HTML Generation (Dual Output)

For every documentation file you create or update under \`${docsRoot}/\`:
  1. Write the primary Markdown file: \`${docsRoot}/<category>/<slug>.md\`
  2. Generate a paired HTML file:     \`${docsRoot}-html/<category>/<slug>.html\`

The HTML file MUST:
  - Mirror the same relative path under \`${docsRoot}-html/\` as the .md file under \`${docsRoot}/\`.
  - Be a self-contained, styled HTML document using the InkStream theme.
  - Include proper \`<head>\` with title, viewport meta, and embedded styles.
  - Use the following base template:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TITLE — ${projectSlug} | InkStream Docs</title>
  <style>
    :root {
      --bg: #0b0d14; --surface: #10131c; --card: #151924;
      --cyan: #00e5ff; --magenta: #ff2d7b; --amber: #ffab00;
      --text-1: #e8eaed; --text-2: #9aa0a6; --text-3: #5f6368;
      --border: rgba(255,255,255,0.06); --mono: "JetBrains Mono", monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: "DM Sans", system-ui, sans-serif;
      background: var(--bg); color: var(--text-1);
      line-height: 1.7; padding: 2rem; max-width: 900px; margin: 0 auto;
    }
    h1 { font-size: 2rem; margin-bottom: 1rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
    h2 { font-size: 1.5rem; margin-top: 2rem; margin-bottom: 0.75rem; color: var(--cyan); }
    h3 { font-size: 1.2rem; margin-top: 1.5rem; margin-bottom: 0.5rem; }
    p { margin-bottom: 1rem; color: var(--text-2); }
    a { color: var(--cyan); }
    code {
      font-family: var(--mono); font-size: 0.85em;
      background: var(--surface); padding: 2px 6px; border-radius: 4px; color: var(--cyan);
    }
    pre {
      background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
      padding: 1rem; overflow-x: auto; margin: 1rem 0;
    }
    pre code { background: transparent; padding: 0; color: var(--text-2); }
    ul, ol { padding-left: 1.5rem; margin-bottom: 1rem; color: var(--text-2); }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th { background: var(--surface); padding: 0.5rem; text-align: left; font-size: 0.8rem; text-transform: uppercase; color: var(--text-3); }
    td { padding: 0.5rem; border-bottom: 1px solid var(--border); color: var(--text-2); }
    blockquote { border-left: 3px solid var(--cyan); padding: 0.75rem 1rem; background: rgba(0,229,255,0.05); margin: 1rem 0; border-radius: 0 8px 8px 0; }
    .breadcrumb { font-size: 0.8rem; color: var(--text-3); margin-bottom: 1.5rem; }
    .breadcrumb a { color: var(--text-2); }
    .meta { font-size: 0.75rem; color: var(--text-3); margin-bottom: 2rem; }
  </style>
</head>
<body>
  <nav class="breadcrumb">
    <a href="/">Home</a> › <a href="/${workspaceSlug}">${workspaceSlug}</a> › <a href="/${workspaceSlug}/${projectSlug}">${projectSlug}</a> › CATEGORY › TITLE
  </nav>
  <article>
    <!-- CONVERTED MARKDOWN CONTENT HERE -->
  </article>
</body>
</html>
\`\`\`

When updating an existing .md file, ALWAYS update the corresponding .html file too.
When deleting an .md file, delete the matching .html file.


## Frontmatter

Every documentation Markdown file SHOULD include YAML frontmatter:

\`\`\`yaml
---
title: "Human-Readable Title"
description: "Brief one-line description of this page"
date: YYYY-MM-DD
tags: [architecture, data-flow]
---
\`\`\`


## Syncing with InkStreamCLI

After you create or significantly modify any file under \`${docsRoot}/\`,
  you SHOULD propose running the following command from the project root:

  If inkstream-cli is installed globally:
    inkstream sync

  Otherwise (preferred, always works if project has it as a devDependency):
    npx inkstream-cli sync

When I explicitly say things like:
  "Sync docs"
  "Publish docs"
  "Ship documentation"
you MUST:
  1. Ensure all relevant \`${docsRoot}/\` files are saved.
  2. Run \`npx inkstream-cli sync\` from the project root.
  3. Show me the command output and any errors.


## Auto-Sync Behavior

Whenever you finish a series of edits to files under \`${docsRoot}/\` and I have not
  explicitly said to skip syncing, you SHOULD:

  1. Confirm that the project builds without obvious TypeScript/Node errors (optionally).
  2. Run \`npx inkstream-cli sync\` from the project root.
  3. Report back that docs have been synced.

If syncing fails (e.g. git or network issues), show me the exact error and
  do NOT retry automatically without my instruction.


## Writing Standards

  - Write clear, concise technical documentation suitable for developers.
  - Use descriptive headings that work as TOC entries.
  - Include code examples where helpful, with proper language tags in fenced blocks.
  - Use Mermaid diagrams (fenced \`\`\`mermaid blocks) for architecture and flow diagrams.
  - Link to other docs within the project using relative paths.
  - Never hardcode absolute URLs to the docs site in .md files.


## Safety

  - NEVER write directly into the central inkstream-docs repository from this project.
  - NEVER commit the \`${docsRoot}-html/\` directory to the central docs repo.
  - Only InkStreamCLI syncs \`${docsRoot}/\` content to the docs repo.
  - Before making large structural changes to docs (moving many files, renaming), you
    should explain the proposed change and wait for my confirmation.


## Precedence

If any other rules in this repository conflict with these rules, treat these
  .cursorrules instructions as authoritative for documentation and InkStreamCLI
  behavior.

Always prefer consistency with:
  - \`${docsRoot}/AGENTS.md\` for folder-specific documentation behavior.
  - These .cursorrules for project-wide conventions and sync behavior.
`;
}


export function generateCursorAgentsMd(
  workspaceSlug: string,
  projectSlug: string,
  docsRoot: string
): string {
  return `# InkStream Documentation Agent
# Workspace: ${workspaceSlug} | Project: ${projectSlug}
# ─────────────────────────────────────────────────────────────────────────────
#
# This file provides folder-specific guidance for AI agents working inside
# the ${docsRoot}/ directory. It complements the project-level .cursorrules.

## Context

This folder (\`${docsRoot}/\`) is managed by **InkStreamCLI**.
Files written here are synced to a central documentation site at:
  content/${workspaceSlug}/${projectSlug}/

The agent MUST:
  - Only create Markdown (.md) files in this directory.
  - Follow the subfolder convention: architecture/, workflows/, api/, notes/, decisions/, features/.
  - Use kebab-case filenames.
  - Include YAML frontmatter (title, description, date, tags).
  - Generate a paired HTML file in \`${docsRoot}-html/\` for every .md file created here.

## Subfolder Reference

| Folder         | Purpose                                    | Example                          |
|---------------|--------------------------------------------|----------------------------------|
| architecture/ | System design, component diagrams          | high-level.md, data-flow.md     |
| workflows/    | Dev workflows, CI/CD, deployment           | local-development.md            |
| api/          | API reference, endpoints, SDK              | auth-endpoints.md               |
| notes/        | General notes, config, env vars            | env-variables-reference.md      |
| decisions/    | ADRs with date prefix                      | 2026-02-20-auth-strategy.md     |
| features/     | Feature documentation and specs            | user-dashboard.md               |

## HTML Output

Every .md file you create here MUST have a matching .html file at:
  \`${docsRoot}-html/<same-relative-path>.html\`

The HTML should be a self-contained document styled with the InkStream dark theme.
See the project .cursorrules for the HTML template.

## Do NOT

  - Create .mdx, .txt, or .rst files.
  - Write docs outside of the recognized subfolders listed above.
  - Modify the central docs repo directly.
  - Skip the HTML generation step.
`;
}
