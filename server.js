// server.js - Main server file
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const Web3 = require('web3');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Configure middleware
app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// AI model connection (placeholder - connect to your AI service)
// In-memory session storage (replace with database in production)
const sessions = {};
const users = {};

// AI model connection for Anthropic
const connectToAI = async () => {
 const { Anthropic } = require('@anthropic-ai/sdk');
 const anthropic = new Anthropic({
   apiKey: process.env.ANTHROPIC_API_KEY,
 });
 
 console.log('Connected to Anthropic AI service');
 return {
   generateResponse: async (prompt) => {
     const response = await anthropic.messages.create({
       model: 'claude-3-haiku-20240307',
       max_tokens: 1024,
       messages: [{ role: 'user', content: prompt }]
     });
     return response.content[0].text;
   }
 };
};

//   Initialize Blockchain connection
const web3 = new Web3(process.env.BLOCKCHAIN_PROVIDER_URL);
const sessionContract = {}; // Using simulation mode - replace with real contract when needed

// Session management
app.post('/api/sessions', async (req, res) => {
  const sessionId = uuidv4();
  const userId = req.body.userId || uuidv4();
  
  sessions[sessionId] = {
    id: sessionId,
    createdAt: Date.now(),
    users: [{ id: userId, role: 'admin' }],
    messages: []
  };
  
  // Create blockchain record
  const sessionHash = web3.utils.sha3(JSON.stringify({
    sessionId,
    createdAt: sessions[sessionId].createdAt,
    creator: userId
  }));
  
  // Store hash on blockchain (implementation depends on your contract)
  // const receipt = await sessionContract.methods.createSession(sessionId, sessionHash).send();
  
  const token = jwt.sign({ sessionId, userId, role: 'admin' }, 'your-secret-key', { expiresIn: '24h' });
  
  res.json({
    success: true,
    sessionId,
    userId,
    token,
    shareableLink: `https://your-domain.com/join/${sessionId}`
  });
});

// Join session endpoint
app.post('/api/sessions/:sessionId/join', (req, res) => {
  const { sessionId } = req.params;
  const userId = req.body.userId || uuidv4();
  
  if (!sessions[sessionId]) {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }
  
  // Add user to session
  sessions[sessionId].users.push({ id: userId, role: 'participant' });
  
  const token = jwt.sign({ sessionId, userId, role: 'participant' }, 'your-secret-key', { expiresIn: '24h' });
  
  res.json({
    success: true,
    sessionId,
    userId,
    token
  });
});

// User management endpoint
app.post('/api/sessions/:sessionId/users/:targetUserId', (req, res) => {
  const { sessionId, targetUserId } = req.params;
  const { action } = req.body;
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'No authorization token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, 'your-secret-key');
    
    if (!sessions[sessionId]) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    const requestingUser = sessions[sessionId].users.find(u => u.id === decoded.userId);
    
    if (!requestingUser || requestingUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to manage users' });
    }
    
    if (action === 'kick') {
      sessions[sessionId].users = sessions[sessionId].users.filter(u => u.id !== targetUserId);
      io.to(sessionId).emit('user_kicked', { userId: targetUserId });
      res.json({ success: true, message: 'User removed from session' });
    } else if (action === 'changeRole') {
      const targetUser = sessions[sessionId].users.find(u => u.id === targetUserId);
      if (targetUser) {
        targetUser.role = req.body.newRole;
        res.json({ success: true, message: 'User role updated' });
      } else {
        res.status(404).json({ success: false, message: 'User not found in session' });
      }
    } else {
      res.status(400).json({ success: false, message: 'Invalid action' });
    }
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// Socket.io connection handling
io.on('connection', async (socket) => {
  const { sessionId, token } = socket.handshake.auth;
  
  try {
    const decoded = jwt.verify(token, 'your-secret-key');
    
    if (!sessions[sessionId] || !decoded.sessionId === sessionId) {
      socket.disconnect();
      return;
    }
    
    // Join the session room
socket.join(sessionId);
socket.userId = decoded.userId;
socket.sessionId = sessionId;

console.log(`User ${socket.userId} joined session ${sessionId}`);

// Get all users currently in this session
const socketsInRoom = io.sockets.adapter.rooms.get(sessionId);
const userList = [];
if (socketsInRoom) {
  for (const socketId of socketsInRoom) {
    const userSocket = io.sockets.sockets.get(socketId);
    if (userSocket && userSocket.userId) {
      userList.push({ id: userSocket.userId });
    }
  }
}

// Broadcast updated user list to all users in the session
io.to(sessionId).emit('user_list_updated', { 
  users: userList,
  timestamp: Date.now()
});
    
    // Initialize AI model connection
    const aiModel = await connectToAI();
    
    // Handle user messages
socket.on('message', async (data) => {
  const messageId = uuidv4();
  const message = {
    id: messageId,
    content: data.content,
    userId: socket.userId,
    timestamp: Date.now()
  };
  
  // Save message to session
  sessions[sessionId].messages.push(message);
  
  // Create blockchain record for message integrity
  const messageHash = web3.utils.sha3(JSON.stringify(message));
  // await sessionContract.methods.addMessage(sessionId, messageId, messageHash).send();
  
  // Broadcast message to all users in session
  io.to(sessionId).emit('message', message);
  
  // Check if message starts with "AI " to trigger AI response
  if (data.content.trim().startsWith("AI ")) {
    // Extract the prompt (remove "AI " from the beginning)
    const aiPrompt = data.content.trim().substring(3);
    
    if (aiPrompt.length > 0) {
      try {
        // Get AI response
        const aiResponse = await aiModel.generateResponse(aiPrompt);
        const aiMessage = {
          id: uuidv4(),
          content: aiResponse,
          userId: 'ai-model',
          timestamp: Date.now()
        };
        
        sessions[sessionId].messages.push(aiMessage);
        io.to(sessionId).emit('message', aiMessage);
      } catch (error) {
        console.error('AI response error:', error);
        const errorMessage = {
          id: uuidv4(),
          content: "Sorry, I'm having trouble responding right now. Please try again.",
          userId: 'ai-model',
          timestamp: Date.now()
        };
        sessions[sessionId].messages.push(errorMessage);
        io.to(sessionId).emit('message', errorMessage);
      }
    }
  }
  // If message doesn't start with "AI ", it's just a regular chat message
  // AI will not respond, and the message is treated as normal user chat
});
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} left session ${sessionId}`);
      io.to(sessionId).emit('user_left', { 
        userId: socket.userId,
        timestamp: Date.now()
      });
    });
    
  } catch (error) {
    console.error('Socket authentication error:', error);
    socket.disconnect();
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
