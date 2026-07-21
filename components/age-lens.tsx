"use client";

import { useMemo, useState } from "react";

const moments = [
  { age: 18, year: "1981", line: "Your mother was leaving home for the first time.", label: "First departure" },
  { age: 23, year: "1986", line: "Your father had just started a job he did not feel ready for.", label: "First leap" },
  { age: 26, year: "1989", line: "He was learning what to keep and what to leave behind.", label: "The turning year" },
  { age: 31, year: "1994", line: "She was holding a new baby and a future she could not yet see.", label: "New orbit" },
];

export function AgeLens() {
  const [age, setAge] = useState(26);
  const moment = useMemo(() => moments.reduce((closest, item) => Math.abs(item.age - age) < Math.abs(closest.age - age) ? item : closest), [age]);
  return <section className="age-lens" aria-label="Explore a family age bridge">
    <div className="lens-orbit lens-orbit-one"/><div className="lens-orbit lens-orbit-two"/>
    <div className="lens-head"><p className="kicker">Try the age lens</p><h2>How old are you<br/>right now?</h2><p>Move through the years. Somewhere, a person you love was standing at the same threshold.</p></div>
    <div className="lens-core">
      <div className="age-number" aria-live="polite"><span>{age}</span><small>your age</small></div>
      <div className="memory-window"><div className="window-grain"/><p>Then · {moment.year}</p><strong>Dad, {moment.age}</strong><span>{moment.label}</span></div>
      <div className="lens-caption"><b>{moment.line}</b><span>This is a possible bridge, not a claim about their life.</span></div>
    </div>
    <div className="age-control"><input aria-label="Your current age" type="range" min="18" max="38" value={age} onChange={(event) => setAge(Number(event.target.value))}/><div><span>18</span><span>28</span><span>38</span></div></div>
  </section>;
}
