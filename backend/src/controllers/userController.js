const User = require("../models/User");

const getAllUser = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 9;
        const search = req.query.search || "";

        const query = {
            $or: [
                { name: { $regex: search, $options: "i" } },
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
        const currentUserId = req.user.id;    
        const targetUserId = req.params.id;   

       
        const currentUser = await User.findById(currentUserId);
        const targetUser = await User.findById(targetUserId);

        if (!currentUser || !targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        
        const tempRole = currentUser.role;
        currentUser.role = targetUser.role;
        targetUser.role = tempRole;

        await currentUser.save();
        await targetUser.save();

        
        const logout = true;

        return res.json({
            success: true,
            message: "Roles swapped successfully",
            currentUserNewRole: currentUser.role,
            targetUserNewRole: targetUser.role,
            logout,
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
};



module.exports = {getAllUser, updateRoleUser};

