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

## Design System

The HTML must use the InkStream documentation theme:
- **Color palette**: Gold accent (#C9A84C), dark background (#0b0c10), elevated surfaces (#1a1b23)
- **Typography**: Literata for headings, DM Sans for body, JetBrains Mono for code
- **Layout**: Fixed sidebar navigation (280px) with main content area (max 900px)
- **Responsive**: Sidebar collapses to horizontal wrapped nav on screens ≤ 900px
- **Mermaid**: Include mermaid.js CDN and initialize with dark theme + gold primary color

## Template

Use this HTML structure for generated files:

\\\`\\\`\\\`html
<!DOCTYPE html>
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
</html>
\\\`\\\`\\\`

## Template Placeholders
- **PAGE_TITLE**: Replace with actual document title
- **DESCRIPTION**: Replace with one-line description from frontmatter
- **CATEGORY**: Replace with the category name (Architecture, Workflows, etc.)
- **SIDEBAR_LINKS**: Replace with navigation links grouped by category using \\\`<span class="section-label">Category</span>\\\` and \\\`<a href="...">Page Title</a>\\\`

## Supported HTML Components
When converting Markdown to HTML, use these patterns:
- **Lead paragraph**: \\\`<p class="lead">...</p>\\\` for intro text
- **Mermaid diagrams**: \\\`<div class="mermaid">...</div>\\\`
- **Cards**: \\\`<div class="card-grid"><div class="card"><h4>Title</h4><p>Description</p></div></div>\\\`
- **Badges**: \\\`<span class="tag tag-get">GET</span>\\\`, \\\`<span class="tag tag-post">POST</span>\\\`, etc.
- **Test badges**: \\\`<span class="test-badge">✓ N tests passing</span>\\\`
- **Package badges**: \\\`<span class="pkg-badge">label</span>\\\` inside h2 elements
- **Endpoint lists**: \\\`<div class="endpoint-list"><div class="endpoint">...</div></div>\\\`

## Rules
- Replace all placeholders with actual values from the Markdown content
- Convert Markdown to HTML faithfully (headings, code blocks, lists, tables, links)
- Always update the HTML when the matching .md file changes
- Delete the HTML when the matching .md file is deleted
- Mermaid diagrams in fenced \\\`\\\`\\\`mermaid blocks should become \\\`<div class="mermaid">\\\` blocks
- Use semantic HTML5 elements where appropriate
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
