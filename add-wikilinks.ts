import * as path from "node:path";
import {
  listMemoryFiles,
  parseMemoryFile,
  writeMemoryFile,
} from "../server/src/storage/markdown.js";

function main() {
  const files = listMemoryFiles();
  let updated = 0;
  let skipped = 0;

  for (const fullPath of files) {
    try {
      const memory = parseMemoryFile(fullPath);
      if (!memory.related || memory.related.length === 0) {
        skipped++;
        continue;
      }
      writeMemoryFile(memory);
      updated++;
      console.log(
        `Updated: ${path.relative(process.cwd(), fullPath)} (${memory.related.length} links)`
      );
    } catch (err) {
      console.warn(`Skipped ${fullPath}: ${(err as Error).message}`);
    }
  }

  console.log(`Done. Updated ${updated} files. Skipped ${skipped}.`);
}

main();
