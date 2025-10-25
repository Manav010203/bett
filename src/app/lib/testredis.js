const Redis = require("ioredis");
const redis = new Redis(); // default localhost:6379

async function testRedis() {
  await redis.set("test-key", "Hello Redis!");
  const value = await redis.get("test-key");
  console.log("Redis returned:", value);
  redis.disconnect();
}

testRedis();
