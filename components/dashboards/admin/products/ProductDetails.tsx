
'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { EditProductDialog } from './EditProductDialog';
import { format } from 'date-fns';

interface ProductDetailsProps {
  productId: string;
  token: string;
}

export function ProductDetails({ productId, token }: ProductDetailsProps) {
  const router = useRouter();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-product', productId],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/product?product_id=${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data.data;
    }
  });

  const handleDelete = async () => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/delete-product?product_id=${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success('Product deleted successfully');
      router.push('/admin-dashboard/products');
    } catch (error) {
      toast.error('Failed to delete product');
      console.error('Delete error:', error);
    }
  };

  if (isLoading) return <div>Loading product details...</div>;
  if (isError) return <div>Error: {(error as Error).message}</div>;

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Product Details</h1>
        <div className="flex space-x-2">
          <EditProductDialog 
            product={data} 
            token={token} 
            onSuccess={() => router.refresh()} 
          />
          <Button 
            variant="destructive" 
            onClick={handleDelete}
          >
            Delete Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Images */}
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {data.product_image && (
                <div className="relative aspect-square">
                  <Image
                    src={data.product_image}
                    alt={data.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              )}
              {data.images?.map((image: string, index: number) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={image}
                    alt={`${data.name} variant ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Product Info */}
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">{data.name}</h2>
              <p className="text-gray-600">{data.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Base Price</p>
                <p className="font-medium">
                  {new Intl.NumberFormat('en-NG', {
                    style: 'currency',
                    currency: data.currency,
                  }).format(data.basePrice)}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium">{data.category?.name}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant={data.active ? 'default' : 'destructive'}>
                  {data.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500">Perishable</p>
                <Badge variant={data.isPerishable ? 'default' : 'secondary'}>
                  {data.isPerishable ? 'Yes' : 'No'}
                </Badge>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500">Unit</p>
                <p className="font-medium">{data.unit}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500">Package Type</p>
                <p className="font-medium">{data.packageType}</p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-500">Created At</p>
              <p>{format(new Date(data.createdAt), 'PPPpp')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Variants */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Product Variants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.variants.map((variant: {
                id: string;
                name: string;
                sku: string;
                image: string;
                currency: string;
                price: number;
                netWeight: number;
                expiryDate?: string;
              }) => (
                <Card key={variant.id}>
                  <CardHeader className="p-0">
                    <div className="relative aspect-square">
                      <Image
                        src={variant.image}
                        alt={variant.name}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <h3 className="font-semibold">{variant.name}</h3>
                    <p className="text-sm text-gray-600">SKU: {variant.sku}</p>
                    <p className="font-medium mt-2">
                      {new Intl.NumberFormat('en-NG', {
                        style: 'currency',
                        currency: variant.currency,
                      }).format(variant.price)}
                    </p>
                    <p className="text-sm mt-1">
                      Net Weight: {variant.netWeight} {data.unit}
                    </p>
                    {variant.expiryDate && (
                      <p className="text-sm">
                        Expires: {format(new Date(variant.expiryDate), 'PPP')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}