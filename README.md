# CoWatch - Watch YouTube Together

A sleek, minimalistic co-watching app that allows friends to watch YouTube videos together with near-zero delay synchronization.

## ✨ Features

- **Real-time Sync**: Watch videos with friends in perfect sync with millisecond precision
- **User Accounts**: Create accounts and maintain friends lists
- **3-Second Countdown**: Synchronized start with visual countdown timer
- **Auto-Sync**: Automatic video synchronization if users lag behind
- **Manual Resync**: One-click manual sync button for connection issues
- **Live Reactions**: Send emoji reactions that appear on screen
- **Chat**: Optional real-time chat during watch sessions
- **Dark/Light Mode**: Toggle between themes with smooth transitions
- **Mobile Responsive**: Works seamlessly on desktop and mobile browsers
- **Modern UI**: Clean, minimalistic design with smooth animations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- YouTube Data API v3 key (free from Google Cloud Console)

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd cowatch-app
npm install
cd server && npm install && cd ..
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` and add your YouTube API key:
```
YOUTUBE_API_KEY=your-youtube-api-key-here
```

3. **Start the development servers:**
```bash
npm run dev
```

This starts both the React client (port 5173) and Node.js server (port 3001).

4. **Open your browser to http://localhost:5173**

## 🎯 How to Use

### Getting Started
1. **Sign Up**: Create an account with username, email, and password
2. **Add Friends**: Find friends by username and add them to your list
3. **Send Videos**: Paste a YouTube URL and send it to a friend
4. **Watch Together**: Both users join the watch room automatically

### Watch Room Features
- **Countdown Timer**: Click "Start Together" for a 3-second countdown
- **Emoji Reactions**: Click emoji buttons to send floating reactions
- **Chat**: Open the chat panel to message during videos
- **Manual Sync**: Use the sync button if videos get out of sync
- **Participants**: See who's currently watching

### Supported YouTube URLs
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `VIDEO_ID` (direct video ID)

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Socket.io Client** for real-time communication
- **React Router** for navigation
- **React Hot Toast** for notifications

### Backend
- **Node.js** with Express
- **Socket.io** for WebSocket communication
- **SQLite** for data storage
- **JWT** for authentication
- **YouTube Data API v3** for video information

## 📱 Browser Compatibility

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## 🔧 Configuration

### YouTube API Setup
1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create API credentials (API Key)
5. Add the key to your `.env` file

### Environment Variables
```bash
PORT=3001                          # Server port
CLIENT_URL=http://localhost:5173   # Client URL for CORS
JWT_SECRET=your-secret-key         # JWT signing secret
YOUTUBE_API_KEY=your-api-key       # YouTube Data API key
```

## 📝 Development

### Available Scripts

**Root directory:**
- `npm run dev` - Start both client and server in development
- `npm run build` - Build the React app for production
- `npm run lint` - Run ESLint

**Client-specific:**
- `npm run dev:client` - Start only the React development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**Server-specific:**
- `npm run dev:server` - Start only the Node.js server

### Project Structure
```
cowatch-app/
├── src/                    # React frontend
│   ├── components/         # Reusable components
│   ├── context/           # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── server/                # Node.js backend
│   ├── database/          # Database initialization
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   └── socket/            # Socket.io handlers
└── public/                # Static assets
```

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Setup
- Set `NODE_ENV=production`
- Use a secure JWT secret
- Configure your YouTube API key
- Set appropriate CORS origins

### Database
The app uses SQLite by default. For production, consider upgrading to PostgreSQL by modifying the database configuration in `server/database/init.ts`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Troubleshooting

### Common Issues

**"YouTube API not configured" error:**
- Ensure you have a valid YouTube Data API v3 key
- Check that the key is correctly set in your `.env` file
- Verify the API is enabled in Google Cloud Console

**Videos not syncing:**
- Check your internet connection
- Try the manual sync button
- Ensure both users are in the same watch session

**Can't connect to server:**
- Verify the server is running on port 3001
- Check that no firewall is blocking the connection
- Ensure WebSocket connections are allowed

### Support
For issues and feature requests, please open an issue on GitHub.