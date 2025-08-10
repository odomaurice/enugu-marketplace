import VerifyOtp from '@/components/verify-otp'
import React, { Suspense } from 'react'

const page = () => {
  return (
    
        <Suspense fallback={<div>Loading...</div>}>
          <VerifyOtp/>
        </Suspense>
    
  )
}

export default page