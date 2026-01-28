"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CameraProvider, useCamera } from "./CameraProvider";
import captureFrame from "./captureFrame";
import downloadStrip from "./downloadStrip";

function CameraPageContent() {
  const { videoRef, startCamera, stopCamera } = useCamera();
  const searchParams = useSearchParams();

  // Get frame count from URL, default to 3
  const TOTAL_FRAMES = parseInt(searchParams.get("frames")) || 3;

  const [frames, setFrames] = useState(Array(TOTAL_FRAMES).fill(null));
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Start camera on mount
  useEffect(() => {
    startCamera();
    setIsCameraActive(true);
    return () => stopCamera();
  }, []);

  // Capture current frame
  const handleCapture = () => {
    const image = captureFrame(videoRef.current);
    if (!image) return;

    setFrames(prev => {
      const updated = [...prev];
      updated[currentFrame] = image;
      return updated;
    });

    stopCamera();
    setIsCameraActive(false);

    if (currentFrame < TOTAL_FRAMES - 1) {
      setTimeout(() => {
        setCurrentFrame(prev => prev + 1);
        startCamera();
        setIsCameraActive(true);
      }, 300);
    }
  };

  // Retake specific frame
  const handleRetake = (frameIndex) => {
    setFrames(prev => {
      const updated = [...prev];
      updated[frameIndex] = null;
      return updated;
    });

    setCurrentFrame(frameIndex);
    startCamera();
    setIsCameraActive(true);
  };

  // HARD EXIT — guaranteed camera release
  const handleBack = () => {
    stopCamera();
    window.location.replace("/");
  };

  const allFramesCaptured = frames.every(frame => frame !== null);

  // Dynamically adjust frame height based on total frames to prevent scrolling
  const getFrameHeight = () => {
    switch (TOTAL_FRAMES) {
      case 3:
        return "180px"; // Comfortable size for 3 frames
      case 4:
        return "140px"; // Slightly smaller for 4
      case 5:
        return "110px"; // Compact for 5
      default:
        return "140px";
    }
  };

  const frameHeight = getFrameHeight();

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        padding: "20px 20px 30px 20px",
      }}
    >
      <h2 style={{ margin: "0 0 8px 0" }}>Photobooth</h2>

      {/* VERTICAL FRAME STRIP - Classic Photobooth Style */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {frames.map((frame, index) => (
          <div
            key={index}
            style={{
              width: "280px",
              height: frameHeight,
              borderRadius: "8px",
              overflow: "hidden",
              background: "#000",
              position: "relative",
              border: index === currentFrame && isCameraActive ? "3px solid #a3cefd" : "none",
            }}
          >
            {frame ? (
              <>
                <img
                  src={frame}
                  alt={`Frame ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <button
                  onClick={() => handleRetake(index)}
                  style={{
                    position: "absolute",
                    bottom: "6px",
                    right: "6px",
                    padding: "4px 10px",
                    fontSize: "11px",
                    background: "rgba(255,255,255,0.95)",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Retake
                </button>
              </>
            ) : index === currentFrame && isCameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              // Empty frame placeholder
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#666",
                  fontSize: "14px",
                }}
              >
                Frame {index + 1}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CONTROLS */}
      <div style={{ marginTop: "8px", display: "flex", gap: "10px" }}>
        {isCameraActive && (
          <button
            onClick={handleCapture}
            style={{
              padding: "12px 28px",
              fontSize: "16px",
              fontWeight: "600",
              background: " #a3cefd",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Capture
          </button>
        )}

        {allFramesCaptured && (
          <button
            onClick={() => downloadStrip(frames)}
            style={{
              padding: "12px 28px",
              fontSize: "16px",
              fontWeight: "600",
              background: "#71ac7e",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
             Download
          </button>
        )}

        <button
          onClick={handleBack}
          style={{
            padding: "12px 28px",
            fontSize: "16px",
            fontWeight: "600",
            background: "#6c757d",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
      </div>
    </main>
  );
}

export default function CameraPage() {
  return (
    <CameraProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <CameraPageContent />
      </Suspense>
    </CameraProvider>
  );
}
