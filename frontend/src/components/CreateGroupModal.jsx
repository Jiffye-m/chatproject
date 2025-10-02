import { useState, useRef, useEffect } from "react";
import { useGroupStore } from "../store/useGroupStore";
import { useChatStore } from "../store/useChatStore";
import { XIcon, CameraIcon, UsersIcon, CheckIcon } from "lucide-react";
import toast from "react-hot-toast";

function CreateGroupModal({ onClose }) {
  const { createGroup, isCreatingGroup } = useGroupStore();
  const { allContacts, getAllContacts } = useChatStore();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    profilePic: "",
  });
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (allContacts.length === 0) {
      getAllContacts();
    }
  }, [allContacts.length, getAllContacts]);

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
      setFormData({ ...formData, profilePic: base64Image });
    };
    reader.readAsDataURL(file);
  };

  const toggleMemberSelection = (contact) => {
    setSelectedMembers(prev => {
      if (prev.find(m => m._id === contact._id)) {
        return prev.filter(m => m._id !== contact._id);
      } else {
        return [...prev, contact];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Group name is required");
      return;
    }

    try {
      const groupData = {
        ...formData,
        memberIds: selectedMembers.map(m => m._id),
      };

      const newGroup = await createGroup(groupData);
      onClose();
      
      // Optionally select the new group immediately
      // setSelectedGroup(newGroup);
    } catch (error) {
      // Error is handled in the store
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-slate-200">Create New Group</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Group Image */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="size-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-400/10 flex items-center justify-center border-2 border-dashed border-cyan-500/30 hover:border-cyan-500/50 transition-colors"
              >
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Group" 
                    className="size-16 rounded-full object-cover"
                  />
                ) : (
                  <CameraIcon className="size-6 text-cyan-400" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <div>
              <h3 className="text-slate-200 font-medium">Group Photo</h3>
              <p className="text-slate-400 text-sm">Click to upload</p>
            </div>
          </div>

          {/* Group Name */}
          <div>
            <label className="block text-slate-200 text-sm font-medium mb-1">
              Group Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              placeholder="Enter group name"
              maxLength={100}
            />
          </div>

          {/* Group Description */}
          <div>
            <label className="block text-slate-200 text-sm font-medium mb-1">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 resize-none"
              placeholder="What's this group about?"
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Add Members */}
          <div>
            <label className="block text-slate-200 text-sm font-medium mb-2">
              Add Members ({selectedMembers.length} selected)
            </label>
            <div className="max-h-40 overflow-y-auto space-y-2 border border-slate-600 rounded-lg p-2">
              {allContacts.map((contact) => {
                const isSelected = selectedMembers.find(m => m._id === contact._id);
                return (
                  <div
                    key={contact._id}
                    onClick={() => toggleMemberSelection(contact)}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected ? "bg-cyan-500/20" : "hover:bg-slate-700"
                    }`}
                  >
                    <div className="size-8 rounded-full overflow-hidden">
                      <img 
                        src={contact.profilePic || "/avatar.png"} 
                        alt={contact.fullName}
                        className="size-full object-cover"
                      />
                    </div>
                    <span className="text-slate-200 flex-1">{contact.fullName}</span>
                    {isSelected && (
                      <CheckIcon className="size-4 text-cyan-400" />
                    )}
                  </div>
                );
              })}
              {allContacts.length === 0 && (
                <div className="text-slate-400 text-sm text-center py-4">
                  No contacts available
                </div>
              )}
            </div>
          </div>

          {/* Selected Members Preview */}
          {selectedMembers.length > 0 && (
            <div>
              <label className="block text-slate-200 text-sm font-medium mb-2">
                Selected Members
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedMembers.map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center gap-2 bg-cyan-500/20 px-3 py-1 rounded-full"
                  >
                    <div className="size-5 rounded-full overflow-hidden">
                      <img 
                        src={member.profilePic || "/avatar.png"} 
                        alt={member.fullName}
                        className="size-full object-cover"
                      />
                    </div>
                    <span className="text-slate-200 text-sm">{member.fullName}</span>
                    <button
                      type="button"
                      onClick={() => toggleMemberSelection(member)}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      <XIcon className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-slate-400 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name.trim() || isCreatingGroup}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCreatingGroup ? (
                <>
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UsersIcon className="size-4" />
                  Create Group
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateGroupModal;