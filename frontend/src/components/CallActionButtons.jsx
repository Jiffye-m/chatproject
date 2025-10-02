import { PhoneIcon, VideoIcon } from "lucide-react";
import { useCallStore } from "../store/useCallStore";

function CallActionButtons({ user }) {
  const { startCall, callStatus } = useCallStore();

  const handleVoiceCall = () => {
    if (callStatus !== 'idle') return;
    startCall(user, 'voice');
  };

  const handleVideoCall = () => {
    if (callStatus !== 'idle') return;
    startCall(user, 'video');
  };

  const isDisabled = callStatus !== 'idle';

  return (
    <div className="flex items-center gap-1 lg:gap-2">
      {/* Voice Call Button */}
      <button
        onClick={handleVoiceCall}
        disabled={isDisabled}
        className="p-2 lg:p-2 text-gray-600 hover:text-green-500 hover:bg-green-50 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        title="Voice Call"
      >
        <PhoneIcon className="w-4 h-4 lg:w-5 lg:h-5" />
      </button>

      {/* Video Call Button */}
      <button
        onClick={handleVideoCall}
        disabled={isDisabled}
        className="p-2 lg:p-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        title="Video Call"
      >
        <VideoIcon className="w-4 h-4 lg:w-5 lg:h-5" />
      </button>
    </div>
  );
}

export default CallActionButtons;