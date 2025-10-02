import { useEffect, useState } from "react";
import { useCallStore } from "../store/useCallStore";
import { useAuthStore } from "../store/useAuthStore";
import { PhoneIcon, VideoIcon, PhoneIncomingIcon, PhoneOutgoingIcon, PhoneMissed, ClockIcon, TrashIcon } from "lucide-react";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";

function CallHistoryList() {
  const { 
    getCallHistory, 
    callHistory, 
    isCallHistoryLoading, 
    markCallAsRead,
    deleteCallHistory,
    startCall 
  } = useCallStore();
  const { authUser } = useAuthStore();
  const [page, setPage] = useState(1);

  useEffect(() => {
    getCallHistory(page);
  }, [getCallHistory, page]);

  const formatCallDuration = (duration) => {
    if (duration === 0) return "0:00";
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatCallTime = (date) => {
    const callDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - callDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "Today " + callDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 2) {
      return "Yesterday " + callDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays <= 7) {
      return callDate.toLocaleDateString([], { weekday: 'short' }) + " " + 
             callDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return callDate.toLocaleDateString([], { month: 'short', day: 'numeric' }) + " " + 
             callDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const getCallIcon = (call) => {
    const isOutgoing = call.caller._id === authUser._id;
    
    if (call.status === 'missed' && !isOutgoing) {
      return <PhoneMissed className="w-4 h-4 text-red-400" />;
    }
    
    if (isOutgoing) {
      return <PhoneOutgoingIcon className="w-4 h-4 text-green-400" />;
    } else {
      return <PhoneIncomingIcon className="w-4 h-4 text-blue-400" />;
    }
  };

  const getCallTypeIcon = (callType) => {
    return callType === 'video' 
      ? <VideoIcon className="w-4 h-4 text-slate-400" />
      : <PhoneIcon className="w-4 h-4 text-slate-400" />;
  };

  const getStatusText = (call) => {
    const isOutgoing = call.caller._id === authUser._id;
    
    switch (call.status) {
      case 'completed':
        return isOutgoing ? 'Outgoing' : 'Incoming';
      case 'missed':
        return 'Missed';
      case 'rejected':
        return isOutgoing ? 'Rejected' : 'Declined';
      case 'failed':
        return 'Failed';
      default:
        return call.status;
    }
  };

  const getOtherParticipant = (call) => {
    return call.caller._id === authUser._id ? call.receiver : call.caller;
  };

  const handleCallBack = (call, callType) => {
    const participant = getOtherParticipant(call);
    startCall(participant, callType);
    markCallAsRead(call._id);
  };

  const handleDeleteCall = (callId, e) => {
    e.stopPropagation();
    if (window.confirm("Delete this call from history?")) {
      deleteCallHistory(callId);
    }
  };

  if (isCallHistoryLoading) return <UsersLoadingSkeleton />;

  return (
    <div className="space-y-2">
      {callHistory.length === 0 ? (
        <div className="text-center py-8 text-slate-600">
          <PhoneIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No call history yet</p>
          <p className="text-sm">Start making calls to see them here</p>
        </div>
      ) : (
        callHistory.map((call) => {
          const participant = getOtherParticipant(call);
          const isUnread = !call.isRead && call.receiver._id === authUser._id;

          return (
            <div
              key={call._id}
              onClick={() => markCallAsRead(call._id)}
              className={`p-3 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors ${
                isUnread ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-slate-800/30'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Participant Avatar */}
                <div className="size-10 rounded-full overflow-hidden">
                  <img
                    src={participant.profilePic || "/avatar.png"}
                    alt={participant.fullName}
                    className="size-full object-cover"
                  />
                </div>

                {/* Call Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-slate-200 font-medium truncate">
                      {participant.fullName}
                    </h4>
                    {isUnread && (
                      <div className="size-2 bg-cyan-400 rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    {getCallIcon(call)}
                    <span className={`${
                      call.status === 'missed' && call.receiver._id === authUser._id 
                        ? 'text-red-400' 
                        : 'text-slate-400'
                    }`}>
                      {getStatusText(call)}
                    </span>
                    {getCallTypeIcon(call.callType)}
                  </div>
                </div>

                {/* Call Info */}
                <div className="text-right">
                  <div className="text-slate-400 text-xs mb-1">
                    {formatCallTime(call.createdAt)}
                  </div>
                  
                  {call.status === 'completed' && call.duration > 0 && (
                    <div className="flex items-center gap-1 text-slate-500 text-xs">
                      <ClockIcon className="w-3 h-3" />
                      {formatCallDuration(call.duration)}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                  {/* Call Back Buttons */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCallBack(call, 'voice');
                    }}
                    className="p-2 text-slate-400 hover:text-green-400 transition-colors rounded-lg hover:bg-slate-700"
                    title="Voice Call"
                  >
                    <PhoneIcon className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCallBack(call, 'video');
                    }}
                    className="p-2 text-slate-400 hover:text-blue-400 transition-colors rounded-lg hover:bg-slate-700"
                    title="Video Call"
                  >
                    <VideoIcon className="w-4 h-4" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDeleteCall(call._id, e)}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-700"
                    title="Delete"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default CallHistoryList;