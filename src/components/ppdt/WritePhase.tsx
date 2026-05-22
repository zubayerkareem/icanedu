import React, { useEffect, useRef, useState } from "react";
import type { PPDTPicture } from "@/lib/ppdt/mock";
import { useCountdown } from "@/hooks/useCountdown";
import { CircularTimer } from "./CircularTimer";
import { clearDraft, loadDraft, saveDraft } from "@/lib/ppdt/storage";

interface WritePhaseProps {
  picture: PPDTPicture;
  pictureIndex: number;
  totalPictures: number;
  courseId: string;
  onSubmit: (
    story: string,
    wordCount: number,
    timeTaken: number,
    autoSubmitted: boolean
  ) => void;
}

function countWords(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

export function WritePhase({
  picture,
  pictureIndex,
  totalPictures,
  courseId,
  onSubmit,
}: WritePhaseProps) {
  const TOTAL_SECONDS = 270;
  const { remaining, start, pause } = useCountdown(TOTAL_SECONDS);
  const [text, setText] = useState("");
  const [visible, setVisible] = useState(false);
  const startedRef = useRef(false);
  const remainingRef = useRef(TOTAL_SECONDS);
  const submittedRef = useRef(false);
  const textRef = useRef("");

  // Keep refs in sync
  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    // Fade in
    const fadeTimer = setTimeout(() => setVisible(true), 30);

    // Load draft
    const draft = loadDraft(courseId, picture.picture_number);
    if (draft) {
      setText(draft);
    }

    // Start countdown - on end: auto submit
    if (!startedRef.current) {
      startedRef.current = true;
      start(() => {
        if (!submittedRef.current) {
          submittedRef.current = true;
          const currentText = textRef.current;
          const wc = countWords(currentText);
          clearDraft(courseId, picture.picture_number);
          onSubmit(currentText, wc, TOTAL_SECONDS, true);
        }
      });
    }

    return () => clearTimeout(fadeTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    saveDraft(courseId, picture.picture_number, val);
  };

  const handleManualSubmit = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    pause();
    const wc = countWords(text);
    const timeTaken = TOTAL_SECONDS - remainingRef.current;
    clearDraft(courseId, picture.picture_number);
    onSubmit(text, wc, timeTaken, false);
  };

  const wordCount = countWords(text);
  const canSubmit = text.length >= 50;
  const wordCountGold = wordCount >= 50;

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
          totalSeconds={TOTAL_SECONDS}
          remainingSeconds={remaining}
          size={80}
          urgent={remaining <= 60}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left panel - Image (40%) */}
        <div
          className="md:w-2/5 flex flex-col items-center justify-center p-6"
          style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div
            className="w-full rounded-xl overflow-hidden"
            style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
          >
            <img
              src={picture.image_url}
              alt={`PPDT Picture ${pictureIndex}`}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
          <p
            style={{
              fontFamily: "Rajdhani, sans-serif",
              fontSize: "0.875rem",
              color: "rgba(255,255,255,0.4)",
              marginTop: "0.75rem",
              textAlign: "center",
            }}
          >
            Picture {pictureIndex}
          </p>
        </div>

        {/* Right panel - Writing (60%) */}
        <div className="md:w-3/5 flex flex-col p-6 gap-4">
          <h2
            style={{
              fontFamily: "Rajdhani, sans-serif",
              fontSize: "1.25rem",
              fontWeight: 600,
              color: "rgba(255,255,255,0.9)",
            }}
          >
            Write your story
          </h2>

          <textarea
            value={text}
            onChange={handleTextChange}
            placeholder="Write your story here... Describe who is in the picture, what is happening, what led to this situation, and what will happen next."
            style={{
              flex: 1,
              minHeight: "300px",
              background: "#0d1f3c",
              color: "white",
              border: "1.5px solid rgba(201,168,76,0.3)",
              borderRadius: "0.5rem",
              padding: "1rem",
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: "1rem",
              lineHeight: 1.7,
              resize: "vertical",
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => {
              (e.target as HTMLTextAreaElement).style.borderColor = "#c9a84c";
            }}
            onBlur={(e) => {
              (e.target as HTMLTextAreaElement).style.borderColor =
                "rgba(201,168,76,0.3)";
            }}
          />

          {/* Bottom controls */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex flex-col gap-1">
              <span
                style={{
                  fontFamily: "Rajdhani, sans-serif",
                  fontSize: "0.9rem",
                  color: wordCountGold ? "#c9a84c" : "rgba(255,255,255,0.5)",
                  fontWeight: wordCountGold ? 600 : 400,
                  transition: "color 0.3s",
                }}
              >
                {wordCount} words
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.35)",
                }}
              >
                Auto-submits when timer ends
              </span>
            </div>

            <button
              onClick={handleManualSubmit}
              disabled={!canSubmit}
              style={{
                padding: "0.625rem 1.75rem",
                background: canSubmit ? "#c9a84c" : "rgba(255,255,255,0.1)",
                color: canSubmit ? "#0a1628" : "rgba(255,255,255,0.3)",
                border: "none",
                borderRadius: "0.5rem",
                fontFamily: "Rajdhani, sans-serif",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: canSubmit ? "pointer" : "not-allowed",
                transition: "background 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                if (canSubmit)
                  (e.currentTarget as HTMLButtonElement).style.background = "#b8963e";
              }}
              onMouseLeave={(e) => {
                if (canSubmit)
                  (e.currentTarget as HTMLButtonElement).style.background = "#c9a84c";
              }}
            >
              Submit Story
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
