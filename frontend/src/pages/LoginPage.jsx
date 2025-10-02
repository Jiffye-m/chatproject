import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { MessageCircleIcon, MailIcon, LockIcon, LoaderIcon } from "lucide-react";
import { Link } from "react-router";

function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  
  const { login, isLoggingIn, resendVerification, isResendingVerification } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData);
    
    // If email verification is required, show resend option
    if (result?.requiresVerification) {
      setShowResendVerification(true);
      setPendingEmail(result.email || formData.email);
    }
  };

  const handleResendVerification = async () => {
    await resendVerification(pendingEmail);
  };

  return (
    <div className="w-full flex items-center justify-center p-4 bg-gray-50 min-h-screen">
      <div className="relative w-full max-w-6xl md:h-[800px] h-[650px]">
        <div className="w-full h-full bg-white rounded-2xl shadow-xl border border-gray-200 flex overflow-hidden">
          <div className="w-full flex flex-col md:flex-row">
            {/* FORM COLUMN - LEFT SIDE */}
            <div className="md:w-1/2 p-8 flex items-center justify-center md:border-r border-gray-200">
              <div className="w-full max-w-md">
                {/* HEADING TEXT */}
                <div className="text-center mb-8">
                  <MessageCircleIcon className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                  <p className="text-gray-600">Sign in to your account</p>
                </div>

                {/* Email Verification Notice */}
                {showResendVerification && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 font-medium mb-3">
                      Please verify your email address to continue.
                    </p>
                    <button
                      onClick={handleResendVerification}
                      disabled={isResendingVerification}
                      className="w-full text-sm bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isResendingVerification ? (
                        <>
                          <LoaderIcon className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Resend Verification Email"
                      )}
                    </button>
                  </div>
                )}

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* EMAIL INPUT */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <div className="relative">
                      <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                        placeholder="johndoe@gmail.com"
                        required
                      />
                    </div>
                  </div>

                  {/* PASSWORD INPUT */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <div className="relative">
                      <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
                    type="submit" 
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? (
                      <>
                        <LoaderIcon className="w-5 h-5 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <Link to="/signup" className="text-blue-600 hover:text-blue-800 font-bold text-lg">
                    Don't have an account? Sign Up
                  </Link>
                </div>
              </div>
            </div>

            {/* FORM ILLUSTRATION - RIGHT SIDE */}
            <div className="hidden md:w-1/2 md:flex items-center justify-center p-8 bg-gradient-to-br from-blue-600 to-blue-800">
              <div className="text-center">
                <img
                  src="/login.png"
                  alt="People using mobile devices"
                  className="w-full h-auto object-contain mb-8"
                />
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-6">Connect anytime, anywhere</h3>

                  <div className="flex justify-center gap-4">
                    <span className="px-4 py-2 bg-white text-blue-600 text-sm font-bold rounded-full shadow-lg">Free</span>
                    <span className="px-4 py-2 bg-white text-blue-600 text-sm font-bold rounded-full shadow-lg">Easy Setup</span>
                    <span className="px-4 py-2 bg-white text-blue-600 text-sm font-bold rounded-full shadow-lg">Private</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;