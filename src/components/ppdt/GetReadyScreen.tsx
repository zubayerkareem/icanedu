import React, { useEffect, useState } from "react";
import { useCountdown } from "@/hooks/useCountdown";
import { CircularTimer } from "./CircularTimer";

interface GetReadyScreenProps {
  nextPictureNumber: number;
  onReady: () => void;
}

export function GetReadyScreen({ nextPictureNumber, onReady }: GetReadyScreenProps) {
  const { remaining, start } = useCountdown(5);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger fade-in
    const fadeTimer = setTimeout(() => setVisible(true), 30);
    // Start countdown
    start(onReady);
    return () => clearTimeout(fadeTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-[#0a1628]"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease-in",
      }}
    >
      <div className="flex flex-col items-center gap-6">
        <CircularTimer
          totalSeconds={5}
          remainingSeconds={remaining}
          size={160}
          urgent={remaining <= 3}
        />

        <h2
          style={{
            fontFamily: "Rajdhani, sans-serif",
            fontSize: "2.5rem",
            fontWeight: 700,
            color: "#c9a84c",
            letterSpacing: "0.05em",
          }}
        >
          Get Ready
        </h2>

        <p
          style={{
            fontFamily: "Rajdhani, sans-serif",
            fontSize: "1.25rem",
            color: "rgba(255,255,255,0.75)",
          }}
        >
          Picture {nextPictureNumber} is next
        </p>
      </div>
    </div>
  );
}
