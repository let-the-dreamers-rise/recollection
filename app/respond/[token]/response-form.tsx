"use client";

/* The image URL is a short-lived signed URL from private storage and cannot use a static Next image allowlist. */
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type InviteData = {
  invitation: { recipientName: string | null; expiresAt: string };
  circle: { title: string; prompt: string; coverUrl: string | null };
};

export function ResponseForm({ token }: { token: string }) {
  const [data, setData] = useState<InviteData | null>(null);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [consent, setConsent] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audio, setAudio] = useState<File | null>(null);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const parts = useRef<Blob[]>([]);

  useEffect(() => {
    fetch(`/api/invites/${token}`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error);
        setData(body);
      })
      .catch((caught) => setError(caught.message));
  }, [token]);

  async function toggleRecording() {
    if (recording) {
      recorder.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const media = new MediaRecorder(stream);
      parts.current = [];
      media.ondataavailable = (event) => parts.current.push(event.data);
      media.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        setAudio(new File([new Blob(parts.current, { type: media.mimeType || "audio/webm" })], "my-answer.webm", { type: media.mimeType || "audio/webm" }));
        setRecording(false);
      };
      recorder.current = media;
      media.start();
      setRecording(true);
    } catch {
      setError("Microphone access is needed to record. You can write your answer instead.");
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!name.trim() || !consent || (!text.trim() && !audio)) {
      setError("Please add your name, an answer, and consent before sending.");
      return;
    }
    setSaving(true);
    const form = new FormData();
    form.set("name", name);
    form.set("text", text);
    form.set("consent", String(consent));
    if (audio) form.set("audio", audio);
    const response = await fetch(`/api/invites/${token}`, { method: "POST", body: form });
    const body = await response.json();
    setSaving(false);
    if (!response.ok) {
      setError(body.error || "We could not save your answer.");
      return;
    }
    setDone(true);
  }

  if (error && !data) return <main className="guest-shell"><div className="guest-card"><Link className="wordmark" href="/">recollection<span>.</span></Link><h1>This private link is not available.</h1><p>{error}</p></div></main>;
  if (!data) return <main className="guest-shell"><div className="guest-card">Opening your private invitation...</div></main>;
  if (done) return <main className="guest-shell"><div className="guest-card thank-you"><Link className="wordmark" href="/">recollection<span>.</span></Link><p className="eyebrow">Answer received</p><h1>Thank you for crossing the years.</h1><p>Your answer has been added to <b>{data.circle.title}</b>. Only people invited to this private age chain can see it.</p></div></main>;

  return <main className="guest-shell"><section className="guest-card"><Link className="wordmark" href="/">recollection<span>.</span></Link>{data.circle.coverUrl && <img className="guest-photo" src={data.circle.coverUrl} alt="The original photo shared with this invitation"/>}<p className="eyebrow">A private question {data.invitation.recipientName ? `for ${data.invitation.recipientName}` : "for you"}</p><h1>{data.circle.title}</h1><blockquote>&ldquo;{data.circle.prompt}&rdquo;</blockquote><p className="guest-note">There is no right answer. Tell us what that age felt like, in the language that feels like home.</p><form onSubmit={submit}><label>Your name<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="How should your family know this is you?"/></label><label>Your answer<textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Write as much or as little as you want..." rows={6}/></label><div className="record-box"><div><b>Or speak it in your own voice</b><small>{audio ? "Voice note ready to send" : "Your recording is private, not synthetic."}</small></div><button type="button" className={recording ? "recording" : "record"} onClick={toggleRecording}>{recording ? "Stop recording" : audio ? "Record again" : "Record voice"}</button></div><label className="check"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)}/><span>I consent to this answer being stored in this private Recollection age chain. I understand its owner can remove it.</span></label>{error && <p className="form-error">{error}</p>}<button className="button button-primary full" disabled={saving}>{saving ? "Sending your answer..." : "Send my answer"}</button></form><small>Private link expires {new Date(data.invitation.expiresAt).toLocaleDateString()}.</small></section></main>;
}
