import Group from '../models/Group.js';
import Message from '../models/Message.js';

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
