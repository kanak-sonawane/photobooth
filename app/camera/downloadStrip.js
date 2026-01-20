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

  const width = images[0].width;
  const height = images.reduce((sum, img) => sum + img.height, 0);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");

  let yOffset = 0;
  images.forEach(img => {
    ctx.drawImage(img, 0, yOffset);
    yOffset += img.height;
  });

  const link = document.createElement("a");
  link.download = "photobooth.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}
