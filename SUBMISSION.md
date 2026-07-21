# OpenAI Build Week submission — Recollection

## Category

**Apps for Your Life**

## Live project

**Judge demo:** https://recollection-age-chain.vercel.app/demo

**Real private login:** https://recollection-age-chain.vercel.app/login

## Devpost field copy

Review this in your own voice before submitting, then paste it into Devpost.

### Project name

Recollection

### Elevator pitch

**Meet someone you love when they were your age.**

### About the project

## Inspiration

At the age when a life decision feels enormous, the people we love often have one thing no feed, chatbot, or self-help article can give us: they have already been that age. Recollection turns a family photograph into a private crossing between two lives at the same age.

## What it does

An owner starts an Age Chain with one original photo, the age they share with a parent or grandparent, and one question that matters now. The invited person answers in writing or with their own voice through a private, expiring link—no app download and no account required. The answer comes home beside the original photograph.

GPT-5.6 can suggest three careful opening questions from owner-supplied context. It does not invent the family story or answer on anyone’s behalf.

An optional FAL visual bridge adds atmosphere, not evidence: a silent, people-free room with light and movement. It is labelled **Imagined** and never receives a photo, face, name, voice, or personal context.

## How we built it

Recollection is a Next.js and TypeScript application backed by Supabase Auth, Postgres, Storage, and Row Level Security. Passwordless email links protect the private owner experience; a separate guest invitation flow permits a consented text or audio response without creating an account.

The server-only OpenAI Responses API path uses GPT-5.6 for three constrained question suggestions. The server-only FAL queue uses a fixed prompt for the optional people-free bridge. Codex accelerated the product design, private architecture, implementation, security hardening, tests, and production release gate. See [BUILD_WITH_CODEX.md](./BUILD_WITH_CODEX.md) for the detailed build record.

## Challenges we ran into

The tempting version of this idea was a generated speaking relative. We rejected it. The harder, more valuable problem is creating a reason for a real conversation while clearly separating a photograph, a human answer, and any imagined atmosphere. That required private storage, consent, invitation expiry, revocation, source labels, and a model prompt that refuses to invent family facts.

## Accomplishments that we're proud of

- A complete private journey instead of a generic AI video wrapper
- Real authentication, persistence, private storage, invitation controls, and RLS
- A no-login judge walkthrough using fictional sample data
- A grounded GPT-5.6 interaction where the model opens a conversation but never replaces the person
- A visual feature designed so it cannot use or create a relative’s likeness

## What we learned

The best use of generative AI here is not to manufacture a memory. It is to make a real memory easier to recover: a better question, a lower-friction invitation, and a clear boundary between history and imagination.

## What's next for Recollection

Add owner-controlled exports and deletion jobs, family member roles, locale-aware prompts, and an optional private remembrance book built only from consented original and spoken material.

### Built with

Next.js, React, TypeScript, Supabase Auth, Supabase Postgres, Supabase Storage, Row Level Security, OpenAI Responses API, GPT-5.6, Codex, FAL, Vercel

### Judge instructions

1. Open `/demo` for a no-login walkthrough with clearly labelled fictional data.
2. Open `/login` for the real passwordless private workflow.
3. Use your own email address; no shared judge password is required.
4. The optional FAL action appears only inside an owner’s private Age Chain and is deliberately labelled **Imagined**.

## Three-minute demo arc

**0:00–0:20 — Hook:** “I am 26. My mother was 26 once. What did she know about choosing a home that I do not?” Start on the Age Chain, not a dashboard.

**0:20–0:55 — Make a crossing:** Upload one consented original photo. Enter the shared age and the current life threshold.

**0:55–1:20 — GPT-5.6, bounded:** Generate three question suggestions. Say clearly: “GPT-5.6 helps shape the question; it does not create the family memory.”

**1:20–1:50 — The human answer:** Open the private link in an incognito window. Submit a short consented response.

**1:50–2:15 — The record comes home:** Refresh the owner’s Age Chain. Show **Original** photo + question + **Spoken** answer together.

**2:15–2:35 — The visual boundary:** Trigger the optional FAL bridge. Show the silent people-free result next to the **Imagined** label. Explain that no family material is sent to FAL.

**2:35–2:55 — Product promise:** Revoke the link. End with: “Every year of your life, you can meet someone you love at the same age.”

## Submission checklist

- [ ] Add the public Vercel URL below after deployment.
- [ ] Add that URL’s `/auth/callback` path to Supabase Auth redirect URLs.
- [ ] Add real OpenAI and FAL server-side keys to the deployment if demonstrating those live paths.
- [ ] Record a public YouTube video below three minutes with English audio.
- [ ] Paste the actual Codex `/feedback` session ID into Devpost.
- [ ] Select **Apps for Your Life**.
- [ ] Select your correct submitter type and country of residence.
- [ ] Review and personalize the project story before submitting.
- [ ] Accept the terms yourself and submit only when every field is complete.
