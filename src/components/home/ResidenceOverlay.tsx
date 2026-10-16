import type { RefObject } from "react";
import { residenceCallouts } from "../../content/heroWalkthrough";

export function ResidenceOverlay({ overlay }: { overlay: RefObject<HTMLDivElement | null> }) {
  return <div className="residence-overlay" ref={overlay} aria-hidden="true">
    <div className="residence-caption">
      <p className="residence-index">THE RESIDENCE / <span data-residence-index>01 — 08</span></p>
      <h2 data-residence-title>The residence</h2>
      <p data-residence-subtitle>Architecture in every detail</p>
    </div>
    <div className="residence-levels">
      <p>RESIDENCE / <span data-residence-level>EXTERIOR</span></p>
      {[3,2,1,0].map(level=><div className="residence-level" data-level={level} key={level}>
        <span>0{level}</span><i /><span>{["Ground","First","Second","Third"][level]}</span>
      </div>)}
    </div>
    <svg className="residence-callouts">
      {residenceCallouts.map((callout,i)=><g key={callout.text} data-callout={i} opacity="0">
        <circle r="3" fill="currentColor" />
        <path fill="none" stroke="currentColor" strokeWidth="0.8" />
        <text fontSize="10" fill="currentColor">{callout.text}</text>
      </g>)}
    </svg>
    <div className="residence-timeline"><span data-residence-progress /></div>
  </div>;
}
