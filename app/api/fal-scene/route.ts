import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { createServerSupabaseClient } from "../../../lib/supabase/server";

export const runtime = "nodejs";
const defaultModel = "fal-ai/kling-video/v3/turbo/standard/text-to-video";

type Bridge = { request_id: string; status: string; video_url: string | null };

function bridgePayload(bridge: Bridge) {
  return { requestId: bridge.request_id, status: bridge.status, url: bridge.video_url || undefined };
}

function privatePrompt() {
  return "Cinematic 16:9 imagined visual bridge. An empty, people-free home environment: a warm lamp switches on, monsoon light moves across a window, a folded letter rests on a table, fabric moves gently, distant festival colour, slow deliberate camera movement. The mood is intimate, hopeful, reflective. Absolutely no people, faces, human silhouettes, photographs, readable text, logos, names, or identifiable likenesses. This is an imagined environmental bridge, never archival footage.";
}

export async function GET(request: Request) {
  const circleId = new URL(request.url).searchParams.get("circleId");
  if (!circleId) return NextResponse.json({ error: "A circle is required." }, { status: 400 });
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to view a visual bridge." }, { status: 401 });
  const { data, error } = await supabase.from("visual_bridges").select("request_id,status,video_url").eq("circle_id", circleId).maybeSingle();
  if (error) return NextResponse.json({ error: "Visual-bridge storage is not ready. Apply the database migration first." }, { status: 503 });
  if (!data) return NextResponse.json({ bridge: null });
  return NextResponse.json({ bridge: bridgePayload(data as Bridge) });
}

export async function POST(request: Request) {
  try {
    const { circleId } = await request.json();
    if (typeof circleId !== "string") return NextResponse.json({ error: "This bridge needs its circle." }, { status: 400 });
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in to render a visual bridge." }, { status: 401 });
    const { data: circle } = await supabase.from("memory_circles").select("id").eq("id", circleId).eq("owner_id", user.id).maybeSingle();
    if (!circle) return NextResponse.json({ error: "Only the owner can create this visual bridge." }, { status: 403 });
    const { data: existing, error: existingError } = await supabase.from("visual_bridges").select("request_id,status,video_url").eq("circle_id", circleId).maybeSingle();
    if (existingError) return NextResponse.json({ error: "Visual-bridge storage is not ready. Apply the database migration first." }, { status: 503 });
    if (existing) return NextResponse.json(bridgePayload(existing as Bridge));
    if (!process.env.FAL_KEY) return NextResponse.json({ error: "Add FAL_KEY to .env.local to enable visual-bridge rendering." }, { status: 503 });

    fal.config({ credentials: process.env.FAL_KEY });
    const model = process.env.FAL_VIDEO_MODEL || defaultModel;
    const queued = await fal.queue.submit(model, {
      input: {
        prompt: privatePrompt(),
        aspect_ratio: "16:9",
        duration: "8",
        generate_audio: false,
        negative_prompt: "people, faces, human silhouettes, photographs, readable text, logos, names, watermarks, identifiable likenesses",
      },
    });
    const requestId = queued.request_id;
    if (!requestId) throw new Error("FAL did not return a render id.");
    const { data: created, error: insertError } = await supabase.from("visual_bridges").insert({ circle_id: circleId, owner_id: user.id, request_id: requestId, model, status: "IN_QUEUE" }).select("request_id,status,video_url").single();
    if (insertError) throw new Error("The FAL request started, but its private record could not be saved. Apply the visual-bridge database migration before retrying.");
    return NextResponse.json(bridgePayload(created as Bridge));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "The visual bridge could not start." }, { status: 500 });
  }
}
