import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';
import eventRoutes from './routes/events.js';
import chatRoutes from './routes/chat.js';
import Message from './models/Message.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust for production
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/chat', chatRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'API is running...' });
});

// Socket.io logic
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  socket.on('join_group', (groupId) => {
    socket.join(groupId);
    console.log(`User ${socket.id} joined group ${groupId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      // data: { sender_id, group_id, message }
      const newMsg = await Message.create(data);
      const populatedMsg = await newMsg.populate('sender_id', 'name role');
      
      io.to(data.group_id).emit('receive_message', populatedMsg);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
