"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "../../../lib/supabase/browser";

type Suggestion = { question: string; reason: string };
type QuestionSource = "gpt" | "local-guidance" | "";

export function NewCircleForm() {
  const router = useRouter();
  const [relative, setRelative] = useState("");
  const [theirAge, setTheirAge] = useState("");
  const [yourAge, setYourAge] = useState("");
  const [moment, setMoment] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [questionSource, setQuestionSource] = useState<QuestionSource>("");
  const [prompt, setPrompt] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "thinking" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");
  const context = `I am ${yourAge || "the same age"}. ${relative || "My relative"} was ${theirAge || "around this age"}. The life moment I am facing now: ${moment}`;
  const title = relative && theirAge ? `${relative} at ${theirAge}` : "My first age bridge";

  async function suggestQuestions() {
    if (!relative.trim() || !yourAge || !theirAge || !moment.trim()) {
      setMessage("Name your relative, both ages, and the life moment that makes this bridge matter.");
      return;
    }
    setStatus("thinking");
    setMessage("");
    try {
      const response = await fetch("/api/questions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ context, title }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Could not shape a question.");
      setSuggestions(body.questions);
      setQuestionSource(body.source === "gpt" ? "gpt" : "local-guidance");
      setPrompt(body.questions[0]?.question || "");
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not shape a question.");
    }
  }

  async function createBridge(event: React.FormEvent) {
    event.preventDefault();
    if (!relative.trim() || !yourAge || !theirAge || !file || !prompt.trim() || !consent) {
      setMessage("Add the original photo, complete the age bridge, choose a question, and confirm you have permission to share it.");
      return;
    }
    setStatus("saving");
    setMessage("");
    try {
      const supabase = createBrowserSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Your session has ended. Please sign in again.");
      let coverPath: string | null = null;
      if (file) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        coverPath = `${user.id}/${crypto.randomUUID()}-${safeName}`;
        const { error: uploadError } = await supabase.storage.from("memory-media").upload(coverPath, file, { contentType: file.type, upsert: false });
        if (uploadError) throw uploadError;
      }
      const { data, error } = await supabase.from("memory_circles").insert({ title, source_context: context, prompt: prompt.trim(), cover_path: coverPath, consent_confirmed_at: new Date().toISOString() }).select("id").single();
      if (error) throw error;
      router.push(`/app/circles/${data.id}`);
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not save your age bridge.");
    }
  }

  return <form className="bridge-form" onSubmit={createBridge}>
    <section className="bridge-step bridge-step-first"><div className="step-heading"><span>01</span><div><h2>Find the crossing.</h2><p>Choose someone who was your age before you.</p></div></div><div className="age-pair"><label>Their name<input required value={relative} onChange={(event) => setRelative(event.target.value)} placeholder="Dad, Nani, Mum..."/></label><label>They were<input required type="number" min="1" max="110" value={theirAge} onChange={(event) => setTheirAge(event.target.value)} placeholder="26"/><span className="field-caption">years old</span></label><label>You are<input required type="number" min="1" max="110" value={yourAge} onChange={(event) => setYourAge(event.target.value)} placeholder="26"/><span className="field-caption">years old now</span></label></div><label className="photo-drop">The original photograph <input required type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setFile(event.target.files?.[0] ?? null)}/><span>{file ? `${file.name} is ready` : "Choose an image - private by default"}</span></label></section>
    <section className="bridge-step"><div className="step-heading"><span>02</span><div><h2>Why does this age matter?</h2><p>Give the bridge a present-tense stake.</p></div></div><label>Your life, right now<textarea value={moment} onChange={(event) => setMoment(event.target.value)} placeholder="I am about to move to another city for my first job. I feel excited, but I am scared of being alone." rows={4}/></label></section>
    <section className="bridge-step"><div className="step-heading"><span>03</span><div><h2>Ask what only they can answer.</h2><p>GPT can shape the opening. You keep the final word.</p></div></div><button type="button" className="button button-outline-light" disabled={status === "thinking"} onClick={suggestQuestions}>{status === "thinking" ? "Shaping the right question..." : "Shape three honest questions"}</button>{questionSource && <p className="field-caption" role="status">{questionSource === "gpt" ? "GPT-5.6 shaped these questions from your context. It did not add family facts." : "Local guidance is shown. Configure OPENAI_API_KEY for GPT-5.6 suggestions."}</p>}{suggestions.length > 0 && <div className="question-choices">{suggestions.map((suggestion) => <button type="button" key={suggestion.question} className={prompt === suggestion.question ? "question-choice selected" : "question-choice"} onClick={() => setPrompt(suggestion.question)}><b>{suggestion.question}</b><span>{suggestion.reason}</span></button>)}</div>}<label>Your chosen question<input required value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="What did you wish someone had told you at my age?"/></label><label className="check bridge-check"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)}/><span>I have permission to invite this person and share this photograph. Recollection will never generate their likeness or clone their voice.</span></label></section>
    {message && <p className="form-error" role="alert">{message}</p>}<div className="bridge-submit"><p>Next, you will make one private link for the person who can answer this question.</p><button className="button button-sun" disabled={status === "saving"}>{status === "saving" ? "Opening the bridge..." : "Open this age bridge"}</button></div>
  </form>;
}
