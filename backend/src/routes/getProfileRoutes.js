const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {getProfile} = require("../controllers/userProfileController");


router.get("/:userID/profile", auth, getProfile);

module.exports = router;
