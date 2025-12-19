'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { EditCategoryDialog } from './EditCategoryDialog';
import { DeleteCategoryDialog } from './DeleteCategoryDialog';

interface CategoryDetailsProps {
  category: any;
  token: string;
}

export function CategoryDetails({ category, token }: CategoryDetailsProps) {
  if (!category) {
    return <div>Category not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{category.name}</h1>
        <div className="flex gap-2">
          <EditCategoryDialog 
            category={category} 
            token={token} 
            onSuccess={() => window.location.reload()} 
          />
          <DeleteCategoryDialog 
            categoryId={category.id} 
            token={token} 
            onSuccess={() => window.location.href = '/agent-dashboard/categories'} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Category Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Slug</h3>
              <p>{category.slug}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Parent Category</h3>
              <p>{category.parent?.name || 'None'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Subcategories</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {category.children.length > 0 ? (
                  category.children.map((child: any) => (
                    <span key={child.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {child.name}
                    </span>
                  ))
                ) : (
                  <span className="text-sm">None</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Products ({category.products.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {category.products.length > 0 ? (
              <div className="space-y-4">
                {category.products.map((product: any) => (
                  <div key={product.id} className="flex items-center gap-4 p-2 border rounded-lg">
                    <div className="relative h-16 w-16">
                      <Image
                        src={product.product_image || '/placeholder-product.jpg'}
                        alt={product.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1">{product.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No products in this category</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button asChild variant="outline">
          <Link href="/agent-dashboard/categories">
            Back to Categories
          </Link>
        </Button>
      </div>
    </div>
  );
}