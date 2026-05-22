import React from "react";
import { Link, useParams } from "react-router-dom";
import type { PPDTSet } from "@/lib/ppdt/mock";

interface InstructionScreenProps {
  setData: PPDTSet;
  onBegin: () => void;
}

const instructions = [
  {
    number: 1,
    title: "Observation Phase (30 seconds)",
    description:
      "A blurred picture will be shown for 30 seconds. Observe it carefully and start building your story in your mind.",
  },
  {
    number: 2,
    title: "Writing Phase (4 minutes 30 seconds)",
    description:
      "The picture becomes clear. Write a story of at least 50 words based on what you see. Include what led to the situation, what is happening now, and what will happen next.",
  },
  {
    number: 3,
    title: "4 Pictures Total",
    description:
      "You will go through 4 pictures in sequence. A short 'Get Ready' screen will appear between each picture.",
  },
  {
    number: 4,
    title: "Auto-Submit",
    description:
      "If you do not submit before the timer ends, your story will be auto-submitted with whatever you have written.",
  },
];

export function InstructionScreen({ setData, onBegin }: InstructionScreenProps) {
  const { id: courseId } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-[#0a1628] text-white flex flex-col">
      {/* Breadcrumb */}
      <div className="px-6 py-4">
        <Link
          to={`/courses/${courseId}`}
          style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.875rem" }}
          className="hover:text-white transition-colors"
        >
          ← Back to Course
        </Link>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div
          className="w-full max-w-2xl rounded-2xl p-8 md:p-10"
          style={{
            border: "1.5px solid #c9a84c",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          {/* Title */}
          <h1
            style={{
              fontFamily: "Rajdhani, sans-serif",
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "#c9a84c",
              marginBottom: "0.25rem",
              lineHeight: 1.2,
            }}
          >
            PPDT
          </h1>
          <p
            style={{
              fontFamily: "Rajdhani, sans-serif",
              fontSize: "1rem",
              color: "rgba(255,255,255,0.6)",
              marginBottom: "1.75rem",
            }}
          >
            Picture Perception &amp; Description Test
          </p>

          {/* How It Works */}
          <h2
            style={{
              fontFamily: "Rajdhani, sans-serif",
              fontSize: "1.125rem",
              fontWeight: 600,
              color: "#c9a84c",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "1.25rem",
            }}
          >
            How It Works
          </h2>

          <div className="space-y-4 mb-6">
            {instructions.map((item) => (
              <div key={item.number} className="flex gap-4">
                <div
                  style={{
                    minWidth: "2rem",
                    height: "2rem",
                    borderRadius: "50%",
                    background: "#c9a84c",
                    color: "#0a1628",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Rajdhani, sans-serif",
                    fontWeight: 700,
                    fontSize: "1rem",
                    flexShrink: 0,
                  }}
                >
                  {item.number}
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: "Rajdhani, sans-serif",
                      fontWeight: 600,
                      fontSize: "1rem",
                      color: "white",
                      marginBottom: "0.2rem",
                    }}
                  >
                    {item.title}
                  </p>
                  <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.65)" }}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Warning box */}
          <div
            className="rounded-lg p-4 mb-6"
            style={{
              border: "1px solid #f59e0b",
              background: "rgba(245,158,11,0.07)",
            }}
          >
            <p
              style={{
                fontFamily: "Rajdhani, sans-serif",
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "#f59e0b",
              }}
            >
              ⚠️ Important: Once started, you cannot pause or go back. Make sure you are in a
              quiet place with a stable internet connection before beginning.
            </p>
          </div>

          {/* Time note */}
          <p
            style={{
              fontSize: "0.8rem",
              color: "rgba(255,255,255,0.4)",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            Total Time: ~20 minutes for 4 pictures
          </p>

          {/* Begin button */}
          <button
            onClick={onBegin}
            style={{
              width: "100%",
              padding: "0.875rem 2rem",
              background: "#c9a84c",
              color: "#0a1628",
              border: "none",
              borderRadius: "0.5rem",
              fontFamily: "Rajdhani, sans-serif",
              fontSize: "1.125rem",
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.05em",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background = "#b8963e")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background = "#c9a84c")
            }
          >
            Begin Test
          </button>
        </div>
      </div>
    </div>
  );
}
