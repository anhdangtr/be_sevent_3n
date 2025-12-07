const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");


router.get("/getAllUser", userController.getAllUser);
router.put("/updateRoleUser/:id", authMiddleware, userController.updateRoleUser);

module.exports = router;
