import Collection from "@/lib/models/Collection";
import Product from "@/lib/models/Product";
import { connectToDB } from "@/lib/mongoDB";
import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";

export const DELETE=async(req:NextRequest,{params}:
    {
        params:{collectionId:string}
    })=>{
        try{
            const {userId}=auth();
            if(!userId){
                return new NextResponse("Unauthorized",{status:401});
            }
            await connectToDB();
            await Collection.findByIdAndDelete(params.collectionId);
            await Product.updateMany({collection:params.collectionId},
                {$pull:{collections:params.collectionId}});
                
            return new NextResponse("Collection is Deleted",{status:200});

        }catch(err){
            console.log('Collection Id_Delete',err);
            return new NextResponse("Internal error",{status:500})
        }
    }

export const GET=async(req:NextRequest,
    {params}:{
        params:{
            collectionId:string
        }
    })=>{
        try{
           await connectToDB();
        const collection=await Collection.findById(params.collectionId).populate({path:"products",model:Product});
        if(!collection){
            return new NextResponse(JSON.stringify({message:"Collection Not found"}),{status:404});
        }
        return NextResponse.json(collection,{status:200})

        }catch(err){
           console.log("collectionnId_Get",err);
           return new NextResponse("Internal error",{status:500});
        }
    }



    
    export const POST=async(req:NextRequest,{params}:{
        params:{collectionId:string}
    })=>{
        try{
            const userId=auth();
            if(!userId){
                return new NextResponse("Unauthorized",{status:401})
            }
            await connectToDB();
            let collection=await Collection.findById(params.collectionId);
            if(!collection){
                return new NextResponse("Collection Not found",{status:404});
            }
            const {title,description,image}=await req.json();
            if((!title || !image)){
                return new NextResponse("title and image are required",{status:404});
            }
           collection=await Collection.findByIdAndUpdate(params.collectionId,{title,description,image},{new:true})
          await collection.save();
          return NextResponse.json(collection,{status:200});


        }catch(err){
         console.log("error in updating category",err);
         return new NextResponse("Internal error",{status:500});
        }
    }

export const dynamic="force-dynamic"; 