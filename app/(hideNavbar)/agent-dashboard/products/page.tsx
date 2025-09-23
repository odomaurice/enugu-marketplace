
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ProductsList } from '@/components/dashboards/agent/products/ProductsList';
import { CreateProductDialog } from '@/components/dashboards/agent/products/CreateProductDialog';

export default async function AdminProductsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'fulfillment_officer') {
    redirect('/auth/signin');
  }

  return (
    <div className="container py-6 mt-[60px]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <CreateProductDialog token={session.user.token}  />
      </div>
      <ProductsList token={session.user.token} />
    </div>
  );
}