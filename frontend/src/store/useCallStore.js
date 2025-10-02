import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useCallStore = create((set, get) => ({
  // Call state
  incomingCall: null,
  currentCall: null,
  isCallActive: false,
  callType: null, // 'voice' | 'video'
  callStatus: 'idle', // 'idle' | 'calling' | 'ringing' | 'connected' | 'ended'
  
  // WebRTC
  localStream: null,
  remoteStream: null,
  peerConnection: null,
  
  // UI state
  isVideoEnabled: true,
  isAudioEnabled: true,
  isCallModalOpen: false,
  callDuration: 0,
  callTimer: null,
  callStartTime: null,
  callConnectedTime: null,

  // Call History
  callHistory: [],
  isCallHistoryLoading: false,
  missedCalls: [],

  // WebRTC configuration
  rtcConfig: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  },

  startCall: async (recipient, type) => {
    const socket = useAuthStore.getState().socket;
    if (!socket) {
      toast.error("Connection error. Please refresh and try again.");
      return;
    }

    try {
      set({ 
        callStatus: 'calling', 
        callType: type, 
        isCallModalOpen: true,
        callStartTime: new Date()
      });

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video',
        audio: true
      });

      set({ localStream: stream });

      // Create peer connection
      const pc = new RTCPeerConnection(get().rtcConfig);
      set({ peerConnection: pc });

      // Add local stream tracks to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Handle remote stream
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        set({ remoteStream });
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            to: recipient._id,
            candidate: event.candidate
          });
        }
      };

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send call offer
      socket.emit("call-offer", {
        to: recipient._id,
        offer: offer,
        callType: type,
        caller: useAuthStore.getState().authUser
      });

      set({
        currentCall: {
          participant: recipient,
          type: type,
          isInitiator: true
        }
      });

    } catch (error) {
      console.error("Error starting call:", error);
      toast.error("Failed to start call. Please check your camera/microphone permissions.");
      get().endCall();
    }
  },

  answerCall: async (accept) => {
    const { incomingCall } = get();
    const socket = useAuthStore.getState().socket;
    
    if (!incomingCall || !socket) return;

    if (!accept) {
      socket.emit("call-rejected", { to: incomingCall.caller._id });
      set({ 
        incomingCall: null, 
        callStatus: 'idle',
        isCallModalOpen: false 
      });
      return;
    }

    try {
      set({ 
        callStatus: 'connected', 
        callType: incomingCall.callType,
        isCallModalOpen: true 
      });

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: incomingCall.callType === 'video',
        audio: true
      });

      set({ localStream: stream });

      // Create peer connection
      const pc = new RTCPeerConnection(get().rtcConfig);
      set({ peerConnection: pc });

      // Add local stream tracks
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Handle remote stream
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        set({ remoteStream });
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            to: incomingCall.caller._id,
            candidate: event.candidate
          });
        }
      };

      // Set remote description and create answer
      await pc.setRemoteDescription(incomingCall.offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Send answer
      socket.emit("call-answered", {
        to: incomingCall.caller._id,
        answer: answer
      });

      set({
        currentCall: {
          participant: incomingCall.caller,
          type: incomingCall.callType,
          isInitiator: false
        },
        incomingCall: null,
        isCallActive: true
      });

      get().startCallTimer();

    } catch (error) {
      console.error("Error answering call:", error);
      toast.error("Failed to answer call. Please check your camera/microphone permissions.");
      get().endCall();
    }
  },

  endCall: () => {
    const { currentCall, localStream, peerConnection, callTimer, callStartTime, callConnectedTime, callType } = get();
    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser;

    // Calculate call duration and create call history
    if (currentCall && callStartTime) {
      const endTime = new Date();
      const duration = callConnectedTime 
        ? Math.floor((endTime - callConnectedTime) / 1000)
        : 0;

      const callHistoryData = {
        caller: currentCall.isInitiator ? authUser._id : currentCall.participant._id,
        receiver: currentCall.isInitiator ? currentCall.participant._id : authUser._id,
        callType: callType,
        status: duration > 0 ? 'completed' : 'failed',
        duration: duration,
        startedAt: callStartTime,
        endedAt: endTime
      };

      // Save call history
      get().saveCallHistory(callHistoryData);
    }

    // Notify other participant
    if (currentCall && socket) {
      socket.emit("call-ended", { to: currentCall.participant._id });
    }

    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    // Close peer connection
    if (peerConnection) {
      peerConnection.close();
    }

    // Clear timer
    if (callTimer) {
      clearInterval(callTimer);
    }

    // Reset state
    set({
      incomingCall: null,
      currentCall: null,
      isCallActive: false,
      callType: null,
      callStatus: 'idle',
      localStream: null,
      remoteStream: null,
      peerConnection: null,
      isVideoEnabled: true,
      isAudioEnabled: true,
      isCallModalOpen: false,
      callDuration: 0,
      callTimer: null,
      callStartTime: null,
      callConnectedTime: null
    });
  },

  toggleVideo: () => {
    const { localStream, isVideoEnabled } = get();
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        set({ isVideoEnabled: !isVideoEnabled });
      }
    }
  },

  toggleAudio: () => {
    const { localStream, isAudioEnabled } = get();
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        set({ isAudioEnabled: !isAudioEnabled });
      }
    }
  },

  startCallTimer: () => {
    set({ callConnectedTime: new Date() });
    const timer = setInterval(() => {
      set(state => ({ callDuration: state.callDuration + 1 }));
    }, 1000);
    set({ callTimer: timer });
  },

  // Call History Methods
  saveCallHistory: async (callData) => {
    try {
      await axiosInstance.post("/call-history", callData);
      // Optionally refresh call history
      get().getCallHistory();
    } catch (error) {
      console.error("Failed to save call history:", error);
    }
  },

  getCallHistory: async (page = 1) => {
    set({ isCallHistoryLoading: true });
    try {
      const res = await axiosInstance.get(`/call-history?page=${page}&limit=20`);
      set({ callHistory: res.data.calls });
      return res.data;
    } catch (error) {
      console.error("Failed to get call history:", error);
      toast.error("Failed to load call history");
    } finally {
      set({ isCallHistoryLoading: false });
    }
  },

  getCallHistoryWithUser: async (userId, page = 1) => {
    set({ isCallHistoryLoading: true });
    try {
      const res = await axiosInstance.get(`/call-history/user/${userId}?page=${page}&limit=20`);
      return res.data;
    } catch (error) {
      console.error("Failed to get call history with user:", error);
      toast.error("Failed to load call history");
    } finally {
      set({ isCallHistoryLoading: false });
    }
  },

  getMissedCalls: async () => {
    try {
      const res = await axiosInstance.get("/call-history/missed");
      set({ missedCalls: res.data });
      return res.data;
    } catch (error) {
      console.error("Failed to get missed calls:", error);
    }
  },

  markCallAsRead: async (callId) => {
    try {
      await axiosInstance.patch(`/call-history/${callId}/read`);
      // Update local state
      set(state => ({
        callHistory: state.callHistory.map(call =>
          call._id === callId ? { ...call, isRead: true } : call
        ),
        missedCalls: state.missedCalls.filter(call => call._id !== callId)
      }));
    } catch (error) {
      console.error("Failed to mark call as read:", error);
    }
  },

  deleteCallHistory: async (callId) => {
    try {
      await axiosInstance.delete(`/call-history/${callId}`);
      // Update local state
      set(state => ({
        callHistory: state.callHistory.filter(call => call._id !== callId)
      }));
      toast.success("Call deleted from history");
    } catch (error) {
      console.error("Failed to delete call:", error);
      toast.error("Failed to delete call");
    }
  },

  getCallStatistics: async (timeframe = 30) => {
    try {
      const res = await axiosInstance.get(`/call-history/statistics?timeframe=${timeframe}`);
      return res.data;
    } catch (error) {
      console.error("Failed to get call statistics:", error);
      return null;
    }
  },

  // Socket event handlers
  handleIncomingCall: (data) => {
    set({
      incomingCall: data,
      callStatus: 'ringing'
    });
  },

  handleCallAnswered: async (data) => {
    const { peerConnection } = get();
    if (peerConnection) {
      await peerConnection.setRemoteDescription(data.answer);
      set({ 
        callStatus: 'connected',
        isCallActive: true 
      });
      get().startCallTimer();
    }
  },

  handleCallRejected: () => {
    toast.info("Call was rejected");
    get().endCall();
  },

  handleCallEnded: () => {
    toast.info("Call ended");
    get().endCall();
  },

  handleIceCandidate: async (data) => {
    const { peerConnection } = get();
    if (peerConnection) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    }
  },

  // Initialize socket listeners
  initializeCallListeners: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("incoming-call", get().handleIncomingCall);
    socket.on("call-answered", get().handleCallAnswered);
    socket.on("call-rejected", get().handleCallRejected);
    socket.on("call-ended", get().handleCallEnded);
    socket.on("ice-candidate", get().handleIceCandidate);
  },

  // Cleanup socket listeners
  cleanupCallListeners: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("incoming-call");
    socket.off("call-answered");
    socket.off("call-rejected");
    socket.off("call-ended");
    socket.off("ice-candidate");
  },

  formatCallDuration: (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}));