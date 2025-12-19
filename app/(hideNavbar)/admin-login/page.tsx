import AdminLogin from '@/components/admin-login'
import React, { Suspense } from 'react'

const page = () => {
  return (
   
      <Suspense fallback={<div>Loading...</div>}>
        <AdminLogin/>
      </Suspense>
  
  )
}

export default page