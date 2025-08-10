import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminChartDialog from '@/components/dashboards/admin/AdminChartDialog';
import { OrdersChart } from '@/components/dashboards/admin/OrdersChart';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect(`/admin-login?callbackUrl=${encodeURIComponent('/admin-dashboard')}`);
  }

  if (session.user.role !== 'admin') {
    redirect('/auth/error?error=Unauthorized');
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Welcome, {session.user.name}</h1>
     
      
      <div className="mt-8">
       
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Dashboard cards or components */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-medium">Admin Tools</h3>
            <p className="text-sm text-gray-500 mt-2">Manage system settings</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-medium">User Management</h3>
            <p className="text-sm text-gray-500 mt-2">View and manage users</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-medium">Reports</h3>
            <p className="text-sm text-gray-500 mt-2">View system reports</p>
          </div>
        </div>
      </div>
      <div className='flex my-6 justify-between gap-4 '>
        <AdminChartDialog/>
        <OrdersChart />
      </div>
    </div>
  );
}

