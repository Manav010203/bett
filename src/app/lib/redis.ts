import { createClient } from "redis";

const redis = createClient({
  url: process.env.REDIS_DATABASE_URL,
});

redis.on("error", (err) => console.error("Redis client error:", err));

// Connect only once
(async () => {
  try {
    if (!redis.isOpen) {
      await redis.connect();
      console.log("✅ Redis connected");
    }
  } catch (err) {
    console.error("❌ Redis connection failed:", err);
  }
})();

export default redis;
