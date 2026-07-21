import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../../lib/supabase/server";
import { SignOutButton } from "../../components/sign-out-button";

type Circle = { id: string; title: string; created_at: string; cover_path: string | null; prompt: string | null };

export default async function AppHome() {
  let userEmail = "";
  let circles: Circle[] = [];
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    userEmail = user.email ?? "";
    const { data } = await supabase.from("memory_circles").select("id,title,created_at,cover_path,prompt").order("created_at", { ascending: false });
    circles = (data ?? []) as Circle[];
  } catch {
    redirect("/login");
  }

  return <main className="app-shell"><header className="app-header dark-header"><Link className="wordmark" href="/app">recollection<span>.</span></Link><div className="account-actions"><span className="account-pill"><i/>{userEmail}</span><SignOutButton/></div></header><section className="dashboard-hero"><div><p className="kicker">Your private age chain</p><h1>Every age is a<br/><em>doorway.</em></h1><p>Open one exact crossing between your life now and someone you love at the same age.</p><div className="dashboard-actions"><Link className="button button-sun" href="/app/new">Open an age bridge <span>Begin</span></Link><span className="private-marker"><i/> Private to you and people you invite</span></div></div><div className="dashboard-orbit" aria-label="A visual time bridge from then to now"><span className="orbit-year orbit-then">THEN</span><span className="orbit-age">26</span><span className="orbit-line"/><span className="orbit-age orbit-now">26</span><span className="orbit-year orbit-forward">NOW</span><i className="orbit-ring orbit-ring-one"/><i className="orbit-ring orbit-ring-two"/></div></section><section className="chain-rule"><span>THEN</span><i/><span>NOW</span><i/><span>FORWARD</span></section>{circles.length === 0 ? <section className="chain-empty"><div className="empty-portal"><i/><i/><i/><b>26</b></div><div><p className="kicker">Your first crossing</p><h2>Who in your family<br/>was your age first?</h2><p>Not a family tree. Not a photo dump. One exact meeting across time.</p><Link className="text-action" href="/app/new">Create the first bridge <span>Begin</span></Link></div></section> : <section className="bridge-list"><div className="list-title"><div><p className="kicker">Open crossings</p><h2>Your age chain</h2></div><p>{circles.length} private {circles.length === 1 ? "crossing" : "crossings"}</p></div>{circles.map((circle, index) => <Link key={circle.id} className="bridge-row" href={`/app/circles/${circle.id}`}><span className="bridge-index">{String(index + 1).padStart(2, "0")}</span><div className="bridge-row-orb">{circle.cover_path ? "Source" : "Open"}</div><div><small>Same-age bridge - {new Date(circle.created_at).toLocaleDateString()}</small><h3>{circle.title}</h3><p>{circle.prompt || "A question waiting in another year."}</p></div><span className="bridge-arrow">Open</span></Link>)}</section>}</main>;
}
