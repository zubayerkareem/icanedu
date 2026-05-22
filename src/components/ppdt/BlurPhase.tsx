import React, { useEffect, useState } from "react";
import type { PPDTPicture } from "@/lib/ppdt/mock";
import { useCountdown } from "@/hooks/useCountdown";
import { CircularTimer } from "./CircularTimer";

interface BlurPhaseProps {
  picture: PPDTPicture;
  pictureIndex: number;
  totalPictures: number;
  onPhaseEnd: () => void;
}

export function BlurPhase({
  picture,
  pictureIndex,
  totalPictures,
  onPhaseEnd,
}: BlurPhaseProps) {
  const { remaining, start } = useCountdown(30);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setVisible(true), 30);
    start(onPhaseEnd);
    return () => clearTimeout(fadeTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="min-h-screen bg-[#0a1628] text-white flex flex-col"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease-in",
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <span
          style={{
            fontFamily: "Rajdhani, sans-serif",
            fontWeight: 600,
            fontSize: "1.1rem",
            color: "rgba(255,255,255,0.75)",
          }}
        >
          Picture {pictureIndex} of {totalPictures}
        </span>

        <CircularTimer
          totalSeconds={30}
          remainingSeconds={remaining}
          size={80}
          urgent={remaining <= 5}
        />
      </div>

      {/* Image */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-6">
        <div
          className="w-full max-w-3xl rounded-xl overflow-hidden"
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}
        >
          <img
            src={picture.image_url}
            alt={`PPDT Picture ${pictureIndex}`}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              filter: "blur(8px)",
              transition: "filter 0.3s",
            }}
          />
        </div>

        {/* Bottom label */}
        <p
          style={{
            fontFamily: "Rajdhani, sans-serif",
            fontSize: "1rem",
            color: "rgba(255,255,255,0.55)",
            textAlign: "center",
          }}
        >
          Observe the picture carefully — build your story
        </p>
      </div>
    </div>
  );
}
