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

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
      }}
    >
      <h2>Photobooth</h2>

      {/* FRAME STRIP */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {frames.map((frame, index) => (
          <div
            key={index}
            style={{
              width: "260px",
              height: "140px",
              borderRadius: "12px",
              overflow: "hidden",
              background: "#000",
              position: "relative",
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
                    bottom: "8px",
                    right: "8px",
                    padding: "4px 8px",
                    fontSize: "12px",
                    background: "rgba(255,255,255,0.9)",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer",
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
            ) : null}
          </div>
        ))}
      </div>

      {/* CONTROLS */}
      <div style={{ marginTop: "12px" }}>
        {isCameraActive && (
          <button onClick={handleCapture} style={{ marginRight: "8px" }}>
            Capture
          </button>
        )}

        {allFramesCaptured && (
          <button
            onClick={() => downloadStrip(frames)}
            style={{ marginRight: "8px" }}
          >
            Download
          </button>
        )}

        <button onClick={handleBack}>Back</button>
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
