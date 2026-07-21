import Link from "next/link";
import { AgeLens } from "../components/age-lens";

export default function HomePage() {
  return <main className="landing">
    <nav className="site-nav"><Link className="wordmark" href="/">recollection<span>.</span></Link><div><Link className="nav-link" href="#age-lens">The age chain</Link><Link className="button button-quiet" href="/login">Enter your timeline</Link></div></nav>
    <section className="portal-hero"><div className="hero-copy"><p className="kicker">The Age Chain</p><h1>Meet them<br/>when they were <em>you.</em></h1><p className="hero-lede">At this exact age, your parent or grandparent was walking toward a life they could not yet see. Recollection lets you ask what that felt like.</p><div className="hero-actions"><Link className="button button-sun" href="/login">Find my first age bridge <span>→</span></Link><a className="text-action" href="#age-lens">Turn the lens <span>↓</span></a></div></div><div className="portal-art" aria-label="A stylized time portal between then and now"><div className="portal-aura"/><div className="portal-ring portal-ring-outer"/><div className="portal-ring portal-ring-inner"/><div className="portal-photo"><span>THEN</span><b>Dad, 26</b><small>1989 · A first apartment</small></div><div className="portal-now"><span>NOW</span><b>You, 26</b><small>2026 · A first leap</small></div><div className="portal-thread"><i/><i/><i/></div><p className="portal-quote">“What were you afraid of<br/>when you were my age?”</p></div></section>
    <section className="truth-banner"><span className="truth-dot"/>Your family stays the author. Recollection labels every original, spoken, and imagined detail.</section>
    <div id="age-lens"><AgeLens/></div>
    <section className="crossing"><div><p className="kicker">One age. Two lives.</p><h2>This is not a memory book.</h2></div><p>It is the conversation that becomes possible when you realize your father had the same age, your mother had the same fear, and neither of you knew it until now.</p><Link className="text-action" href="/login">Start an age bridge <span>→</span></Link></section>
    <footer className="site-footer"><span>Made for the questions that arrive right on time.</span><Link href="/privacy">Privacy & care</Link></footer>
  </main>;
}
