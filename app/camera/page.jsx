"use client";

import { useState, useEffect } from "react";
import { CameraProvider, useCamera } from "./CameraProvider";
import CameraView from "./CameraView";
import captureFrame from "./captureFrame";

function CameraPageContent() {
  const { videoRef, startCamera, stopCamera, error } = useCamera();
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const handleCapture = () => {
    const image = captureFrame(videoRef.current);
    if (image) {
      setPhoto(image);
      stopCamera(); // light off
    }
  };

  const handleRetake = () => {
    setPhoto(null);
    startCamera();
  };

  const handleBack = () => {
    stopCamera();
    // ✅ Hard exit to guarantee camera release every time
    window.location.replace("/");
  };

  return (
    <main style={{ textAlign: "center" }}>
      <h2>Camera</h2>

      {error && <p>{error}</p>}

      {!photo && <CameraView videoRef={videoRef} />}
      {photo && <img src={photo} alt="Captured" style={{ width: "100%", maxWidth: "400px" }} />}

      <div style={{ marginTop: "20px" }}>
        {!photo && <button onClick={handleCapture}>Capture</button>}
        {photo && <button onClick={handleRetake}>Retake</button>}
        <br /><br />
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
