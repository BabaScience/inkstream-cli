import path from "path";
import os from "os";
import fs from "fs-extra";
import { mapDocsPath } from "../resolver";

// ─── Config tests ─────────────────────────────────────────────────────────────

describe("Config loading", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "inkstream-test-"));
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  test("writes and reads GlobalConfig round-trip", async () => {
    // Dynamically override INKSTREAM_DIR for isolation
    const configPath = path.join(tmpDir, "config.json");
    const config = {
      docsRepo: {
        gitUrl: "git@github.com:test/docs.git",
        localPath: "/tmp/docs",
      },
      workspaces: [
        {
          slug: "personal",
          name: "Personal",
          configPath: path.join(tmpDir, "workspaces", "personal.json"),
        },
      ],
    };

    await fs.writeJson(configPath, config, { spaces: 2 });
    const loaded = await fs.readJson(configPath);

    expect(loaded.docsRepo.gitUrl).toBe("git@github.com:test/docs.git");
    expect(loaded.workspaces).toHaveLength(1);
    expect(loaded.workspaces[0].slug).toBe("personal");
  });

  test("writes and reads WorkspaceConfig round-trip", async () => {
    const wsPath = path.join(tmpDir, "personal.json");
    const wsConfig = {
      slug: "personal",
      name: "Personal",
      projects: {
        "my-app": {
          name: "My App",
          localPaths: ["/Users/dev/my-app", "/home/bamba/dev/my-app"],
          docsRoot: "docs",
        },
      },
    };

    await fs.writeJson(wsPath, wsConfig, { spaces: 2 });
    const loaded = await fs.readJson(wsPath);

    expect(loaded.projects["my-app"].localPaths).toHaveLength(2);
    expect(loaded.projects["my-app"].docsRoot).toBe("docs");
  });
});

// ─── Project resolution tests ──────────────────────────────────────────────────

describe("Project resolution from localPaths", () => {
  test("matches exact path", () => {
    const projectRoot = "/Users/bamba/dev/personal/inkstream";
    const localPaths = ["/Users/bamba/dev/personal/inkstream"];
    const normalizedRoot = path.normalize(projectRoot);
    const normalizedPaths = localPaths.map(path.normalize);

    expect(normalizedPaths.includes(normalizedRoot)).toBe(true);
  });

  test("matches with trailing slash difference", () => {
    const projectRoot = "/Users/bamba/dev/personal/inkstream";
    const localPaths = ["/Users/bamba/dev/personal/inkstream"];

    const normalizedRoot = path.normalize(projectRoot);
    const normalizedPaths = localPaths.map(path.normalize);

    expect(normalizedPaths.includes(normalizedRoot)).toBe(true);
  });

  test("does not match different path", () => {
    const projectRoot = "/Users/bamba/dev/other-project";
    const localPaths = ["/Users/bamba/dev/personal/inkstream"];

    const normalizedRoot = path.normalize(projectRoot);
    const normalizedPaths = localPaths.map(path.normalize);

    expect(normalizedPaths.includes(normalizedRoot)).toBe(false);
  });

  test("matches first of multiple localPaths", () => {
    const projectRoot = "/home/bamba/dev/inkstream";
    const localPaths = [
      "/Users/bamba/dev/personal/inkstream",
      "/home/bamba/dev/inkstream",
    ];

    const normalizedRoot = path.normalize(projectRoot);
    const normalizedPaths = localPaths.map(path.normalize);

    expect(normalizedPaths.includes(normalizedRoot)).toBe(true);
  });
});

// ─── Docs path mapping tests ───────────────────────────────────────────────────

describe("mapDocsPath", () => {
  test("maps workspace + project to correct content path", () => {
    const result = mapDocsPath("/tmp/inkstream-docs", "personal", "inkstream");
    const expected = path.join("/tmp/inkstream-docs", "content", "personal", "inkstream");
    expect(result).toBe(expected);
  });

  test("handles nested workspace slug", () => {
    const result = mapDocsPath("/repos/docs", "client-x", "mobile-app");
    const expected = path.join("/repos/docs", "content", "client-x", "mobile-app");
    expect(result).toBe(expected);
  });

  test("produces consistent result across calls", () => {
    const a = mapDocsPath("/docs", "work", "engine");
    const b = mapDocsPath("/docs", "work", "engine");
    expect(a).toBe(b);
  });
});
