export default function SadFlower({ className }: { className?: string }) {
  return (
    <svg viewBox="20 55 80 100" className={className} aria-hidden="true">
      <g>
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0,60,135; 3,60,135; 0,60,135; -3,60,135; 0,60,135"
          dur="4s"
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1"
        />
        <path
          d="M42 132 L46 146 L74 146 L78 132Z"
          fill="#dad7d4"
          stroke="#443528"
          strokeWidth="2.25"
          strokeLinejoin="round"
        />
        <line
          x1="42"
          y1="132"
          x2="78"
          y2="132"
          stroke="#443528"
          strokeWidth="2.25"
          strokeLinecap="round"
        />
        <path
          d="M60 132 Q58 118 56 108 Q54 100 52 94"
          fill="none"
          stroke="#443528"
          strokeWidth="2.25"
          strokeLinecap="round"
        />
        <path
          d="M56 118 Q44 110 40 116 Q42 122 56 118Z"
          fill="#c1bcb7"
          stroke="#443528"
          strokeWidth="2.25"
          strokeLinejoin="round"
        />
        <path
          d="M58 112 Q70 106 72 112 Q68 118 58 112Z"
          fill="#c1bcb7"
          stroke="#443528"
          strokeWidth="2.25"
          strokeLinejoin="round"
        />
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="-8,52,82; -11,52,82; -8,52,82; -5,52,82; -8,52,82"
            dur="3.5s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1"
          />
          {[0, -51.4, 51.4, -102.9, 102.9, -154.3, 154.3].map((angle) => (
            <ellipse
              key={angle}
              cx="52"
              cy="68"
              rx="7"
              ry="11"
              fill="#e8e6e5"
              stroke="#443528"
              strokeWidth="2.25"
              transform={`rotate(${String(angle)},52,82)`}
            />
          ))}
          <circle
            cx="52"
            cy="82"
            r="12"
            fill="#c1bcb7"
            stroke="#443528"
            strokeWidth="2.25"
          />
          <circle cx="47" cy="78" r="2.5" fill="white" opacity="0.3" />
          <g stroke="#443528" strokeWidth="2.25" strokeLinecap="round">
            <line x1="45" y1="78" x2="49" y2="82" />
            <line x1="49" y1="78" x2="45" y2="82" />
          </g>
          <g stroke="#443528" strokeWidth="2.25" strokeLinecap="round">
            <line x1="55" y1="78" x2="59" y2="82" />
            <line x1="59" y1="78" x2="55" y2="82" />
          </g>
          <path
            fill="none"
            stroke="#443528"
            strokeWidth="2.25"
            strokeLinecap="round"
          >
            <animate
              attributeName="d"
              values="M47 87 Q52 84 57 87; M47 88 Q52 85 57 88; M47 87 Q52 84 57 87"
              dur="3s"
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
            />
          </path>
        </g>
      </g>
    </svg>
  );
}
