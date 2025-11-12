import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ProductsList } from '@/components/dashboards/admin/products/ProductsList';
import { CreateProductDialog } from '@/components/dashboards/admin/products/CreateProductDialog';

export default async function AdminProductsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'super_admin') {
    redirect('/auth/signin');
  }

  return (
    <div className="container py-4 sm:py-6 mt-[60px] px-3 sm:px-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left">
          Product Management
        </h1>
        <div className="flex justify-center sm:justify-end">
          <CreateProductDialog token={session.user.token} />
        </div>
      </div>
      
      {/* Products List */}
      <div className="w-full">
        <ProductsList token={session.user.token} />
      </div>
    </div>
  );
}