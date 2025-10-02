import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { MessageCircleIcon, MailCheckIcon, AlertTriangleIcon, LoaderIcon } from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";

function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { authUser, isCheckingAuth, checkAuth } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState(null);

  // Get email from URL if redirected from signup
  useEffect(() => {
    const signupEmail = searchParams.get("email");
    if (signupEmail) {
      setEmail(signupEmail);
    }
  }, [searchParams]);

  // Handle verification from URL token
  useEffect(() => {
    if (token) {
      const verifyEmail = async () => {
        try {
          const res = await axiosInstance.get(`/auth/verify-email?token=${token}`);
          toast.success(res.data.message);
          
          // Update auth state in store and redirect
          await checkAuth(); // Refetch user data
          navigate("/chat", { replace: true });

        } catch (err) {
          const message = err.response?.data?.message || "Failed to verify email.";
          const isExpired = err.response?.data?.expired || false;
          setError({ message, isExpired });
          toast.error(message);
        } finally {
          setIsVerifying(false);
        }
      };

      verifyEmail();
    } else {
      setIsVerifying(false);
    }
  }, [token, navigate, checkAuth]);

  // Handle resend verification email
  const handleResend = async () => {
    setIsVerifying(true);
    setError(null);
    try {
      const res = await axiosInstance.post("/auth/resend-verification", { email });
      toast.success(res.data.message);
      // Optional: Update attempts left display
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend verification email.");
      setError({ message: err.response?.data?.message, isExpired: false });
    } finally {
      setIsVerifying(false);
    }
  };

  // If user is already authenticated and verified, redirect
  useEffect(() => {
    if (!isCheckingAuth && authUser?.isEmailVerified) {
      navigate("/chat", { replace: true });
    }
  }, [authUser, isCheckingAuth, navigate]);

  // Conditional Rendering based on state
  const renderContent = () => {
    if (isVerifying) {
      return (
        <div className="text-center">
          <LoaderIcon className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Verifying your email...</h2>
        </div>
      );
    }
    
    // RENDER: Error State
    if (error) {
      return (
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
          <AlertTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-700 mb-2">Verification Failed</h2>
          <p className="text-gray-700 mb-4">{error.message}</p>
          {error.isExpired && email && (
            <button
              onClick={handleResend}
              className="mt-4 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
              disabled={isVerifying}
            >
              Resend Verification Email
            </button>
          )}
          <div className="mt-4 text-sm text-gray-600">
            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">Back to Login</Link>
          </div>
        </div>
      );
    }

    // RENDER: Post-Signup Prompt
    if (email) {
      return (
        <div className="text-center p-8 bg-green-50 rounded-lg border border-green-200">
          <MailCheckIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-700 mb-2">Check Your Email</h2>
          <p className="text-gray-700 mb-4">A verification link has been sent to <strong>{email}</strong>. Please click the link to activate your account.</p>
          <button
            onClick={handleResend}
            className="mt-4 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
            disabled={isVerifying}
          >
            Resend Email
          </button>
          <div className="mt-4 text-sm text-gray-600">
            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">Back to Login</Link>
          </div>
        </div>
      );
    }

    // RENDER: Default State
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
        <AlertTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Access</h2>
        <p className="text-gray-600">Please sign up or log in to access this page.</p>
        <div className="mt-4 text-sm text-gray-600">
          <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">Go to Login</Link>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-white min-h-screen">
      <div className="relative w-full max-w-lg">
        <div className="w-full bg-white rounded-2xl shadow-2xl border-2 border-blue-100 p-8">
          <div className="text-center mb-6">
            <MessageCircleIcon className="w-16 h-16 mx-auto mb-4 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Email Verification</h1>
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default EmailVerificationPage;