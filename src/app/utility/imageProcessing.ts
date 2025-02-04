export async function getCroppedImg(
  imageSrc: string,
  crop: any,
  sharpness: number = 1
): Promise<string> {
  const image: HTMLImageElement = await new Promise((resolve) => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => resolve(img);
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const { width, height, x, y } = crop;
  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

  if (sharpness !== 1) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] *= sharpness;
      data[i + 1] *= sharpness;
      data[i + 2] *= sharpness;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  return canvas.toDataURL("image/jpeg");
}
