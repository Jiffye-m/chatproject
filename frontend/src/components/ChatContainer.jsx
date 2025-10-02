import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();

    // clean up
    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    const scrollToBottom = () => {
      if (messageEndRef.current) {
        messageEndRef.current.scrollIntoView({ 
          behavior: "smooth", 
          block: "end" 
        });
      }
    };

    // Small delay to ensure DOM is updated
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Chat Header - Fixed */}
      <div className="flex-shrink-0">
        <ChatHeader />
      </div>

      {/* Messages Container - Scrollable */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 lg:px-6"
        style={{ 
          scrollBehavior: 'smooth',
          height: 'calc(100% - 140px)' // Account for header and input
        }}
      >
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-4xl mx-auto space-y-4 pb-4">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex ${msg.senderId._id === authUser._id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-2xl shadow-sm ${
                    msg.senderId._id === authUser._id
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-white text-gray-900 border border-gray-200 rounded-bl-md"
                  }`}
                >
                  {msg.image && (
                    <img 
                      src={msg.image} 
                      alt="Shared" 
                      className="rounded-xl max-w-full h-auto mb-2 object-cover max-h-64"
                    />
                  )}
                  {msg.text && (
                    <p className="text-sm lg:text-base leading-relaxed break-words">
                      {msg.text}
                    </p>
                  )}
                  <p className={`text-xs mt-1 ${
                    msg.senderId === authUser._id ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {/* Scroll target - Always at the bottom */}
            <div ref={messageEndRef} className="h-1" />
          </div>
        ) : isMessagesLoading ? (
          <div className="flex items-center justify-center h-full">
            <MessagesLoadingSkeleton />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <NoChatHistoryPlaceholder name={selectedUser.fullName} />
          </div>
        )}
      </div>

      {/* Message Input - Fixed */}
      <div className="flex-shrink-0">
        <MessageInput />
      </div>
    </div>
  );
}

export default ChatContainer;