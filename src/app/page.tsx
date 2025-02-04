"use client";
import { useState } from "react";
import EditImage from "./commponents/Edit";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleImageUpload = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImage(reader.result);
          setIsEditing(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const closeEdit = () => setIsEditing(false);

  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 sm:p-12 font-[family-name:var(--font-geist-sans)] bg-gradient-to-br from-purple-50 to-blue-50">
      <header className="text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2 sm:mb-4">
          Image<span className="text-blue-600">Pro</span>
        </h1>
        <p className="text-sm sm:text-lg text-gray-600">
          Resize, Crop, and Sharpen Your Images with Ease
        </p>
      </header>

      <main className="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-6 sm:p-8">
        {!isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  ></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Upload Image
              </h2>
              <p className="text-sm text-gray-600 text-center">
                Drag and drop or click to upload your image.
              </p>
              <input
                type="file"
                className="hidden"
                id="file-upload"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Choose File
              </label>
            </div>

            <div className="flex flex-col items-center justify-center space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Preview</h2>
              <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {image ? (
                  <img
                    src={image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-sm">Preview</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col ">
            <button
              onClick={closeEdit}
              className="mb-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Back to Upload
            </button>
            <EditImage image={image} />
          </div>
        )}
      </main>

      <footer className="text-center text-gray-600 text-sm mt-8">
        <p>© 2025 ImagePro. All rights reserved.</p>
      </footer>
    </div>
  );
}
