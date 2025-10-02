import { useState, useRef } from "react";
import { LogOutIcon, SettingsIcon, MessageCircleIcon, MenuIcon, XIcon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import ProfileSettingsModal from "./ProfileSettingsModal";

function AppBar() {
  const { logout, authUser, updateProfile } = useAuthStore();
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  return (
    <>
      <div className="bg-white border-b-2 border-blue-100 shadow-md sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
          {/* Left Section - Logo & User Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <MessageCircleIcon className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 hidden sm:block">ChatApp</span>
            </div>
            
            {/* User Avatar & Name - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
              <button
                className="size-10 rounded-full overflow-hidden relative group border-2 border-blue-500 shadow-md"
                onClick={() => fileInputRef.current?.click()}
              >
                <img
                  src={selectedImg || authUser.profilePic || "/avatar.png"}
                  alt="User image"
                  className="size-full object-cover"
                />
                <div className="absolute inset-0 bg-blue-600/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                  <span className="text-white text-xs font-bold">Edit</span>
                </div>
              </button>
              
              <div>
                <h3 className="text-gray-900 font-bold text-sm truncate max-w-[120px]">
                  {authUser.fullName}
                </h3>
                <p className="text-green-600 text-xs font-semibold">Online</p>
              </div>
              
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Right Section - Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2">
              <button
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all p-2 rounded-xl shadow-sm hover:shadow-md"
                onClick={() => setShowProfileSettings(true)}
                title="Profile Settings"
              >
                <SettingsIcon className="size-5" />
              </button>

              <button
                className="text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all p-2 rounded-xl shadow-sm hover:shadow-md"
                onClick={logout}
                title="Logout"
              >
                <LogOutIcon className="size-5" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all p-2 rounded-xl"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <XIcon className="size-6" /> : <MenuIcon className="size-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-3 space-y-3">
              {/* Mobile User Info */}
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <button
                  className="size-12 rounded-full overflow-hidden relative group border-2 border-blue-500 shadow-md"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <img
                    src={selectedImg || authUser.profilePic || "/avatar.png"}
                    alt="User image"
                    className="size-full object-cover"
                  />
                  <div className="absolute inset-0 bg-blue-600/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <span className="text-white text-xs font-bold">Edit</span>
                  </div>
                </button>
                
                <div>
                  <h3 className="text-gray-900 font-bold">
                    {authUser.fullName}
                  </h3>
                  <p className="text-green-600 text-sm font-semibold">Online</p>
                </div>
              </div>

              {/* Mobile Actions */}
              <button
                className="w-full flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-xl transition-all text-left"
                onClick={() => {
                  setShowProfileSettings(true);
                  setShowMobileMenu(false);
                }}
              >
                <SettingsIcon className="size-5" />
                <span className="font-medium">Profile Settings</span>
              </button>

              <button
                className="w-full flex items-center gap-3 text-gray-700 hover:text-red-600 hover:bg-red-50 p-3 rounded-xl transition-all text-left"
                onClick={() => {
                  logout();
                  setShowMobileMenu(false);
                }}
              >
                <LogOutIcon className="size-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Profile Settings Modal */}
      {showProfileSettings && (
        <ProfileSettingsModal
          onClose={() => setShowProfileSettings(false)}
        />
      )}
    </>
  );
}

export default AppBar;