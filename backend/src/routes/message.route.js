import express from "express";
import {
  getAllContacts,
  getChatPartners,
  getMessagesByUserId,
  getGroupMessages,
  sendMessage,
  sendGroupMessage,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();

// Apply middlewares to all routes
router.use(arcjetProtection, protectRoute);

// Direct message routes
router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.get("/direct/:id", getMessagesByUserId);
router.post("/send/:id", sendMessage);

// Group message routes
router.get("/group/:id", getGroupMessages);
router.post("/send-group/:id", sendGroupMessage);

export default router;