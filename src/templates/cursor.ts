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

All project documentation MUST live under the \\\`${docsRoot}/\\\` directory at the project root.

Use these subfolders and naming conventions:

  ${docsRoot}/architecture/<slug>.md   — System design, data flow, component diagrams
  ${docsRoot}/workflows/<slug>.md      — Developer workflows, CI/CD, deployment
  ${docsRoot}/api/<slug>.md            — API reference, endpoints, SDK usage
  ${docsRoot}/notes/<slug>.md          — General notes, environment variables, config
  ${docsRoot}/decisions/<date>-<slug>.md — ADRs (Architecture Decision Records)
  ${docsRoot}/features/<slug>.md       — Feature docs, user stories, specs

### File Naming Rules
  - Use kebab-case for all filenames: \\\`high-level.md\\\`, \\\`data-flow.md\\\`.
  - Decision logs MUST include dates: \\\`2026-02-20-viewport-strategy.md\\\`.
  - All doc files MUST use \\\`.md\\\` extension.
  - Do NOT use \\\`.mdx\\\`, \\\`.txt\\\`, or other extensions for documentation.


## HTML Generation (Dual Output)

For every documentation file you create or update under \\\`${docsRoot}/\\\`:
  1. Write the primary Markdown file: \\\`${docsRoot}/<category>/<slug>.md\\\`
  2. Generate a paired HTML file:     \\\`${docsRoot}-html/<category>/<slug>.html\\\`

The HTML file MUST:
  - Mirror the same relative path under \\\`${docsRoot}-html/\\\` as the .md file under \\\`${docsRoot}/\\\`.
  - Be a self-contained, styled HTML document using the InkStream theme.
  - Include proper \\\`<head>\\\` with title, viewport meta, Google Fonts links, and embedded styles.
  - Include mermaid.js via CDN if the document contains any mermaid diagrams.
  - Be fully responsive (sidebar collapses to horizontal nav on mobile ≤ 900px).
  - Use the following base template:

\\\`\\\`\\\`html
${getHtmlTemplate(workspaceSlug, projectSlug, docsRoot)}
\\\`\\\`\\\`

### HTML Template Usage Instructions
  - Replace PAGE_TITLE with the actual document title.
  - Replace CATEGORY with the category name (e.g. "Architecture", "Workflows").
  - Replace SIDEBAR_LINKS with sidebar navigation links for all docs in this project. Each link should use:
    \\\`<a href="/WORKSPACE/PROJECT/CATEGORY/SLUG">Page Title</a>\\\`
    Group them by category using \\\`<span class="section-label">Category Name</span>\\\`.
  - Replace the <!-- CONVERTED MARKDOWN CONTENT HERE --> comment with the actual HTML-converted markdown content.
  - For Mermaid diagrams, wrap them in \\\`<div class="mermaid">...</div>\\\`.
  - For code blocks, use \\\`<pre><code>...</code></pre>\\\`.
  - For tables, use standard \\\`<table>\\\` with \\\`<th>\\\` and \\\`<td>\\\`.
  - For cards/callouts, use \\\`<div class="card-grid"><div class="card">...</div></div>\\\`.
  - For lead/intro paragraphs, use \\\`<p class="lead">...</p>\\\`.
  - For badges, use \\\`<span class="tag tag-*">...</span>\\\` where * is the color variant.

When updating an existing .md file, ALWAYS update the corresponding .html file too.
When deleting an .md file, delete the matching .html file.


## Frontmatter

Every documentation Markdown file SHOULD include YAML frontmatter:

\\\`\\\`\\\`yaml
---
title: "Human-Readable Title"
description: "Brief one-line description of this page"
date: YYYY-MM-DD
tags: [architecture, data-flow]
---
\\\`\\\`\\\`


## Syncing with InkStreamCLI

After you create or significantly modify any file under \\\`${docsRoot}/\\\`,
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
  1. Ensure all relevant \\\`${docsRoot}/\\\` files are saved.
  2. Run \\\`npx inkstream-cli sync\\\` from the project root.
  3. Show me the command output and any errors.


## Auto-Sync Behavior

Whenever you finish a series of edits to files under \\\`${docsRoot}/\\\` and I have not
  explicitly said to skip syncing, you SHOULD:

  1. Confirm that the project builds without obvious TypeScript/Node errors (optionally).
  2. Run \\\`npx inkstream-cli sync\\\` from the project root.
  3. Report back that docs have been synced.

If syncing fails (e.g. git or network issues), show me the exact error and
  do NOT retry automatically without my instruction.


## Writing Standards

  - Write clear, concise technical documentation suitable for developers.
  - Use descriptive headings that work as TOC entries.
  - Include code examples where helpful, with proper language tags in fenced blocks.
  - Use Mermaid diagrams (fenced \\\`\\\`\\\`mermaid blocks) for architecture and flow diagrams.
  - Link to other docs within the project using relative paths.
  - Never hardcode absolute URLs to the docs site in .md files.


## Safety

  - NEVER write directly into the central inkstream-docs repository from this project.
  - NEVER commit the \\\`${docsRoot}-html/\\\` directory to the central docs repo.
  - Only InkStreamCLI syncs \\\`${docsRoot}/\\\` content to the docs repo.
  - Before making large structural changes to docs (moving many files, renaming), you
    should explain the proposed change and wait for my confirmation.


## Precedence

If any other rules in this repository conflict with these rules, treat these
  .cursorrules instructions as authoritative for documentation and InkStreamCLI
  behavior.

Always prefer consistency with:
  - \\\`${docsRoot}/AGENTS.md\\\` for folder-specific documentation behavior.
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

This folder (\\\`${docsRoot}/\\\`) is managed by **InkStreamCLI**.
Files written here are synced to a central documentation site at:
  content/${workspaceSlug}/${projectSlug}/

The agent MUST:
  - Only create Markdown (.md) files in this directory.
  - Follow the subfolder convention: architecture/, workflows/, api/, notes/, decisions/, features/.
  - Use kebab-case filenames.
  - Include YAML frontmatter (title, description, date, tags).
  - Generate a paired HTML file in \\\`${docsRoot}-html/\\\` for every .md file created here.

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
  \\\`${docsRoot}-html/<same-relative-path>.html\\\`

The HTML MUST use the InkStream documentation theme with:
  - Gold accent color scheme (#C9A84C primary)
  - Fixed sidebar navigation with section labels and active states
  - Responsive layout (sidebar collapses to horizontal nav on mobile ≤ 900px)
  - Mermaid.js support for diagrams
  - Styled tables, code blocks, cards, badges, and lead paragraphs
  - Google Fonts: Literata (headings), DM Sans (body), JetBrains Mono (code)

See the project .cursorrules for the full HTML template.

## Do NOT

  - Create .mdx, .txt, or .rst files.
  - Write docs outside of the recognized subfolders listed above.
  - Modify the central docs repo directly.
  - Skip the HTML generation step.
`;
}


