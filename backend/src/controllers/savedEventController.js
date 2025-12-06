const User = require('../models/User');
const Event = require('../models/Event');

// Save an event into user's folder
const saveEvent = async (req, res) => {
  try {
    const { eventId, folderName } = req.body;
    const userId = req.user._id;

    if (!eventId) {
      return res.status(400).json({ success: false, message: 'Event ID is required' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const user = await User.findById(userId);

    const folderToUse = folderName || "Watch later";

    // Check if folder exists
    let folder = user.savedFolders.find(f => f.name === folderToUse);

    // If folder does not exist → create one
    if (!folder) {
      folder = { name: folderToUse, events: [] };
      user.savedFolders.push(folder);
    }

    // Check if event already saved in this folder
    const isAlreadySaved = folder.events.some(e => e.event.toString() === eventId);

    if (isAlreadySaved) {
      return res.status(400).json({
        success: false,
        message: 'Event is already saved in this folder'
      });
    }

    // Add event
    folder.events.push({ event: eventId });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Event saved successfully',
      data: user.savedFolders
    });
  } catch (error) {
    console.error("Save event error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


const getSavedEvents = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .populate("savedFolders.events.event");

    let allEvents = [];

    user.savedFolders.forEach(folder => {
      folder.events.forEach(ev => {
        allEvents.push({
          folder: folder.name,
          event: ev.event,
          savedAt: ev.savedAt
        });
      });
    });

    res.json({
      success: true,
      data: allEvents
    });
  } catch (error) {
    console.error("Get saved events error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateSavedEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { newFolder } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!newFolder) {
      return res.status(400).json({ success: false, message: "New folder name required" });
    }

    // Remove event from any folder it was in
    let removed = false;
    user.savedFolders.forEach(folder => {
      const idx = folder.events.findIndex(e => e.event.toString() === eventId);
      if (idx !== -1) {
        folder.events.splice(idx, 1);
        removed = true;
      }
    });

    if (!removed) {
      return res.status(404).json({ success: false, message: 'Event not found in any folder' });
    }

    // Move to new folder (create folder if not exists)
    let targetFolder = user.savedFolders.find(f => f.name === newFolder);
    if (!targetFolder) {
      targetFolder = { name: newFolder, events: [] };
      user.savedFolders.push(targetFolder);
    }

    targetFolder.events.push({ event: eventId });

    await user.save();

    res.json({
      success: true,
      message: "Event moved successfully",
      data: user.savedFolders
    });

  } catch (error) {
    console.error("Update saved event error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const deleteSavedEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);

    let removed = false;

    user.savedFolders.forEach(folder => {
      const idx = folder.events.findIndex(e => e.event.toString() === eventId);
      if (idx !== -1) {
        folder.events.splice(idx, 1);
        removed = true;
      }
    });

    if (!removed) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    await user.save();

    res.json({
      success: true,
      message: "Saved event removed successfully"
    });
  } catch (error) {
    console.error("Delete saved event error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//Manage to get saved events by folder

const getFolderList = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    const folders = user.savedFolders.map(folder => ({
      name: folder.name,
      totalEvents: folder.events.length
    }));

    res.json({
      success: true,
      folders
    });

  } catch (error) {
    console.error("Get folder list error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getSavedEventsByFolder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { folderName } = req.params;

    const user = await User.findById(userId)
      .populate("savedFolders.events.event");

    const folder = user.savedFolders.find(f => f.name === folderName);

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: "Folder not found"
      });
    }

    res.json({
      success: true,
      folder: folderName,
      events: folder.events
    });

  } catch (error) {
    console.error("Get events by folder error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  saveEvent,
  getSavedEvents,
  updateSavedEvent,
  deleteSavedEvent,
  getFolderList,
  getSavedEventsByFolder
};
