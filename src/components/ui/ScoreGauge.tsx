interface ScoreGaugeProps {
  score: number;
  label: string;
  size?: number;
}

export function ScoreGauge({ score, label, size = 128 }: ScoreGaugeProps) {
  const radius = size / 2 - 6;
  const circumference = 2 * Math.PI * radius;

  // A non-finite score (e.g. reading a field the API never sent) previously
  // produced NaN here, which rendered as an empty ring with no number. Fall
  // back to an empty track so the gauge still reads as "not scored".
  const isValid = Number.isFinite(score);
  const clamped = isValid ? Math.min(100, Math.max(0, score)) : 0;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={4}
            className="stroke-muted/80 dark:stroke-muted"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={4}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="stroke-accent transition-[stroke-dashoffset] duration-700 ease-out dark:stroke-accent-dark"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-mono text-3xl font-medium tabular-nums"
            role="img"
            aria-label={isValid ? `${label}: ${score} out of 100` : `${label}: not scored`}
          >
            {isValid ? score : "—"}
          </span>
        </div>
      </div>
      <span className="text-xs text-ink-muted dark:text-ink-muted-dark">{label}</span>
    </div>
  );
}
