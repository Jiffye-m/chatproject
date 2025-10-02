import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    profilePic: {
      type: String,
      default: "",
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    maxMembers: {
      type: Number,
      default: 100,
    }
  },
  { timestamps: true }
);

// Ensure admin is always in members array
groupSchema.pre('save', function(next) {
  if (!this.members.includes(this.admin)) {
    this.members.push(this.admin);
  }
  next();
});

const Group = mongoose.model("Group", groupSchema);

export default Group;