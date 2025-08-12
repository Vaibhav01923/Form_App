import React, { useState } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

const CreateFormModal = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState("Untitled Form");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { createForm, uploadImage } = useAuthStore();

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
        // Calculate new dimensions
        let { width, height } = img;

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
        // Compress the image
        const compressedFile = await compressImage(file);
        setSelectedImage(compressedFile);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error("Error compressing image:", error);
        alert("Error processing image. Please try another image.");
      }
    }
  };

  const handleRemoveImage = () => {
    // Add smooth transition when removing image
    const imgElement = document.querySelector(`[src="${imagePreview}"]`);
    if (imgElement) {
      imgElement.style.opacity = "0";
      setTimeout(() => {
        setSelectedImage(null);
        setImagePreview(null);
      }, 200);
    } else {
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  const handleCreateForm = async () => {
    try {
      setIsCreating(true);
      let imageUrl = "";

      // Upload image if selected
      if (selectedImage) {
        setIsUploading(true);
        const uploadResponse = await uploadImage(selectedImage);
        imageUrl = uploadResponse.imageUrl;
        setIsUploading(false);
      }

      // Create form with image URL
      const formData = {
        title: title.trim() || "Untitled Form",
        imageUrl,
        questions: [],
      };

      const newForm = await createForm(formData);
      onSuccess(newForm);
      handleClose();
    } catch (error) {
      console.error("Error creating form:", error);
    } finally {
      setIsCreating(false);
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setTitle("Untitled Form");
    setSelectedImage(null);
    setImagePreview(null);
    setIsUploading(false);
    setIsCreating(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Create New Form
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Form Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Form Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter form title..."
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Form Image (Optional)
            </label>

            {!imagePreview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    Click to upload an image
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    PNG, JPG up to 10MB (auto-compressed)
                  </span>
                </label>
              </div>
            ) : (
              <div
                className="relative h-32 overflow-hidden rounded-lg"
                style={{ contain: "layout size" }}
              >
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover transition-all duration-300"
                  style={{ maxHeight: "100%", maxWidth: "100%" }}
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={isCreating || isUploading}
          >
            Cancel
          </button>
          <button
            onClick={handleCreateForm}
            disabled={isCreating || isUploading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : isCreating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              "Create Form"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateFormModal;
