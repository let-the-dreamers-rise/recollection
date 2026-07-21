import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "../../../../lib/supabase/admin";

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const admin = createAdminSupabaseClient();
    const { data, error } = await admin.from("invitations").select("id,circle_id,recipient_name,expires_at,revoked_at,memory_circles(title,prompt,cover_path)").eq("token", token).single();
    if (error || !data || data.revoked_at || new Date(data.expires_at) < new Date()) return NextResponse.json({ error: "This response link is unavailable." }, { status: 404 });
    const circle = Array.isArray(data.memory_circles) ? data.memory_circles[0] : data.memory_circles;
    let coverUrl: string | null = null;
    if (circle?.cover_path) { const signed = await admin.storage.from("memory-media").createSignedUrl(circle.cover_path, 600); coverUrl = signed.data?.signedUrl || null; }
    return NextResponse.json({ invitation: { recipientName: data.recipient_name, expiresAt: data.expires_at }, circle: { title: circle?.title, prompt: circle?.prompt, coverUrl } });
  } catch { return NextResponse.json({ error: "This response link is unavailable." }, { status: 404 }); }
}

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const form = await request.formData();
    const name = String(form.get("name") || "").trim();
    const text = String(form.get("text") || "").trim();
    const consent = form.get("consent") === "true";
    const audio = form.get("audio");
    if (!name || !consent || (!text && !(audio instanceof File && audio.size))) return NextResponse.json({ error: "Please add your name, a response, and consent." }, { status: 400 });
    const admin = createAdminSupabaseClient();
    const { data: invitation } = await admin.from("invitations").select("id,circle_id,expires_at,revoked_at,max_responses").eq("token", token).single();
    if (!invitation || invitation.revoked_at || new Date(invitation.expires_at) < new Date()) return NextResponse.json({ error: "This response link has expired or was revoked." }, { status: 410 });
    const { count } = await admin.from("story_responses").select("id", { count: "exact", head: true }).eq("invitation_id", invitation.id);
    if ((count || 0) >= invitation.max_responses) return NextResponse.json({ error: "This link has already received its response." }, { status: 409 });
    let audioPath: string | null = null;
    if (audio instanceof File && audio.size) { audioPath = `${invitation.circle_id}/responses/${crypto.randomUUID()}-${audio.name || "voice.webm"}`; const { error } = await admin.storage.from("memory-media").upload(audioPath, audio, { contentType: audio.type || "audio/webm", upsert: false }); if (error) throw error; }
    const { error } = await admin.from("story_responses").insert({ circle_id: invitation.circle_id, invitation_id: invitation.id, contributor_name: name, kind: audioPath ? "audio" : "text", text_content: audioPath ? null : text, audio_path: audioPath, consent_to_store_at: new Date().toISOString() });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "We couldn’t save your response. Please try again." }, { status: 500 }); }
}
