import Group from '../models/Group.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

// @desc    Create a new group
// @route   POST /api/chat/groups
// @access  Private
export const createGroup = async (req, res) => {
  try {
    const { group_name, group_type, description, is_official } = req.body;

    const group = await Group.create({
      group_name,
      group_type,
      description,
      is_official: req.user.role === 'Admin' ? is_official : false,
      created_by: req.user._id,
      members: [{ user: req.user._id, role: 'Admin' }]
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all groups
// @route   GET /api/chat/groups
// @access  Private
export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({}).populate('created_by', 'name');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join a group
// @route   POST /api/chat/groups/:id/join
// @access  Private
export const joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (group) {
      const isMember = group.members.find(m => m.user.toString() === req.user._id.toString());
      if (isMember) {
        return res.status(400).json({ message: 'Already a member' });
      }

      group.members.push({ user: req.user._id, role: 'Member' });
      await group.save();
      res.json({ message: 'Joined group successfully' });
    } else {
      res.status(404).json({ message: 'Group not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get group messages
// @route   GET /api/chat/groups/:id/messages
// @access  Private
export const getGroupMessages = async (req, res) => {
  try {
    const messages = await Message.find({ group_id: req.params.id })
      .populate('sender_id', 'name role')
      .sort({ createdAt: 1 });
      
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Report a message
// @route   PUT /api/chat/messages/:id/report
// @access  Private
export const reportMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    message.isReported = true;
    await message.save();
    res.json({ message: 'Message reported successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reported messages
// @route   GET /api/chat/messages/reported
// @access  Private (Admin)
export const getReportedMessages = async (req, res) => {
  try {
    const messages = await Message.find({ isReported: true })
      .populate('sender_id', 'name')
      .populate('group_id', 'group_name')
      .sort({ updatedAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all conversations for a user
// @route   GET /api/chat/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const pinnedChatIds = user.pinnedChats || [];

    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name email role')
      .populate('group_id', 'group_name description')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json({
      conversations,
      pinnedChats: pinnedChatIds
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create or get direct conversation
// @route   POST /api/chat/conversations/direct/:userId
// @access  Private
export const createOrGetDirectConversation = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot create chat with yourself' });
    }

    let conversation = await Conversation.findOne({
      type: 'direct',
      participants: { $all: [req.user._id, userId] }
    })
      .populate('participants', 'name email role')
      .populate('lastMessage');

    if (!conversation) {
      conversation = await Conversation.create({
        type: 'direct',
        participants: [req.user._id, userId],
        unreadCounts: new Map([[req.user._id.toString(), 0], [userId.toString(), 0]])
      });

      conversation = await Conversation.findById(conversation._id).populate('participants', 'name email role');
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get conversation messages
// @route   GET /api/chat/conversations/:id/messages
// @access  Private
export const getConversationMessages = async (req, res) => {
  try {
    const messages = await Message.find({ conversation_id: req.params.id })
      .populate('sender_id', 'name role')
      .populate({
        path: 'replyTo',
        populate: { path: 'sender_id', select: 'name' }
      })
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Pin or unpin a conversation
// @route   POST /api/chat/conversations/:id/pin
// @access  Private
export const pinConversation = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const user = await User.findById(req.user._id);

    // Initialize if undefined
    if (!user.pinnedChats) user.pinnedChats = [];

    const isPinned = user.pinnedChats.includes(conversationId);

    if (isPinned) {
      user.pinnedChats = user.pinnedChats.filter(id => id.toString() !== conversationId);
    } else {
      user.pinnedChats.push(conversationId);
    }

    await user.save();
    res.json({ isPinned: !isPinned, pinnedChats: user.pinnedChats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark conversation as read
// @route   PUT /api/chat/conversations/:id/read
// @access  Private
export const markConversationRead = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.unreadCounts) {
      conversation.unreadCounts = new Map();
    }
    
    conversation.unreadCounts.set(req.user._id.toString(), 0);
    await conversation.save();

    res.json({ message: 'Marked as read', unreadCounts: conversation.unreadCounts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const joinConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });

    if (!conversation.participants.includes(req.user._id)) {
      conversation.participants.push(req.user._id);
      await conversation.save();
    }
    res.json({ message: "Joined successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
