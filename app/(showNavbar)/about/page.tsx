import BenefitsSection from '@/components/BenefitsSection'
import FAQ from '@/components/FAQ'
import Features from '@/components/Feature'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import LeadershipProfile from '@/components/Overview'
import ProductInstance from '@/components/product-instance'
import Stats from '@/components/Stats'

import React from 'react'

const page = () => {
  return (
    <div className=''>
      {/* <Header/> */}
      <Hero/>

      <Stats/>
      
      <Features/>
       <LeadershipProfile/>


      <BenefitsSection/>
      
     
      <FAQ/>
      <Footer/>
    </div>
  )
}

export default page