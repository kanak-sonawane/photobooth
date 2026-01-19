"use client";

import { useRouter } from "next/navigation";

export default function SelectFrame() {
  const router = useRouter();

  const frameLayouts = [
    { id: 1, count: 1, label: "1 Frame" },
    { id: 2, count: 2, label: "2 Frames" },
    { id: 3, count: 3, label: "3 Frames" },
  ];

  const handleSelectLayout = (frameCount) => {
    router.push(`/camera?frames=${frameCount}`);
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
            }}
          >
            {/* Visual representation of frames */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {Array.from({ length: layout.count }).map((_, index) => (
                <div
                  key={index}
                  style={{
                    width: "80px",
                    height: layout.count === 1 ? "100px" : "30px",
                    background: "#ddd",
                    borderRadius: "4px",
                  }}
                />
              ))}
            </div>
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