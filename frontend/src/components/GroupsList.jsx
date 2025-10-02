import { useEffect, useState } from "react";
import { useGroupStore } from "../store/useGroupStore";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import CreateGroupModal from "./CreateGroupModal";
import { PlusIcon, UsersIcon } from "lucide-react";

function GroupsList() {
  const { getUserGroups, groups, isGroupsLoading, setSelectedGroup } = useGroupStore();
  const { setSelectedUser } = useChatStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    getUserGroups();
  }, [getUserGroups]);

  const handleGroupSelect = (group) => {
    setSelectedUser(null); // Clear any selected user
    setSelectedGroup(group);
  };

  if (isGroupsLoading) return <UsersLoadingSkeleton />;

  return (
    <>
      <div className="mb-4">
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 p-3 rounded-lg transition-colors flex items-center gap-2 text-cyan-400 font-medium"
        >
          <PlusIcon className="w-4 h-4" />
          Create New Group
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
          <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center">
            <UsersIcon className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h4 className="text-slate-200 font-medium mb-1">No groups yet</h4>
            <p className="text-slate-400 text-sm px-6">
              Create your first group to start chatting with multiple people
            </p>
          </div>
        </div>
      ) : (
        groups.map((group) => (
          <div
            key={group._id}
            className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
            onClick={() => handleGroupSelect(group)}
          >
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-400/10 flex items-center justify-center">
                {group.profilePic ? (
                  <img 
                    src={group.profilePic} 
                    alt={group.name} 
                    className="size-12 rounded-full object-cover"
                  />
                ) : (
                  <UsersIcon className="size-6 text-cyan-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-slate-600 font-medium truncate">{group.name}</h4>
                <p className="text-slate-400 text-sm truncate">
                  {group.members?.length} members
                </p>
              </div>
            </div>
          </div>
        ))
      )}

      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </>
  );
}

export default GroupsList;