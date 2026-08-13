import type { Test } from "@composed/domain";

// Tests authored in markdown and compiled by `pnpm content:build`
// (see docs/content-authoring-format.md, ADR-0008).
//
// Unlike the Cambridge `ingested/` lane, this file and the generated test
// modules beside it ARE committed: authored content is original or licensed,
// so it is meant to deploy. The build regenerates this file to static-import
// every generated test; commit the result.
//
// Empty until the first test is built.
export const AUTHORED_TESTS: Test[] = [];
