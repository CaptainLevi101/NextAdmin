
"use client"

import ProductForm from '@/components/Products/ProductForm';
import CollectionForm from '@/components/collections/CollectionForm';
import Loader from '@/components/custom ui/Loader';
import React, { useEffect, useState } from 'react'

const ProductDetails = ({params}:{params:{
    productId:string
}}) => {
    const [loading,setLoading]=useState(true);
    const [productDetails,setProductDetails]=useState<ProductType | null>(null);
    
    const getProductDetails=async()=>{
        try{
            const res=await fetch(`/api/products/${params.productId}`,{
                method: 'GET',
            })
            const data=await res.json();
            
            setProductDetails(data);
            setLoading(false);

        }catch(err){
            console.log("product Id get method",err);
        }
    }
    useEffect(()=>{
       getProductDetails();
    },[])

  return (
      loading?<Loader/>:(
     <ProductForm initialData={productDetails}/>
      )
  )
}

export default ProductDetails
