"use client";

import {z} from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import React, { useEffect, useState } from 'react'

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
import MultiText from '../custom ui/MultiText';
import MultiSelect from '../custom ui/MultiSelect';



//first step is making the form schema
const formSchema=z.object({
  title:z.string().min(2).max(20),
  description:z.string().min(2).max(500).trim(),
  media:z.array(z.string()),
  category:z.string(),
  collections:z.array(z.string()),
  tags:z.array(z.string()),
  sizes:z.array(z.string()),
  colors:z.array(z.string()),
  price:z.coerce.number().min(0.1),
  expense:z.coerce.number().min(0.1)

})

interface ProductFormProps{
  initialData?:ProductType | null;
}

 
  


const ProductForm:React.FC<ProductFormProps> = ({initialData}) => {
   // 1. Define your form.
   const router=useRouter();
   const [loading,setLoading]=useState(false);
   const [collections,setCollections]=useState<CollectionType[]>([]);

   const getCollection=async()=>{
    try{
      setLoading(true);
      const res=await fetch("/api/collections",{
        method: "GET",
      });
      const data=await res.json();
      setCollections(data);
      setLoading(false);

    }catch(err){
      console.log("Colelction_Get",err);
      toast.error('Something Wrong ! Please try again later');
    }
   }
   useEffect(()=>{
    getCollection();

   },[])

   const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {...initialData,collections:initialData.collections.map((collection)=>collection._id)} : {
      title: "",
      description: "",
      media: [],
      category: "",
      collections:[],
      tags: [],
      sizes: [],
      colors: [],
      price: 0.1,
      expense: 0.1,
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
      const url=initialData?`/api/products/${initialData._id}`:"/api/products";
      // console.log(values);
      const res=await fetch(url,{
        method:"POST",
        body:JSON.stringify(values),
      })
      if(res.ok){
        setLoading(false);
        toast.success(`Products ${initialData?"updated":"created"}`);
        window.location.href="/products";
        router.push('/products');
      }
    }catch(err){
      console.log("Products_Post",err);
      toast.error("Something went wrong Please try again");
    }
  }

  return (
    <div className='p-10'>
      {initialData?(
        <div className='flex justify-between items-center'>
         <p className='text-heading2-bold'>Edit Products</p>
         <Delete id={initialData._id} item="product"/>
         </div>
      ):(
        <p className='text-heading2-bold'>Create Products</p>
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
          name="media"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <ImageUpload 
                value={field.value} 
                onChange={(url)=>field.onChange([...field.value,url])}
                onRemove={(url)=>field.onChange(...field.value.filter((image)=>image!=url))}>
                </ImageUpload>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='md:grid md:grid-cols-3 gap-8'> 
          <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price ($)</FormLabel>
              <FormControl>
                <Input type="number" onKeyDown={handleKeyPress} placeholder="Price" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
          <FormField
          control={form.control}
          name="expense"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expense ($)</FormLabel>
              <FormControl>
                <Input type="number" onKeyDown={handleKeyPress} placeholder="Expense" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input  onKeyDown={handleKeyPress} placeholder="Category" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <MultiText
                 placeholder="Tags" 
                value={field.value} 
                onChange={(tag)=>field.onChange([...field.value,tag])}
                onRemove={(tagToRemove)=>
                  field.onChange([
                  ...field.value.filter((item)=>item!==tagToRemove)
                ])} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
       {collections.length > 0 && (
              <FormField
                control={form.control}
                name="collections"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Collections</FormLabel>
                    <FormControl>
                      <MultiSelect
                        placeholder="Collections"
                        collections={collections}
                        value={field.value}
                        onChange={(_id) =>
                          field.onChange([...field.value, _id])
                        }
                        onRemove={(idToRemove) =>
                          field.onChange([
                            ...field.value.filter(
                              (collectionId) => collectionId !== idToRemove
                            ),
                          ])
                        }
                      />
                    </FormControl>
                    <FormMessage className="text-red-1" />
                  </FormItem>
                )}
              />
            )}
           <FormField
          control={form.control}
          name="colors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Colors</FormLabel>
              <FormControl>
                <MultiText
                 placeholder="Colors" 
                value={field.value} 
                onChange={(color)=>field.onChange([...field.value,color])}
                onRemove={(colorToRemove)=>
                  field.onChange([
                  ...field.value.filter((color)=>color!==colorToRemove)
                ])} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="sizes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Size</FormLabel>
              <FormControl>
                <MultiText
                 placeholder="size" 
                value={field.value} 
                onChange={(size)=>field.onChange([...field.value,size])}
                onRemove={(sizeToRemove)=>
                  field.onChange([
                  ...field.value.filter((item)=>item!==sizeToRemove)
                ])} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      
        </div>
        
        <div className='flex gap-10'> 
        <Button type="submit" className='bg-blue-1 text-white'>Submit</Button>
        <Button type="button" className='bg-blue-1 text-white'  onClick={()=>router.push("/products")}>Discard</Button>
        </div>
      </form>
    </Form>
    </div>

  )
}


export default ProductForm
