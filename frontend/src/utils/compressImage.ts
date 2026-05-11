const compressImage = (
  file: File,
  maxWidth = 1200,
  quality = 0.8,
): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      // scale down if wider than maxWidth
      const ratio = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    img.src = url;
  });
};

export default compressImage;
