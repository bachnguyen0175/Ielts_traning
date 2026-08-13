import type { Test } from "@composed/domain";

// Locally-ingested Cambridge tests.
//
// This committed file is the SAFE DEFAULT — an empty list — so the repo builds
// and deploys (Vercel / fresh clones) with only the sample mock).
//
// The ingester (`content/ingest/ingest.py`) regenerates this file LOCALLY to
// static-import the gitignored `*.data.json` prose files, then marks it
// `git update-index --skip-worktree` so the local edit is never committed.
// Run the ingester to restore local Cambridge play; git and Vercel stay clean.
export const INGESTED_TESTS: Test[] = [];
