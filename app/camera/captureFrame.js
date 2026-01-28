export default function captureFrame(videoElement) {
  if (!videoElement) return null;

  const canvas = document.createElement("canvas");
  
  // Match the aspect ratio from camera preview (wider and shorter)
  // Using ratio similar to what's displayed: approximately 2.5:1 (width:height)
  const targetWidth = 1920;  // High res for quality
  const targetHeight = 768;  // Wider/shorter ratio
  
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");

  // Calculate how to crop the video to match target aspect ratio
  const videoAspect = videoElement.videoWidth / videoElement.videoHeight;
  const targetAspect = targetWidth / targetHeight;

  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = videoElement.videoWidth;
  let sourceHeight = videoElement.videoHeight;

  if (videoAspect > targetAspect) {
    // Video is wider - crop sides
    sourceWidth = videoElement.videoHeight * targetAspect;
    sourceX = (videoElement.videoWidth - sourceWidth) / 2;
  } else {
    // Video is taller - crop top/bottom
    sourceHeight = videoElement.videoWidth / targetAspect;
    sourceY = (videoElement.videoHeight - sourceHeight) / 2;
  }

  // Draw cropped video to canvas
  ctx.drawImage(
    videoElement,
    sourceX, sourceY, sourceWidth, sourceHeight,
    0, 0, targetWidth, targetHeight
  );

  return canvas.toDataURL("image/png");
}