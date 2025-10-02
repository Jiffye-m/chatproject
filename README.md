# ChatApp - Real-Time Messaging & Video Calling Platform

A full-stack real-time chat application with video/voice calling, group chats, and email verification built with the MERN stack, Socket.IO, and WebRTC.

## ✨ Features

- 🔐 **Secure Authentication** - JWT-based auth with email verification
- 💬 **Real-Time Messaging** - Instant messaging with Socket.IO
- 📹 **Video & Voice Calls** - WebRTC-powered HD calls
- 👥 **Group Chats** - Create and manage group conversations
- 📞 **Call History** - Track all your calls with detailed history
- 🖼️ **Media Sharing** - Share images in chats
- 🔔 **Online Status** - See who's online in real-time
- 📱 **Responsive Design** - Works seamlessly on mobile and desktop
- 🔒 **Security** - Rate limiting, bot detection with Arcjet

## 🛠️ Tech Stack

### Frontend
- React 18
- Zustand (State Management)
- TailwindCSS
- Socket.IO Client
- WebRTC
- Axios
- React Router

### Backend
- Node.js & Express
- MongoDB & Mongoose
- Socket.IO
- WebRTC Signaling
- JWT Authentication
- Cloudinary (Image Upload)
- Resend (Email Service)
- Arcjet (Security)

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/chatapp.git
cd chatapp
```

### 2. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update the `.env` file with your credentials:

```env
# Server
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=onboarding@resend.dev
EMAIL_FROM_NAME=ChatApp Team

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Arcjet (Optional)
ARCJET_KEY=your_arcjet_key
ARCJET_ENV=development
```

### 4. Run the Application

```bash
# Development mode (runs both backend and frontend)
npm run dev

# Run backend only
npm run server

# Run frontend only
cd frontend && npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## 📧 Email Verification Setup

### Using Resend (Recommended)

1. Sign up at [Resend](https://resend.com)
2. Get your API key from the dashboard
3. Add it to your `.env` file
4. Verify your sending domain (for production)

### Email Flow

1. User signs up → Verification email sent
2. User clicks link → Email verified
3. User can now login and access the app

## 🎥 WebRTC Setup

The app uses public STUN servers for development. For production:

1. Set up a TURN server (recommended: [Coturn](https://github.com/coturn/coturn))
2. Update `useCallStore.js` with your TURN server credentials:

```javascript
rtcConfig: {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { 
      urls: 'turn:your-turn-server.com:3478',
      username: 'username',
      credential: 'password'
    }
  ]
}
```

## 📁 Project Structure

```
chatapp/
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── store/        # Zustand stores
│   │   ├── lib/          # Utils and config
│   │   └── App.jsx
│   └── package.json
├── src/                   # Backend source
│   ├── controllers/      # Route controllers
│   ├── models/           # MongoDB models
│   ├── routes/           # Express routes
│   ├── lib/              # Utils and config
│   ├── middleware/       # Custom middleware
│   └── index.js          # Entry point
├── .env.example          # Environment template
├── package.json
└── README.md
```

## 🔒 Security Features

- JWT token authentication
- HTTP-only cookies
- Rate limiting (100 req/min)
- Bot detection
- CSRF protection
- Email verification
- Secure password hashing (bcrypt)

## 🐛 Common Issues & Solutions

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port in .env
PORT=3001
```

### MongoDB Connection Failed
- Ensure MongoDB is running
- Check connection string in `.env`
- Whitelist your IP in MongoDB Atlas

### Email Not Sending
- Verify Resend API key
- Check spam folder
- Ensure EMAIL_FROM is verified in Resend

### WebRTC Calls Not Working
- Allow camera/microphone permissions
- Check browser console for errors
- Ensure HTTPS in production (WebRTC requires secure context)

## 📦 Deployment

### Backend (Railway/Render/Heroku)

1. Set all environment variables
2. Build command: `npm install`
3. Start command: `npm start`

### Frontend (Vercel/Netlify)

1. Build command: `npm run build`
2. Output directory: `dist`
3. Set `VITE_API_URL` to your backend URL

### Full Stack (Render)

Deploy as a monorepo with both services.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Your Name - [@yourhandle](https://twitter.com/yourhandle)

## 🙏 Acknowledgments

- Socket.IO for real-time communication
- WebRTC for peer-to-peer connections
- Resend for email delivery
- Cloudinary for media management

## 📞 Support

For support, email support@yourapp.com or create an issue on GitHub.

---

Made with ❤️ using MERN Stack
