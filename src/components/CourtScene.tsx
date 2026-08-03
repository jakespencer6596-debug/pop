/**
 * Brand panel scene: a close-up half court seen from behind the baseline,
 * with a real net (tape, mesh, posts) and a pickleball that drops in,
 * loses height over four bounces, then rolls off the edge of the panel.
 * Pure CSS, hidden from screen readers, frozen under
 * prefers-reduced-motion.
 */
export function CourtScene() {
  return (
    <div className="pb-scene" aria-hidden="true">
      <div className="pb-glow" />
      <svg
        className="pb-court"
        viewBox="0 0 600 460"
        preserveAspectRatio="none"
        fill="none"
      >
        {/* Court surface, split at the kitchen line */}
        <polygon
          points="88,168 512,168 574,290 26,290"
          fill="rgba(249,224,29,0.035)"
        />
        <polygon
          points="26,290 574,290 700,460 -100,460"
          fill="rgba(0,86,184,0.07)"
        />
        {/* Sidelines running past the viewer */}
        <path
          vectorEffect="non-scaling-stroke"
          d="M88 168 L-100 460"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="2"
        />
        <path
          vectorEffect="non-scaling-stroke"
          d="M512 168 L700 460"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="2"
        />
        {/* Kitchen line */}
        <path
          vectorEffect="non-scaling-stroke"
          d="M26 290 L574 290"
          stroke="rgba(249,224,29,0.28)"
          strokeWidth="2.5"
        />
        {/* Center line, kitchen to baseline */}
        <path
          vectorEffect="non-scaling-stroke"
          d="M300 290 L300 460"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth="2"
        />

        {/* Net: posts, mesh, center strap, and a bright top tape */}
        <path
          vectorEffect="non-scaling-stroke"
          d="M84 120 L84 172"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="4"
        />
        <path
          vectorEffect="non-scaling-stroke"
          d="M516 120 L516 172"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="4"
        />
        {/* mesh verticals */}
        <g
          vectorEffect="non-scaling-stroke"
          stroke="rgba(255,255,255,0.11)"
          strokeWidth="1"
        >
          <path vectorEffect="non-scaling-stroke" d="M108 122 L108 166" />
          <path vectorEffect="non-scaling-stroke" d="M132 122 L132 166" />
          <path vectorEffect="non-scaling-stroke" d="M156 122 L156 166" />
          <path vectorEffect="non-scaling-stroke" d="M180 122 L180 166" />
          <path vectorEffect="non-scaling-stroke" d="M204 122 L204 166" />
          <path vectorEffect="non-scaling-stroke" d="M228 122 L228 166" />
          <path vectorEffect="non-scaling-stroke" d="M252 122 L252 166" />
          <path vectorEffect="non-scaling-stroke" d="M276 122 L276 166" />
          <path vectorEffect="non-scaling-stroke" d="M324 122 L324 166" />
          <path vectorEffect="non-scaling-stroke" d="M348 122 L348 166" />
          <path vectorEffect="non-scaling-stroke" d="M372 122 L372 166" />
          <path vectorEffect="non-scaling-stroke" d="M396 122 L396 166" />
          <path vectorEffect="non-scaling-stroke" d="M420 122 L420 166" />
          <path vectorEffect="non-scaling-stroke" d="M444 122 L444 166" />
          <path vectorEffect="non-scaling-stroke" d="M468 122 L468 166" />
          <path vectorEffect="non-scaling-stroke" d="M492 122 L492 166" />
        </g>
        {/* mesh horizontals */}
        <g
          vectorEffect="non-scaling-stroke"
          stroke="rgba(255,255,255,0.11)"
          strokeWidth="1"
        >
          <path vectorEffect="non-scaling-stroke" d="M84 133 L516 133" />
          <path vectorEffect="non-scaling-stroke" d="M84 144 L516 144" />
          <path vectorEffect="non-scaling-stroke" d="M84 155 L516 155" />
        </g>
        {/* center strap */}
        <path
          vectorEffect="non-scaling-stroke"
          d="M300 120 L300 166"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="3"
        />
        {/* bottom band */}
        <path
          vectorEffect="non-scaling-stroke"
          d="M84 166 L516 166"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="2"
        />
        {/* top tape */}
        <path
          vectorEffect="non-scaling-stroke"
          d="M80 120 L520 120"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="5"
        />
      </svg>
      <div className="pb-move">
        <div className="pb-shadow" />
        <div className="pb-y">
          <div className="pb-ball" />
        </div>
      </div>
    </div>
  );
}
