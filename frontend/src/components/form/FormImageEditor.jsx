import React, { useState } from "react";
import { Camera, X } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import FormImagePlaceholder from "../common/FormImagePlaceholder";

const FormImageEditor = ({
  currentImageUrl,
  onImageUpdate,
  className = "",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(currentImageUrl);
  const { uploadImage } = useAuthStore();

  const compressImage = (
    file,
    maxWidth = 800,
    maxHeight = 600,
    quality = 0.8
  ) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        const aspectRatio = width / height;

        // For very tall images (like 9:16), limit the height more aggressively
        if (aspectRatio < 0.75) {
          // Taller than 4:3
          maxHeight = Math.min(maxHeight, 400); // Limit very tall images
        }

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, "image/jpeg", quality);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (10MB limit before compression)
      if (file.size > 10 * 1024 * 1024) {
        alert("Image size should be less than 10MB");
        return;
      }

      try {
        setIsUploading(true);

        // Compress the image
        const compressedFile = await compressImage(file);

        // Upload to Cloudinary
        const uploadResponse = await uploadImage(compressedFile);
        const newImageUrl = uploadResponse.imageUrl;

        // Update preview and notify parent
        setImagePreview(newImageUrl);
        onImageUpdate(newImageUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Error uploading image. Please try again.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleRemoveImage = () => {
    // Add a smooth transition when removing image
    const imgElement = document.querySelector(`[src="${imagePreview}"]`);
    if (imgElement) {
      imgElement.style.opacity = "0";
      setTimeout(() => {
        setImagePreview("");
        onImageUpdate("");
      }, 200);
    } else {
      setImagePreview("");
      onImageUpdate("");
    }
  };

  return (
    <div
      className={`relative group ${className}`}
      style={{ aspectRatio: "1/1" }}
    >
      <div
        className="relative overflow-hidden rounded-lg bg-gray-100 w-full h-full"
        style={{ contain: "layout size" }}
      >
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="Form"
            className="w-full h-full object-cover transition-all duration-300"
            style={{ maxHeight: "100%", maxWidth: "100%" }}
            onError={() => {
              setImagePreview("");
              onImageUpdate("");
            }}
          />
        ) : (
          <FormImagePlaceholder className="w-full h-full" />
        )}

        {/* Overlay with upload/remove buttons */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col gap-1">
            {/* Upload/Change Image Button */}
            <label className="cursor-pointer bg-white text-gray-700 px-2 py-1 rounded shadow-md hover:bg-gray-50 transition-colors flex items-center justify-center gap-1 text-xs min-w-0">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                disabled={isUploading}
              />
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                  <span className="hidden sm:inline">Uploading...</span>
                </>
              ) : (
                <>
                  <Camera className="h-3 w-3" />
                  <span className="hidden sm:inline">
                    {imagePreview ? "Change" : "Add"}
                  </span>
                </>
              )}
            </label>

            {/* Remove Image Button */}
            {imagePreview && (
              <button
                onClick={handleRemoveImage}
                className="bg-red-500 text-white px-2 py-1 rounded shadow-md hover:bg-red-600 transition-colors flex items-center justify-center gap-1 text-xs min-w-0"
                disabled={isUploading}
              >
                <X className="h-3 w-3" />
                <span className="hidden sm:inline">Remove</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Upload progress indicator */}
      {isUploading && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Uploading image...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormImageEditor;
