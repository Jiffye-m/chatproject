import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL],
    credentials: true,
  },
});

// apply authentication middleware to all socket connections
io.use(socketAuthMiddleware);

// we will use this function to check if the user is online or not
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// this is for storing online users
const userSocketMap = {}; // {userId:socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.user.fullName);

  const userId = socket.userId;
  userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // === MESSAGE HANDLERS ===
  
  // Handle new message
  socket.on("newMessage", (newMessage) => {
    const receiverSocketId = getReceiverSocketId(newMessage.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
  });

  // Handle new group message
  socket.on("newGroupMessage", (newMessage) => {
    if (newMessage.groupMembers) {
      newMessage.groupMembers.forEach(memberId => {
        const memberSocketId = getReceiverSocketId(memberId);
        if (memberSocketId && memberSocketId !== socket.id) {
          io.to(memberSocketId).emit("newGroupMessage", newMessage);
        }
      });
    }
  });

  // === CALL HANDLERS ===

  // Handle call offer
  socket.on("call-offer", (data) => {
    console.log(`Call offer from ${socket.user.fullName} to user ${data.to}`);
    const receiverSocketId = getReceiverSocketId(data.to);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incoming-call", {
        offer: data.offer,
        callType: data.callType,
        caller: data.caller
      });
      console.log(`Call offer sent to receiver`);
    } else {
      // User is offline
      socket.emit("call-failed", { 
        reason: "User is offline",
        message: "The user you're trying to call is currently offline" 
      });
    }
  });

  // Handle call answer
  socket.on("call-answered", (data) => {
    console.log(`Call answered by ${socket.user.fullName}`);
    const callerSocketId = getReceiverSocketId(data.to);
    
    if (callerSocketId) {
      io.to(callerSocketId).emit("call-answered", {
        answer: data.answer
      });
      console.log(`Call answer sent to caller`);
    }
  });

  // Handle call rejection
  socket.on("call-rejected", (data) => {
    console.log(`Call rejected by ${socket.user.fullName}`);
    const callerSocketId = getReceiverSocketId(data.to);
    
    if (callerSocketId) {
      io.to(callerSocketId).emit("call-rejected");
      console.log(`Call rejection sent to caller`);
    }
  });

  // Handle call ended
  socket.on("call-ended", (data) => {
    console.log(`Call ended by ${socket.user.fullName}`);
    const otherUserSocketId = getReceiverSocketId(data.to);
    
    if (otherUserSocketId) {
      io.to(otherUserSocketId).emit("call-ended");
      console.log(`Call end notification sent`);
    }
  });

  // Handle ICE candidates
  socket.on("ice-candidate", (data) => {
    const receiverSocketId = getReceiverSocketId(data.to);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("ice-candidate", {
        candidate: data.candidate
      });
    }
  });

  // === GROUP HANDLERS ===

  // Handle new group
  socket.on("newGroup", (groupData) => {
    groupData.members?.forEach(memberId => {
      const memberSocketId = getReceiverSocketId(memberId);
      if (memberSocketId && memberSocketId !== socket.id) {
        io.to(memberSocketId).emit("newGroup", groupData);
      }
    });
  });

  // Handle group updated
  socket.on("groupUpdated", (groupData) => {
    groupData.members?.forEach(memberId => {
      const memberSocketId = getReceiverSocketId(memberId);
      if (memberSocketId) {
        io.to(memberSocketId).emit("groupUpdated", groupData);
      }
    });
  });

  // Handle group deleted
  socket.on("groupDeleted", (data) => {
    data.memberIds?.forEach(memberId => {
      const memberSocketId = getReceiverSocketId(memberId);
      if (memberSocketId) {
        io.to(memberSocketId).emit("groupDeleted", {
          groupId: data.groupId,
          groupName: data.groupName
        });
      }
    });
  });

  // Handle group member added
  socket.on("groupMemberAdded", (data) => {
    data.group?.members?.forEach(memberId => {
      const memberSocketId = getReceiverSocketId(memberId);
      if (memberSocketId) {
        io.to(memberSocketId).emit("groupMemberAdded", data);
      }
    });
  });

  // Handle group member removed
  socket.on("groupMemberRemoved", (data) => {
    data.group?.members?.forEach(memberId => {
      const memberSocketId = getReceiverSocketId(memberId);
      if (memberSocketId) {
        io.to(memberSocketId).emit("groupMemberRemoved", data);
      }
    });

    // Notify the removed member
    const removedMemberSocketId = getReceiverSocketId(data.removedMemberId);
    if (removedMemberSocketId) {
      io.to(removedMemberSocketId).emit("removedFromGroup", {
        groupId: data.group._id,
        groupName: data.group.name
      });
    }
  });

  // with socket.on we listen for events from clients
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.user.fullName);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };