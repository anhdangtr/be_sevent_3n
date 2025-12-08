// src/controllers/eventController.js

const Event = require('../models/Event');
const User = require('../models/User');
const mongoose = require('mongoose');
const { sendError } = require('../utils/responseHelper');

// Helper: Validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return id.match(/^[0-9a-fA-F]{24}$/);
};

// =========================================================
//  1. FETCH EVENT API — GET LIST, SEARCH, FILTER, TRENDING
// =========================================================

const getAllEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    const { search, category } = req.query;

    let query = {};

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: { $regex: regex } },
        { location: { $regex: regex } },
        { organization: { $regex: regex } }
      ];
    }

    if (category && category !== 'all') {
      const mongoose = require('mongoose');
      try {
        query.category = mongoose.Types.ObjectId(category);
      } catch (err) {
        query.category = category; // fallback nếu không phải ObjectId
      }
    }

    const totalEvents = await Event.countDocuments(query);
    const events = await Event.find(query)
      .sort({ startDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v')
      .lean();

    const totalPages = Math.ceil(totalEvents / limit);

    res.json({
      success: true,
      data: events,
      pagination: {
        page,
        pages: totalPages,
        total: totalEvents,
        limit
      }
    });
  } catch (error) {
    console.error('Error in getAllEvents:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách sự kiện'
    });
  }
};

const getTrendingEvents = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;

    const trendingEvents = await Event.find()
      .sort({
        interestingCount: -1,
        saveCount: -1,
        createdAt: -1
      })
      .limit(limit)
      .select('-__v')
      .lean();

    res.json({
      success: true,
      data: trendingEvents
    });
  } catch (error) {
    console.error('Error in getTrendingEvents:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy sự kiện nổi bật'
    });
  }
};

const getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!isValidObjectId(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }

    const event = await Event.findOne({ _id: eventId });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Get event by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// =========================================================
//  2. CRUD EVENT — CREATE / UPDATE / DELETE
// =========================================================

const createEvent = async (req, res) => {
  try {
    const payload = req.body;
    const newEvent = await Event.create(payload);
    res.status(201).json({ success: true, data: newEvent });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi tạo sự kiện' });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    if (!isValidObjectId(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }

    const updated = await Event.findByIdAndUpdate(eventId, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật sự kiện' });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    if (!isValidObjectId(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }

    const deleted = await Event.findByIdAndDelete(eventId);
    if (!deleted) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi xóa sự kiện' });
  }
};

// =========================================================
//  CHECK LIKE & SAVE STATUS
// =========================================================

const checkIfUserLiked = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isLiked = user.interestingEvents.some(
      (item) => item.event.toString() === eventId
    );

    res.status(200).json({
      success: true,
      isLiked
    });
  } catch (error) {
    console.error('Check like error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const checkIfUserSaved = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Kiểm tra event đã được save trong bất kỳ folder nào
    let isSaved = false;
    user.savedFolders.forEach(folder => {
      const exists = folder.events.some(e => e.event.toString() === eventId);
      if (exists) {
        isSaved = true;
      }
    });

    // Lấy số lượng save của event
    const event = await Event.findById(eventId);
    const saveCount = event.saveCount || 0;

    res.status(200).json({
      success: true,
      isSaved,
      saveCount
    });
  } catch (error) {
    console.error('Check save error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// =========================================================
//  TOGGLE LIKE
// =========================================================

const toggleLikeEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }

    const event = await Event.findOne({ _id: eventId });
    if (!event) {
      return sendError(res, "Event không tồn tại", 404);
    }

    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, "User không tồn tại", 404);
    }

    let isLiked = false;
    const alreadyLiked = user.interestingEvents.some(
      (item) => item.event.toString() === eventId
    );

    if (alreadyLiked) {
      // Remove like
      user.interestingEvents = user.interestingEvents.filter(
        (item) => item.event.toString() !== eventId
      );
      await Event.updateOne(
        { _id: eventId },
        { $inc: { interestingCount: -1 } }
      );
    } else {
      // Add like
      user.interestingEvents.push({ event: eventId });
      await Event.updateOne(
        { _id: eventId },
        { $inc: { interestingCount: 1 } }
      );
      isLiked = true;
    }

    await user.save();
    const updated = await Event.findOne({ _id: eventId });

    return res.json({
      success: true,
      data: {
        isLiked,
        interestingCount: updated.interestingCount
      }
    });
  } catch (error) {
    console.error("Toggle like error:", error);
    return sendError(res, "Lỗi server khi toggle like");
  }
};

// =========================================================
//  TOGGLE SAVE
// =========================================================

const toggleSaveEvent = async (req, res) => {
  try {
    const userId = req.user._id;
    const { eventId } = req.params;

    if (!isValidObjectId(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }

    const user = await User.findById(userId);
    const event = await Event.findOne({ _id: eventId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User không tồn tại"
      });
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Sự kiện không tồn tại"
      });
    }

    // Create "Watch later" folder if doesn't exist
    let folder = user.savedFolders.find(f => f.name === "Watch later");

    if (!folder) {
      folder = { name: "Watch later", events: [] };
      user.savedFolders.push(folder);
    }

    const alreadySaved = folder.events.some(e => e.event.toString() === eventId);

    if (alreadySaved) {
      // Remove event from folder
      folder.events = folder.events.filter(e => e.event.toString() !== eventId);

      await Event.updateOne(
        { _id: eventId },
        { $inc: { saveCount: -1 } }
      );

      await user.save();

      const updated = await Event.findOne({ _id: eventId });

      return res.json({
        success: true,
        message: "Đã bỏ lưu",
        isSaved: false,
        saveCount: updated.saveCount
      });
    } else {
      // Add to folder
      folder.events.push({ event: eventId });

      await Event.updateOne(
        { _id: eventId },
        { $inc: { saveCount: 1 } }
      );

      await user.save();

      const updated = await Event.findOne({ _id: eventId });

      return res.json({
        success: true,
        message: "Đã lưu vào Watch later",
        isSaved: true,
        saveCount: updated.saveCount
      });
    }
  } catch (error) {
    console.error("Toggle save error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server"
    });
  }
};

// =========================================================
// EXPORT
// =========================================================

module.exports = {
  getAllEvents,
  getEventById,
  getTrendingEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  checkIfUserLiked,
  checkIfUserSaved,
  toggleLikeEvent,
  toggleSaveEvent
};