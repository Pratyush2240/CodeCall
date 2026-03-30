import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis({
  maxRetriesPerRequest: null,   // ✅ REQUIRED
});

export const jobQueue = new Queue("jobs", {
  connection,
});