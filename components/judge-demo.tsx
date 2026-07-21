"use client";

import Link from "next/link";
import { useState } from "react";

export function JudgeDemo() {
  const [bridgeOpen, setBridgeOpen] = useState(false);

  return (
    <main className="demo-shell">
      <header className="demo-header">
        <Link className="wordmark" href="/">recollection<span>.</span></Link>
        <div>
          <span className="demo-badge"><i /> Judge demo - fictional sample data</span>
          <Link className="quiet-link" href="/login">Use the real private app</Link>
        </div>
      </header>

      <section className="demo-hero">
        <div>
          <p className="kicker">The Age Chain - a three-minute product tour</p>
          <h1>At 26, Maya<br />meets her mother<br /><em>at 26.</em></h1>
          <p>Maya is considering her first job in another city. This is not a generated memory of her mother. It is one honest question for the person who lived that age.</p>
          <div className="demo-source-row">
            <span><i className="legend-original" />Original</span>
            <span><i className="legend-spoken" />Spoken</span>
            <span><i className="legend-imagined" />Imagined</span>
          </div>
        </div>
        <div className="demo-photo-frame" aria-label="Illustrated sample photograph showing a doorway and warm light">
          <span>ORIGINAL</span>
          <b>Her mother,<br />26</b>
          <small>1997 - a first apartment</small>
          <i />
        </div>
      </section>

      <section className="demo-thread">
        <article className="demo-question">
          <p className="kicker">One grounded question</p>
          <blockquote>&ldquo;What did you wish someone had told you when you were choosing your first home?&rdquo;</blockquote>
          <p>GPT-5.6 suggests the opening from Maya&apos;s supplied context. It never supplies the answer.</p>
        </article>
        <article className="demo-answer">
          <div className="response-avatar">M</div>
          <div>
            <p className="kicker">A real answer, in her own words</p>
            <h2>&ldquo;I thought being brave meant not missing home. It actually meant choosing a place, then letting people visit the life I made there.&rdquo;</h2>
            <small>Spoken answer - fictional demo content</small>
          </div>
        </article>
      </section>

      <section className="demo-bridge">
        <div>
          <p className="kicker">Optional visual bridge</p>
          <h2>Atmosphere, never evidence.</h2>
          <p>In the private app, FAL can render a people-free environmental bridge only after the owner chooses it. It never receives a family photo, face, name, voice, or personal context.</p>
          <button type="button" className="button button-sun" onClick={() => setBridgeOpen((open) => !open)} aria-expanded={bridgeOpen}>
            {bridgeOpen ? "Close imagined bridge" : "Reveal imagined bridge"}
          </button>
        </div>
        <div className={bridgeOpen ? "demo-ambient is-open" : "demo-ambient"} aria-live="polite">
          {bridgeOpen ? (
            <>
              <video className="demo-ambient-video" src="/recollection-ambient-bridge.mp4" autoPlay loop muted playsInline aria-label="Imagined people-free room with lamplight, a letter, rain, and moving curtains" />
              <p className="demo-ambient-caption">IMAGINED - an FAL environmental bridge. No family material was used.</p>
            </>
          ) : (
            <>
              <span className="demo-light" />
              <span className="demo-window" />
              <span className="demo-table" />
              <span className="demo-letter" />
              <p>The bridge is deliberately off until you choose it.</p>
            </>
          )}
        </div>
      </section>

      <section className="demo-close">
        <p className="kicker">The product promise</p>
        <h2>Every year of your life, you can meet someone you love at the same age.</h2>
        <p>Try the real flow with a private email link when the Supabase backend is connected.</p>
        <Link className="button button-quiet" href="/login">Open the real private app</Link>
      </section>
    </main>
  );
}
