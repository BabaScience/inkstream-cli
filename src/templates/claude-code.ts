// ─── Claude Code Agent Templates ─────────────────────────────────────────────
// Generates CLAUDE.md and .claude/ directory files for Claude Code integration

export function generateClaudeMd(
  workspaceSlug: string,
  projectSlug: string,
  docsRoot: string
): string {
  return `# InkStreamCLI — Claude Code Configuration
# Project: ${projectSlug} | Workspace: ${workspaceSlug}

## Project Overview

This project uses **InkStreamCLI** (\`inkstream-cli\`) to sync documentation to a central Vercel-deployed docs site.
Documentation lives in \`${docsRoot}/\` and is synced to \`content/${workspaceSlug}/${projectSlug}/\` in the docs repo.

## Documentation Rules

All docs MUST go in \`${docsRoot}/\` with these subfolders:
- \`architecture/\` — System design, data flow, component diagrams
- \`workflows/\` — Developer workflows, CI/CD, deployment
- \`api/\` — API reference, endpoints, SDK usage
- \`notes/\` — General notes, environment variables, config
- \`decisions/\` — ADRs with date prefix (e.g. \`2026-02-20-auth-strategy.md\`)
- \`features/\` — Feature docs, user stories, specs

### File Conventions
- Kebab-case filenames: \`high-level.md\`, \`data-flow.md\`
- Always \`.md\` extension — never \`.mdx\`, \`.txt\`, or \`.rst\`
- Include YAML frontmatter: title, description, date, tags

### Dual Output (MD + HTML)
For every doc file, generate BOTH:
1. \`${docsRoot}/<category>/<slug>.md\` — Primary Markdown
2. \`${docsRoot}-html/<category>/<slug>.html\` — Styled HTML mirror

@.claude/rules/html-template.md

## Syncing

After doc changes, run: \`npx inkstream-cli sync\`
On explicit commands like "sync docs" / "publish docs" / "ship documentation":
1. Ensure files are saved
2. Run \`npx inkstream-cli sync\`
3. Report output

## Constraints
- NEVER write directly to the central inkstream-docs repo
- NEVER commit \`${docsRoot}-html/\` to the central docs repo
- Only InkStreamCLI syncs content to the docs repo
- Ask before large structural changes (moving/renaming many files)
`;
}

export function generateClaudeRulesDocumentation(
  docsRoot: string
): string {
  return `---
files: ["${docsRoot}/**"]
---

# Documentation Rules

When working on files in \`${docsRoot}/\`:

- Use the subfolder convention: architecture/, workflows/, api/, notes/, decisions/, features/
- Kebab-case filenames only
- Include YAML frontmatter (title, description, date, tags)
- Use Mermaid diagrams for architecture and flows
- Link to other docs using relative paths
- Write clear, concise technical content for developers
- After changes, propose running \`npx inkstream-cli sync\`
`;
}

export function generateClaudeRulesHtmlTemplate(
  workspaceSlug: string,
  projectSlug: string,
  docsRoot: string
): string {
  return `---
files: ["${docsRoot}/**", "${docsRoot}-html/**"]
---

# HTML Generation Template

Every \`.md\` file in \`${docsRoot}/\` MUST have a paired \`.html\` file in \`${docsRoot}-html/\` at the same relative path.

## Template

Use this HTML structure for generated files:

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

## Rules
- Replace TITLE and CATEGORY with actual values
- Convert Markdown to HTML faithfully (headings, code blocks, lists, tables, links)
- Always update the HTML when the matching .md file changes
- Delete the HTML when the matching .md file is deleted
`;
}

export function generateClaudeSettingsJson(): string {
  return JSON.stringify(
    {
      permissions: {
        allow: [
          "Bash(npx inkstream-cli sync)",
          "Bash(npx inkstream-cli status)",
          "Bash(npx inkstream-cli sync --dry-run)",
        ],
      },
    },
    null,
    2
  );
}
