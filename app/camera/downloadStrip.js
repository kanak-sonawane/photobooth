export default async function downloadStrip(frames) {
  const validFrames = frames.filter(Boolean);
  if (validFrames.length === 0) return;

  const images = await Promise.all(
    validFrames.map(src => {
      return new Promise(resolve => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
      });
    })
  );

  // Use original frame dimensions from camera
  const frameWidth = images[0].width;
  const frameHeight = images[0].height;

  // Calculate final strip dimensions
  const padding = 40; // Space between frames (scaled up)
  const stripPadding = 80; // Border around entire strip (scaled up)

  const canvas = document.createElement("canvas");
  canvas.width = frameWidth + (stripPadding * 2);
  canvas.height = (frameHeight * validFrames.length) + (padding * (validFrames.length - 1)) + (stripPadding * 2);

  const ctx = canvas.getContext("2d");

  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw each frame at original size
  let yOffset = stripPadding;
  images.forEach(img => {
    ctx.drawImage(img, stripPadding, yOffset, frameWidth, frameHeight);
    yOffset += frameHeight + padding;
  });

  // Download
  const link = document.createElement("a");
  link.download = `photobooth-${Date.now()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
