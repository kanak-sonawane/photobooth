"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function CustomizePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const canvasRef = useRef(null);
  const framesLoadedRef = useRef(false);

  const [frames, setFrames] = useState([]);
  const [frameCount, setFrameCount] = useState(4);
  const [selectedBg, setSelectedBg] = useState(null);
  const [backgrounds, setBackgrounds] = useState([]);

  useEffect(() => {
    if (framesLoadedRef.current) return;
    framesLoadedRef.current = true;

    const count = parseInt(searchParams.get("frames")) || 4;
    const sessionId = searchParams.get("session");

    setFrameCount(count);

    if (
      typeof window !== "undefined" &&
      sessionId &&
      window.__PHOTOBOOTH__ &&
      window.__PHOTOBOOTH__[sessionId]
    ) {
      setFrames(window.__PHOTOBOOTH__[sessionId]);
    }

    loadBackgrounds(count);
  }, []);

  const loadBackgrounds = (count) => {
    if (count === 4) {
      setBackgrounds([
        {
          id: "pink-frame",
          name: "Pink Frame",
          path: "/backgrounds/4-frames/pink-frame.png",
          // HIGH RES: 4x scale for quality (512x1620)
          // Slots scaled proportionally
          slots: [
            { x: 32, y: 32, width: 448, height: 320 },    // Slot 1
            { x: 32, y: 384, width: 448, height: 320 },   // Slot 2
            { x: 32, y: 736, width: 448, height: 320 },   // Slot 3
            { x: 32, y: 1088, width: 448, height: 320 },  // Slot 4
          ],
        },
      ]);
      setSelectedBg("pink-frame");
    }
  };

  useEffect(() => {
    if (frames.length > 0 && selectedBg && canvasRef.current) {
      renderPreview();
    }
  }, [frames, selectedBg]);

  /**
   * Draws an image into a slot using "cover" fitting — like CSS object-fit: cover.
   * Crops the image from the center so it fills the slot without any stretching,
   * regardless of whether the photo came from a landscape desktop webcam or
   * a portrait mobile camera.
   */
  const drawCoverFit = (ctx, img, slot) => {
    const { x, y, width, height } = slot;
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const slotAspect = width / height;

    let srcX = 0, srcY = 0, srcW = img.naturalWidth, srcH = img.naturalHeight;

    if (imgAspect > slotAspect) {
      // Image is wider than the slot → crop the left/right sides
      srcH = img.naturalHeight;
      srcW = img.naturalHeight * slotAspect;
      srcX = (img.naturalWidth - srcW) / 2;
    } else {
      // Image is taller than the slot → crop the top/bottom
      srcW = img.naturalWidth;
      srcH = img.naturalWidth / slotAspect;
      srcY = (img.naturalHeight - srcH) / 2;
    }

    // Clip to the slot bounds so nothing bleeds outside
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();
    ctx.drawImage(img, srcX, srcY, srcW, srcH, x, y, width, height);
    ctx.restore();
  };

  const renderPreview = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const bg = backgrounds.find((b) => b.id === selectedBg);
    if (!bg) return;

    // HIGH RESOLUTION: 4x scale (512x1620) for crystal clear quality
    const scale = 4;
    const baseWidth = 128;
    const baseHeight = 405;

    canvas.width = baseWidth * scale;   // 512
    canvas.height = baseHeight * scale; // 1620

    // Display at 2x size (256x810) — looks same as before on desktop
    canvas.style.width = baseWidth * 2 + "px";
    canvas.style.height = baseHeight * 2 + "px";

    // Enable image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw photos using cover-fit to prevent stretching on any device/orientation
    const photoPromises = frames
      .slice(0, bg.slots.length)
      .map((frameData, i) => {
        return new Promise((resolve) => {
          const slot = bg.slots[i];
          const photoImage = new Image();
          photoImage.onload = () => {
            drawCoverFit(ctx, photoImage, slot);
            resolve();
          };
          photoImage.onerror = () => {
            console.error(`Failed to load photo ${i}`);
            resolve();
          };
          photoImage.src = frameData;
        });
      });

    await Promise.all(photoPromises);

    // Draw frame overlay at high resolution
    await new Promise((resolve) => {
      const bgImage = new Image();
      bgImage.onload = () => {
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        resolve();
      };
      bgImage.onerror = () => {
        console.error('Failed to load background frame');
        resolve();
      };
      bgImage.src = bg.path;
    });

    console.log('High-res preview rendered: 512x1620');
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;

    const link = document.createElement("a");
    link.download = `photobooth-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();

    const sessionId = searchParams.get("session");
    if (
      typeof window !== "undefined" &&
      sessionId &&
      window.__PHOTOBOOTH__
    ) {
      delete window.__PHOTOBOOTH__[sessionId];
    }
  };

  const handleBack = () => {
    const sessionId = searchParams.get("session");
    if (
      typeof window !== "undefined" &&
      sessionId &&
      window.__PHOTOBOOTH__
    ) {
      delete window.__PHOTOBOOTH__[sessionId];
    }
    router.push("/camera?frames=" + frameCount);
  };

  if (frames.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <p>No photos found. Please take photos first.</p>
        <button onClick={() => router.push("/")}>Go Home</button>
      </div>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        gap: "20px",
      }}
    >
      <h2>Customize Your Photobooth</h2>

      <div
        style={{
          display: "flex",
          gap: "30px",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "10px" }}>Preview</h3>
          <canvas
            ref={canvasRef}
            style={{
              border: "2px solid #ccc",
              borderRadius: "8px",
              // Ensure canvas never overflows on small screens
              maxWidth: "100%",
              height: "auto",
            }}
          />
        </div>

        <div style={{ maxWidth: "300px" }}>
          <h3 style={{ marginBottom: "10px" }}>Choose Background</h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {backgrounds.map((bg) => (
              <button
                key={bg.id}
                onClick={() => setSelectedBg(bg.id)}
                style={{
                  padding: "10px",
                  border:
                    selectedBg === bg.id
                      ? "3px solid #007bff"
                      : "2px solid #ccc",
                  borderRadius: "8px",
                  background:
                    selectedBg === bg.id ? "#e7f3ff" : "#fff",
                  cursor: "pointer",
                  textAlign: "left",
                  fontWeight:
                    selectedBg === bg.id ? "600" : "400",
                }}
              >
                <img
                  src={bg.path}
                  alt={bg.name}
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "4px",
                    marginBottom: "5px",
                  }}
                />
                {bg.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
        <button
          onClick={handleDownload}
          style={{
            padding: "14px 32px",
            fontSize: "18px",
            fontWeight: "700",
            background: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          ⬇️ Download
        </button>
        <button
          onClick={handleBack}
          style={{
            padding: "14px 32px",
            fontSize: "18px",
            fontWeight: "700",
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

export default function CustomizePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomizePageContent />
    </Suspense>
  );
}