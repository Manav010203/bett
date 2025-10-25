import redis from "@/app/lib/redis";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const stream = new ReadableStream({
    async start(controller) {
      // Create a dedicated subscriber
      const subscriber = redis.duplicate();
      await subscriber.connect();

      const channel = `market:update:${id}`;
      await subscriber.subscribe(channel, (message) => {
        // Encode and send as SSE event
        const event = `data: ${message}\n\n`;
        controller.enqueue(new TextEncoder().encode(event));
      });

      // Handle client disconnect
      req.signal.addEventListener("abort", async () => {
        await subscriber.unsubscribe(channel);
        await subscriber.quit();
        try{
          controller.close();
        }catch(err){}
        
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
