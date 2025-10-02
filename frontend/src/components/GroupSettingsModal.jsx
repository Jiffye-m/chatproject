import { useState, useRef } from "react";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { XIcon, UserPlusIcon, UserMinusIcon, TrashIcon, LogOutIcon, CameraIcon, EditIcon, CheckIcon } from "lucide-react";
import toast from "react-hot-toast";

function GroupSettingsModal({ group, onClose }) {
  const { updateGroup, deleteGroup, addMemberToGroup, removeMemberFromGroup, leaveGroup } = useGroupStore();
  const { authUser } = useAuthStore();
  const { allContacts, getAllContacts } = useChatStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: group.name,
    description: group.description || "",
    profilePic: "",
  });
  const [showAddMember, setShowAddMember] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const isAdmin = group.admin._id === authUser._id;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Image = reader.result;
      setImagePreview(base64Image);
      setEditData({ ...editData, profilePic: base64Image });
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateGroup = async () => {
    if (!editData.name.trim()) {
      toast.error("Group name is required");
      return;
    }

    try {
      await updateGroup(group._id, editData);
      setIsEditing(false);
      setImagePreview(null);
    } catch (error) {
      // Error is handled in the store
    }
  };

  const handleDeleteGroup = async () => {
    if (window.confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
      try {
        await deleteGroup(group._id);
        onClose();
      } catch (error) {
        // Error is handled in the store
      }
    }
  };

  const handleLeaveGroup = async () => {
    if (window.confirm("Are you sure you want to leave this group?")) {
      try {
        await leaveGroup(group._id);
        onClose();
      } catch (error) {
        // Error is handled in the store
      }
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      try {
        await removeMemberFromGroup(group._id, memberId);
      } catch (error) {
        // Error is handled in the store
      }
    }
  };

  const availableContacts = allContacts.filter(contact => 
    !group.members.some(member => member._id === contact._id)
  );

  const handleAddMember = async (contactId) => {
    try {
      await addMemberToGroup(group._id, [contactId]);
      setShowAddMember(false);
    } catch (error) {
      // Error is handled in the store
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-slate-200">Group Settings</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Group Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="size-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-400/10 flex items-center justify-center overflow-hidden">
                  {imagePreview || group.profilePic ? (
                    <img 
                      src={imagePreview || group.profilePic} 
                      alt={group.name}
                      className="size-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">{group.name[0]?.toUpperCase()}</span>
                  )}
                </div>
                {isAdmin && isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 size-6 bg-cyan-500 rounded-full flex items-center justify-center text-white hover:bg-cyan-600"
                  >
                    <CameraIcon className="size-3" />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    placeholder="Group name"
                  />
                ) : (
                  <h3 className="text-xl font-semibold text-slate-200">{group.name}</h3>
                )}
                <p className="text-slate-400 text-sm mt-1">{group.members.length} members</p>
              </div>

              {isAdmin && (
                <button
                  onClick={() => {
                    if (isEditing) {
                      handleUpdateGroup();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  {isEditing ? <CheckIcon className="size-5" /> : <EditIcon className="size-5" />}
                </button>
              )}
            </div>

            {/* Description */}
            {isEditing ? (
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 resize-none"
                placeholder="Group description"
                rows={3}
              />
            ) : group.description && (
              <p className="text-slate-300 text-sm bg-slate-700/50 p-3 rounded-lg">
                {group.description}
              </p>
            )}
          </div>

          {/* Members */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-slate-200 font-medium">Members ({group.members.length})</h4>
              {isAdmin && (
                <button
                  onClick={() => {
                    if (allContacts.length === 0) getAllContacts();
                    setShowAddMember(true);
                  }}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 text-sm"
                >
                  <UserPlusIcon className="size-4" />
                  Add Member
                </button>
              )}
            </div>

            <div className="max-h-40 overflow-y-auto space-y-2">
              {group.members.map((member) => (
                <div key={member._id} className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full overflow-hidden">
                      <img 
                        src={member.profilePic || "/avatar.png"} 
                        alt={member.fullName}
                        className="size-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="text-slate-200 text-sm">{member.fullName}</span>
                      {member._id === group.admin._id && (
                        <span className="text-xs text-cyan-400 ml-2">Admin</span>
                      )}
                    </div>
                  </div>

                  {isAdmin && member._id !== authUser._id && (
                    <button
                      onClick={() => handleRemoveMember(member._id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <UserMinusIcon className="size-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add Member Modal */}
          {showAddMember && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-60">
              <div className="bg-slate-800 rounded-lg p-4 max-w-sm w-full m-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-slate-200">Add Members</h3>
                  <button
                    onClick={() => setShowAddMember(false)}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    <XIcon className="size-4" />
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {availableContacts.map((contact) => (
                    <div
                      key={contact._id}
                      onClick={() => handleAddMember(contact._id)}
                      className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors"
                    >
                      <div className="size-8 rounded-full overflow-hidden">
                        <img 
                          src={contact.profilePic || "/avatar.png"} 
                          alt={contact.fullName}
                          className="size-full object-cover"
                        />
                      </div>
                      <span className="text-slate-200 text-sm">{contact.fullName}</span>
                    </div>
                  ))}
                  {availableContacts.length === 0 && (
                    <p className="text-slate-400 text-sm text-center py-4">
                      No available contacts to add
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-4 border-t border-slate-700">
            {!isAdmin && (
              <button
                onClick={handleLeaveGroup}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-orange-400 border border-orange-400/20 rounded-lg hover:bg-orange-400/10 transition-colors"
              >
                <LogOutIcon className="size-4" />
                Leave Group
              </button>
            )}

            {isAdmin && (
              <button
                onClick={handleDeleteGroup}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-400 border border-red-400/20 rounded-lg hover:bg-red-400/10 transition-colors"
              >
                <TrashIcon className="size-4" />
                Delete Group
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupSettingsModal;