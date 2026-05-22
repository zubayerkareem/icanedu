import React from "react";

interface CircularTimerProps {
  totalSeconds: number;
  remainingSeconds: number;
  size?: number;
  urgent?: boolean;
}

export function CircularTimer({
  totalSeconds,
  remainingSeconds,
  size = 140,
  urgent = false,
}: CircularTimerProps) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const fraction = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
  const offset = circumference * (1 - fraction);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeLabel = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const progressColor = urgent ? "#ef4444" : "#c9a84c";

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label={`Timer: ${timeLabel}`}
    >
      {/* Background circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={8}
      />

      {/* Progress arc */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={progressColor}
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{
          transform: "rotate(-90deg)",
          transformOrigin: "center",
          transition: "stroke-dashoffset 1s linear, stroke 0.3s ease",
        }}
      />

      {/* Center time text */}
      <text
        x={center}
        y={center}
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize={20}
        fontFamily="Rajdhani, sans-serif"
        fontWeight={600}
      >
        {timeLabel}
      </text>
    </svg>
  );
}
