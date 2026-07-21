import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "../../../../lib/supabase/server";
import { InvitePanel } from "../../../../components/invite-panel";
import { SceneStudio } from "../../../../components/scene-studio";

export default async function CirclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
  try {
    supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
  } catch {
    redirect("/login");
  }

  const [{ data: circle, error: circleError }, { data: invitations }, { data: responses }] = await Promise.all([
    supabase.from("memory_circles").select("*").eq("id", id).single(),
    supabase.from("invitations").select("id,token,recipient_name,expires_at,revoked_at").eq("circle_id", id).order("created_at", { ascending: false }),
    supabase.from("story_responses").select("id,contributor_name,kind,text_content,transcript,created_at").eq("circle_id", id).order("created_at", { ascending: false }),
  ]);
  if (circleError || !circle) notFound();
  const ages = circle.source_context.match(/I am (\d+).*?was (\d+)/i);

  return <main className="bridge-detail"><header className="app-header dark-header"><Link className="wordmark" href="/app">recollection<span>.</span></Link><Link className="quiet-link" href="/app">Back to your age chain</Link></header><section className="detail-hero"><div className="detail-age"><span>THEN</span><b>{ages?.[2] || "?"}</b><i/><b>{ages?.[1] || "?"}</b><span>NOW</span></div><div><p className="kicker">A private age bridge</p><h1>{circle.title}</h1><blockquote>&ldquo;{circle.prompt}&rdquo;</blockquote><p>{circle.source_context || "This crossing is waiting for its context."}</p></div></section><InvitePanel circleId={circle.id} invitations={invitations ?? []}/><section className="voice-return"><div><p className="kicker">The human answer</p><h2>{responses?.length ? "A voice crossed the years." : "The other side is still waiting."}</h2><p>{responses?.length ? "What is spoken here remains the family's source, not a story written by AI." : "Send one calm question to the person who was there. No account is needed for them to answer."}</p></div>{responses?.length ? <div className="response-list">{responses.map((response) => <article key={response.id} className="response-card"><div className="response-avatar">{response.contributor_name.slice(0, 1).toUpperCase()}</div><div><b>{response.contributor_name}</b><small>{response.kind === "audio" ? "A spoken memory" : "A written memory"} - {new Date(response.created_at).toLocaleDateString()}</small><p>{response.transcript || response.text_content || "Voice response received. A transcript can be added by the bridge owner."}</p></div></article>)}</div> : <div className="waiting-signal"><i/><span>Waiting for a real answer</span></div>}</section><SceneStudio circleId={circle.id} title={circle.title} context={circle.source_context}/></main>;
}
