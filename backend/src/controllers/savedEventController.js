const SavedEvent = require('../models/SavedEvent');
const Event = require('../models/Event');

// Save an event
const saveEvent = async (req, res) => {
  try {
    const { eventId, folderName } = req.body;
    const userId = req.user._id;

    // Validate inputs
    if (!eventId) {
      return res.status(400).json({ success: false, message: 'Event ID is required' });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if event is already saved
    const existingSaved = await SavedEvent.findOne({
      userId,
      eventId
    });

    if (existingSaved) {
      return res.status(400).json({ success: false, message: 'Event already saved' });
    }

    // Create saved event
    const savedEvent = await SavedEvent.create({
      userId,
      eventId,
      folderName: folderName || 'Watch later'
    });

    res.status(201).json({
      success: true,
      data: savedEvent,
      message: 'Event saved successfully'
    });
  } catch (error) {
    console.error('Save event error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lưu event'
    });
  }
};

// Get all saved events for logged-in user
const getSavedEvents = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const total = await SavedEvent.countDocuments({ userId });
    const savedEvents = await SavedEvent.find({ userId })
      .populate('eventId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: savedEvents,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    console.error('Get saved events error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách sự kiện đã lưu'
    });
  }
};

// Update a saved event (e.g., change folder name)
const updateSavedEvent = async (req, res) => {
  try {
    const { savedEventId } = req.params;
    const { folderName } = req.body;
    const userId = req.user._id;

    const savedEvent = await SavedEvent.findById(savedEventId);
    if (!savedEvent) {
      return res.status(404).json({ success: false, message: 'Saved event not found' });
    }

    // Check ownership
    if (savedEvent.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (folderName) {
      savedEvent.folderName = folderName;
    }

    await savedEvent.save();

    res.json({
      success: true,
      data: savedEvent,
      message: 'Saved event updated successfully'
    });
  } catch (error) {
    console.error('Update saved event error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật saved event'
    });
  }
};

// Delete a saved event
const deleteSavedEvent = async (req, res) => {
  try {
    const { savedEventId } = req.params;
    const userId = req.user._id;

    const savedEvent = await SavedEvent.findById(savedEventId);
    if (!savedEvent) {
      return res.status(404).json({ success: false, message: 'Saved event not found' });
    }

    // Check ownership
    if (savedEvent.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await SavedEvent.deleteOne({ _id: savedEventId });

    res.json({
      success: true,
      message: 'Saved event deleted successfully'
    });
  } catch (error) {
    console.error('Delete saved event error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi xoá saved event'
    });
  }
};

module.exports = {
  saveEvent,
  getSavedEvents,
  updateSavedEvent,
  deleteSavedEvent
};
