import { useEffect, useState } from "react";
import { useCallStore } from "../store/useCallStore";
import { useAuthStore } from "../store/useAuthStore";
import { PhoneIcon, VideoIcon, PhoneIncomingIcon, PhoneOutgoingIcon, PhoneMissedIcon, ClockIcon } from "lucide-react";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";

function CallHistory() {
  const { getCallHistory, callHistory, isCallHistoryLoading } = useCallStore();
  const { authUser } = useAuthStore();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    getCallHistory(1);
  }, [getCallHistory]);

  const getCallIcon = (call) => {
    const isOutgoing = call.caller._id === authUser._id;
    const iconClass = "size-4";
    
    if (call.status === 'missed' && !isOutgoing) {
      return <PhoneMissedIcon className={`${iconClass} text-red-400`} />;
    } else if (call.status === 'rejected') {
      return <PhoneMissedIcon className={`${iconClass} text-orange-400`} />;
    } else if (isOutgoing) {
      return <PhoneOutgoingIcon className={`${iconClass} text-green-400`} />;
    } else {
      return <PhoneIncomingIcon className={`${iconClass} text-blue-400`} />;
    }
  };

  const getCallTypeIcon = (callType) => {
    return callType === 'video' 
      ? <VideoIcon className="size-4 text-slate-400" />
      : <PhoneIcon className="size-4 text-slate-400" />;
  };

  const getCallStatusText = (call) => {
    const isOutgoing = call.caller._id === authUser._id;
    
    switch (call.status) {
      case 'completed':
        return `${call.duration > 0 ? formatDuration(call.duration) : 'Connected'}`;
      case 'missed':
        return isOutgoing ? 'No answer' : 'Missed';
      case 'rejected':
        return isOutgoing ? 'Declined' : 'Rejected';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'long' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getOtherParticipant = (call) => {
    return call.caller._id === authUser._id ? call.receiver : call.caller;
  };

  if (isCallHistoryLoading) {
    return <UsersLoadingSkeleton />;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-4 px-2">
        <ClockIcon className="size-5 text-slate-400" />
        <h3 className="text-slate-200 font-medium">Call History</h3>
      </div>

      {callHistory.length === 0 ? (
        <div className="text-center py-8">
          <PhoneIcon className="size-12 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400">No call history yet</p>
          <p className="text-slate-500 text-sm">Your calls will appear here</p>
        </div>
      ) : (
        <div className="space-y-1">
          {callHistory.map((call) => {
            const participant = getOtherParticipant(call);
            return (
              <div
                key={call._id}
                className="bg-slate-800/30 hover:bg-slate-700/30 p-3 rounded-lg transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="size-10 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src={participant.profilePic || "/avatar.png"}
                      alt={participant.fullName}
                      className="size-full object-cover"
                    />
                  </div>

                  {/* Call info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-slate-200 font-medium truncate">
                        {participant.fullName}
                      </h4>
                      <div className="flex items-center gap-1">
                        {getCallIcon(call)}
                        {getCallTypeIcon(call.callType)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-sm ${
                        call.status === 'missed' && call.receiver._id === authUser._id
                          ? 'text-red-400'
                          : 'text-slate-400'
                      }`}>
                        {getCallStatusText(call)}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatTime(call.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CallHistory;