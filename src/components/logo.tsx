/**
 * HARF monogram: HA over RF in a frame, split by a crimson rule.
 * Inherits its color from `currentColor`, so it works on light and navy.
 */
export function Monogram({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 84" role="img" aria-label="HARF" className={className}>
      <rect x="2" y="2" width="60" height="80" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <text
        x="32"
        y="37"
        textAnchor="middle"
        fontSize="30"
        letterSpacing="2"
        fill="currentColor"
        style={{ fontFamily: "var(--font-newsreader), Georgia, serif" }}
      >
        HA
      </text>
      <line x1="10" y1="43" x2="54" y2="43" stroke="var(--accent)" strokeWidth="2.5" />
      <text
        x="32"
        y="73"
        textAnchor="middle"
        fontSize="30"
        letterSpacing="2"
        fill="currentColor"
        style={{ fontFamily: "var(--font-newsreader), Georgia, serif" }}
      >
        RF
      </text>
    </svg>
  );
}
