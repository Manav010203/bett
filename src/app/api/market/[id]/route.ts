
import { prisma } from "@/app/lib/db";
import redis from "@/app/lib/redis";

import { NextResponse } from "next/server";

export async function GET(req:Request,context:{params:Promise<{id:string}>}) {
    try{
        const id = (await context.params).id;
        if(!id){
            return NextResponse.json({message:"id not provided"},{status:400});
        }
        const cacheKey = `market:${id}`;
        const cached = await redis.get(cacheKey);
        if(cached){
            console.log("cached has been hit✅");
            return NextResponse.json(JSON.parse(cached));
        }
        console.log("Cache miss ❌ — fetching from Postgres...");

        const market = await prisma.market.findUnique({
            where:{
                id:id
            },
            include:{outcomes:true}
        })
        if(!market){
            return NextResponse.json({message:"No Market of that id found"},{status:404});
        }
        await redis.set(cacheKey,JSON.stringify(market),{EX:15});
        return NextResponse.json({market},{status:200});
    }catch(err){
        console.error(err);
        return NextResponse.json({message:"Something went wrong on our side"},{status:500});
    }
}