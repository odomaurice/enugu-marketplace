"use client";

import { useEffect } from 'react';
import { toast } from 'sonner';
import BenefitsSection from '@/components/BenefitsSection'
import FAQ from '@/components/FAQ'
import Features from '@/components/Feature'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import LeadershipProfile from '@/components/Overview'
import ProductInstance from '@/components/product-instance'
import Stats from '@/components/Stats'

const Page = () => {
  useEffect(() => {
    // Show toast message when component mounts
    toast.info(
      <div className="flex items-start gap-3">
        <div className="flex flex-col">
          <span className="font-bold text-base">Enugu State Government</span>
          <span className="text-sm mt-1">This platform is exclusively for verified civil servants of Enugu State</span>
        </div>
      </div>,
      {
        duration: 8000, // Show for 8 seconds
        position: 'top-center',
        style: {
          background: '#008000',
          color: 'white',
          border: 'none',
        }
      }
    );
  }, []);

  return (
    <div className=''>
      {/* <Header/> */}
      {/* <Hero/>

      <Stats/>
      
      <Features/>
       <LeadershipProfile/>


      <BenefitsSection/> */}
      
      <ProductInstance/>
      {/* <FAQ/> */}
      <Footer/>
    </div>
  )
}

export default Page