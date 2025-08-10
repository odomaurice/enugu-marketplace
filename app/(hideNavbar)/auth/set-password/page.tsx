import SetPassword from '@/components/SetPassword'
import React, { Suspense } from 'react'

const page = () => {
  return (
   
        <Suspense fallback={<div>Loading...</div>}>
          <SetPassword/>
        </Suspense>
   
  )
}

export default page