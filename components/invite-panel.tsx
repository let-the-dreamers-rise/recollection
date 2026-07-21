"use client";
import { useState } from "react";
import { createBrowserSupabaseClient } from "../lib/supabase/browser";

type Invitation = { id: string; token: string; recipient_name: string | null; expires_at: string; revoked_at: string | null };

export function InvitePanel({ circleId, invitations }: { circleId: string; invitations: Invitation[] }) {
  const [items, setItems] = useState(invitations);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  async function makeInvite() {
    setBusy(true); setNotice("");
    const supabase = createBrowserSupabaseClient();
    const { data, error } = await supabase.from("invitations").insert({ circle_id: circleId, recipient_name: name.trim() || null }).select("id,token,recipient_name,expires_at,revoked_at").single();
    setBusy(false);
    if (error) { setNotice(error.message); return; }
    setItems([data, ...items]); setName(""); setNotice("Private response link created. Copy it before sending.");
  }
  async function revoke(id: string) {
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.from("invitations").update({ revoked_at: new Date().toISOString() }).eq("id", id);
    if (error) { setNotice(error.message); return; }
    setItems(items.map((item) => item.id === id ? { ...item, revoked_at: new Date().toISOString() } : item));
  }
  return <section className="invite-panel"><div><p className="kicker">Ask across the years</p><h2>One quiet link.<br/>No app to learn.</h2><p>They only see the photograph and the question you chose. The link expires in 14 days and you can revoke it any time.</p></div><div className="invite-create"><input aria-label="Recipient name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Their name (optional)"/><button className="button button-sun" type="button" disabled={busy} onClick={makeInvite}>{busy ? "Opening…" : "Make the question link"}</button></div>{notice && <p className="form-success">{notice}</p>}<div className="invite-list">{items.length === 0 ? <p className="muted">No question link yet.</p> : items.map((item) => <article key={item.id} className={item.revoked_at ? "invite-row muted" : "invite-row"}><div><b>{item.recipient_name || "The person who remembers"}</b><small>{item.revoked_at ? "Revoked" : `Closes ${new Date(item.expires_at).toLocaleDateString()}`}</small></div>{item.revoked_at ? <span>Closed</span> : <div><button className="text-link" onClick={() => navigator.clipboard.writeText(`${origin}/respond/${item.token}`)}>Copy link</button><button className="text-button danger" onClick={() => revoke(item.id)}>Revoke</button></div>}</article>)}</div></section>;
}
