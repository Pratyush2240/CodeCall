import { Router } from "express";
import {
  sendFriendRequest,
  acceptFriendRequest,
  getFriends
} from "../controllers/friend.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/request", authenticate, sendFriendRequest);
router.post("/accept/:id", authenticate, acceptFriendRequest);
router.get("/", authenticate, getFriends);

export default router;
