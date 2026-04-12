/**
 * Index imported Claude.ai conversations into LanceDB for semantic search.
 *
 * Usage: cd server && npx tsx ../scripts/index-conversations.ts [path-to-conversations.json]
 *
 * Default path: ~/cortex/import-claude/conversations.json
 */
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import {
  addConversationRecords,
  dropConversationTable,
  type ConversationRecord,
} from "../server/src/storage/conversationStore.js";
import { generateEmbeddings } from "../server/src/embeddings/ollama.js";
import { chunkText } from "../server/src/storage/vectorStore.js";

interface RawMessage {
  sender: string;
  text?: string;
  content?: Array<{ type?: string; text?: string }> | null;
}

interface RawConversation {
  uuid: string;
  name?: string;
  created_at?: string;
  chat_messages?: RawMessage[];
}

function extractText(msg: RawMessage): string {
  if (msg.text) return msg.text;
  if (Array.isArray(msg.content)) {
    return msg.content
      .filter((c) => c && (c.type === "text" || c.text))
      .map((c) => c.text ?? "")
      .join("");
  }
  return "";
}

function flattenConversation(conv: RawConversation): string {
  const msgs = conv.chat_messages ?? [];
  return msgs
    .map((m) => {
      const sender = m.sender === "human" ? "User" : "Assistant";
      const text = extractText(m).trim();
      return text ? `[${sender}]\n${text}` : "";
    })
    .filter(Boolean)
    .join("\n\n---\n\n");
}

const BATCH_SIZE = 32;

async function embedBatch(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const vectors = await generateEmbeddings(batch);
    results.push(...vectors);
  }
  return results;
}

async function main() {
  const inputPath =
    process.argv[2] ??
    path.join(os.homedir(), "cortex", "import-claude", "conversations.json");

  if (!fs.existsSync(inputPath)) {
    console.error(`File not found: ${inputPath}`);
    process.exit(1);
  }

  console.log(`Loading conversations from ${inputPath}...`);
  const raw: RawConversation[] = JSON.parse(
    fs.readFileSync(inputPath, "utf-8")
  );
  console.log(`Found ${raw.length} conversations.`);

  console.log("Dropping existing conversations table...");
  await dropConversationTable();

  let totalChunks = 0;
  let totalConvs = 0;
  let skipped = 0;

  for (let ci = 0; ci < raw.length; ci++) {
    const conv = raw[ci];
    const fullText = flattenConversation(conv);
    if (!fullText.trim()) {
      skipped++;
      continue;
    }

    const title =
      (conv.name ?? "").trim() ||
      fullText.slice(0, 60).replace(/\n/g, " ").trim() ||
      "(untitled)";
    const date = (conv.created_at ?? "").slice(0, 10) || "unknown";
    const convId = conv.uuid;

    const chunks = chunkText(fullText, 500, 50);
    if (chunks.length === 0) {
      skipped++;
      continue;
    }

    const vectors = await embedBatch(chunks);

    const records: ConversationRecord[] = chunks.map((text, i) => ({
      id: `${convId}#${i}`,
      conversation_id: convId,
      chunk_index: i,
      text,
      vector: vectors[i],
      title,
      date,
      platform: "claude.ai",
    }));

    await addConversationRecords(records);
    totalChunks += records.length;
    totalConvs++;

    if ((ci + 1) % 10 === 0 || ci === raw.length - 1) {
      console.log(
        `  [${ci + 1}/${raw.length}] ${totalConvs} convs → ${totalChunks} chunks indexed`
      );
    }
  }

  console.log(
    `\nDone. ${totalConvs} conversations indexed (${totalChunks} chunks). ${skipped} skipped (empty).`
  );
}

main().catch((err) => {
  console.error("Index failed:", err);
  process.exit(1);
});
