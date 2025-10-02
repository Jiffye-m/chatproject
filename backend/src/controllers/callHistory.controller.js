import CallHistory from "../models/CallHistory.js";
import User from "../models/User.js";

export const createCallHistory = async (callData) => {
  try {
    const callHistory = new CallHistory({
      caller: callData.caller,
      receiver: callData.receiver,
      callType: callData.callType,
      status: callData.status,
      duration: callData.duration || 0,
      startedAt: callData.startedAt,
      endedAt: callData.endedAt,
    });

    await callHistory.save();
    return callHistory;
  } catch (error) {
    console.error("Error creating call history:", error);
    throw error;
  }
};

export const getCallHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const calls = await CallHistory.find({
      $or: [{ caller: userId }, { receiver: userId }]
    })
    .populate('caller', 'fullName profilePic')
    .populate('receiver', 'fullName profilePic')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    // Mark calls as read when fetched
    await CallHistory.updateMany(
      {
        $or: [
          { caller: userId, isRead: false },
          { receiver: userId, isRead: false }
        ]
      },
      { isRead: true }
    );

    const totalCalls = await CallHistory.countDocuments({
      $or: [{ caller: userId }, { receiver: userId }]
    });

    res.status(200).json({
      calls,
      totalPages: Math.ceil(totalCalls / limit),
      currentPage: page,
      totalCalls
    });
  } catch (error) {
    console.error("Error in getCallHistory:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCallHistoryWithUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { otherUserId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Verify other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const calls = await CallHistory.find({
      $or: [
        { caller: userId, receiver: otherUserId },
        { caller: otherUserId, receiver: userId }
      ]
    })
    .populate('caller', 'fullName profilePic')
    .populate('receiver', 'fullName profilePic')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const totalCalls = await CallHistory.countDocuments({
      $or: [
        { caller: userId, receiver: otherUserId },
        { caller: otherUserId, receiver: userId }
      ]
    });

    res.status(200).json({
      calls,
      totalPages: Math.ceil(totalCalls / limit),
      currentPage: page,
      totalCalls,
      otherUser: {
        _id: otherUser._id,
        fullName: otherUser.fullName,
        profilePic: otherUser.profilePic
      }
    });
  } catch (error) {
    console.error("Error in getCallHistoryWithUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMissedCalls = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const missedCalls = await CallHistory.find({
      receiver: userId,
      status: 'missed',
      isRead: false
    })
    .populate('caller', 'fullName profilePic')
    .populate('receiver', 'fullName profilePic')
    .sort({ createdAt: -1 });

    res.status(200).json(missedCalls);
  } catch (error) {
    console.error("Error in getMissedCalls:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markCallAsRead = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user._id;

    const call = await CallHistory.findOneAndUpdate(
      { 
        _id: callId,
        $or: [{ caller: userId }, { receiver: userId }]
      },
      { isRead: true },
      { new: true }
    );

    if (!call) {
      return res.status(404).json({ message: "Call not found" });
    }

    res.status(200).json({ message: "Call marked as read" });
  } catch (error) {
    console.error("Error in markCallAsRead:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteCallHistory = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user._id;

    const call = await CallHistory.findOneAndDelete({
      _id: callId,
      $or: [{ caller: userId }, { receiver: userId }]
    });

    if (!call) {
      return res.status(404).json({ message: "Call not found" });
    }

    res.status(200).json({ message: "Call deleted successfully" });
  } catch (error) {
    console.error("Error in deleteCallHistory:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCallStatistics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { timeframe = '30' } = req.query; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));

    const stats = await CallHistory.aggregate([
      {
        $match: {
          $or: [{ caller: userId }, { receiver: userId }],
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalCalls: { $sum: 1 },
          voiceCalls: {
            $sum: { $cond: [{ $eq: ["$callType", "voice"] }, 1, 0] }
          },
          videoCalls: {
            $sum: { $cond: [{ $eq: ["$callType", "video"] }, 1, 0] }
          },
          completedCalls: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          },
          missedCalls: {
            $sum: { $cond: [{ $eq: ["$status", "missed"] }, 1, 0] }
          },
          rejectedCalls: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] }
          },
          totalDuration: { $sum: "$duration" },
          averageDuration: { $avg: "$duration" }
        }
      }
    ]);

    const result = stats[0] || {
      totalCalls: 0,
      voiceCalls: 0,
      videoCalls: 0,
      completedCalls: 0,
      missedCalls: 0,
      rejectedCalls: 0,
      totalDuration: 0,
      averageDuration: 0
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getCallStatistics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};