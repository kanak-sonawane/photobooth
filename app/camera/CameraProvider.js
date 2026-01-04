"use client";

import { createContext, useContext, useRef, useState, useEffect } from "react";

const CameraContext = createContext(null);

export function CameraProvider({ children }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);

  // Stop camera safely
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Start camera safely
  const startCamera = async () => {
    stopCamera(); // kill old stream first
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setError("Camera permission denied or unavailable");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <CameraContext.Provider value={{ videoRef, startCamera, stopCamera, error }}>
      {children}
    </CameraContext.Provider>
  );
}

export const useCamera = () => {
  const context = useContext(CameraContext);
  if (!context) throw new Error("useCamera must be used within CameraProvider");
  return context;
};
