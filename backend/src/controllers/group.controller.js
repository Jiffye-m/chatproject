import cloudinary from "../lib/cloudinary.js";
import { io } from "../lib/socket.js";
import Group from "../models/Group.js";
import User from "../models/User.js";
import Message from "../models/Message.js";

export const createGroup = async (req, res) => {
  try {
    const { name, description, profilePic, memberIds = [] } = req.body;
    const adminId = req.user._id;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Group name is required" });
    }

    // Validate member IDs
    if (memberIds.length > 0) {
      const validMembers = await User.find({ _id: { $in: memberIds } });
      if (validMembers.length !== memberIds.length) {
        return res.status(400).json({ message: "Some member IDs are invalid" });
      }
    }

    let imageUrl;
    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      imageUrl = uploadResponse.secure_url;
    }

    const newGroup = new Group({
      name: name.trim(),
      description: description?.trim(),
      profilePic: imageUrl,
      admin: adminId,
      members: [adminId, ...memberIds.filter(id => id !== adminId.toString())]
    });

    await newGroup.save();
    
    // Populate the group with member details
    const populatedGroup = await Group.findById(newGroup._id)
      .populate('admin', '-password')
      .populate('members', '-password');

    // Emit to all group members that a new group was created
    populatedGroup.members.forEach(member => {
      if (member._id.toString() !== adminId.toString()) {
        io.to(member._id.toString()).emit("newGroup", populatedGroup);
      }
    });

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error("Error in createGroup controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const groups = await Group.find({ 
      members: userId,
      isActive: true 
    })
    .populate('admin', '-password')
    .populate('members', '-password')
    .sort({ updatedAt: -1 });

    res.status(200).json(groups);
  } catch (error) {
    console.error("Error in getUserGroups controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getGroupDetails = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findOne({ 
      _id: groupId,
      members: userId,
      isActive: true 
    })
    .populate('admin', '-password')
    .populate('members', '-password');

    if (!group) {
      return res.status(404).json({ message: "Group not found or you're not a member" });
    }

    res.status(200).json(group);
  } catch (error) {
    console.error("Error in getGroupDetails controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const { name, description, profilePic } = req.body;
    const userId = req.user._id;

    const group = await Group.findOne({ _id: groupId, admin: userId });
    if (!group) {
      return res.status(403).json({ message: "Only group admin can update group details" });
    }

    let imageUrl = group.profilePic;
    if (profilePic && profilePic !== group.profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      imageUrl = uploadResponse.secure_url;
    }

    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() }),
        ...(profilePic && { profilePic: imageUrl })
      },
      { new: true }
    )
    .populate('admin', '-password')
    .populate('members', '-password');

    // Notify all group members about the update
    updatedGroup.members.forEach(member => {
      io.to(member._id.toString()).emit("groupUpdated", updatedGroup);
    });

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Error in updateGroup controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addMemberToGroup = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const { memberIds } = req.body;
    const userId = req.user._id;

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ message: "Member IDs are required" });
    }

    const group = await Group.findOne({ _id: groupId, admin: userId });
    if (!group) {
      return res.status(403).json({ message: "Only group admin can add members" });
    }

    // Validate new member IDs
    const validMembers = await User.find({ _id: { $in: memberIds } });
    if (validMembers.length !== memberIds.length) {
      return res.status(400).json({ message: "Some member IDs are invalid" });
    }

    // Check if adding these members would exceed the limit
    const newMemberIds = memberIds.filter(id => !group.members.includes(id));
    if (group.members.length + newMemberIds.length > group.maxMembers) {
      return res.status(400).json({ 
        message: `Cannot add members. Group limit is ${group.maxMembers}` 
      });
    }

    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { $addToSet: { members: { $each: newMemberIds } } },
      { new: true }
    )
    .populate('admin', '-password')
    .populate('members', '-password');

    // Notify all members about new additions
    updatedGroup.members.forEach(member => {
      io.to(member._id.toString()).emit("groupMemberAdded", {
        group: updatedGroup,
        newMembers: validMembers.filter(m => newMemberIds.includes(m._id.toString()))
      });
    });

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Error in addMemberToGroup controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const removeMemberFromGroup = async (req, res) => {
  try {
    const { id: groupId, memberId } = req.params;
    const userId = req.user._id;

    const group = await Group.findOne({ _id: groupId, admin: userId });
    if (!group) {
      return res.status(403).json({ message: "Only group admin can remove members" });
    }

    if (memberId === userId.toString()) {
      return res.status(400).json({ message: "Admin cannot remove themselves. Transfer admin rights first or delete the group." });
    }

    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { $pull: { members: memberId } },
      { new: true }
    )
    .populate('admin', '-password')
    .populate('members', '-password');

    // Notify all remaining members and the removed member
    updatedGroup.members.forEach(member => {
      io.to(member._id.toString()).emit("groupMemberRemoved", {
        group: updatedGroup,
        removedMemberId: memberId
      });
    });

    // Notify the removed member
    io.to(memberId).emit("removedFromGroup", { groupId, groupName: group.name });

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Error in removeMemberFromGroup controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.includes(userId)) {
      return res.status(400).json({ message: "You're not a member of this group" });
    }

    if (group.admin.toString() === userId.toString()) {
      return res.status(400).json({ 
        message: "Admin cannot leave the group. Transfer admin rights first or delete the group." 
      });
    }

    await Group.findByIdAndUpdate(
      groupId,
      { $pull: { members: userId } }
    );

    const updatedGroup = await Group.findById(groupId)
      .populate('admin', '-password')
      .populate('members', '-password');

    // Notify remaining members
    updatedGroup.members.forEach(member => {
      io.to(member._id.toString()).emit("groupMemberLeft", {
        group: updatedGroup,
        leftMemberId: userId
      });
    });

    res.status(200).json({ message: "Left group successfully" });
  } catch (error) {
    console.error("Error in leaveGroup controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findOne({ _id: groupId, admin: userId });
    if (!group) {
      return res.status(403).json({ message: "Only group admin can delete the group" });
    }

    // Soft delete by marking as inactive
    await Group.findByIdAndUpdate(groupId, { isActive: false });

    // Notify all members that the group was deleted
    group.members.forEach(memberId => {
      io.to(memberId.toString()).emit("groupDeleted", { groupId, groupName: group.name });
    });

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error in deleteGroup controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};