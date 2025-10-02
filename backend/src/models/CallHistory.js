import mongoose from "mongoose";

const callHistorySchema = new mongoose.Schema(
  {
    caller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    callType: {
      type: String,
      enum: ['voice', 'video'],
      required: true,
    },
    status: {
      type: String,
      enum: ['completed', 'missed', 'rejected', 'failed'],
      required: true,
    },
    duration: {
      type: Number, // duration in seconds
      default: 0,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    endedAt: {
      type: Date,
    },
    // For grouping calls in UI (missed calls, etc.)
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for efficient querying
callHistorySchema.index({ caller: 1, createdAt: -1 });
callHistorySchema.index({ receiver: 1, createdAt: -1 });
callHistorySchema.index({ startedAt: -1 });

// Virtual for call participants (useful for queries)
callHistorySchema.virtual('participants').get(function() {
  return [this.caller, this.receiver];
});

const CallHistory = mongoose.model("CallHistory", callHistorySchema);

export default CallHistory;