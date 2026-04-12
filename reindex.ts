import { reindexAll } from "../server/src/storage/sync.js";

async function main() {
  console.log("Reindexing all memories...");
  const result = await reindexAll({ reset: true });
  console.log(`Indexed: ${result.indexed}`);
  if (result.errors.length > 0) {
    console.error(`Errors (${result.errors.length}):`);
    for (const e of result.errors) {
      console.error(`  ${e.file}: ${e.error}`);
    }
  }
  process.exit(result.errors.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Reindex failed:", err);
  process.exit(1);
});
