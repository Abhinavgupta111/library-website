import express from 'express';
import { getEvents, addEvent, deleteEvent, updateEvent } from '../controllers/event.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getEvents)
  .post(protect, admin, addEvent);

router.route('/:id')
  .delete(protect, admin, deleteEvent)
  .put(protect, admin, updateEvent);

export default router;
