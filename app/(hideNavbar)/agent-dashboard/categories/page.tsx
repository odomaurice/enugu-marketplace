import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CategoriesList } from '@/components/dashboards/agent/categories/CategoriesList';
import { CreateCategoryDialog } from '@/components/dashboards/agent/categories/CreateCategoryDialog';
import { Suspense } from 'react';

export default async function AdminCategoriesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'fulfillment_officer') {
    redirect('/auth/signin');
  }

  return (
     <Suspense fallback={<div>Loading...</div>}>
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categories Management</h1>
        <CreateCategoryDialog token={session.user.token} />
      </div>
      <CategoriesList token={session.user.token} />
    </div>
    </Suspense>
  );
}