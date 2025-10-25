import { createClient } from "redis";

const redis = createClient({
    url:"redis://localhost:6379"
});

redis.on("error",(err)=>console.error("Redis client error",err));

(async ()=>{
    if (!redis.isOpen) await redis.connect();
})();

export default redis;