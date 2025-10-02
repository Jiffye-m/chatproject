import { XIcon, UsersIcon, SettingsIcon } from "lucide-react";
import { useGroupStore } from "../store/useGroupStore";
import { useEffect, useState } from "react";
import GroupSettingsModal from "./GroupSettingsModal";

function GroupChatHeader() {
  const { selectedGroup, setSelectedGroup } = useGroupStore();
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") setSelectedGroup(null);
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedGroup]);

  if (!selectedGroup) return null;

  return (
    <>
      <div className="flex justify-between items-center bg-slate-200/50 border-b border-slate-700/50 max-h-[84px] px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="size-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-400/10 flex items-center justify-center">
            {selectedGroup.profilePic ? (
              <img 
                src={selectedGroup.profilePic} 
                alt={selectedGroup.name}
                className="size-12 rounded-full object-cover"
              />
            ) : (
              <UsersIcon className="size-6 text-cyan-400" />
            )}
          </div>

          <div>
            <h3 className="text-slate-600 font-medium">{selectedGroup.name}</h3>
            <p className="text-slate-400 text-sm">
              {selectedGroup.members?.length} members
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-700/50"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>

          <button onClick={() => setSelectedGroup(null)}>
            <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
          </button>
        </div>
      </div>

      {showSettings && (
        <GroupSettingsModal
          group={selectedGroup}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
}
export default GroupChatHeader;