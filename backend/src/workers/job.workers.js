import { Worker } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis({
  maxRetriesPerRequest: null,   // ✅ REQUIRED
});

console.log("Worker started");

const worker = new Worker(
  "jobs",
  async (job) => {
    switch (job.name) {
      case "sendNotification":
        console.log("Processing notification:", job.data);
        break;

      default:
        console.log("Unknown job");
    }
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`Job failed: ${job.id}`, err);
});