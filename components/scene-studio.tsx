"use client";

import { useEffect, useState } from "react";

type Job = { requestId: string; status: string; progress?: number; url?: string; error?: string };

export function SceneStudio({ circleId, title, context }: { circleId: string; title: string; context: string }) {
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState("");
  const situation = context.split("The life moment I am facing now:")[1]?.trim() || "A life moment still waiting to be named.";

  useEffect(() => {
    if (!job || !["IN_QUEUE", "IN_PROGRESS"].includes(job.status)) return;
    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/fal-scene/${job.requestId}`);
      const body = await response.json();
      if (response.ok) setJob(body); else setError(body.error || "The visual bridge status is unavailable.");
    }, 5000);
    return () => window.clearInterval(timer);
  }, [job]);

  useEffect(() => {
    fetch(`/api/fal-scene?circleId=${encodeURIComponent(circleId)}`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error);
        if (body.bridge) setJob(body.bridge);
      })
      .catch((caught) => setError(caught.message));
  }, [circleId]);

  async function createScene() {
    setError("");
    const response = await fetch("/api/fal-scene", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ circleId }) });
    const body = await response.json();
    if (!response.ok) { setError(body.error || "The visual bridge could not start."); return; }
    setJob(body);
  }

  const active = job && ["IN_QUEUE", "IN_PROGRESS"].includes(job.status);
  return <section className="scene-studio"><div className="studio-copy"><p className="kicker">The visual bridge</p><h2>Build the world<br/>around the photograph.</h2><p>Recollection never animates a family face or treats generated video as evidence. FAL renders one fixed, people-free atmosphere. No family material is sent to FAL.</p><div className="source-legend"><span><i className="legend-original"/>Original</span><span><i className="legend-spoken"/>Spoken</span><span><i className="legend-imagined"/>Imagined</span></div></div><div className="scene-render">{job?.url ? <video className="scene-video" controls playsInline src={job.url}><track kind="captions"/></video> : <><div className="scene-visual"><span className="scene-sun"/><span className="scene-door"/><span className="scene-floor"/><span className="scene-grain"/></div><div className="scene-state"><b>{active ? `Rendering ${job.progress ? `${job.progress}%` : "your bridge"}` : title}</b><span>{active ? "FAL is rendering the atmosphere. You can return to this bridge later." : "No faces. No recreated family footage."}</span></div></>}<div className="scene-notes"><p><b>NOW</b>{situation}</p><p><b>THEN</b>Waiting for the person who remembers to describe their world.</p><p><b>BRIDGE</b>Light, place, objects, and motion - visibly marked imagined.</p></div>{!job || job.status === "FAILED" ? <button className="button button-sun" onClick={createScene}>Render an 8-second visual bridge <span>Open</span></button> : null}{error && <p className="form-error">{error}</p>}</div></section>;
}
