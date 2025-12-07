const User = require("../models/User");

const getAllUser = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 9;
        const search = req.query.search || "";

        const query = {
            $or: [
                { username: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ]
        };

        const totalUsers = await User.countDocuments(query);

        const users = await User.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            users,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page
        });

    } catch (err) {
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const updateRoleUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Đổi role
        user.role = user.role === "admin" ? "user" : "admin";
        await user.save();

        return res.json({
            success: true,
            message: "Role updated successfully",
            newRole: user.role,
            logout: true   // báo frontend logout
        });

    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = {getAllUser, updateRoleUser};

