import { useEffect, useRef } from "react";
import { PhoneOffIcon, MicIcon, MicOffIcon, VideoIcon, VideoOffIcon, MaximizeIcon, MinimizeIcon } from "lucide-react";
import { useCallStore } from "../store/useCallStore";

function CallInterface() {
  const {
    currentCall,
    callStatus,
    callType,
    isCallActive,
    localStream,
    remoteStream,
    isVideoEnabled,
    isAudioEnabled,
    callDuration,
    endCall,
    toggleVideo,
    toggleAudio,
    formatCallDuration,
    isCallModalOpen
  } = useCallStore();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Set up video streams
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (!currentCall || !isCallModalOpen) {
    return null;
  }

  const isVideo = callType === 'video';
  const isConnected = callStatus === 'connected' && isCallActive;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900/90 backdrop-blur-sm p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full overflow-hidden">
            <img
              src={currentCall.participant.profilePic || "/avatar.png"}
              alt={currentCall.participant.fullName}
              className="size-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-white font-medium">
              {currentCall.participant.fullName}
            </h3>
            <p className="text-slate-400 text-sm">
              {isConnected ? formatCallDuration(callDuration) : 'Connecting...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm">
            {isVideo ? 'Video Call' : 'Voice Call'}
          </span>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative bg-slate-900">
        {isVideo ? (
          <>
            {/* Remote Video (Main) */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Local Video (Picture-in-Picture) */}
            <div className="absolute top-4 right-4 w-48 h-36 bg-slate-800 rounded-lg overflow-hidden border-2 border-slate-600">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {!isVideoEnabled && (
                <div className="absolute inset-0 bg-slate-700 flex items-center justify-center">
                  <VideoOffIcon className="size-8 text-slate-400" />
                </div>
              )}
            </div>

            {/* Remote video placeholder */}
            {!remoteStream && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                <div className="text-center">
                  <div className="size-24 bg-slate-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <img
                      src={currentCall.participant.profilePic || "/avatar.png"}
                      alt={currentCall.participant.fullName}
                      className="size-20 rounded-full object-cover"
                    />
                  </div>
                  <p className="text-slate-300">Waiting for video...</p>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Voice Call UI */
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="size-32 bg-gradient-to-br from-cyan-500/20 to-cyan-400/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <img
                  src={currentCall.participant.profilePic || "/avatar.png"}
                  alt={currentCall.participant.fullName}
                  className="size-28 rounded-full object-cover"
                />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                {currentCall.participant.fullName}
              </h2>
              <p className="text-slate-400">
                {isConnected ? `Call duration: ${formatCallDuration(callDuration)}` : 'Connecting...'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-slate-900/90 backdrop-blur-sm p-6">
        <div className="flex justify-center items-center gap-6">
          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`size-14 rounded-full flex items-center justify-center transition-colors shadow-lg ${
              isAudioEnabled
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
            title={isAudioEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {isAudioEnabled ? (
              <MicIcon className="size-6" />
            ) : (
              <MicOffIcon className="size-6" />
            )}
          </button>

          {/* End Call */}
          <button
            onClick={endCall}
            className="size-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors shadow-lg"
            title="End Call"
          >
            <PhoneOffIcon className="size-7 text-white" />
          </button>

          {/* Video Toggle (only show for video calls) */}
          {isVideo && (
            <button
              onClick={toggleVideo}
              className={`size-14 rounded-full flex items-center justify-center transition-colors shadow-lg ${
                isVideoEnabled
                  ? 'bg-slate-700 hover:bg-slate-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
              title={isVideoEnabled ? 'Turn Off Video' : 'Turn On Video'}
            >
              {isVideoEnabled ? (
                <VideoIcon className="size-6" />
              ) : (
                <VideoOffIcon className="size-6" />
              )}
            </button>
          )}
        </div>

        {/* Call Status */}
        <div className="text-center mt-4">
          <div className="flex items-center justify-center gap-2">
            <div className={`size-2 rounded-full ${
              isConnected ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'
            }`} />
            <span className="text-slate-400 text-sm">
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CallInterface;