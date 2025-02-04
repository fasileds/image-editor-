import React, { useState, useEffect, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Slider } from "@mui/material";
import { getCroppedImg } from "../utility/imageProcessing";
import DownloadIcon from "@mui/icons-material/Download";
import CropIcon from "@mui/icons-material/Crop";
import TuneIcon from "@mui/icons-material/Tune";
import AspectRatioIcon from "@mui/icons-material/AspectRatio";
import debounce from "lodash.debounce";

interface EditImageProps {
  image: string | null | undefined;
}

export default function EditImage({ image }: EditImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [cropSize, setCropSize] = useState<{ width: number; height: number }>({
    width: 300,
    height: 200,
  });
  const [sharpness, setSharpness] = useState<number>(1);
  const [showCropTools, setShowCropTools] = useState<boolean>(false);
  const [showSharpnessTools, setShowSharpnessTools] = useState<boolean>(false);
  const [showResizeTools, setShowResizeTools] = useState<boolean>(false);
  const [resizeDimensions, setResizeDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 300, height: 200 });

  useEffect(() => {
    if (image !== undefined) {
      setImageSrc(image ?? null);
    }
  }, [image]);

  useEffect(() => {
    if (imageSrc && croppedAreaPixels) {
      applyEdits(imageSrc, croppedAreaPixels, sharpness, resizeDimensions);
    }
  }, [sharpness, resizeDimensions]);

  const onCropComplete = async (_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
    await applyEdits(imageSrc, croppedPixels, sharpness, resizeDimensions);
  };

  const applyEdits = async (
    src: string | null,
    cropArea: any,
    sharpness: number,
    resizeDimensions: { width: number; height: number }
  ) => {
    if (!src || !cropArea) return;
    try {
      const croppedImage = await getCroppedImg(src, cropArea);
      const sharpenedImage = await applySharpness(croppedImage, sharpness);
      const resizedImage = await resizeImage(
        sharpenedImage,
        resizeDimensions.width,
        resizeDimensions.height
      );
      setOutputImage(resizedImage);
    } catch (error) {
      console.error("Error applying edits:", error);
    }
  };

  const applySharpness = (
    image: string | null,
    sharpness: number
  ): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      if (!image) {
        return resolve(null);
      }
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(null);

      const img = new Image();
      img.src = image;

      img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.filter = `contrast(${100 + sharpness * 50}%)`;
        ctx.drawImage(img, 0, 0);
        const sharpenedImage = canvas.toDataURL("image/jpeg");
        resolve(sharpenedImage);
      };

      img.onerror = function () {
        reject(new Error("Image load failed"));
      };
    });
  };

  const resizeImage = (
    image: string | null,
    width: number,
    height: number
  ): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      if (!image) {
        return resolve(null);
      }
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(null);

      const img = new Image();
      img.src = image;

      img.onload = function () {
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        const resizedImage = canvas.toDataURL("image/jpeg");
        resolve(resizedImage);
      };

      img.onerror = function () {
        reject(new Error("Image load failed"));
      };
    });
  };

  const handleSharpnessChange = useCallback(
    debounce((value: number) => setSharpness(value), 200),
    []
  );

  const handleResizeChange = (width: number, height: number) => {
    setResizeDimensions({ width, height });
  };

  const downloadImage = () => {
    if (outputImage) {
      const link = document.createElement("a");
      link.href = outputImage;
      link.download = "edited-image.jpg";
      link.click();
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg mt-6 mb-6 max-w-full">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
        Edit Image
      </h1>

      {imageSrc && (
        <>
          <div className="relative w-full h-[400px] mb-6 rounded-xl overflow-hidden shadow-lg">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              cropSize={cropSize}
              aspect={cropSize.width / cropSize.height}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              showGrid={false}
            />
          </div>

          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => setShowCropTools(!showCropTools)}
              className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700"
            >
              <CropIcon className="mr-2" /> Crop Tools
            </button>
            <button
              onClick={() => setShowSharpnessTools(!showSharpnessTools)}
              className="flex items-center bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-yellow-700"
            >
              <TuneIcon className="mr-2" /> Sharpness Tools
            </button>
            <button
              onClick={() => setShowResizeTools(!showResizeTools)}
              className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-purple-700"
            >
              <AspectRatioIcon className="mr-2" /> Resize Tools
            </button>
          </div>

          {showCropTools && (
            <div className="flex items-center justify-between mb-6 space-x-4">
              <div className="flex flex-col items-start w-full">
                <label className="text-gray-700 text-sm font-semibold">
                  Zoom
                </label>
                <Slider
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(_, value) => setZoom(value as number)}
                  sx={{ color: "#4CAF50" }}
                />
              </div>
              <div className="flex flex-col items-start w-full">
                <label className="text-gray-700 text-sm font-semibold">
                  Width
                </label>
                <Slider
                  value={cropSize.width}
                  min={100}
                  max={600}
                  step={10}
                  onChange={(_, value) =>
                    setCropSize((prev) => ({ ...prev, width: value as number }))
                  }
                  sx={{ color: "#4CAF50" }}
                />
              </div>
              <div className="flex flex-col items-start w-full">
                <label className="text-gray-700 text-sm font-semibold">
                  Height
                </label>
                <Slider
                  value={cropSize.height}
                  min={100}
                  max={400}
                  step={10}
                  onChange={(_, value) =>
                    setCropSize((prev) => ({
                      ...prev,
                      height: value as number,
                    }))
                  }
                  sx={{ color: "#4CAF50" }}
                />
              </div>
            </div>
          )}

          {showSharpnessTools && (
            <div className="flex flex-col items-start w-full mb-6">
              <label className="text-gray-700 text-sm font-semibold">
                Sharpness
              </label>
              <Slider
                value={sharpness}
                min={0}
                max={5}
                step={0.1}
                onChange={(_, value) => handleSharpnessChange(value as number)}
                sx={{ color: "#4CAF50" }}
              />
            </div>
          )}

          {showResizeTools && (
            <div className="flex items-center justify-between mb-6 space-x-4">
              <div className="flex flex-col items-start w-full">
                <label className="text-gray-700 text-sm font-semibold">
                  Resize Width (px)
                </label>
                <input
                  type="number"
                  value={resizeDimensions.width}
                  onChange={(e) =>
                    handleResizeChange(
                      parseInt(e.target.value, 10),
                      resizeDimensions.height
                    )
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  min={50}
                  max={1000}
                />
              </div>
              <div className="flex flex-col items-start w-full">
                <label className="text-gray-700 text-sm font-semibold">
                  Resize Height (px)
                </label>
                <input
                  type="number"
                  value={resizeDimensions.height}
                  onChange={(e) =>
                    handleResizeChange(
                      resizeDimensions.width,
                      parseInt(e.target.value, 10)
                    )
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  min={50}
                  max={1000}
                />
              </div>
            </div>
          )}

          {outputImage && (
            <div className="mt-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Image Preview
              </h2>
              <img
                src={outputImage}
                alt="Edited Result"
                className="max-w-full border-4 border-gray-300 rounded-lg shadow-2xl transition-transform transform hover:scale-105"
              />
              <div className="mt-4">
                <button
                  onClick={downloadImage}
                  className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700"
                >
                  <DownloadIcon className="mr-2" />
                  Download Image
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
