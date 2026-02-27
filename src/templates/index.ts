// ─── Agent Template Registry ─────────────────────────────────────────────────
// Central export for all agent templates

export {
  generateCursorRules,
  generateCursorAgentsMd,
} from "./cursor.js";

export {
  generateClaudeMd,
  generateClaudeRulesDocumentation,
  generateClaudeRulesHtmlTemplate,
  generateClaudeSettingsJson,
} from "./claude-code.js";

export type AgentType = "cursor" | "claude-code";

export const AGENT_CHOICES: { name: string; value: AgentType; description: string }[] = [
  {
    name: "Cursor",
    value: "cursor",
    description: "Generates .cursorrules and docs/AGENTS.md",
  },
  {
    name: "Claude Code",
    value: "claude-code",
    description: "Generates CLAUDE.md and .claude/ directory with rules",
  },
];
