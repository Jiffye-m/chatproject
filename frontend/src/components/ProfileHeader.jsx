import { useState } from "react";
import { VolumeOffIcon, Volume2Icon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function ProfileHeader() {
  const { isSoundEnabled, toggleSound } = useChatStore();

  return (
    <div className="p-4 border-b-2 border-blue-100 bg-gradient-to-r from-blue-50 to-white">
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h3 className="text-gray-900 font-black text-lg">
            Conversations
          </h3>
          <p className="text-gray-600 text-sm font-semibold">Stay connected with everyone</p>
        </div>

        {/* SOUND TOGGLE BTN - Only button remaining */}
        <div className="flex items-center">
          <button
            className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all p-3 rounded-xl shadow-sm hover:shadow-md"
            onClick={() => {
              mouseClickSound.currentTime = 0;
              mouseClickSound.play().catch((error) => console.log("Audio play failed:", error));
              toggleSound();
            }}
            title={isSoundEnabled ? "Disable Sound" : "Enable Sound"}
          >
            {isSoundEnabled ? (
              <Volume2Icon className="size-6" />
            ) : (
              <VolumeOffIcon className="size-6" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
export default ProfileHeader;