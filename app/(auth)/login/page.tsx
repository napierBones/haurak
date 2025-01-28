import React from 'react';
import { auth, signIn } from '@/auth';
import { IoLogoGithub } from 'react-icons/io';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';

const page =async () => {

      const session = await auth()
     
      if (session?.user){
        redirect("/")
      }
 return (
  <div className='size-96 mx-auto p-2 flex flex-col items-center  gap-3 justify-center'>
   <h1 className='text-3xl text-center'>Please Login to Continue </h1>

   <form
    action={async () => {
     'use server';
     await signIn('github');
    }}>
    <Button variant='outline' className='w-full flex items-center justify-center text-black'>
     <IoLogoGithub className='mr-2 h-5 w-5' />
     Sign in with GitHub
    </Button>
   </form>
  </div>
 );
};

export default page;
