import { useState, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { XIcon, CameraIcon, SaveIcon, UserIcon, MailIcon } from "lucide-react";
import toast from "react-hot-toast";

function ProfileSettingsModal({ onClose }) {
  const { authUser, updateProfile } = useAuthStore();
  const [formData, setFormData] = useState({
    fullName: authUser.fullName || "",
    email: authUser.email || "",
    profilePic: "",
  });
  const [imagePreview, setImagePreview] = useState(authUser.profilePic || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Image = reader.result;
      setImagePreview(base64Image);
      setFormData({ ...formData, profilePic: base64Image });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsUpdating(true);

    try {
      const updateData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        ...(formData.profilePic && { profilePic: formData.profilePic })
      };

      await updateProfile(updateData);
      toast.success("Profile updated successfully!");
      onClose();
    } catch (error) {
      // Error is handled in the store
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: authUser.fullName || "",
      email: authUser.email || "",
      profilePic: "",
    });
    setImagePreview(authUser.profilePic || "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-slate-200">Update Profile</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="size-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-400/10 flex items-center justify-center overflow-hidden border-4 border-slate-600/30">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Profile" 
                    className="size-24 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="size-12 text-slate-400" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 size-8 bg-cyan-500 rounded-full flex items-center justify-center text-white hover:bg-cyan-600 transition-colors shadow-lg"
              >
                <CameraIcon className="size-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <p className="text-slate-400 text-sm text-center">
              Click the camera icon to update your profile picture
            </p>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-slate-200 text-sm font-medium mb-2">
              Full Name *
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-3 py-2 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                placeholder="Enter your full name"
                maxLength={100}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-slate-200 text-sm font-medium mb-2">
              Email Address *
            </label>
            <div className="relative">
              <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-3 py-2 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                placeholder="Enter your email address"
              />
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-slate-700/30 rounded-lg p-3">
            <h3 className="text-slate-200 text-sm font-medium mb-2">Account Information</h3>
            <div className="space-y-1 text-xs text-slate-400">
              <p>Account created: {new Date(authUser.createdAt).toLocaleDateString()}</p>
              <p>Last updated: {new Date(authUser.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 px-4 py-2 text-slate-400 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors"
              disabled={isUpdating}
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUpdating ? (
                <>
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <SaveIcon className="size-4" />
                  Update Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileSettingsModal;