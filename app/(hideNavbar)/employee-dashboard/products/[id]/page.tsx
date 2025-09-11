'use client';

import ProductDetailPage from '@/components/single-product';
import React from 'react';
import { useParams } from 'next/navigation';

const Page = () => {
  const params = useParams<{ id: string }>();

  return (
    <div>
      <ProductDetailPage params={params} />
    </div>
  );
};

export default Page;
