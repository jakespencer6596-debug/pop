/**
 * Decorative pickleball scene for the ink brand panel: a faint perspective
 * court with a ball that dribbles across the floor. Pure CSS animation,
 * hidden from screen readers, frozen under prefers-reduced-motion.
 */
export function CourtScene() {
  return (
    <div className="pb-scene" aria-hidden="true">
      <svg
        className="pb-court"
        viewBox="0 0 600 400"
        preserveAspectRatio="xMidYMax slice"
        fill="none"
      >
        {/* Court boundary in perspective */}
        <path
          d="M220 110 L380 110 L560 370 L40 370 Z"
          stroke="rgba(255,255,255,0.09)"
          strokeWidth="1.5"
        />
        {/* Center line */}
        <path
          d="M300 110 L300 370"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1.5"
        />
        {/* Net */}
        <path
          d="M150 210 L450 210"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="2"
        />
        <path
          d="M150 196 L150 210"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth="1.5"
        />
        <path
          d="M450 196 L450 210"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth="1.5"
        />
        {/* Non-volley zone lines in gold */}
        <path
          d="M169 183 L431 183"
          stroke="rgba(249,224,29,0.16)"
          strokeWidth="1.5"
        />
        <path
          d="M124 249 L476 249"
          stroke="rgba(249,224,29,0.16)"
          strokeWidth="1.5"
        />
      </svg>
      <div className="pb-floor" />
      <div className="pb-ball-x">
        <div className="pb-shadow" />
        <div className="pb-ball-y">
          <div className="pb-ball" />
        </div>
      </div>
    </div>
  );
}
