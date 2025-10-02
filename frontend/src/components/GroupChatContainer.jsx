import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useGroupStore } from "../store/useGroupStore";
import GroupChatHeader from "./GroupChatHeader";
import GroupMessageInput from "./GroupMessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import NoGroupChatHistoryPlaceholder from "./NoGroupChatHistoryPlaceholder";

function GroupChatContainer() {
  const {
    selectedGroup,
    getGroupMessages,
    groupMessages,
    isGroupMessagesLoading,
    subscribeToGroupMessages,
    unsubscribeFromGroupMessages,
  } = useGroupStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (selectedGroup) {
      getGroupMessages(selectedGroup._id);
      subscribeToGroupMessages();
    }

    return () => unsubscribeFromGroupMessages();
  }, [selectedGroup, getGroupMessages, subscribeToGroupMessages, unsubscribeFromGroupMessages]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [groupMessages]);

  if (!selectedGroup) return null;

  return (
    <>
      <GroupChatHeader />
      <div className="flex-1 px-6 overflow-y-auto py-8">
        {groupMessages.length > 0 && !isGroupMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {groupMessages.map((msg) => (
              <div
                key={msg._id}
                className={`chat ${msg.senderId._id === authUser._id ? "chat-end" : "chat-start"}`}
              >
                <div className="chat-image avatar">
                  <div className="w-8 rounded-full">
                    <img 
                      src={msg.senderId.profilePic || "/avatar.png"} 
                      alt={msg.senderId.fullName}
                    />
                  </div>
                </div>
                <div className="chat-header text-xs opacity-50 mb-1">
                  {msg.senderId.fullName}
                  <time className="ml-1">
                    {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
                <div
                  className={`chat-bubble relative ${
                    msg.senderId._id === authUser._id
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  {msg.image && (
                    <img 
                      src={msg.image} 
                      alt="Shared" 
                      className="rounded-lg max-w-xs object-cover"
                    />
                  )}
                  {msg.text && <p className={msg.image ? "mt-2" : ""}>{msg.text}</p>}
                </div>
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>
        ) : isGroupMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoGroupChatHistoryPlaceholder groupName={selectedGroup.name} />
        )}
      </div>

      <GroupMessageInput />
    </>
  );
}

export default GroupChatContainer;