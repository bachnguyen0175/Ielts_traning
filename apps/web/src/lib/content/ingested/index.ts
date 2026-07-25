import type { Test } from "@composed/domain";
import cam15Test1Reading from "./cam15-academic-test1.reading.data.json";

// Locally-ingested Cambridge tests. The `*.data.json` files carry Cambridge
// passage prose + question wording and are GITIGNORED — never committed
// (private-study posture, see content/README.md). They ARE bundled locally
// (gitignore doesn't affect bundling), so the test is playable on this machine.
//
// Caveat: a fresh clone without the data file won't build until the ingester
// (`content/ingest/`) regenerates it. Expected for a private, single-dev tool.

export const INGESTED_TESTS: Test[] = [cam15Test1Reading as unknown as Test];
