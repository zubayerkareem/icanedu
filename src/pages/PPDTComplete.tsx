import React, { useState } from "react";
import { Link } from "react-router-dom";
import type { PPDTSubmission } from "@/lib/ppdt/storage";

interface PPDTCompleteProps {
  submissions: PPDTSubmission[];
  setName: string;
  courseId: string;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

export function PPDTComplete({ submissions, setName, courseId }: PPDTCompleteProps) {
  const [showStories, setShowStories] = useState(false);

  const getSubmission = (picNum: number): PPDTSubmission | undefined =>
    submissions.find((s) => s.picture_number === picNum);

  return (
    <div className="min-h-screen bg-[#0a1628] text-white flex flex-col items-center px-4 py-12">
      {/* Trophy */}
      <div style={{ fontSize: "4rem", marginBottom: "0.5rem" }}>🏆</div>

      <h1
        style={{
          fontFamily: "Rajdhani, sans-serif",
          fontSize: "2.25rem",
          fontWeight: 700,
          color: "#c9a84c",
          marginBottom: "0.25rem",
          textAlign: "center",
        }}
      >
        Test Complete!
      </h1>

      <p
        style={{
          fontFamily: "Rajdhani, sans-serif",
          fontSize: "1rem",
          color: "rgba(255,255,255,0.55)",
          marginBottom: "2.5rem",
          textAlign: "center",
        }}
      >
        {setName}
      </p>

      {/* Summary table */}
      <div
        className="w-full max-w-3xl rounded-xl overflow-hidden"
        style={{ border: "1.5px solid #c9a84c" }}
      >
        {/* Table header */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr",
            background: "rgba(201,168,76,0.12)",
            borderBottom: "1px solid rgba(201,168,76,0.3)",
          }}
        >
          {["Picture #", "Story Length", "Words", "Time Used", "Status"].map(
            (col) => (
              <div
                key={col}
                style={{
                  padding: "0.75rem 1rem",
                  fontFamily: "Rajdhani, sans-serif",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  color: "#c9a84c",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {col}
              </div>
            )
          )}
        </div>

        {/* Rows */}
        {[1, 2, 3, 4].map((picNum) => {
          const sub = getSubmission(picNum);
          const isAuto = sub?.auto_submitted ?? false;

          return (
            <div
              key={picNum}
              className="grid"
              style={{
                gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: isAuto
                  ? "rgba(245,158,11,0.07)"
                  : "transparent",
              }}
            >
              {/* Picture # */}
              <div
                style={{
                  padding: "0.75rem 1rem",
                  fontFamily: "Rajdhani, sans-serif",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  color: "white",
                }}
              >
                {picNum}
              </div>

              {/* Story length (chars) */}
              <div
                style={{
                  padding: "0.75rem 1rem",
                  fontSize: "0.875rem",
                  color: "rgba(255,255,255,0.65)",
                }}
              >
                {sub ? `${sub.story_text.length} characters` : "—"}
              </div>

              {/* Words */}
              <div
                style={{
                  padding: "0.75rem 1rem",
                  fontSize: "0.875rem",
                  color: sub ? (sub.word_count >= 50 ? "#c9a84c" : "rgba(255,255,255,0.65)") : "rgba(255,255,255,0.3)",
                }}
              >
                {sub ? sub.word_count : "—"}
              </div>

              {/* Time used */}
              <div
                style={{
                  padding: "0.75rem 1rem",
                  fontSize: "0.875rem",
                  color: "rgba(255,255,255,0.65)",
                }}
              >
                {sub ? formatTime(sub.time_taken) : "—"}
              </div>

              {/* Status */}
              <div
                style={{
                  padding: "0.75rem 1rem",
                  fontSize: "0.8rem",
                  fontFamily: "Rajdhani, sans-serif",
                  fontWeight: 600,
                  color: !sub
                    ? "rgba(255,255,255,0.3)"
                    : isAuto
                    ? "#f59e0b"
                    : "#22c55e",
                }}
              >
                {!sub ? "Not Submitted" : isAuto ? "Auto-Submitted" : "Submitted"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 mt-8 flex-wrap justify-center">
        <button
          onClick={() => setShowStories((v) => !v)}
          style={{
            padding: "0.75rem 1.75rem",
            background: "transparent",
            color: "#c9a84c",
            border: "1.5px solid #c9a84c",
            borderRadius: "0.5rem",
            fontFamily: "Rajdhani, sans-serif",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(201,168,76,0.1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          {showStories ? "Hide Stories" : "View My Stories"}
        </button>

        <Link
          to={`/courses/${courseId}`}
          style={{
            padding: "0.75rem 1.75rem",
            background: "#c9a84c",
            color: "#0a1628",
            borderRadius: "0.5rem",
            fontFamily: "Rajdhani, sans-serif",
            fontSize: "1rem",
            fontWeight: 700,
            textDecoration: "none",
            display: "inline-block",
            transition: "background 0.2s",
          }}
        >
          Back to Course
        </Link>
      </div>

      {/* Expandable stories */}
      {showStories && (
        <div className="w-full max-w-3xl mt-8 space-y-4">
          {[1, 2, 3, 4].map((picNum) => {
            const sub = getSubmission(picNum);
            return (
              <div
                key={picNum}
                className="rounded-xl p-5"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <p
                  style={{
                    fontFamily: "Rajdhani, sans-serif",
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: "#c9a84c",
                    marginBottom: "0.5rem",
                  }}
                >
                  Picture {picNum}
                  {sub?.auto_submitted && (
                    <span
                      style={{
                        marginLeft: "0.75rem",
                        fontSize: "0.75rem",
                        color: "#f59e0b",
                        fontWeight: 400,
                      }}
                    >
                      (auto-submitted)
                    </span>
                  )}
                </p>
                {sub ? (
                  <p
                    style={{
                      fontFamily: "'Source Serif 4', Georgia, serif",
                      fontSize: "0.9375rem",
                      lineHeight: 1.7,
                      color: "rgba(255,255,255,0.8)",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {sub.story_text || <em style={{ color: "rgba(255,255,255,0.3)" }}>No story written.</em>}
                  </p>
                ) : (
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "rgba(255,255,255,0.3)",
                      fontStyle: "italic",
                    }}
                  >
                    Not submitted.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
