import Event from '../models/Event.js';
import Group from '../models/Group.js';

// @desc    Get all events
// @route   GET /api/events
// @access  Public
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find({}).sort({ event_date: 1 }).populate('created_by', 'name');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add an event
// @route   POST /api/events
// @access  Private/Admin
export const addEvent = async (req, res) => {
  try {
    const { title, description, event_date, venue } = req.body;

    const event = new Event({
      title,
      description,
      event_date,
      venue,
      created_by: req.user._id
    });

    const createdEvent = await event.save();

    // Automatically create a chat group for this event
    const group = new Group({
      group_name: `Event: ${title}`,
      group_type: 'Event',
      description: `Discussion group for the event: ${title}. ${description}`,
      created_by: req.user._id,
      members: [{ user: req.user._id, role: 'Admin' }]
    });
    await group.save();

    res.status(201).json(createdEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      await event.deleteOne();
      res.json({ message: 'Event removed' });
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Admin
export const updateEvent = async (req, res) => {
  try {
    const { title, description, event_date, venue } = req.body;
    const event = await Event.findById(req.params.id);

    if (event) {
      event.title = title || event.title;
      event.description = description || event.description;
      event.event_date = event_date || event.event_date;
      event.venue = venue || event.venue;

      const updatedEvent = await event.save();
      res.json(updatedEvent);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
