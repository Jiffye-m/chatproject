import { useChatStore } from "../store/useChatStore";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab } = useChatStore();

  const tabs = [
    { id: "chats", label: "Chats" },
    { id: "groups", label: "Groups" },
    { id: "calls", label: "Calls" },
    { id: "contacts", label: "Contacts" }
  ];

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex bg-gray-100 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
export default ActiveTabSwitch;