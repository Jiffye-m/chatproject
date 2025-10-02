import { MessageCircleIcon, VideoIcon, PhoneIcon, UsersIcon, ShieldIcon, ZapIcon, GlobeIcon, ArrowRightIcon } from "lucide-react";
import { Link } from "react-router";

function LandingPage() {
  const features = [
    {
      icon: MessageCircleIcon,
      title: "Instant Messaging",
      description: "Send messages instantly with real-time delivery and read receipts."
    },
    {
      icon: VideoIcon,
      title: "Video Calls",
      description: "High-quality video calls with crystal clear audio and video."
    },
    {
      icon: PhoneIcon,
      title: "Voice Calls",
      description: "Make voice calls with excellent sound quality anywhere, anytime."
    },
    {
      icon: UsersIcon,
      title: "Group Chats",
      description: "Create groups, manage members, and chat with multiple people at once."
    },
    {
      icon: ShieldIcon,
      title: "Secure & Private",
      description: "End-to-end security with encrypted messages and secure authentication."
    },
    {
      icon: ZapIcon,
      title: "Fast & Reliable",
      description: "Lightning-fast message delivery with 99.9% uptime reliability."
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "1M+", label: "Messages Sent" },
    { number: "50K+", label: "Video Calls" },
    { number: "99.9%", label: "Uptime" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-md border-b-2 border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <MessageCircleIcon className="w-9 h-9 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">ChatApp</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-gray-800 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-semibold shadow-md transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl sm:text-7xl font-black text-gray-900 mb-8 leading-tight">
              Connect with Anyone,
              <span className="text-blue-600 block">Anywhere</span>
            </h1>
            <p className="text-xl text-gray-700 font-medium mb-10 max-w-3xl mx-auto leading-relaxed">
              Experience seamless communication with instant messaging, high-quality video calls, 
              and group chats. Stay connected with friends, family, and colleagues like never before.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl text-lg font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-3"
              >
                Start Chatting Free
                <ArrowRightIcon className="w-6 h-6" />
              </Link>
              <Link
                to="/login"
                className="border-2 border-blue-600 hover:bg-blue-600 hover:text-white text-blue-600 px-10 py-4 rounded-xl text-lg font-bold transition-all shadow-md hover:shadow-lg"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white border-t-2 border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-3 p-6 rounded-xl bg-blue-50 border border-blue-200">
                <div className="text-4xl md:text-5xl font-black text-blue-600">
                  {stat.number}
                </div>
                <div className="text-gray-800 font-bold text-lg">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Everything you need to stay connected
            </h2>
            <p className="text-xl text-gray-700 font-semibold max-w-2xl mx-auto leading-relaxed">
              Powerful features designed to make communication effortless, 
              secure, and enjoyable for everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border-2 border-blue-100 hover:border-blue-300">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 font-medium leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Get started in seconds
            </h2>
            <p className="text-xl text-gray-700 font-semibold">
              Simple steps to join millions of users worldwide
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-black text-white">1</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Create Account</h3>
              <p className="text-gray-700 font-medium">Sign up with your email in under 30 seconds</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-black text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Add Contacts</h3>
              <p className="text-gray-700 font-medium">Find and connect with friends, family, and colleagues</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-black text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Start Chatting</h3>
              <p className="text-gray-700 font-medium">Send messages, make calls, and create groups instantly</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8">
            Ready to get started?
          </h2>
          <p className="text-xl text-blue-100 font-semibold mb-10 leading-relaxed">
            Join thousands of users who trust ChatApp for their daily communication needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/signup"
              className="bg-white hover:bg-gray-100 text-blue-700 px-10 py-4 rounded-xl text-lg font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="border-2 border-white hover:bg-white hover:text-blue-700 text-white px-10 py-4 rounded-xl text-lg font-bold transition-all shadow-md hover:shadow-lg"
            >
              Sign In Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <MessageCircleIcon className="w-10 h-10 text-blue-400" />
                <span className="text-2xl font-bold">ChatApp</span>
              </div>
              <p className="text-gray-300 font-medium mb-6 leading-relaxed">
                The modern way to stay connected with friends, family, and teams. 
                Fast, secure, and reliable messaging for everyone.
              </p>
              <div className="flex items-center gap-3 text-gray-300">
                <GlobeIcon className="w-6 h-6" />
                <span className="font-semibold">Available worldwide</span>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-6 text-blue-400">Features</h3>
              <ul className="space-y-3 text-gray-300 font-medium">
                <li>Instant Messaging</li>
                <li>Video Calls</li>
                <li>Voice Calls</li>
                <li>Group Chats</li>
                <li>File Sharing</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-6 text-blue-400">Company</h3>
              <ul className="space-y-3 text-gray-300 font-medium">
                <li>About Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Contact</li>
                <li>Support</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p className="font-semibold">&copy; 2024 ChatApp. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;