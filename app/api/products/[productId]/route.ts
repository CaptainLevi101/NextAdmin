import Collection from "@/lib/models/Collection";
import Product from "@/lib/models/Product";
import { connectToDB } from "@/lib/mongoDB";
import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";

export const GET=async(req:NextRequest,
    {params}:{
        params:{
            productId:string
        }
    })=>{
        try{
           await connectToDB();
        const product=await Product.findById(params.productId).populate({path:'collections',model:Collection});
        if(!product){
            return new NextResponse(JSON.stringify({message:"Product Not found"}),{status:404});
        }
        return NextResponse.json(product,{status:200})

        }catch(err){
           console.log("ProductId_Get",err);
           return new NextResponse("Internal error",{status:500});
        }
    }
export const POST=async(req:NextRequest,{params}:{
    params:{
        productId:string
    }
})=>{
    try{
        const {userId}=auth();
        if(!userId){
            return new NextResponse('Unauthorized',{status:401});
        }
        await connectToDB();
        const product=await Product.findById(params.productId);
        if(!product){
            return new NextResponse(JSON.stringify({message: "Product not found"}),{status:401})
        }
        const {title,description,media,category,collections,tags,sizes,colors,price,expense}=await req.json();
        if(!title || !description || !media || !category || !price || !expense){
           return new NextResponse(JSON.stringify({message: "Not enough data to create a new product"}),{status:400})
        }
       
        const addedCollections=collections.filter((collectionId:string)=>!product.collections.includes(collectionId));
        //included the new collections but not the previous ones
        const removedCollections=product.collections.filter((collectionId:string)=>!collections.includes(collectionId))
        //excluded the items which are not in the new collections   collections basically here are collectionID


        //this await would means that complete all the promises first
        //updating collections
       await Promise.all([
        // update added collections with this product
        ...addedCollections.map((collectionId:string)=>Collection.findByIdAndUpdate(collectionId,{
            $push:{products:product._id}
        })),

        ...removedCollections.map((collectionId:string)=>Collection.findByIdAndUpdate(collectionId,{
            $pull:{products:product._id}
        }))
       ]);
      //update product
      const updatedProduct=await Product.findByIdAndUpdate(params.productId,{
        title,
        description,
        media,
        category,
        collections,
        tags,
        sizes,
        colors,
        price,
        expense
      },{new:true}).populate({path:'collections',model:Collection})

     await updatedProduct.save();
     return NextResponse.json(updatedProduct,{status:200});
        

    }catch(err){
        console.log("ProductId_Post",err);
        return new NextResponse("Internal error",{status:500});
    }
}

export const DELETE=async(req:NextRequest,
    {params}:{
        params:{
            productId:string
        }
    })=>{
        try{
            const {userId}=auth();
            if(!userId){
                return new NextResponse('Unauthorized',{status:401});
            }
            await connectToDB();
            const product=await Product.findById(params.productId);
            if(!product){
                return new NextResponse(JSON.stringify({message: "Product not found"}),{status:401})
            } 
        await Product.findByIdAndDelete(product._id);


        // update collection
        await Promise.all(  
            await product.collections.map((collectionId:string)=>
            Collection.findByIdAndUpdate(collectionId,{
                $pull:{products:product._id}
            }))
        )


        }catch(err){
            console.log("ProductId_Post",err);
            return new NextResponse("Internal error",{status:500});
        }
    }