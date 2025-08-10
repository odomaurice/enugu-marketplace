'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface Product {
  id: string;
  name: string;
  description: string;
  product_image: string;
  basePrice: number;
  currency: string;
}

const ProductInstance = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products?limit=6`);
      return res.data.data as Product[];
    }
  });

  return (
    <div className="container py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold my-8">Employee Food Ordering</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Order fresh food products for your workplace. Available exclusively for registered employees.
        </p>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-full">
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full bg-gray-200 animate-pulse" />
                </CardHeader>
                <CardContent className="pt-4 space-y-2">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products?.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow h-full">
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full">
                    <Image
                      src={product.product_image || '/placeholder-product.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                    {product.description}
                  </p>
                  <div className="mt-3">
                    <span className="font-medium">
                      From {new Intl.NumberFormat('en-NG', {
                        style: 'currency',
                        currency: product.currency,
                      }).format(product.basePrice)}
                    </span>
                  </div>
                  <Button asChild className="w-full mt-4 bg-orange-700 hover:bg-orange-600">
                    <Link href={`/products/${product.id}`}>View Product Variants</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="text-center">
        <Button asChild size="lg" className='bg-orange-800 hover:bg-orange-700'>
          <Link href="/products">View All Products</Link>
        </Button>
      </div>
    </div>
  );
}

export default ProductInstance;