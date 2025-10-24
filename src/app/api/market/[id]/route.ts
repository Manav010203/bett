
import { prisma } from "@/app/lib/db";

import { NextResponse } from "next/server";

export async function GET(req:Request,context:{params:Promise<{id:string}>}) {
    try{
        const id = (await context.params).id;
        if(!id){
            return NextResponse.json({message:"id not provided"},{status:400});
        }
        const market = await prisma.market.findUnique({
            where:{
                id:id
            },
            include:{outcomes:true}
        })
        if(!market){
            return NextResponse.json({message:"No Market of that id found"},{status:404});
        }
        return NextResponse.json({market},{status:200});
    }catch(err){
        console.error(err);
        return NextResponse.json({message:"Something went wrong on our side"},{status:500});
    }
}