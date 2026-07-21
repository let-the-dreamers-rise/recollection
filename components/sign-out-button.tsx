"use client";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "../lib/supabase/browser";

export function SignOutButton() {
  const router = useRouter();
  return <button type="button" className="text-button" aria-label="Sign out of Recollection" onClick={async () => { await createBrowserSupabaseClient().auth.signOut(); router.push("/"); router.refresh(); }}>Sign out</button>;
}
