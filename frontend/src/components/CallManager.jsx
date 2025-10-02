import { useEffect } from "react";
import { useCallStore } from "../store/useCallStore";
import { useAuthStore } from "../store/useAuthStore";
import IncomingCallModal from "./IncomingCallModal";
import CallInterface from "./CallInterface";

function CallManager() {
  const { 
    initializeCallListeners, 
    cleanupCallListeners, 
    incomingCall, 
    callStatus,
    isCallModalOpen
  } = useCallStore();
  
  const { socket } = useAuthStore();

  useEffect(() => {
    if (socket) {
      initializeCallListeners();
      return () => cleanupCallListeners();
    }
  }, [socket, initializeCallListeners, cleanupCallListeners]);

  return (
    <>
      {/* Incoming Call Modal */}
      {incomingCall && callStatus === 'ringing' && <IncomingCallModal />}
      
      {/* Active Call Interface */}
      {isCallModalOpen && <CallInterface />}
    </>
  );
}

export default CallManager;