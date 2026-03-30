import redisClient from "../config/redis.js";

export const cacheMiddleware = (ttl = 60) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;

    const cached = await redisClient.get(key);

    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const originalSend = res.json.bind(res);

    res.json = async (data) => {
      await redisClient.setEx(key, ttl, JSON.stringify(data));
      return originalSend(data);
    };

    next();
  };
};