// ─── Shared HTML Template ────────────────────────────────────────────────────

function getHtmlTemplate(
  workspaceSlug: string,
  projectSlug: string,
  _docsRoot: string
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PAGE_TITLE — ${projectSlug} | InkStream Docs</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Literata:opsz,wght@7..72,400;7..72,600;7..72,700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"><\/script>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --bg:#0b0c10;--bg-surface:#13141a;--bg-elevated:#1a1b23;--bg-sidebar:#0e0f14;
      --text:#e0e0e0;--text-muted:#8a8f98;--text-heading:#f5f5f0;
      --gold:#C9A84C;--gold-dim:#8B7355;--gold-glow:rgba(201,168,76,0.15);
      --blue:#4A90D9;--green:#50C878;--red:#E86452;--purple:#9D8CFF;
      --border:#222330;--border-active:#3a3b4a;
      --radius:6px;--sidebar-w:280px;
      --font-body:'DM Sans',sans-serif;--font-heading:'Literata',serif;--font-mono:'JetBrains Mono',monospace;
    }
    html{scroll-behavior:smooth;font-size:15px}
    body{font-family:var(--font-body);background:var(--bg);color:var(--text);line-height:1.7;display:flex;min-height:100vh}

    /* ━━━ BACK LINK ━━━ */
    .back-link{display:block;padding:12px 20px;font-size:0.75rem;color:var(--text-muted);text-decoration:none;border-bottom:1px solid var(--border);transition:color 0.2s}
    .back-link:hover{color:var(--gold)}

    /* ━━━ SIDEBAR ━━━ */
    .sidebar{position:fixed;top:0;left:0;width:var(--sidebar-w);height:100vh;background:var(--bg-sidebar);border-right:1px solid var(--border);overflow-y:auto;z-index:100;display:flex;flex-direction:column;padding:0}
    .sidebar-header{padding:24px 20px 16px;border-bottom:1px solid var(--border)}
    .sidebar-header h1{font-family:var(--font-heading);font-size:1.05rem;color:var(--gold);letter-spacing:0.02em;line-height:1.3}
    .sidebar-header p{font-size:0.72rem;color:var(--text-muted);margin-top:4px;text-transform:uppercase;letter-spacing:0.12em}
    .sidebar-nav{flex:1;padding:12px 0}
    .sidebar-nav .section-label{display:block;padding:8px 20px 4px;font-size:0.65rem;text-transform:uppercase;letter-spacing:0.14em;color:var(--gold-dim);font-weight:600}
    .sidebar-nav a{display:block;padding:6px 20px 6px 28px;color:var(--text-muted);text-decoration:none;font-size:0.85rem;transition:all 0.15s;border-left:2px solid transparent}
    .sidebar-nav a:hover{color:var(--text);background:var(--gold-glow);border-left-color:var(--gold)}
    .sidebar-nav a.active{color:var(--gold);border-left-color:var(--gold);background:var(--gold-glow)}
    .sidebar-badge{display:inline-block;background:var(--bg-elevated);color:var(--text-muted);font-size:0.65rem;padding:1px 6px;border-radius:10px;margin-left:4px;font-family:var(--font-mono)}
    .sidebar-footer{padding:16px 20px;border-top:1px solid var(--border);font-size:0.72rem;color:var(--text-muted)}
    .sidebar-footer strong{color:var(--green);font-weight:500}

    /* ━━━ MAIN CONTENT ━━━ */
    .main{margin-left:var(--sidebar-w);flex:1;max-width:900px;padding:48px 56px 120px}
    .main>section{margin-bottom:64px;padding-top:24px}
    .main h2{font-family:var(--font-heading);font-size:1.7rem;color:var(--text-heading);margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid var(--border)}
    .main h2 .pkg-badge{font-family:var(--font-mono);font-size:0.7rem;color:var(--gold);background:var(--gold-glow);padding:3px 10px;border-radius:12px;vertical-align:middle;margin-left:8px;font-weight:500}
    .main h3{font-family:var(--font-heading);font-size:1.18rem;color:var(--text-heading);margin:28px 0 10px}
    .main h4{font-size:0.95rem;color:var(--gold);margin:20px 0 8px;font-weight:600}
    .main p{margin-bottom:14px;color:var(--text)}
    .main .lead{font-size:1.05rem;color:var(--text-muted);font-style:italic;margin-bottom:20px;border-left:3px solid var(--gold-dim);padding-left:16px}

    /* ━━━ TABLES ━━━ */
    .main table{width:100%;border-collapse:collapse;margin:16px 0 24px;font-size:0.87rem}
    .main th{text-align:left;padding:8px 12px;background:var(--bg-elevated);color:var(--gold);font-weight:600;border-bottom:2px solid var(--border);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.06em}
    .main td{padding:7px 12px;border-bottom:1px solid var(--border);vertical-align:top}
    .main tr:hover td{background:var(--gold-glow)}
    .main td code{background:var(--bg-elevated);padding:1px 5px;border-radius:3px;font-family:var(--font-mono);font-size:0.82em;color:var(--blue)}

    /* ━━━ CODE BLOCKS ━━━ */
    pre{background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius);padding:16px 20px;overflow-x:auto;margin:12px 0 20px;font-family:var(--font-mono);font-size:0.82rem;line-height:1.65;color:#c9d1d9}
    pre .kw{color:var(--purple)}
    pre .str{color:var(--green)}
    pre .num{color:#e5c07b}
    pre .cm{color:#5c6370;font-style:italic}
    pre .fn{color:var(--blue)}
    pre .type{color:#e5c07b}
    code{font-family:var(--font-mono);font-size:0.85em}
    p code,li code{background:var(--bg-elevated);padding:1px 5px;border-radius:3px;color:var(--blue)}

    /* ━━━ MERMAID ━━━ */
    .mermaid{background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin:16px 0 24px;text-align:center;overflow-x:auto}

    /* ━━━ BADGES & TAGS ━━━ */
    .tag{display:inline-block;padding:2px 8px;border-radius:10px;font-size:0.72rem;font-weight:600;margin:0 3px}
    .tag-method{font-family:var(--font-mono);font-weight:700;font-size:0.7rem}
    .tag-get{background:rgba(74,144,217,0.15);color:var(--blue)}
    .tag-post{background:rgba(80,200,120,0.15);color:var(--green)}
    .tag-patch{background:rgba(229,192,123,0.15);color:#e5c07b}
    .tag-delete{background:rgba(232,100,82,0.15);color:var(--red)}
    .tag-ws{background:rgba(157,140,255,0.15);color:var(--purple)}
    .tag-tier{background:var(--bg-elevated);color:var(--text-muted);border:1px solid var(--border)}
    .test-badge{background:rgba(80,200,120,0.12);color:var(--green);padding:3px 10px;border-radius:12px;font-family:var(--font-mono);font-size:0.72rem;font-weight:500}

    /* ━━━ ENDPOINT LIST ━━━ */
    .endpoint-list{margin:16px 0 24px}
    .endpoint{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);font-size:0.88rem}
    .endpoint:hover{background:var(--gold-glow);margin:0 -8px;padding:8px 8px;border-radius:var(--radius)}
    .endpoint .method{min-width:56px;text-align:center}
    .endpoint .path{font-family:var(--font-mono);color:var(--text);font-size:0.82rem;flex:1}
    .endpoint .desc{color:var(--text-muted);font-size:0.82rem}

    /* ━━━ CARDS ━━━ */
    .card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;margin:20px 0 28px}
    .card{background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;transition:border-color 0.2s}
    .card:hover{border-color:var(--gold-dim)}
    .card h4{margin:0 0 6px;color:var(--text-heading);font-size:0.95rem}
    .card p{margin:0;font-size:0.83rem;color:var(--text-muted)}
    .card .card-stat{font-family:var(--font-mono);color:var(--gold);font-size:0.78rem;margin-top:8px}

    /* ━━━ BLOCKQUOTE ━━━ */
    blockquote{border-left:3px solid var(--gold);padding:0.75rem 1rem;background:var(--gold-glow);margin:1rem 0;border-radius:0 var(--radius) var(--radius) 0;color:var(--text-muted);font-style:italic}

    /* ━━━ LISTS ━━━ */
    ul,ol{padding-left:1.5rem;margin-bottom:1rem;color:var(--text)}
    li{margin-bottom:0.25rem}

    /* ━━━ LINKS ━━━ */
    a{color:var(--gold);text-decoration:none;transition:color 0.15s}
    a:hover{color:#e0c56a}

    /* ━━━ RESPONSIVE ━━━ */
    @media(max-width:900px){
      .sidebar{width:100%;height:auto;position:static;border-right:none;border-bottom:1px solid var(--border)}
      .main{margin-left:0;padding:24px 20px 80px}
      .sidebar-nav{display:flex;flex-wrap:wrap;gap:4px;padding:8px 16px}
      .sidebar-nav .section-label{width:100%}
      .sidebar-nav a{padding:4px 10px;border-left:none;border-radius:var(--radius)}
      .card-grid{grid-template-columns:1fr}
      .endpoint{flex-wrap:wrap;gap:6px}
      .endpoint .desc{width:100%;padding-left:66px}
    }
  </style>
</head>
<body>

<aside class="sidebar">
  <a href="/" class="back-link">← Back to Home</a>
  <div class="sidebar-header">
    <h1>${projectSlug}</h1>
    <p>${workspaceSlug} · InkStream Docs</p>
  </div>
  <nav class="sidebar-nav">
    SIDEBAR_LINKS
  </nav>
</aside>

<div class="main">
  <section>
    <h2>PAGE_TITLE</h2>
    <p class="lead">DESCRIPTION</p>

    <!-- CONVERTED MARKDOWN CONTENT HERE -->

  </section>
</div>

<script>
  mermaid.initialize({
    theme: 'dark',
    themeVariables: {
      primaryColor: '#C9A84C',
      primaryTextColor: '#f5f5f0',
      lineColor: '#3a3b4a',
      secondaryColor: '#1a1b23'
    }
  });

  // Active sidebar highlighting
  const currentPath = window.location.pathname;
  document.querySelectorAll('.sidebar-nav a').forEach(a => {
    if (a.getAttribute('href') === currentPath) a.classList.add('active');
  });
</script>
</body>
</html>`;
}
