import { prisma } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest) {
    try{
        const resp = await prisma.market.findMany({
            include:{outcomes:true},
            orderBy:{createdAt:"desc"}
        })
        if(!resp){
            return NextResponse.json({
                message:"unabel to fetch"
            },{
                status:500
            })
        }
        return NextResponse.json({
            resp
        },{status:200})
    } catch(err){
        console.error(err);
        return NextResponse.json({message:"Something went wrong"},{status:500})
    }
}
type reqbody = {
    title:string,
    description:string,
    outcomes:string[]
}
export async function POST(req:NextResponse) {
    try{
        const body:reqbody = await req.json();
        const resp = await prisma.market.create({
            data:{
                title:body.title,
                description:body.description,
                outcomes:{
                    create:body.outcomes.map(label=>({label}))
                },
                status:"open"
            }
        })
        if(!resp){
            return NextResponse.json({message:"unable to register the bet"},{status:500})
        }
        return NextResponse.json({message:"Bet has been registered"},{status:200});
    }catch(err){
        console.error(err);
        return NextResponse.json({message:"Something went wrong on our side"},{status:500});
    }
}