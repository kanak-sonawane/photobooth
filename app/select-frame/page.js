"use client";

import { useRouter } from "next/navigation";

export default function SelectFrame() {
  const router = useRouter();

  const frameLayouts = [
    { id: 3, count: 3, label: "3 Frames" },
    { id: 4, count: 4, label: "4 Frames" },
    { id: 5, count: 5, label: "5 Frames" },
  ];

  const handleSelectLayout = (frameCount) => {
    router.push(`/camera?frames=${frameCount}`);
  };

  // Helper to render vertical strip preview based on frame count
  const renderPreview = (count) => {
    // Adjust mini frame height based on total count to fit in container
    const frameHeight = count === 3 ? "45px" : count === 4 ? "35px" : "28px";
    
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            style={{
              width: "80px",
              height: frameHeight,
              background: "#ddd",
              borderRadius: "4px",
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
      }}
    >
      <h2>Select Frame Layout</h2>

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {frameLayouts.map((layout) => (
          <button
            key={layout.id}
            onClick={() => handleSelectLayout(layout.count)}
            style={{
              width: "150px",
              height: "200px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              cursor: "pointer",
              border: "2px solid #ccc",
              borderRadius: "12px",
              background: "#fff",
              fontSize: "16px",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "#007bff";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "#ccc";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {/* Visual representation of vertical frames */}
            {renderPreview(layout.count)}
            <span style={{ fontWeight: "bold" }}>{layout.label}</span>
          </button>
        ))}
      </div>

      <button
        onClick={() => router.push("/")}
        style={{ marginTop: "20px" }}
      >
        Back
      </button>
    </main>
  );
}