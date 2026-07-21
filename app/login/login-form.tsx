"use client";

import Link from "next/link";
import { useState } from "react";
import { createBrowserSupabaseClient, hasSupabaseConfig } from "../../lib/supabase/browser";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const configured = hasSupabaseConfig();

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    if (!configured) return;
    setStatus("sending");
    setMessage("");
    try {
      const supabase = createBrowserSupabaseClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
      if (error) throw error;
      setStatus("sent");
      setMessage(`A private sign-in link is on its way to ${email}.`);
    } catch (caught) {
      setStatus("error");
      setMessage(caught instanceof Error ? caught.message : "We could not send the sign-in link. Please try again.");
    }
  }

  return (
    <main className="auth-shell auth-stage">
      <header className="auth-header">
        <Link className="wordmark" href="/">recollection<span>.</span></Link>
        <Link className="quiet-link" href="/">Back to the age chain</Link>
      </header>
      <div className="auth-layout">
        <aside className="auth-story">
          <p className="kicker">Private by design</p>
          <h1>One email.<br /><em>One doorway.</em></h1>
          <p>Recollection has no shared family password, public profile, or noisy social feed. Your private age chain begins with a sign-in link sent only to you.</p>
          <ol className="magic-steps">
            <li><span>01</span><div><b>Enter your email</b><small>Use the inbox you trust most.</small></div></li>
            <li><span>02</span><div><b>Open the magic link</b><small>We return you to this private crossing.</small></div></li>
            <li><span>03</span><div><b>Ask across the years</b><small>One photo. One real question. One human answer.</small></div></li>
          </ol>
          <p className="auth-source-note"><i /> Your family material stays private by default.</p>
        </aside>
        <section className="auth-card">
          <div className="auth-card-mark"><span>EMAIL LINK</span><i /><span>PRIVATE</span></div>
          <p className="eyebrow">Enter your timeline</p>
          <h2>Let&apos;s make the first crossing.</h2>
          <p className="auth-lede">We&apos;ll email a secure sign-in link. No password to create, remember, or share.</p>
          {!configured && <div className="notice"><b>Backend connection needed.</b> Add your Supabase keys to <code>.env.local</code> and magic-link sign-in will turn on.</div>}
          <form onSubmit={signIn}>
            <label>
              Email address
              <input type="email" autoComplete="email" inputMode="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" disabled={!configured || status === "sending"} />
            </label>
            <button className="button button-primary full" disabled={!configured || status === "sending"}>
              {status === "sending" ? "Sending your private link..." : status === "sent" ? "Send another sign-in link" : "Email me a secure sign-in link"}
            </button>
          </form>
          {status !== "idle" && <p role="status" aria-live="polite" className={status === "error" ? "form-error" : "form-success"}>{message}</p>}
          <a className="judge-demo-link" href="/demo">
            <span>Judge demo</span>
            <b>Explore the complete sample experience - no email needed</b>
          </a>
          <div className="auth-assurance"><span>NO PASSWORD</span><i /><span>NO PUBLIC PROFILE</span><i /><span>YOUR CONTROL</span></div>
        </section>
      </div>
    </main>
  );
}
