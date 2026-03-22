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
import multer from 'multer';
import path from 'path';

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

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

app.post('/api/chat/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.send({ url: `/uploads/${req.file.filename}` });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'API is running...' });
});

import Conversation from './models/Conversation.js';

// Map to track online users: userId -> socketId
const onlineUsers = new Map();

// Socket.io logic
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  socket.on('setup', (userData) => {
    if (userData && userData._id) {
      socket.join(userData._id);
      onlineUsers.set(userData._id, socket.id);
      socket.emit('connected');
      io.emit('online_users_list', Array.from(onlineUsers.keys()));
    }
  });

  socket.on('join_chat', (room) => {
    socket.join(room);
  });
  
  // Backward compatibility
  socket.on('join_group', (groupId) => {
    socket.join(groupId);
  });

  socket.on('typing', (room) => socket.in(room).emit('typing', room));
  socket.on('stop_typing', (room) => socket.in(room).emit('stop_typing', room));

  socket.on('send_message', async (data) => {
    try {
      const msgData = {
        sender_id: data.sender_id,
        conversation_id: data.conversation_id,
        group_id: data.group_id,
        message: data.message,
        fileUrl: data.fileUrl,
        replyTo: data.replyTo
      };

      const newMsg = await Message.create(msgData);
      const populatedMsg = await newMsg.populate('sender_id', 'name role');
      
      let updatedConversation = null;
      if (data.conversation_id) {
         updatedConversation = await Conversation.findById(data.conversation_id);
         if (updatedConversation) {
           updatedConversation.lastMessage = newMsg._id;
           
           if (!updatedConversation.unreadCounts) {
             updatedConversation.unreadCounts = new Map();
           }
           
           for (let key of updatedConversation.unreadCounts.keys()) {
             if (key !== data.sender_id.toString()) {
               updatedConversation.unreadCounts.set(key, (updatedConversation.unreadCounts.get(key) || 0) + 1);
             }
           }
           await updatedConversation.save();
           updatedConversation = await Conversation.findById(data.conversation_id).populate('lastMessage');
         }
      }

      const room = data.conversation_id || data.group_id;
      io.to(room).emit('receive_message', populatedMsg);
      
      // Notify for sidebar updates
      socket.broadcast.emit('message_notification', {
        message: populatedMsg,
        conversation: updatedConversation
      });
      
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('message_reaction', async ({ messageId, emoji, userId, chatId }) => {
    try {
      const message = await Message.findById(messageId);
      if (message) {
        // Toggle reaction
        const existingIndex = message.reactions.findIndex(r => r.user.toString() === userId && r.emoji === emoji);
        if (existingIndex > -1) {
          message.reactions.splice(existingIndex, 1);
        } else {
          message.reactions.push({ user: userId, emoji });
        }
        await message.save();
        
        const updatedMsg = await Message.findById(messageId).populate('sender_id', 'name role').populate({
          path: 'replyTo',
          populate: { path: 'sender_id', select: 'name' }
        });
        io.to(chatId).emit('update_message', updatedMsg);
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  });

  socket.on('check_online_users', () => {
    socket.emit('online_users_list', Array.from(onlineUsers.keys()));
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    for (let [key, value] of onlineUsers.entries()) {
      if (value === socket.id) {
        onlineUsers.delete(key);
        io.emit('online_users_list', Array.from(onlineUsers.keys()));
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
