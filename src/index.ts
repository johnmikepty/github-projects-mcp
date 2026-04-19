import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getProject } from "./tools/get-project.js";
import { listProjectItems } from "./tools/list-items.js";
import { moveProjectItem } from "./tools/move-item.js";
import { createIssue } from "./tools/create-issue.js";
import { addIssueToProject } from "./tools/add-to-project.js";

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error("ERROR: GITHUB_TOKEN environment variable is required");
  process.exit(1);
}

const server = new McpServer({
  name: "github-projects-mcp",
  version: "1.0.0",
});

// ── Tool: get_project ─────────────────────────────────────────
server.tool(
  "get_project",
  "Get GitHub Project v2 metadata including fields and status options",
  {
    owner:         z.string().describe("GitHub username or org"),
    projectNumber: z.number().describe("Project number (from the URL)"),
  },
  async ({ owner, projectNumber }) => {
    const project = await getProject(token, owner, projectNumber);
    return { content: [{ type: "text", text: JSON.stringify(project, null, 2) }] };
  }
);

// ── Tool: list_project_items ──────────────────────────────────
server.tool(
  "list_project_items",
  "List all items (issues/PRs) in a GitHub Project v2 board with their current status",
  {
    owner:         z.string().describe("GitHub username or org"),
    projectNumber: z.number().describe("Project number"),
  },
  async ({ owner, projectNumber }) => {
    const items = await listProjectItems(token, owner, projectNumber);
    return { content: [{ type: "text", text: JSON.stringify(items, null, 2) }] };
  }
);

// ── Tool: move_project_item ───────────────────────────────────
server.tool(
  "move_project_item",
  "Move an issue or PR to a different status column in a GitHub Project v2 Kanban board",
  {
    owner:         z.string().describe("GitHub username or org"),
    projectNumber: z.number().describe("Project number"),
    issueNumber:   z.number().describe("Issue or PR number"),
    targetStatus:  z.string().describe("Target status column name e.g. 'Todo', 'In Progress', 'Done'"),
  },
  async ({ owner, projectNumber, issueNumber, targetStatus }) => {
    const result = await moveProjectItem(token, owner, projectNumber, issueNumber, targetStatus);
    return { content: [{ type: "text", text: result.message }] };
  }
);

// ── Tool: create_issue ────────────────────────────────────────
server.tool(
  "create_issue",
  "Create a new GitHub issue in a repository",
  {
    owner: z.string().describe("GitHub username or org"),
    repo:  z.string().describe("Repository name"),
    title: z.string().describe("Issue title"),
    body:  z.string().optional().describe("Issue body (markdown supported)"),
  },
  async ({ owner, repo, title, body }) => {
    const issue = await createIssue(token, owner, repo, title, body);
    return { content: [{ type: "text", text: JSON.stringify(issue, null, 2) }] };
  }
);

// ── Tool: add_issue_to_project ────────────────────────────────
server.tool(
  "add_issue_to_project",
  "Add an existing issue (by node ID) to a GitHub Project v2 board",
  {
    owner:         z.string().describe("GitHub username or org"),
    projectNumber: z.number().describe("Project number"),
    issueNodeId:   z.string().describe("Issue node ID (starts with I_kw...)"),
  },
  async ({ owner, projectNumber, issueNodeId }) => {
    const result = await addIssueToProject(token, owner, projectNumber, issueNodeId);
    return { content: [{ type: "text", text: result.message }] };
  }
);

// ── Start server ──────────────────────────────────────────────
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("github-projects-mcp running on stdio");
