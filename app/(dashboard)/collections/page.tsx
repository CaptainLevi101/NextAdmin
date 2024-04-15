"use client"

import { DataTable } from '@/components/custom ui/DataTable';
import { columns } from '@/components/collections/CollectionColumns';
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';

const Collections = () => {
  const [loading,setLoading]=useState(true);
  const [collections,setCollections]=useState([]);
  const router=useRouter();


  const getCollections=async()=>{
    try{
      const res=await fetch("/api/collections",{
        method: "GET",
      })
      const data=await res.json();
      setCollections(data);
      setLoading(false);
    }catch(err){
      console.log("Collections_get",err);
    }
  }
  useEffect(()=>{
    getCollections();
  },[])

  return (
    <div className='px-10 py-5'>
    <div className='flex items-center justify-between'>
      <p className='text-heading2-bold'>Collections</p>
      <Button className='bg-blue-1 text-white' onClick={()=>router.push("/collections/new")}>
        <Plus className='h-4 w-4 mr-2'/>
        Create Collection
      </Button>
      </div>
      <Separator className='bg-grey-1 my-4'/>
      <DataTable columns={columns} data={collections} searchKey="title"/>
      </div>
  )
}

export default Collections
