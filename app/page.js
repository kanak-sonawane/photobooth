"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main style={{ textAlign: "center", marginTop: "40vh" }}>
      <h1>Photobooth</h1>
      <button onClick={() => router.push("/select-frame")}>
        Select Frames
      </button>
    </main>
  );
}