// Socket connection
const socket = io();

// DOM elements
const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const joinForm = document.getElementById('join-form');
const usernameInput = document.getElementById('username');
const roomInput = document.getElementById('room');
const currentRoomSpan = document.getElementById('current-room');
const userCountSpan = document.getElementById('user-count');
const usersList = document.getElementById('users-list');
const messages = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const leaveRoomBtn = document.getElementById('leave-room');
const reactionPicker = document.getElementById('reaction-picker');
const typingIndicator = document.getElementById('typing-indicator');

// State
let currentUser = null;
let currentRoom = null;
let selectedMessageId = null;
let typingTimer = null;
let typingUsers = new Set();

// Event Listeners
joinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const room = roomInput.value.trim();
    
    if (username && room) {
        currentUser = username;
        currentRoom = room;
        socket.emit('join-room', { username, room });
        
        // Switch to chat screen
        loginScreen.classList.add('hidden');
        chatScreen.classList.remove('hidden');
        currentRoomSpan.textContent = `Room: ${room}`;
        messageInput.focus();
    }
});

// Send message
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    } else {
        handleTyping();
    }
});

// Leave room
leaveRoomBtn.addEventListener('click', () => {
    socket.disconnect();
    location.reload();
});

// Message reactions
messages.addEventListener('click', (e) => {
    if (e.target.closest('.message-content')) {
        const messageElement = e.target.closest('.message');
        selectedMessageId = messageElement.dataset.messageId;
        showReactionPicker(e);
    }
});

// Reaction picker
reactionPicker.addEventListener('click', (e) => {
    if (e.target.classList.contains('emoji')) {
        const emoji = e.target.dataset.emoji;
        socket.emit('add-reaction', { messageId: selectedMessageId, emoji });
        hideReactionPicker();
    }
});

// Hide reaction picker when clicking outside
document.addEventListener('click', (e) => {
    if (!reactionPicker.contains(e.target) && !e.target.closest('.message-content')) {
        hideReactionPicker();
    }
});

// Functions
function sendMessage() {
    const text = messageInput.value.trim();
    if (text) {
        socket.emit('send-message', { text });
        messageInput.value = '';
        stopTyping();
    }
}

function handleTyping() {
    socket.emit('typing', true);
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        stopTyping();
    }, 1000);
}

function stopTyping() {
    socket.emit('typing', false);
    clearTimeout(typingTimer);
}

function showReactionPicker(event) {
    reactionPicker.style.left = event.pageX + 'px';
    reactionPicker.style.top = (event.pageY - 60) + 'px';
    reactionPicker.classList.remove('hidden');
}

function hideReactionPicker() {
    reactionPicker.classList.add('hidden');
}

function addMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.dataset.messageId = message.id;
    
    messageElement.innerHTML = `
        <div class="message-header">
            <span class="username" style="color: ${message.color}">${escapeHtml(message.username)}</span>
            <span class="timestamp">${message.timestamp}</span>
        </div>
        <div class="message-content" style="border-left-color: ${message.color}">
            ${escapeHtml(message.text)}
        </div>
        <div class="message-reactions"></div>
    `;
    
    messages.appendChild(messageElement);
    scrollToBottom();
    
    // Update reactions if they exist
    if (message.reactions && Object.keys(message.reactions).length > 0) {
        updateMessageReactions(message.id, message.reactions);
    }
}

function addSystemMessage(text) {
    const messageElement = document.createElement('div');
    messageElement.className = 'system-message';
    messageElement.textContent = text;
    messages.appendChild(messageElement);
    scrollToBottom();
}

function updateMessageReactions(messageId, reactions) {
    const messageElement = messages.querySelector(`[data-message-id="${messageId}"]`);
    if (!messageElement) return;
    
    const reactionsContainer = messageElement.querySelector('.message-reactions');
    reactionsContainer.innerHTML = '';
    
    Object.entries(reactions).forEach(([emoji, users]) => {
        if (users.length > 0) {
            const reactionElement = document.createElement('div');
            reactionElement.className = 'reaction';
            
            // Check if current user reacted
            if (users.includes(currentUser)) {
                reactionElement.classList.add('user-reacted');
            }
            
            reactionElement.innerHTML = `${emoji} ${users.length}`;
            reactionElement.title = `Reacted by: ${users.join(', ')}`;
            reactionsContainer.appendChild(reactionElement);
        }
    });
}

function updateUsersList(users) {
    usersList.innerHTML = '';
    userCountSpan.textContent = `${users.length} user${users.length !== 1 ? 's' : ''} online`;
    
    users.forEach(user => {
        const userElement = document.createElement('div');
        userElement.className = 'user-item';
        userElement.innerHTML = `
            <div class="user-color" style="background-color: ${user.color}"></div>
            <span>${escapeHtml(user.username)}</span>
        `;
        usersList.appendChild(userElement);
    });
}

function updateTypingIndicator() {
    if (typingUsers.size > 0) {
        const users = Array.from(typingUsers);
        let text = '';
        if (users.length === 1) {
            text = `${users[0]} is typing...`;
        } else if (users.length === 2) {
            text = `${users[0]} and ${users[1]} are typing...`;
        } else {
            text = 'Several people are typing...';
        }
        typingIndicator.textContent = text;
    } else {
        typingIndicator.textContent = '';
    }
}

function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Socket event listeners
socket.on('room-messages', (roomMessages) => {
    messages.innerHTML = '';
    roomMessages.forEach(message => addMessage(message));
});

socket.on('new-message', (message) => {
    addMessage(message);
});

socket.on('room-users', (users) => {
    updateUsersList(users);
});

socket.on('user-joined', (data) => {
    addSystemMessage(`${data.username} joined the room at ${data.timestamp}`);
});

socket.on('user-left', (data) => {
    addSystemMessage(`${data.username} left the room at ${data.timestamp}`);
});

socket.on('reaction-updated', (data) => {
    updateMessageReactions(data.messageId, data.reactions);
});

socket.on('user-typing', (data) => {
    if (data.isTyping) {
        typingUsers.add(data.username);
    } else {
        typingUsers.delete(data.username);
    }
    updateTypingIndicator();
});

socket.on('disconnect', () => {
    addSystemMessage('Disconnected from server');
});

socket.on('connect', () => {
    if (currentUser && currentRoom) {
        socket.emit('join-room', { username: currentUser, room: currentRoom });
    }
});
