import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Trash2, ArrowLeft } from "lucide-react";

const ProfileImageDisplay = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [fetchingImage, setFetchingImage] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // Add authentication check
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("user"));
    if (!userInfo || userInfo.username !== "Rami&Sara") {
      navigate("/home");
    }
  }, [navigate]);

  useEffect(() => {
    fetchProfileImage();
  }, []);

  const fetchProfileImage = async () => {
    try {
      setFetchingImage(true);
      const querySnapshot = await getDocs(collection(db, "profileImage"));
      const imageList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort by uploadDate and get the most recent one
      const sortedImages = imageList.sort(
        (a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)
      );

      setProfileImage(sortedImages[0] || null);
    } catch (error) {
      console.error("Error fetching image:", error);
      setError("Failed to load image");
    } finally {
      setFetchingImage(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm("Are you sure you want to delete this image?")) {
      return;
    }

    try {
      setDeleting(true);
      await deleteDoc(doc(db, "profileImage", imageId));
      setProfileImage(null);
      setSuccess("Image deleted successfully!");
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error deleting image:", error);
      setError("Failed to delete image");
      setTimeout(() => setError(""), 3000);
    } finally {
      setDeleting(false);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 1024 * 1024) {
      setError("Image size should be less than 1MB");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess(false);

      const base64Image = await convertToBase64(file);

      await addDoc(collection(db, "profileImage"), {
        imageData: base64Image,
        fileName: file.name,
        uploadDate: new Date().toISOString(),
      });

      await fetchProfileImage();
      setSuccess("Image uploaded successfully!");
      e.target.value = "";
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Failed to upload image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/ProfilePage");
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={24} className="mr-2" />
          <span>Back to Profile</span>
        </button>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">
            Upload New Profile Image
          </h2>
          <div className="flex flex-col">
            <label
              htmlFor="imageUpload"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              Upload Image
            </label>
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={loading}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {loading && (
            <div className="text-blue-500 text-sm">Uploading image...</div>
          )}

          {error && <div className="text-red-500 text-sm">{error}</div>}

          {success && <div className="text-green-500 text-sm">{success}</div>}

          <div className="text-xs text-gray-500">
            * Maximum file size: 1MB
            <br />* Supported formats: JPG, PNG, GIF
          </div>
        </div>
      </div>

      {/* Profile Image Display */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Current Profile Image</h2>

        {fetchingImage ? (
          <div className="text-center text-gray-500 py-8">Loading image...</div>
        ) : !profileImage ? (
          <div className="text-center text-gray-500 py-8">
            No profile image uploaded yet
          </div>
        ) : (
          <div className="relative rounded-lg overflow-hidden shadow-md">
            <img
              src={profileImage.imageData || profileImage.imageUrl}
              alt={profileImage.fileName || "Profile image"}
              className="w-full h-auto max-h-[500px] object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm flex justify-between items-center">
              <span>
                {new Date(profileImage.uploadDate).toLocaleDateString()}
              </span>
              <button
                onClick={() => handleDelete(profileImage.id)}
                disabled={deleting}
                className="text-white hover:text-red-400 transition-colors"
                title="Delete image"
              >
                <Trash2 size={18} />
              </button>
            </div>
            {deleting && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white">Deleting...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileImageDisplay;
