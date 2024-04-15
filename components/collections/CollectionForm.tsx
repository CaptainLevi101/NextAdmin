"use client";

import {z} from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import React, { useState } from 'react'

import { Textarea } from "@/components/ui/textarea"
import { Separator } from '@/components/ui/separator'
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import ImageUpload from '@/components/custom ui/ImageUpload';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Delete from '../custom ui/Delete';



//first step is making the form schema
const formSchema=z.object({
  title:z.string().min(2).max(20),
  description:z.string().min(2).max(500).trim(),
  image:z.string()
})

interface CollectionFormProps{
  initialData?:CollectionType|null;
}
 
  


const CollectionForm:React.FC<CollectionFormProps> = ({initialData}) => {
   // 1. Define your form.
   const router=useRouter();
   const [loading,setLoading]=useState(false);

   const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues:initialData?initialData:{
       title:"",
       description:"",
       image:""
    },
  })

  const handleKeyPress=(e:React.KeyboardEvent<HTMLInputElement> | React.KeyboardEvent<HTMLTextAreaElement>)=>{
    if(e.key=='Enter'){
      e.preventDefault();
    }
  }

  const onSubmit=async(values: z.infer<typeof formSchema>)=>{
    try{
      setLoading(true);
      const url=initialData?`/api/collections/${initialData._id}`:"/api/collections";
      // console.log(values);
      const res=await fetch(url,{
        method:"POST",
        body:JSON.stringify(values),
      })
      if(res.ok){
        setLoading(false);
        toast.success(`Collection ${initialData?"updated":"created"}`);
        window.location.href="/collections";
        router.push('/collections');
      }
    }catch(err){
      console.log("Collection_Post",err);
      toast.error("Something went wrong Please try again");
    }
  }

  return (
    <div className='p-10'>
      {initialData?(
        <div className='flex justify-between items-center'>
         <p className='text-heading2-bold'>Edit collection</p>
         <Delete id={initialData._id} item="collection"/>
         </div>
      ):(
        <p className='text-heading2-bold'>Create collection</p>
      )}
        
         <Separator className='my-6 bg-gray-400'/>
         <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input onKeyDown={handleKeyPress} placeholder="Title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea onKeyDown={handleKeyPress} placeholder="Description" {...field} rows={5} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <ImageUpload 
                value={field.value?[field.value]:[]} 
                onChange={(url)=>field.onChange(url)}
                onRemove={()=>field.onChange("")}>
                </ImageUpload>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='flex gap-10'> 
        <Button type="submit" className='bg-blue-1 text-white'>Submit</Button>
        <Button type="button" className='bg-blue-1 text-white'  onClick={()=>router.push("/collections")}>Discard</Button>
        </div>
      </form>
    </Form>
    </div>

  )
}


export default CollectionForm
