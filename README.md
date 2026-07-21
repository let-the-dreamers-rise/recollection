# Recollection

**Meet someone you love when they were your age.**

Recollection is a private, invite-first intergenerational app. An original family photo opens an **Age Chain** between someone facing life now and a parent or grandparent at the same age. The owner asks one question that matters; the real person returns a written or spoken answer through an expiring private link.

The product is intentionally not a fake-memory generator. Every item is visibly labelled:

- **Original** — an owner-uploaded photograph
- **Spoken** — a real response from the invited person
- **Imagined** — an optional people-free environmental visual bridge

## Judge path

- **No-login walkthrough:** [open the live judge demo](https://recollection-age-chain.vercel.app/demo). It uses clearly marked fictional sample data and demonstrates the complete product story.
- **Real private flow:** [open the deployed login](https://recollection-age-chain.vercel.app/login), use a passwordless email link, create an Age Chain, then send a 14-day revocable invitation.
- **Privacy:** no public profiles, no shared family passwords, private object storage, server-side checks, and Supabase Row Level Security.

## What is implemented

- Supabase Auth passwordless email sign-in
- Protected Age Chain routes with Postgres persistence
- Private image and voice storage
- Owner/member/invite/response Row Level Security policies
- Consent checkpoint before storing a family photo or response
- Expiring, revocable guest links with no guest account
- GPT-5.6 question suggestions through a server-only OpenAI Responses API route
- Optional FAL queue for one silent, eight-second, people-free visual bridge per Age Chain
- Original / Spoken / Imagined source labels throughout the experience
- A reproducible release gate: lint, type-check, security contracts, and a production build

## Local setup

Requires Node 22+ and a Supabase project.

```powershell
git clone https://github.com/let-the-dreamers-rise/recollection.git
cd recollection
Copy-Item .env.example .env.local
npm.cmd ci
npm.cmd run check
npm.cmd run dev
```

Set these values in `.env.local`:

```text
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5.6
FAL_KEY=...
FAL_VIDEO_MODEL=fal-ai/kling-video/v3/turbo/standard/text-to-video
```

Run the migrations in `supabase/migrations/` against the target Supabase project. In **Auth → URL Configuration**, allow both local and deployed `/auth/callback` URLs.

## Deploy on Vercel

Create a Vercel project from this repository and add the same environment variables for Production. Never expose `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, or `FAL_KEY` to the browser. After Vercel assigns a URL, add:

```text
https://recollection-age-chain.vercel.app/auth/callback
```

to the Supabase Auth redirect allow-list. Then test both `/demo` and the real magic-link flow on the deployed URL.

## Safety and truth model

GPT-5.6 sees only owner-supplied age-bridge context and returns exactly three possible questions. It is instructed not to invent names, dates, events, family facts, or advice. The invited relative—not the model—supplies the answer.

The FAL action is an explicit owner click. It receives a fixed prompt for a silent empty environment; it never receives a family photo, voice, name, face, or personal context. Its output is labelled **Imagined**, never archival evidence.

## Built with Codex and GPT-5.6

Read [BUILD_WITH_CODEX.md](./BUILD_WITH_CODEX.md) for the honest build record: product decisions, private Supabase architecture, grounded GPT-5.6 usage, FAL safety boundary, and release-quality work completed with Codex.

## Release verification

```powershell
npm.cmd ci
npm.cmd run check
```

The test suite protects the claims judges should care about: grounded GPT output, no family material in the FAL request, owner-only FAL status access, private-route checks, safe magic-link redirects, and complete submission documentation.
