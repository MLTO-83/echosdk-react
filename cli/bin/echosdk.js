#!/usr/bin/env node
// Entry point for the published CLI binary.
// Dynamically imports the compiled TypeScript entrypoint.
import('../dist/index.js').catch((err) => {
  console.error(err.message);
  process.exit(1);
});
