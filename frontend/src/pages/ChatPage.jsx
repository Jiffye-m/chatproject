import { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";

import AppBar from "../components/AppBar";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import GroupsList from "../components/GroupsList";
import CallHistoryList from "../components/CallHistoryList";
import ChatContainer from "../components/ChatContainer";
import GroupChatContainer from "../components/GroupChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";
import MobileInstructionTooltip from "../components/MobileInstructionTooltip";
import { MenuIcon, XIcon } from "lucide-react";

function ChatPage() {
  const { activeTab, selectedUser } = useChatStore();
  const { selectedGroup } = useGroupStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderMainContent = () => {
    if (selectedGroup) {
      return <GroupChatContainer />;
    } else if (selectedUser) {
      return <ChatContainer />;
    } else {
      return <NoConversationPlaceholder />;
    }
  };

  const renderSidebarContent = () => {
    switch (activeTab) {
      case "chats":
        return <ChatsList />;
      case "groups":
        return <GroupsList />;
      case "calls":
        return <CallHistoryList />;
      case "contacts":
        return <ContactList />;
      default:
        return <ChatsList />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* App Bar */}
      <AppBar />

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Toggle - Fixed positioning */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 border-4 border-white"
          title="Open Menu"
        >
          {isSidebarOpen ? <XIcon className="size-6" /> : <MenuIcon className="size-6" />}
        </button>

        {/* Sidebar - Responsive with proper height */}
        <div className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static fixed inset-y-0 left-0 z-40 
          w-80 bg-white border-r-2 border-blue-100 shadow-xl lg:shadow-none
          transition-transform duration-300 ease-in-out
          flex flex-col overflow-hidden
        `}>
          {/* Profile Header - Fixed */}
          <div className="flex-shrink-0">
            <ProfileHeader />
          </div>
          
          {/* Tab Switch - Fixed */}
          <div className="flex-shrink-0">
            <ActiveTabSwitch />
          </div>

          {/* Sidebar Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
            {renderSidebarContent()}
          </div>
        </div>

        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content Area - Responsive with proper scrolling */}
        <div className="flex-1 flex flex-col bg-gray-50 min-w-0 overflow-hidden">
          {/* Mobile: Auto-close sidebar when selecting a chat */}
          <div 
            className={`
              flex-1 flex flex-col overflow-hidden
              ${(selectedUser || selectedGroup) ? 'block' : 'hidden lg:block'}
            `}
            onClick={() => setIsSidebarOpen(false)}
          >
            {renderMainContent()}
          </div>
        </div>
      </div>

      {/* Mobile Instruction Tooltip */}
      <MobileInstructionTooltip />

      <style jsx global>{`
        /* Hide scrollbar for webkit browsers */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
}

export default ChatPage;