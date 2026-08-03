/**
 * Brand panel scene: a faint perspective court, a soft gold glow, and a
 * pickleball that drops in, loses height over four bounces, rolls to a
 * stop, rests, and fades before the sequence repeats. Pure CSS, hidden
 * from screen readers, frozen under prefers-reduced-motion.
 */
export function CourtScene() {
  return (
    <div className="pb-scene" aria-hidden="true">
      <div className="pb-glow" />
      <svg
        className="pb-court"
        viewBox="0 0 600 400"
        preserveAspectRatio="xMidYMax slice"
        fill="none"
      >
        {/* Court boundary in perspective */}
        <path
          d="M220 110 L380 110 L560 370 L40 370 Z"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1.5"
        />
        {/* Center line */}
        <path
          d="M300 110 L300 370"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1.5"
        />
        {/* Net */}
        <path
          d="M150 210 L450 210"
          stroke="rgba(255,255,255,0.13)"
          strokeWidth="2"
        />
        <path
          d="M150 196 L150 210"
          stroke="rgba(255,255,255,0.09)"
          strokeWidth="1.5"
        />
        <path
          d="M450 196 L450 210"
          stroke="rgba(255,255,255,0.09)"
          strokeWidth="1.5"
        />
        {/* Non-volley zone lines in gold */}
        <path
          d="M169 183 L431 183"
          stroke="rgba(249,224,29,0.14)"
          strokeWidth="1.5"
        />
        <path
          d="M124 249 L476 249"
          stroke="rgba(249,224,29,0.14)"
          strokeWidth="1.5"
        />
      </svg>
      <div className="pb-floor" />
      <div className="pb-move">
        <div className="pb-shadow" />
        <div className="pb-y">
          <div className="pb-ball" />
        </div>
      </div>
    </div>
  );
}
