import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { MessageCircleIcon, LockIcon, MailIcon, UserIcon, LoaderIcon } from "lucide-react";
import { Link } from "react-router";

function SignUpPage() {
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  
  const { signup, isSigningUp, resendVerification, isResendingVerification } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await signup(formData);
      
      // If verification is required, show success message
      if (result?.requiresVerification) {
        setShowVerificationMessage(true);
        setRegisteredEmail(result.email || formData.email);
      }
    } catch (error) {
      // Error already handled in store with toast
    }
  };

  const handleResendVerification = async () => {
    await resendVerification(registeredEmail);
  };

  // Show success message after registration
  if (showVerificationMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-100 p-8 max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-black text-gray-900 text-center mb-3">
            Check Your Email!
          </h2>

          <p className="text-gray-700 text-center mb-6 font-medium">
            We've sent a verification link to <span className="font-bold text-blue-600">{registeredEmail}</span>
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-gray-900 mb-2">Next Steps:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Check your email inbox</li>
              <li>Click the verification link</li>
              <li>You'll be redirected to login</li>
            </ol>
          </div>

          <p className="text-sm text-gray-600 text-center mb-4">
            Didn't receive the email? Check your spam folder.
          </p>

          <button
            onClick={handleResendVerification}
            disabled={isResendingVerification}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
          >
            {isResendingVerification ? (
              <>
                <LoaderIcon className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              "Resend Verification Email"
            )}
          </button>

          <Link
            to="/login"
            className="block w-full text-center text-blue-600 hover:text-blue-800 font-bold py-2"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-white min-h-screen">
      <div className="relative w-full max-w-6xl md:h-[800px] h-[650px]">
        <div className="w-full h-full bg-white rounded-2xl shadow-2xl border-2 border-blue-100 flex overflow-hidden">
          <div className="w-full flex flex-col md:flex-row">
            {/* FORM COLUMN - LEFT SIDE */}
            <div className="md:w-1/2 p-8 flex items-center justify-center md:border-r-2 border-blue-100">
              <div className="w-full max-w-md">
                {/* HEADING TEXT */}
                <div className="text-center mb-10">
                  <div className="w-16 h-16 mx-auto mb-6 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <MessageCircleIcon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 mb-3">Create Account</h2>
                  <p className="text-gray-700 font-semibold text-lg">Join thousands of happy users</p>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* FULL NAME */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-600 bg-white text-gray-900 font-medium placeholder-gray-600 shadow-sm"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>

                  {/* EMAIL INPUT */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">Email Address</label>
                    <div className="relative">
                      <MailIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-600 bg-white text-gray-900 font-medium placeholder-gray-600 shadow-sm"
                        placeholder="johndoe@gmail.com"
                        required
                      />
                    </div>
                  </div>

                  {/* PASSWORD INPUT */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">Password</label>
                    <div className="relative">
                      <LockIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-600 bg-white text-gray-900 font-medium placeholder-gray-600 shadow-sm"
                        placeholder="Create a strong password"
                        required
                        minLength={6}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Must be at least 6 characters</p>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105" 
                    type="submit" 
                    disabled={isSigningUp}
                  >
                    {isSigningUp ? (
                      <>
                        <LoaderIcon className="w-6 h-6 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <Link to="/login" className="text-blue-600 hover:text-blue-800 font-bold text-lg">
                    Already have an account? Login
                  </Link>
                </div>
              </div>
            </div>

            {/* FORM ILLUSTRATION - RIGHT SIDE */}
            <div className="hidden md:w-1/2 md:flex items-center justify-center p-8 bg-gradient-to-br from-blue-600 to-blue-800">
              <div className="text-center">
                <img
                  src="/signup.png"
                  alt="People using mobile devices"
                  className="w-full h-auto object-contain mb-8"
                />
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-6">Start Your Journey Today</h3>

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

export default SignUpPage;