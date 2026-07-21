import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "../../../lib/supabase/server";

const fallback = [
  { question: "What did you wish someone had told you at my age?", reason: "Connects their lived uncertainty to the threshold you are standing on now." },
  { question: "What were you afraid of then that nobody around you knew?", reason: "Makes room for the emotional truth outside the photograph." },
  { question: "What choice from that year quietly changed what came next?", reason: "Lets them tell the story in their own meaning, not an AI summary." },
];

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in to create a question." }, { status: 401 });
    const { context, title } = await request.json();
    if (typeof context !== "string" || context.trim().length < 8) return NextResponse.json({ error: "Please provide a little more context." }, { status: 400 });
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ questions: fallback, source: "local-guidance" });
    const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-5.6", input: `You help a family create an Age Bridge: a real conversation between two people at the same age in different years. Return ONLY valid JSON: {"questions":[{"question":"...","reason":"..."}]}. Create exactly 3 warm, precise questions. Never claim facts beyond the supplied context. Do not invent names, dates, events, or advice. Ask about how the older person experienced life at that age, in a way that helps the younger person facing a current threshold. Title: ${title || "Untitled age bridge"}. Context: ${context}`, max_output_tokens: 500 }) });
    if (!response.ok) return NextResponse.json({ questions: fallback, source: "local-guidance" });
    const payload = await response.json();
    const text = payload.output_text || payload.output?.flatMap((item: { content?: { text?: string }[] }) => item.content ?? []).map((part: { text?: string }) => part.text || "").join("") || "";
    const parsed = JSON.parse(text.replace(/^```json\s*|\s*```$/g, ""));
    if (!Array.isArray(parsed.questions) || parsed.questions.length !== 3) throw new Error("Invalid model response");
    return NextResponse.json({ questions: parsed.questions, source: "gpt" });
  } catch { return NextResponse.json({ questions: fallback, source: "local-guidance" }); }
}
