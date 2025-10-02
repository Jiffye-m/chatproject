import express from "express";
import {
  getCallHistory,
  getCallHistoryWithUser,
  getMissedCalls,
  markCallAsRead,
  deleteCallHistory,
  getCallStatistics
} from "../controllers/callHistory.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();

// Apply middlewares to all routes
router.use(arcjetProtection, protectRoute);

// Get all call history for user
router.get("/", getCallHistory);

// Get call history with specific user
router.get("/user/:otherUserId", getCallHistoryWithUser);

// Get missed calls
router.get("/missed", getMissedCalls);

// Get call statistics
router.get("/statistics", getCallStatistics);

// Mark specific call as read
router.patch("/:callId/read", markCallAsRead);

// Delete specific call from history
router.delete("/:callId", deleteCallHistory);

export default router;