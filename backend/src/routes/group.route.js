import express from "express";
import {
  createGroup,
  getUserGroups,
  getGroupDetails,
  addMemberToGroup,
  removeMemberFromGroup,
  updateGroup,
  deleteGroup,
  leaveGroup
} from "../controllers/group.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();

// Apply middlewares to all routes
router.use(arcjetProtection, protectRoute);

// Group management routes
router.post("/create", createGroup);
router.get("/", getUserGroups);
router.get("/:id", getGroupDetails);
router.put("/:id", updateGroup);
router.delete("/:id", deleteGroup);

// Member management routes
router.post("/:id/members", addMemberToGroup);
router.delete("/:id/members/:memberId", removeMemberFromGroup);
router.post("/:id/leave", leaveGroup);

export default router;