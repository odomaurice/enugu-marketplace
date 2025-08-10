import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ProductVariantsList } from '@/components/dashboards/admin/product-variants/ProductVariantList';
import { CreateProductVariantDialog } from '@/components/dashboards/admin/product-variants/CreateProductVariantDialog';

export default async function AdminProductVariantsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/auth/signin');
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Product Variants Management</h1>
        <CreateProductVariantDialog token={session.user.token} />
      </div>
      <ProductVariantsList token={session.user.token} />
    </div>
  );
}