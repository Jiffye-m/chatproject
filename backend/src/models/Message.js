import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // For direct messages
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // For group messages
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    text: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    image: {
      type: String,
    },
    messageType: {
      type: String,
      enum: ['direct', 'group'],
      required: true,
      default: 'direct',
    }
  },
  { timestamps: true }
);

// Validation to ensure either receiverId or groupId is present, but not both
messageSchema.pre('validate', function(next) {
  if (this.messageType === 'direct') {
    if (!this.receiverId || this.groupId) {
      return next(new Error('Direct messages must have receiverId and no groupId'));
    }
  } else if (this.messageType === 'group') {
    if (!this.groupId || this.receiverId) {
      return next(new Error('Group messages must have groupId and no receiverId'));
    }
  }
  next();
});

const Message = mongoose.model("Message", messageSchema);

export default Message;