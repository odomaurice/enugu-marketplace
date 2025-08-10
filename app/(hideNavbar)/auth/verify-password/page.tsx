import React, { Suspense } from 'react';
import VerifyPassword from '@/components/verify-pasword';

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyPassword />
    </Suspense>
  );
};

export default Page;
