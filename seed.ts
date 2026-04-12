import * as fs from "node:fs";
import * as path from "node:path";
import { config } from "../server/src/config.js";
import { reindexAll } from "../server/src/storage/sync.js";
import { resetDb } from "../server/src/storage/metadataDb.js";
import { dropTable } from "../server/src/storage/vectorStore.js";

interface SeedFile {
  relPath: string;
  content: string;
}

const SEED_FILES: SeedFile[] = [
  {
    relPath: "workstreams/agent-force.md",
    content: `---
id: agent-force
type: workstream
title: "Agent Force POC Initiative"
status: active
created: "2026-03-15T00:00:00Z"
updated: "2026-04-10T16:00:00Z"
tags: [poc, copilot-studio, ado, aileron, ai-agents]
related: [aileron-strategy, demo-build]
---

## Overview
3-month AI proof-of-concept initiative building two Copilot Studio-based agents:
1. ADO Work Tracking Bot — conversational interface for Azure DevOps work items
2. Aileron Design Review Advisor — design system compliance checking

## Current Phase
Iteration 0 — Phase 0 sticky note clustering complete, team action items in flight.

## Team
- Pranay (lead, architecture — SPOF risk identified)
- Yeri, Josef, Samuel, Claire (contributors)
- Angel/Michael (demo coordination)
- Jessica (urgent knowledge transfer — departing)

## Next Actions
- [ ] Angel/Michael: coordinate demo
- [ ] Jessica KT: capture ADO API patterns and Copilot Studio connector config before departure
- [ ] Explore GitHub Actions integration
- [ ] Power Apps exploration

## Blockers
- Jessica departure timeline creates KT urgency
- Pranay carries too much individual ownership across both boards (identified in Phase 0 clustering)
- No team member flagged collecting real test data

## Key Decisions
- Copilot Studio over custom agent framework
- Power Automate for workflow orchestration
- Teams Adaptive Cards for UI

## Stack
Copilot Studio, Power Automate, Teams Adaptive Cards, SharePoint, Azure AD SSO, ADO REST API v7.0
`,
  },
  {
    relPath: "workstreams/home-lab.md",
    content: `---
id: home-lab
type: workstream
title: "Home Lab Infrastructure"
status: active
created: "2026-03-01T00:00:00Z"
updated: "2026-04-11T00:00:00Z"
tags: [infrastructure, gpu, local-inference, edgexpert, mac-mini]
related: [cortex-build]
---

## Overview
Hybrid AI infrastructure combining local inference with cloud API fallback for multi-agent workloads.

## Current State
- EdgeXpert (MSI, NVIDIA GB10 Grace Blackwell, 128GB unified memory, Ubuntu ARM64)
  - vLLM via Docker serving Qwen3.5-35B-A3B as "qwen3.5-coder" on port 8000
  - IP: 192.168.4.210 (LAN), 10.0.0.2 (direct ethernet)
  - systemd auto-start enabled
  - Auto-reboot fully locked down (firmware-updater disabled, fwupd masked, sleep masked, kernel.panic=0)
  - UPS: APC Smart-UPS 1500VA, pure sine wave for 24/7 uptime
- Mac Mini (Apple Silicon, user: agent1admin)
  - Node 22 via nvm, Homebrew installed
  - Direct Cat6 ethernet to EdgeXpert via USB-C adapter (Mac Mini: 10.0.0.1, EdgeXpert: 10.0.0.2)

## Constraints
- GB10 unified memory supports only one vLLM process at a time
- Need to add Ollama sidecar for embedding model (nomic-embed-text) — separate from vLLM

## History
Progressed through Ollama → vLLM (Docker), diagnosing throughput issues, resolving VRAM constraints. Landed on Qwen3-235B-A22B-AWQ initially, then Qwen3.5-35B-A3B as primary model.
`,
  },
  {
    relPath: "workstreams/aileron-strategy.md",
    content: `---
id: aileron-strategy
type: workstream
title: "Aileron Design System Strategy"
status: active
created: "2026-02-15T00:00:00Z"
updated: "2026-04-08T00:00:00Z"
tags: [design-system, aileron, angular, material, strategy, spec-driven]
related: [agent-force]
---

## Overview
Evolution of the Aileron design system toward AI-ready, spec-driven architecture across Angular/Material and React stacks.

## Key Deliverables Produced
- AI-Accelerated Design Operations Strategy (.docx) — three-tier service model, AI context engineering, guardrail architecture, design debt taxonomy, 90-day action plan
- Spec-Driven Development strategy — three-tier spec hierarchy (Global → Stack → App), monorepo spec registry, token pipeline via Style Dictionary, machine-readable contracts
- Interactive HTML reference guides on MCP architecture, SDD, and design tokens

## Current Focus
- Governance philosophy: "enable, not police" / trust-first, developer-experience-sensitive
- DS team evolution from component creators to context engineers
- Machine-readable contracts for agentic tools via .cursorrules, MCP resource servers, RAG pipelines

## Stack
Angular/Material (primary), React (secondary), Figma Variables, Style Dictionary, DTCG token format, W3C token types
`,
  },
  {
    relPath: "workstreams/demo-build.md",
    content: `---
id: demo-build
type: workstream
title: "Agentic AI Live Demo Build"
status: active
created: "2026-04-01T00:00:00Z"
updated: "2026-04-09T00:00:00Z"
tags: [demo, presentation, multi-agent, twilio, live]
related: [agent-force, home-lab]
---

## Overview
Live multi-agent demo for ~100-person UX org presentation. Audience sends SMS feedback, six AI agents process it in real-time, results stream to a dashboard.

## Architecture
- 6 agents + orchestrator: intake, classification, sentiment, clustering, insights, action items
- Twilio SMS for audience input
- Claude Haiku/Sonnet mix (Haiku for high-volume classification/sentiment, Sonnet for synthesis)
- Node.js + SSE for real-time dashboard
- In-memory/SQLite state store

## Status
Architecture designed, awaiting implementation sprint.

## Risks
- Live demo with real SMS — need fallback if Twilio fails
- Claude API rate limits with 100 concurrent users
- Need rehearsal run before the actual presentation
`,
  },
  {
    relPath: "workstreams/cortex-build.md",
    content: `---
id: cortex-build
type: workstream
title: "Cortex Personal Memory OS — Build"
status: active
created: "2026-04-11T00:00:00Z"
updated: "2026-04-11T00:00:00Z"
tags: [cortex, memory, mcp, infrastructure, meta]
related: [home-lab]
---

## Overview
Building the Cortex personal memory OS — a local-first MCP server for personal knowledge management.

## Current Phase
Spec complete. Build in progress — Claude Code executing TASKS.md end-to-end.

## Stack
Node.js 22 (TypeScript), LanceDB, SQLite + FTS5, Ollama (nomic-embed-text), MCP SDK

## Key Decisions
- adr-0003-lancedb-over-chroma
- Markdown as source of truth, LanceDB + SQLite as derived indexes
- Reflection agent generates weekly insights

## Build Plan
Two weekends. See TASKS.md.
`,
  },
  {
    relPath: "decisions/adr-0001-vllm-over-ollama.md",
    content: `---
id: adr-0001-vllm-over-ollama
type: decision
title: "Use vLLM over Ollama for primary inference on EdgeXpert"
status: active
created: "2026-03-28T00:00:00Z"
updated: "2026-03-28T00:00:00Z"
workstream: home-lab
tags: [infrastructure, inference, edgexpert]
related: [home-lab]
---

## Context
Needed a local LLM inference server for the EdgeXpert GB10. Ollama was simpler but couldn't serve large MoE models efficiently on the GB10's unified memory architecture.

## Decision
Switched to vLLM via Docker for primary inference.

## Consequences
- Single vLLM process constraint due to unified memory
- Better token throughput for large models
- Need Docker expertise for maintenance
- Ollama may still be useful as a lightweight sidecar for embedding models
`,
  },
  {
    relPath: "decisions/adr-0002-qwen35-primary.md",
    content: `---
id: adr-0002-qwen35-primary
type: decision
title: "Use Qwen3.5-35B-A3B as primary local model"
status: active
created: "2026-04-05T00:00:00Z"
updated: "2026-04-05T00:00:00Z"
workstream: home-lab
tags: [model-selection, inference]
related: [home-lab, adr-0001-vllm-over-ollama]
---

## Context
After testing Qwen3-235B-A22B-AWQ (too slow for interactive use on GB10) and several smaller models, needed a model that balanced quality with interactive-speed inference.

## Decision
Qwen3.5-35B-A3B served via vLLM as "qwen3.5-coder" on port 8000.

## Consequences
- Good balance of quality and speed for coding and analysis tasks
- Fits comfortably in GB10 memory alongside potential sidecar processes
- May need to revisit as newer models release
`,
  },
  {
    relPath: "decisions/adr-0003-lancedb-over-chroma.md",
    content: `---
id: adr-0003-lancedb-over-chroma
type: decision
title: "Use LanceDB over ChromaDB for Cortex vector storage"
status: active
created: "2026-04-11T00:00:00Z"
updated: "2026-04-11T00:00:00Z"
workstream: cortex-build
tags: [infrastructure, vector-db, storage]
related: [cortex-build, home-lab]
---

## Context
Need a vector database for Cortex that runs on Mac Mini without a separate server process. Candidates: ChromaDB, Qdrant, LanceDB, in-memory FAISS.

## Decision
Use LanceDB.

## Rationale
- Serverless: entire DB is a directory of files, no process to keep alive
- Hybrid search: built-in vector + full-text search
- Versioning: automatic data versioning in Lance format
- Backup: just rsync/rclone the directory
- Node.js SDK: native @lancedb/lancedb package

## Consequences
- Tied to Lance file format (open source, columnar, recoverable)
- Less ecosystem tooling than ChromaDB
- Need to manage index rebuilds manually if schema changes
`,
  },
  {
    relPath: "research/mcp-architecture.md",
    content: `---
id: mcp-architecture
type: research
title: "MCP Architecture Deep Dive"
status: active
created: "2026-03-20T00:00:00Z"
updated: "2026-04-08T00:00:00Z"
tags: [mcp, architecture, json-rpc, protocol]
related: [aileron-strategy, agent-force, cortex-build]
confidence: 0.85
---

## Core Concepts

MCP (Model Context Protocol) uses JSON-RPC 2.0 over two transport types:
- **stdio**: For local tools. Server runs as subprocess of the client.
- **SSE (HTTP)**: For remote/network access. Server runs as HTTP service.

## Four Capability Types
1. **Tools** — Functions the LLM can call (with side effects)
2. **Resources** — Data the LLM can read (read-only)
3. **Prompts** — Reusable prompt templates
4. **Sampling** — Server-initiated LLM calls (server asks client to run inference)

## Key Insight for Cortex
All Cortex memory operations are **tools** (not resources) because they have side effects (write, update, embed). The MCP SDK handles all protocol negotiation — we just define tools.

## Implementation Notes
- \`@modelcontextprotocol/sdk\` provides \`McpServer\` class and \`StdioServerTransport\`
- Tools registered via \`server.registerTool(name, config, handler)\`
- Handler receives parsed input, returns \`{ content: [{ type: "text", text: "..." }] }\`
- Error handling: throw or return error content block

## Open Questions
- SSE transport performance for high-frequency calls?
- Multiple simultaneous MCP client connections?
- Best practices for tool response size limits?
`,
  },
  {
    relPath: "research/copilot-studio-patterns.md",
    content: `---
id: copilot-studio-patterns
type: research
title: "Copilot Studio Connector Patterns"
status: active
created: "2026-03-25T00:00:00Z"
updated: "2026-04-09T00:00:00Z"
tags: [copilot-studio, power-automate, ado, integration]
related: [agent-force]
confidence: 0.6
---

## Overview
Notes on integrating Copilot Studio with Azure DevOps and SharePoint for the Agent Force POC.

## ADO REST API v7.0
- Use Personal Access Token for auth in POC — move to service principal for prod
- Work item query language (WIQL) for complex queries
- Batch API for bulk operations

## Power Automate Patterns
- HTTP connector for ADO calls
- SharePoint connector for document storage
- Teams adaptive cards for conversational UI

## Open Questions
- Rate limits on ADO API for high-frequency bot interactions
- Best way to handle long-running queries without hitting Power Automate timeouts
- Jessica holds deeper context on connector configuration — KT needed before she leaves
`,
  },
  {
    relPath: "people/team-roster.md",
    content: `---
id: team-roster
type: person
title: "UX Team Roster"
status: active
created: "2026-03-01T00:00:00Z"
updated: "2026-04-10T00:00:00Z"
tags: [team, people]
related: [agent-force]
---

## Direct Reports (8 designers)
Pranay leads a UX team of eight designers as principal design systems architect.

## Agent Force Contributors
- **Yeri** — contributor
- **Josef** — contributor
- **Samuel** — contributor
- **Claire** — contributor
- **Angel** — demo coordination (with Michael)
- **Michael** — demo coordination (with Angel)
- **Jessica** — departing, urgent KT needed. Holds context on ADO REST API patterns and Copilot Studio connector configuration.
`,
  },
];

function todayJournal(): SeedFile {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const date = `${y}-${m}-${d}`;
  const title = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const isoNow = now.toISOString();

  return {
    relPath: `journal/${date}.md`,
    content: `---
id: "${date}"
type: journal
title: "${title}"
status: active
created: "${isoNow}"
updated: "${isoNow}"
tags: [cortex-build]
---

### ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}
Seeded Cortex with initial workstreams, decisions, research notes, and team roster. System is now live — ready for weekly reflection and daily journaling.
`,
  };
}

async function main() {
  console.log("Seeding Cortex...");

  // Reset indexes
  resetDb();
  await dropTable();

  const files: SeedFile[] = [...SEED_FILES, todayJournal()];

  for (const f of files) {
    const absPath = path.join(config.memoriesDir, f.relPath);
    const dir = path.dirname(absPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(absPath, f.content, "utf8");
    console.log(`  wrote ${f.relPath}`);
  }

  console.log("Indexing into LanceDB + SQLite...");
  const result = await reindexAll();
  console.log(`Indexed: ${result.indexed}`);
  if (result.errors.length > 0) {
    console.error("Errors:");
    for (const e of result.errors) console.error(`  ${e.file}: ${e.error}`);
    process.exit(1);
  }
  console.log("Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
