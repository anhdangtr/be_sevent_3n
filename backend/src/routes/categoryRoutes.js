const express = require('express');
const router = express.Router();
const EventCategory = require('../models/Category');

router.delete('/categories/:id', async (req, res) => {
  try {
    const category = await EventCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    
    await category.deleteOne(); // Middleware sẽ tự động chạy
    res.json({ message: 'Category and related events deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;