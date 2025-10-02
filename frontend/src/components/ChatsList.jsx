import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser } = useChatStore();
  const { setSelectedGroup } = useGroupStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  const handleChatSelect = (chat) => {
    setSelectedGroup(null); // Clear any selected group
    setSelectedUser(chat);
  };

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <>
      {chats.map((chat) => {
        const isOnline = onlineUsers.includes(chat._id);
        return (
          <div
            key={chat._id}
            className="bg-gray-50 hover:bg-blue-50 p-4 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-blue-200"
            onClick={() => handleChatSelect(chat)}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="size-12 rounded-full overflow-hidden">
                  <img src={chat.profilePic || "/avatar.png"} alt={chat.fullName} />
                </div>
                {isOnline && (
                  <div className="absolute -bottom-1 -right-1 size-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-gray-900 font-medium truncate">{chat.fullName}</h4>
                <p className="text-gray-500 text-sm">{isOnline ? "Online" : "Offline"}</p>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
export default ChatsList;