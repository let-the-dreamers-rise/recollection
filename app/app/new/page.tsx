import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../../../lib/supabase/server";
import { NewCircleForm } from "./new-circle-form";

export default async function NewCirclePage() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
  } catch {
    redirect("/login");
  }
  return <main className="bridge-shell"><header className="app-header dark-header"><Link className="wordmark" href="/app">recollection<span>.</span></Link><Link className="quiet-link" href="/app">Save for later</Link></header><section className="bridge-intro"><p className="kicker">A new age bridge</p><h1>They were your age<br/><em>once.</em></h1><p>Begin with the year where your stories touch. Recollection will never fill in what your family has not said.</p></section><NewCircleForm/></main>;
}
