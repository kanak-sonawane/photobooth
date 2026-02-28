//app\camera\page.jsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CameraProvider, useCamera } from "./CameraProvider";
import captureFrame from "./captureFrame";
import downloadStrip from "./downloadStrip";

function CameraPageContent() {
  const { videoRef, startCamera, stopCamera } = useCamera();
  const searchParams = useSearchParams();
  const router = useRouter();

  const TOTAL_FRAMES = parseInt(searchParams.get("frames")) || 3;

  const [frames, setFrames] = useState(Array(TOTAL_FRAMES).fill(null));
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const [countdown, setCountdown] = useState(null);
  const [countdownRunning, setCountdownRunning] = useState(false);

  // Start camera on mount
  useEffect(() => {
    startCamera();
    setIsCameraActive(true);
    return () => stopCamera();
  }, []);

  // Auto-countdown ONLY for frames after the first (frame 1, 2, 3, 4...)
  useEffect(() => {
    if (!isCameraActive || currentFrame === 0 || countdownRunning) return;

    startCountdown();
  }, [isCameraActive, currentFrame]);

  // Start countdown function
  const startCountdown = () => {
    if (countdownRunning) return;

    setCountdownRunning(true);
    let value = 3;
    setCountdown(value);

    const interval = setInterval(() => {
      value -= 1;
      if (value === 0) {
        clearInterval(interval);
        setCountdown(null);
        setCountdownRunning(false);
        handleCapture();
      } else {
        setCountdown(value);
      }
    }, 1000);
  };

  // ORIGINAL capture logic - UNCHANGED
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

  const handleBack = () => {
    stopCamera();
    window.location.replace("/");
  };

  const allFramesCaptured = frames.every(frame => frame !== null);

  // Handle what happens after all frames are captured
  const handleContinue = () => {
    stopCamera();
    
    // Only 4 frames goes to customize page
    if (TOTAL_FRAMES === 4) {
      // Generate session ID and store frames
      const sessionId = Date.now().toString();
      
      if (typeof window !== 'undefined') {
        if (!window.__PHOTOBOOTH__) {
          window.__PHOTOBOOTH__ = {};
        }
        window.__PHOTOBOOTH__[sessionId] = frames;
      }
      
      router.push(`/customize?frames=${TOTAL_FRAMES}&session=${sessionId}`);
    } else {
      // 3 and 5 frames: direct download
      downloadStrip(frames);
    }
  };

  const getFrameHeight = () => {
    switch (TOTAL_FRAMES) {
      case 3:
        return "180px";
      case 4:
        return "140px";
      case 5:
        return "110px";
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
        padding: "20px",
      }}
    >
      <h2 style={{ margin: "0 0 8px 0" }}>Photobooth</h2>

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
              border:
                index === currentFrame && isCameraActive
                  ? "3px solid #a3cefd"
                  : "none",
            }}
          >
            {frame ? (
              <>
                <img
                  src={frame}
                  alt={`Frame ${index + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
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
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />

                {/* COUNTDOWN OVERLAY */}
                {countdown && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "64px",
                      fontWeight: "800",
                      color: "#fff",
                      background: "rgba(0,0,0,0.4)",
                    }}
                  >
                    {countdown}
                  </div>
                )}
              </>
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#666",
                }}
              >
                Frame {index + 1}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Start button ONLY for first frame */}
      {isCameraActive && !countdownRunning && currentFrame === 0 && (
        <button
          onClick={startCountdown}
          style={{
            padding: "12px 28px",
            fontSize: "16px",
            fontWeight: "600",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          📷 Start
        </button>
      )}

      {allFramesCaptured && (
        <button
          onClick={handleContinue}
          style={{
            padding: "12px 28px",
            fontSize: "16px",
            fontWeight: "600",
            background: TOTAL_FRAMES === 4 ? "#28a745" : "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          {TOTAL_FRAMES === 4 ? "✨ Customize" : "⬇️ Download"}
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