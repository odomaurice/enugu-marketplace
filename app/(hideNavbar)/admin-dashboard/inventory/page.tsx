import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { InventoriesList } from '@/components/dashboards/admin/inventories/InventoriesList';
import { CreateInventoryDialog } from '@/components/dashboards/admin/inventories/CreateInventoryDialog';

export default async function AdminInventoriesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'super_admin') {
    redirect('/auth/signin');
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <CreateInventoryDialog token={session.user.token} />
      </div>
      <InventoriesList token={session.user.token} />
    </div>
  );
}