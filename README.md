# Real-time Chat App 🚀

A modern, feature-rich real-time chat application built with Node.js, Express, and Socket.IO. Perfect for team communication, online communities, or just chatting with friends!

## ✨ Features

- **Real-time messaging** - Instant message delivery with Socket.IO
- **Multiple chat rooms** - Create and join different rooms
- **Emoji reactions** - React to messages with emojis (👍, ❤️, 😂, 😮, 😢, 🔥)
- **Typing indicators** - See when others are typing
- **User presence** - See who's online in each room
- **Responsive design** - Works great on desktop and mobile
- **Clean UI** - Modern, intuitive interface

## 🚀 Quick Start

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/salmonBasilCheese/chat-app.git
cd chat-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

### Development Mode

For development with auto-restart:
```bash
npm run dev
```

## 🏗️ Project Structure

```
chat-app/
├── public/
│   ├── index.html      # Main HTML file
│   ├── script.js       # Client-side JavaScript
│   └── style.css       # Styles
├── server.js           # Express server and Socket.IO logic
├── package.json        # Dependencies and scripts
└── README.md          # This file
```

## 🎯 How to Use

1. **Join a Room**: Enter your username and room name
2. **Send Messages**: Type and press Enter or click Send
3. **React to Messages**: Click on any message to add emoji reactions
4. **See Who's Online**: Check the sidebar for active users
5. **Typing Indicators**: See when others are typing in real-time

## 🔧 Configuration

The app uses environment variables for configuration:

- `PORT` - Server port (default: 3000)

## 📱 Features in Detail

### Real-time Communication
- Powered by Socket.IO for instant bidirectional communication
- Automatic reconnection handling
- Real-time user presence updates

### Room Management
- Dynamic room creation - just enter a room name to create it
- Isolated conversations per room
- Automatic cleanup of empty rooms
- Message history preserved during session

### User Experience
- Responsive design works on all devices
- Smooth animations and transitions
- Intuitive emoji reaction system
- Visual typing indicators
- Color-coded users for easy identification

## 🚀 Deployment

This app is ready to deploy on various platforms:

### Railway
1. Connect your GitHub repository
2. Railway will auto-detect the Node.js app
3. Deploy automatically

### Heroku
1. Create a new Heroku app
2. Connect your GitHub repository
3. Deploy from the Heroku dashboard

### Other Platforms
- Render
- DigitalOcean App Platform
- Vercel
- Netlify Functions

## 🛠️ Technologies Used

- **Backend**: Node.js, Express.js, Socket.IO
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Real-time**: WebSocket communication via Socket.IO
- **Styling**: Modern CSS with Flexbox and animations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🐛 Issues

Found a bug? Have a feature request? Please open an issue on GitHub.

---

**Enjoy chatting! 💬✨**
