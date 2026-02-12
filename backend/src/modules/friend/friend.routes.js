import express from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import {
  sendRequest,
  acceptRequest,
  listFriends
} from "./friend.controller.js";

const router = express.Router();

router.post("/request", requireAuth, sendRequest);
router.post("/accept", requireAuth, acceptRequest);
router.get("/", requireAuth, listFriends);

export default router;
