"use client";

import React from "react";

export default function CameraView({ videoRef }) {
  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      style={{ width: "100%", maxWidth: "400px" }}
    />
  );
}
