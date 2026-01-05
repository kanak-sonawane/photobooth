"use client";

import { useEffect, useState } from "react";
import { CameraProvider, useCamera } from "./CameraProvider";
import captureFrame from "./captureFrame";
import CameraView from "./CameraView";




function CameraPageContent() {
  const { videoRef, startCamera, stopCamera } = useCamera();

  const TOTAL_FRAMES = 3;
  const [frames, setFrames] = useState(Array(TOTAL_FRAMES).fill(null));
  const [currentFrame, setCurrentFrame] = useState(0);

  // Start camera on mount
  useEffect(() => {
    startCamera();
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

    stopCamera(); // 🔥 CAMERA OFF AFTER EACH CAPTURE

    if (currentFrame < TOTAL_FRAMES - 1) {
      setTimeout(() => {
        setCurrentFrame(prev => prev + 1);
        startCamera(); // restart for next frame
      }, 300);
    }
  };

  // Retake current frame
  const handleRetake = () => {
    setFrames(prev => {
      const updated = [...prev];
      updated[currentFrame] = null;
      return updated;
    });

    startCamera();
  };

  // HARD EXIT — guaranteed camera release
  const handleBack = () => {
    stopCamera();
    window.location.replace("/");
  };

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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {frames.map((frame, index) => (
          <div
            key={index}
            style={{
              width: "260px",
              height: "140px",
              borderRadius: "12px",
              overflow: "hidden",
              background: "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {frame ? (
              <img
                src={frame}
                alt={`Frame ${index + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : index === currentFrame ? (
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
        {currentFrame < TOTAL_FRAMES && (
          <button onClick={handleCapture} style={{ marginRight: "8px" }}>
            Capture
          </button>
        )}

        {frames[currentFrame] && (
          <button onClick={handleRetake} style={{ marginRight: "8px" }}>
            Retake
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
      <CameraPageContent />
    </CameraProvider>
  );
}
