import { useState, useEffect } from "react";
import { XIcon, ArrowUpIcon } from "lucide-react";

function MobileInstructionTooltip() {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Show tooltip on mobile devices after a short delay
    const checkMobile = () => window.innerWidth < 1024;
    const hasSeenTooltip = localStorage.getItem('hasSeenMobileTooltip');
    
    if (checkMobile() && !hasSeenTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
      }, 2000); // Show after 2 seconds

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShowTooltip(false);
    localStorage.setItem('hasSeenMobileTooltip', 'true');
  };

  if (!showTooltip) return null;

  return (
    <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border-2 border-blue-100">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <XIcon className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowUpIcon className="w-8 h-8 text-blue-600 transform rotate-45" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            Welcome to ChatApp!
          </h3>
          
          <p className="text-gray-600 font-medium mb-6 leading-relaxed">
            Tap the <span className="inline-flex items-center mx-1 px-2 py-1 bg-blue-600 text-white text-sm rounded-full font-bold">
              ☰
            </span> blue button at the bottom-right to access your chats, groups, and contacts.
          </p>

          <button
            onClick={handleDismiss}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-bold transition-colors shadow-lg"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}

export default MobileInstructionTooltip;