// src/controllers/eventController.js

const Event = require('../models/Event');
const User = require('../models/User');
const mongoose = require('mongoose');

// GET /api/events - Lấy danh sách sự kiện + phân trang + tìm kiếm + lọc category
const getAllEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    const { search, category } = req.query;

    // Xây dựng query tìm kiếm
    let query = {};

    // Tìm theo từ khóa trong title, location, ogranization (không phân biệt hoa thường)
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i'); // không phân biệt hoa thường
      query.$or = [
        { title: { $regex: regex } },
        { location: { $regex: regex } },
        { organization: { $regex: regex } }
      ];
    }

    // Lọc theo danh mục (category là String: tech, business, education, entertainment)
    if (category && category !== 'all') {
      query.category = category;
    }

    // Đếm tổng số sự kiện thỏa điều kiện
    const totalEvents = await Event.countDocuments(query);

    // Lấy danh sách sự kiện
    const events = await Event.find(query)
      .sort({ startDate: -1, createdAt: -1 }) // Sự kiện sắp tới trước, mới tạo trước
      .skip(skip)
      .limit(limit)
      .select('-__v') // Không trả về trường __v
      .lean(); // Tăng tốc độ

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

// GET /api/events/trending - Lấy sự kiện nổi bật (dựa trên interestingCount + saveCount)
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


// Get event by ID
const getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Validate eventId format
    if (!eventId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }

    const event = await Event.findById(eventId);

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

// Check if user liked the event
const checkIfUserLiked = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id; // From authenticate middleware

    // Validate eventId format
    if (!eventId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isLiked = user.interestingEvents.some(
      (item) => item.event.toString() === eventId
    );

    res.status(200).json({
      success: true,
      isLiked: isLiked
    });
  } catch (error) {
    console.error('Check like error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Toggle like/unlike event
const toggleLikeEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id; // From authenticate middleware

    // Validate eventId format
    if (!eventId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user already liked this event
    const alreadyLiked = user.interestingEvents.some(
      (item) => item.event.toString() === eventId
    );

    let isLiked;

    if (alreadyLiked) {
      // Unlike event: remove from user's interestingEvents and decrease counter
      user.interestingEvents = user.interestingEvents.filter(
        (item) => item.event.toString() !== eventId
      );
      event.interestingCount = Math.max(0, event.interestingCount - 1);
      isLiked = false;
    } else {
      // Like event: add to user's interestingEvents and increase counter
      user.interestingEvents.push({
        event: eventId,
        likedAt: new Date()
      });
      event.interestingCount = event.interestingCount + 1;
      isLiked = true;
    }

    // Save both user and event
    await user.save();
    await event.save();

    res.status(200).json({
      success: true,
      isLiked: isLiked,
      interestingCount: event.interestingCount,
      message: alreadyLiked ? 'Event unliked' : 'Event liked'
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// POST /api/events/:eventId/like - Like sự kiện (tăng interestingCount)
const likeEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findByIdAndUpdate(
      eventId,
      { $inc: { interestingCount: 1 } },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ success: false, message: 'Sự kiện không tồn tại' });
    }

    res.json({
      success: true,
      message: 'Đã thích sự kiện',
      data: { interestingCount: event.interestingCount }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// POST /api/events/:eventId/save - Lưu sự kiện
const saveEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findByIdAndUpdate(
      eventId,
      { $inc: { saveCount: 1 } },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ success: false, message: 'Sự kiện không tồn tại' });
    }

    res.json({
      success: true,
      message: 'Đã lưu sự kiện',
      data: { saveCount: event.saveCount }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};



// Create a new event (admin or authenticated users depending on app rules)
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

// Update an existing event
const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const updated = await Event.findByIdAndUpdate(eventId, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật sự kiện' });
  }
};

// Delete an event
const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const deleted = await Event.findByIdAndDelete(eventId);
    if (!deleted) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi xóa sự kiện' });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  getTrendingEvents,
  likeEvent,
  saveEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  checkIfUserLiked,
  toggleLikeEvent
};