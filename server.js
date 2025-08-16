const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage
const rooms = {};
const users = {};

// Generate random color for users
const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Handle user joining a room
    socket.on('join-room', (data) => {
        const { username, room } = data;
        
        // Initialize room if it doesn't exist
        if (!rooms[room]) {
            rooms[room] = {
                messages: [],
                users: {}
            };
        }

        // Store user info
        users[socket.id] = {
            username,
            room,
            color: getRandomColor()
        };

        // Add user to room
        rooms[room].users[socket.id] = {
            username,
            color: users[socket.id].color
        };

        // Join socket room
        socket.join(room);

        // Send existing messages to new user
        socket.emit('room-messages', rooms[room].messages);

        // Send updated user list to room
        io.to(room).emit('room-users', Object.values(rooms[room].users));

        // Notify room of new user
        socket.to(room).emit('user-joined', {
            username,
            timestamp: new Date().toLocaleTimeString()
        });

        console.log(`${username} joined room: ${room}`);
    });

    // Handle sending messages
    socket.on('send-message', (messageData) => {
        const user = users[socket.id];
        if (!user) return;

        const message = {
            id: Date.now() + Math.random(), // Simple ID generation
            username: user.username,
            color: user.color,
            text: messageData.text,
            timestamp: new Date().toLocaleTimeString(),
            reactions: {}
        };

        // Store message in room
        rooms[user.room].messages.push(message);

        // Keep only last 100 messages per room
        if (rooms[user.room].messages.length > 100) {
            rooms[user.room].messages = rooms[user.room].messages.slice(-100);
        }

        // Broadcast to room
        io.to(user.room).emit('new-message', message);
    });

    // Handle emoji reactions
    socket.on('add-reaction', (data) => {
        const { messageId, emoji } = data;
        const user = users[socket.id];
        if (!user) return;

        // Find message in room
        const room = rooms[user.room];
        const message = room.messages.find(msg => msg.id == messageId);
        
        if (message) {
            // Initialize reaction if doesn't exist
            if (!message.reactions[emoji]) {
                message.reactions[emoji] = [];
            }

            // Toggle reaction
            const userIndex = message.reactions[emoji].indexOf(user.username);
            if (userIndex > -1) {
                message.reactions[emoji].splice(userIndex, 1);
            } else {
                message.reactions[emoji].push(user.username);
            }

            // Clean up empty reactions
            if (message.reactions[emoji].length === 0) {
                delete message.reactions[emoji];
            }

            // Broadcast updated reactions
            io.to(user.room).emit('reaction-updated', {
                messageId,
                reactions: message.reactions
            });
        }
    });

    // Handle typing indicators
    socket.on('typing', (isTyping) => {
        const user = users[socket.id];
        if (!user) return;

        socket.to(user.room).emit('user-typing', {
            username: user.username,
            isTyping
        });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        const user = users[socket.id];
        if (user) {
            const { username, room } = user;

            // Remove user from room
            if (rooms[room] && rooms[room].users[socket.id]) {
                delete rooms[room].users[socket.id];
                
                // Update user list for room
                io.to(room).emit('room-users', Object.values(rooms[room].users));
                
                // Notify room of user leaving
                socket.to(room).emit('user-left', {
                    username,
                    timestamp: new Date().toLocaleTimeString()
                });

                // Clean up empty rooms
                if (Object.keys(rooms[room].users).length === 0) {
                    delete rooms[room];
                }
            }

            delete users[socket.id];
            console.log(`${username} disconnected from room: ${room}`);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
