// routes/chatRoutes.js - CORRECTED VERSION
import express from "express";
import Message from "../models/Chat.js";
import User from "../models/User.js";
import { verifyToken } from "../middleware/authMiddleware.js"; // Change authenticateToken to verifyToken

const router = express.Router();

// Get all users except current user
router.get("/users", verifyToken, async (req, res) => {  // Changed here
  try {
    const users = await User.find({ _id: { $ne: req.user.userId } })
      .select("name email location role phone isOnline lastSeen createdAt")
      .sort({ name: 1 });
    
    res.json({ 
      success: true,
      data: users 
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch users" 
    });
  }
});

// Get messages between two users
router.get("/messages/:userId", verifyToken, async (req, res) => {  // Changed here
  try {
    const { userId } = req.params;
    
    const messages = await Message.find({
      $or: [
        { sender: req.user.userId, receiver: userId },
        { sender: userId, receiver: req.user.userId }
      ]
    })
    .sort({ timestamp: 1 })
    .populate("sender", "name email")
    .populate("receiver", "name email");

    // Mark messages as read
    await Message.updateMany(
      { sender: userId, receiver: req.user.userId, read: false },
      { read: true }
    );

    res.json({ 
      success: true,
      data: messages 
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch messages" 
    });
  }
});

// Send a message
router.post("/send", verifyToken, async (req, res) => {  // Changed here
  try {
    const { receiverId, content } = req.body;

    if (!receiverId || !content || content.trim() === '') {
      return res.status(400).json({ 
        success: false,
        error: "Receiver ID and content are required" 
      });
    }

    const message = new Message({
      sender: req.user.userId,
      receiver: receiverId,
      content: content.trim()
    });

    await message.save();

    // Populate sender and receiver info
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name email")
      .populate("receiver", "name email");

    res.status(201).json({ 
      success: true,
      data: populatedMessage 
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to send message" 
    });
  }
});

// Update user online status
router.put("/status", verifyToken, async (req, res) => {  // Changed here
  try {
    const { isOnline } = req.body;
    
    await User.findByIdAndUpdate(req.user.userId, {
      isOnline,
      lastSeen: new Date()
    });

    res.json({ 
      success: true,
      message: "Status updated successfully" 
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to update status" 
    });
  }
});

// Get conversation list
router.get("/conversations", verifyToken, async (req, res) => {  // Changed here
  try {
    // For now, return empty array or implement this later
    res.json({ 
      success: true,
      data: [] 
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch conversations" 
    });
  }
});

// Get unread message count
router.get("/unread-count", verifyToken, async (req, res) => {  // Changed here
  try {
    const count = await Message.countDocuments({
      receiver: req.user.userId,
      read: false
    });

    res.json({ 
      success: true,
      data: count 
    });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch unread count" 
    });
  }
});

export default router;