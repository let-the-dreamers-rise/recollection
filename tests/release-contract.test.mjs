import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = (file) => readFileSync(path.join(root, file), "utf8");

test("submission artefacts document the required judge evidence", () => {
  const readme = source("README.md");
  const submission = source("SUBMISSION.md");
  const buildNotes = source("BUILD_WITH_CODEX.md");
  assert.match(readme, /Local setup/);
  assert.match(submission, /Three-minute demo arc/);
  assert.match(submission, /Codex/);
  assert.match(buildNotes, /GPT-5\.6/);
  assert.match(buildNotes, /Codex/);
});

test("the GPT route remains grounded and the UI exposes its source", () => {
  const route = source("app/api/questions/route.ts");
  const form = source("app/app/new/new-circle-form.tsx");
  assert.match(route, /Never claim facts beyond the supplied context/);
  assert.match(route, /source: "gpt"/);
  assert.match(form, /questionSource/);
});

test("the FAL bridge never forwards family material to the provider", () => {
  const route = source("app/api/fal-scene/route.ts");
  assert.match(route, /function privatePrompt\(\)/);
  assert.match(route, /Absolutely no people, faces/);
  assert.doesNotMatch(route, /request\.json\(\).*title|request\.json\(\).*context/s);
  assert.match(route, /circle_id: circleId/);
});

test("private pages perform a server-side authentication check", () => {
  for (const file of ["app/app/page.tsx", "app/app/new/page.tsx", "app/app/circles/[id]/page.tsx"]) {
    const page = source(file);
    assert.match(page, /createServerSupabaseClient/);
    assert.match(page, /redirect\("\/login"\)/);
  }
});

test("the auth callback prevents protocol-relative redirect targets", () => {
  const callback = source("app/auth/callback/route.ts");
  assert.match(callback, /!next\.startsWith\("\/\/"\)/);
});

test("a FAL render can only be polled by its owner", () => {
  const pollRoute = source("app/api/fal-scene/[requestId]/route.ts");
  assert.match(pollRoute, /\.eq\("owner_id", user\.id\)/);
});
