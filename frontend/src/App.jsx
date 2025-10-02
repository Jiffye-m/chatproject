import { Navigate, Route, Routes } from "react-router";
import LandingPage from "./pages/LandingPage";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import PageLoader from "./components/PageLoader";
import CallManager from "./components/CallManager";

import { Toaster } from "react-hot-toast";

function App() {
  const { checkAuth, isCheckingAuth, authUser } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <PageLoader />;

  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={authUser ? <Navigate to="/chat" /> : <LandingPage />} />
        <Route path="/chat" element={authUser ? <ChatPage /> : <Navigate to="/login" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/chat" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/chat" />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
      </Routes>

      {/* Call Manager - Only show when authenticated */}
      {authUser && <CallManager />}

      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#f8fafc',
            color: '#1e293b',
            border: '1px solid #e2e8f0',
          },
          success: {
            duration: 4000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default App;