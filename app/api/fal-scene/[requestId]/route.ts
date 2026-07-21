import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { createServerSupabaseClient } from "../../../../lib/supabase/server";

export const runtime = "nodejs";
const defaultModel = "fal-ai/kling-video/v3/turbo/standard/text-to-video";

export async function GET(_: Request, { params }: { params: Promise<{ requestId: string }> }) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in to view a visual bridge." }, { status: 401 });
    const { requestId } = await params;
    const { data: bridge, error: bridgeError } = await supabase.from("visual_bridges").select("request_id,status,video_url,model").eq("request_id", requestId).eq("owner_id", user.id).maybeSingle();
    if (bridgeError) return NextResponse.json({ error: "Visual-bridge storage is not ready. Apply the database migration first." }, { status: 503 });
    if (!bridge) return NextResponse.json({ error: "This visual bridge is not available to you." }, { status: 404 });
    if (bridge.status === "COMPLETED" && bridge.video_url) return NextResponse.json({ requestId, status: bridge.status, url: bridge.video_url });
    if (!process.env.FAL_KEY) return NextResponse.json({ error: "FAL is not configured." }, { status: 503 });

    fal.config({ credentials: process.env.FAL_KEY });
    const status = await fal.queue.status(bridge.model || defaultModel, { requestId, logs: true });
    if (status.status !== "COMPLETED") {
      await supabase.from("visual_bridges").update({ status: status.status }).eq("request_id", requestId);
      return NextResponse.json({ requestId, status: status.status, progress: 0 });
    }
    const result = await fal.queue.result(bridge.model || defaultModel, { requestId });
    const data = result.data as { video?: { url?: string } };
    if (!data.video?.url) return NextResponse.json({ error: "FAL completed the render without a video URL." }, { status: 502 });
    await supabase.from("visual_bridges").update({ status: "COMPLETED", video_url: data.video.url }).eq("request_id", requestId);
    return NextResponse.json({ requestId, status: "COMPLETED", url: data.video.url });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "The render status is unavailable." }, { status: 500 });
  }
}
