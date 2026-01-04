export default function captureFrame(videoElement) {
  if (!videoElement) return null;

  const canvas = document.createElement("canvas");
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(videoElement, 0, 0);

  return canvas.toDataURL("image/png");
}
