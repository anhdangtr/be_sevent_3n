const Reminder = require('../models/Reminder');
const Event = require('../models/Event');

// Create a reminder
const createReminder = async (req, res) => {
  try {
    const { eventId, reminderDateTime, note } = req.body;
    const userId = req.user._id;

    // Validate eventId
    if (!eventId) {
      return res.status(400).json({ success: false, message: 'Event ID is required' });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check reminder limit (max 3 per user per event)
    const existingReminders = await Reminder.countDocuments({
      userId,
      eventId
    });

    if (existingReminders >= 3) {
      return res.status(400).json({ success: false, message: 'Chỉ được đặt tối đa 3 reminder cho một sự kiện' });
    }

    // Check for duplicate time
    const duplicateReminder = await Reminder.findOne({
      userId,
      eventId,
      reminderDateTime: new Date(reminderDateTime)
    });

    if (duplicateReminder) {
      return res.status(400).json({ success: false, message: 'Thời gian reminder này đã tồn tại' });
    }

    // Create reminder
    const reminder = await Reminder.create({
      userId,
      eventId,
      reminderDateTime: new Date(reminderDateTime),
      note: note || ''
    });

    res.status(201).json({
      success: true,
      data: reminder,
      message: 'Reminder created successfully'
    });
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi tạo reminder'
    });
  }
};

// Get reminders for an event (by logged-in user)
const getReminders = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const reminders = await Reminder.find({
      userId,
      eventId
    }).sort({ reminderDateTime: 1 });

    res.json({
      success: true,
      data: reminders
    });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy reminders'
    });
  }
};

// Update a reminder
const updateReminder = async (req, res) => {
  try {
    const { reminderId } = req.params;
    const { reminderDateTime, note } = req.body;
    const userId = req.user._id;

    const reminder = await Reminder.findById(reminderId);
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    // Check ownership
    if (reminder.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Check for duplicate time if reminderDateTime is being updated
    if (reminderDateTime && reminderDateTime !== reminder.reminderDateTime.toISOString()) {
      const duplicate = await Reminder.findOne({
        _id: { $ne: reminderId },
        userId,
        eventId: reminder.eventId,
        reminderDateTime: new Date(reminderDateTime)
      });

      if (duplicate) {
        return res.status(400).json({ success: false, message: 'Thời gian reminder này đã tồn tại' });
      }
    }

    // Update fields
    if (reminderDateTime) reminder.reminderDateTime = new Date(reminderDateTime);
    if (note !== undefined) reminder.note = note;

    await reminder.save();

    res.json({
      success: true,
      data: reminder,
      message: 'Reminder updated successfully'
    });
  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật reminder'
    });
  }
};

// Delete a reminder
const deleteReminder = async (req, res) => {
  try {
    const { reminderId } = req.params;
    const userId = req.user._id;

    const reminder = await Reminder.findById(reminderId);
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    // Check ownership
    if (reminder.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Reminder.deleteOne({ _id: reminderId });

    res.json({
      success: true,
      message: 'Reminder deleted successfully'
    });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi xoá reminder'
    });
  }
};

module.exports = {
  createReminder,
  getReminders,
  updateReminder,
  deleteReminder
};

//reminder
