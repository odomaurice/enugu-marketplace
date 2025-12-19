import SetPhoneNumber from '@/components/set-phone-number'

import React, { Suspense } from 'react'

const page = () => {
  return (
   
        <Suspense fallback={<div>Loading...</div>}>
          <SetPhoneNumber/>
        </Suspense>
   
  )
}

export default page