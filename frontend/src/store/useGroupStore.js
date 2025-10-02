import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useGroupStore = create((set, get) => ({
  groups: [],
  selectedGroup: null,
  groupMessages: [],
  isGroupsLoading: false,
  isGroupMessagesLoading: false,
  isCreatingGroup: false,

  setSelectedGroup: (selectedGroup) => set({ selectedGroup }),

  getUserGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups");
      set({ groups: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch groups");
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  createGroup: async (groupData) => {
    set({ isCreatingGroup: true });
    try {
      const res = await axiosInstance.post("/groups/create", groupData);
      const newGroup = res.data;
      set({ groups: [newGroup, ...get().groups] });
      toast.success("Group created successfully!");
      return newGroup;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
      throw error;
    } finally {
      set({ isCreatingGroup: false });
    }
  },

  updateGroup: async (groupId, updateData) => {
    try {
      const res = await axiosInstance.put(`/groups/${groupId}`, updateData);
      const updatedGroup = res.data;
      
      set({
        groups: get().groups.map(g => g._id === groupId ? updatedGroup : g),
        selectedGroup: get().selectedGroup?._id === groupId ? updatedGroup : get().selectedGroup
      });
      
      toast.success("Group updated successfully!");
      return updatedGroup;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update group");
      throw error;
    }
  },

  deleteGroup: async (groupId) => {
    try {
      await axiosInstance.delete(`/groups/${groupId}`);
      set({
        groups: get().groups.filter(g => g._id !== groupId),
        selectedGroup: get().selectedGroup?._id === groupId ? null : get().selectedGroup
      });
      toast.success("Group deleted successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete group");
      throw error;
    }
  },

  addMemberToGroup: async (groupId, memberIds) => {
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/members`, { memberIds });
      const updatedGroup = res.data;
      
      set({
        groups: get().groups.map(g => g._id === groupId ? updatedGroup : g),
        selectedGroup: get().selectedGroup?._id === groupId ? updatedGroup : get().selectedGroup
      });
      
      toast.success("Members added successfully!");
      return updatedGroup;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add members");
      throw error;
    }
  },

  removeMemberFromGroup: async (groupId, memberId) => {
    try {
      const res = await axiosInstance.delete(`/groups/${groupId}/members/${memberId}`);
      const updatedGroup = res.data;
      
      set({
        groups: get().groups.map(g => g._id === groupId ? updatedGroup : g),
        selectedGroup: get().selectedGroup?._id === groupId ? updatedGroup : get().selectedGroup
      });
      
      toast.success("Member removed successfully!");
      return updatedGroup;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove member");
      throw error;
    }
  },

  leaveGroup: async (groupId) => {
    try {
      await axiosInstance.post(`/groups/${groupId}/leave`);
      set({
        groups: get().groups.filter(g => g._id !== groupId),
        selectedGroup: get().selectedGroup?._id === groupId ? null : get().selectedGroup
      });
      toast.success("Left group successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to leave group");
      throw error;
    }
  },

  getGroupMessages: async (groupId) => {
    set({ isGroupMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/group/${groupId}`);
      set({ groupMessages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch group messages");
    } finally {
      set({ isGroupMessagesLoading: false });
    }
  },

  sendGroupMessage: async (messageData) => {
    const { selectedGroup, groupMessages } = get();
    const { authUser } = useAuthStore.getState();

    if (!selectedGroup) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      senderId: {
        _id: authUser._id,
        fullName: authUser.fullName,
        profilePic: authUser.profilePic
      },
      groupId: selectedGroup._id,
      text: messageData.text,
      image: messageData.image,
      messageType: 'group',
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    // Immediately update the UI
    set({ groupMessages: [...groupMessages, optimisticMessage] });

    try {
      const res = await axiosInstance.post(`/messages/send-group/${selectedGroup._id}`, messageData);
      // Replace optimistic message with real one
      set({ 
        groupMessages: groupMessages.concat(res.data)
      });
    } catch (error) {
      // Remove optimistic message on failure
      set({ groupMessages: groupMessages });
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToGroupMessages: () => {
    const { selectedGroup } = get();
    if (!selectedGroup) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newGroupMessage", (newMessage) => {
      const currentMessages = get().groupMessages;
      set({ groupMessages: [...currentMessages, newMessage] });
    });

    socket.on("groupUpdated", (updatedGroup) => {
      set({
        groups: get().groups.map(g => g._id === updatedGroup._id ? updatedGroup : g),
        selectedGroup: get().selectedGroup?._id === updatedGroup._id ? updatedGroup : get().selectedGroup
      });
    });

    socket.on("newGroup", (newGroup) => {
      set({ groups: [newGroup, ...get().groups] });
    });

    socket.on("groupDeleted", ({ groupId }) => {
      set({
        groups: get().groups.filter(g => g._id !== groupId),
        selectedGroup: get().selectedGroup?._id === groupId ? null : get().selectedGroup
      });
      toast.info("Group was deleted");
    });

    socket.on("removedFromGroup", ({ groupId, groupName }) => {
      set({
        groups: get().groups.filter(g => g._id !== groupId),
        selectedGroup: get().selectedGroup?._id === groupId ? null : get().selectedGroup
      });
      toast.info(`You were removed from ${groupName}`);
    });

    socket.on("groupMemberAdded", ({ group }) => {
      set({
        groups: get().groups.map(g => g._id === group._id ? group : g),
        selectedGroup: get().selectedGroup?._id === group._id ? group : get().selectedGroup
      });
    });

    socket.on("groupMemberRemoved", ({ group }) => {
      set({
        groups: get().groups.map(g => g._id === group._id ? group : g),
        selectedGroup: get().selectedGroup?._id === group._id ? group : get().selectedGroup
      });
    });
  },

  unsubscribeFromGroupMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newGroupMessage");
    socket.off("groupUpdated");
    socket.off("newGroup");
    socket.off("groupDeleted");
    socket.off("removedFromGroup");
    socket.off("groupMemberAdded");
    socket.off("groupMemberRemoved");
  },
}));