# How Recollection was built with Codex and GPT-5.6

Recollection was built as a collaboration between the builder and Codex. The important point is not that an AI wrote isolated code; Codex helped turn a high-level idea into a coherent, testable product with deliberate technical decisions.

## Where Codex accelerated the work

1. **Product framing** - Codex helped pressure-test several directions, then focused the build on one user action: meeting a parent or grandparent at the same age through one photo, one question, and one real answer.
2. **Private product architecture** - Codex implemented passwordless Supabase authentication, private storage, Row Level Security, invitation expiry/revocation, and owner-controlled visual-bridge records.
3. **Experience design** - Codex built the age-lens landing experience, the guided crossing form, an account-free invite response flow, and clear Original / Spoken / Imagined source labels.
4. **Safety boundary** - Codex separated the real family record from optional generative media. The FAL integration sends only a fixed people-free environment prompt; family photos, names, voices, and context never leave Recollection for that render.
5. **Release quality** - Codex added a reproducible `npm run check` gate (lint, type-check, release-contract tests, and production build) and fixed protected-route failures found by production-server probes.

## Where GPT-5.6 is used in the product

The server-only [`/api/questions`](./app/api/questions/route.ts) route calls the OpenAI Responses API with `OPENAI_MODEL=gpt-5.6` when configured. It receives only the age-bridge context the signed-in owner supplied, then returns exactly three candidate questions.

The instruction intentionally constrains GPT-5.6 to:

- never invent names, dates, events, or advice;
- never claim family facts outside supplied context; and
- ask a question that the real relative, not the model, is qualified to answer.

The UI identifies whether the suggestions came from GPT-5.6 or local guidance. For the submission video, configure `OPENAI_API_KEY`, show the GPT-5.6 source label, choose a question, and then show the human answer returning through the private invitation flow.

## Reproducible quality gate

```powershell
npm.cmd ci
npm.cmd run check
```

The contract tests do not pretend to replace a live Supabase/OpenAI/FAL smoke test. They protect the intended submission claims: grounded GPT use, private FAL boundaries, server-side private-route checks, and required judge documentation.
