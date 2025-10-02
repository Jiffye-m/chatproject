import { PhoneIcon, PhoneOffIcon, VideoIcon } from "lucide-react";
import { useCallStore } from "../store/useCallStore";
import { useEffect, useState } from "react";

function IncomingCallModal() {
  const { incomingCall, answerCall, callStatus } = useCallStore();
  const [ringTimer, setRingTimer] = useState(null);

  useEffect(() => {
    if (incomingCall && callStatus === 'ringing') {
      // Play ringtone
      const ringtone = new Audio("/sounds/ringtone.mp3");
      ringtone.loop = true;
      ringtone.play().catch(e => console.log("Ringtone play failed:", e));

      const timer = setTimeout(() => {
        ringtone.pause();
        answerCall(false); // Auto-reject after 30 seconds
      }, 30000);

      setRingTimer(timer);

      return () => {
        ringtone.pause();
        clearTimeout(timer);
      };
    }
  }, [incomingCall, callStatus, answerCall]);

  if (!incomingCall || callStatus !== 'ringing') {
    return null;
  }

  const handleAccept = () => {
    if (ringTimer) clearTimeout(ringTimer);
    answerCall(true);
  };

  const handleReject = () => {
    if (ringTimer) clearTimeout(ringTimer);
    answerCall(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-2xl p-8 max-w-sm w-full mx-4 text-center">
        {/* Caller Info */}
        <div className="mb-8">
          <div className="size-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-cyan-400 animate-pulse">
            <img
              src={incomingCall.caller.profilePic || "/avatar.png"}
              alt={incomingCall.caller.fullName}
              className="size-full object-cover"
            />
          </div>
          
          <h2 className="text-xl font-semibold text-slate-200 mb-2">
            {incomingCall.caller.fullName}
          </h2>
          
          <div className="flex items-center justify-center gap-2 text-slate-400">
            {incomingCall.callType === 'video' ? (
              <>
                <VideoIcon className="size-4" />
                <span>Incoming video call...</span>
              </>
            ) : (
              <>
                <PhoneIcon className="size-4" />
                <span>Incoming voice call...</span>
              </>
            )}
          </div>
        </div>

        {/* Call Actions */}
        <div className="flex justify-center gap-8">
          {/* Reject Button */}
          <button
            onClick={handleReject}
            className="size-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors shadow-lg"
            title="Reject Call"
          >
            <PhoneOffIcon className="size-6 text-white" />
          </button>

          {/* Accept Button */}
          <button
            onClick={handleAccept}
            className="size-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors shadow-lg animate-bounce"
            title="Accept Call"
          >
            <PhoneIcon className="size-6 text-white" />
          </button>
        </div>

        {/* Hint */}
        <p className="text-slate-500 text-sm mt-6">
          Call will end automatically in 30 seconds
        </p>
      </div>
    </div>
  );
}

export default IncomingCallModal;