import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { WarehousesList } from '@/components/dashboards/agent/warehouses/WarehousesList';
import { CreateWarehouseDialog } from '@/components/dashboards/agent/warehouses/CreateWarehouseDialog';

export default async function AdminWarehousesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'fulfillment_officer') {
    redirect('/auth/signin');
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Warehouse Management</h1>
        <CreateWarehouseDialog token={session.user.token} />
      </div>
      <WarehousesList token={session.user.token} />
    </div>
  );
}