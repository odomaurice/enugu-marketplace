import EmployeeLogin from '@/components/employee-login'
import React, { Suspense } from 'react'

const page = () => {
  return (
    
      <Suspense fallback={<div>Loading...</div>}>
        <EmployeeLogin/>
      </Suspense>
   
  )
}

export default page