import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminChartDialog from '@/components/dashboards/admin/AdminChartDialog';
import { OrdersChart } from '@/components/dashboards/admin/OrdersChart';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  console.log(session);
  
  if (!session?.user) {
    redirect(`/employee-login?callbackUrl=${encodeURIComponent('/employee-dashboard')}`);
  }

  if (session.user.role !== 'user') {
    redirect('/auth/error?error=Unauthorized');
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Welcome, {session.user.name}</h1>
     
      
      <div className="mt-8">
       
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Dashboard cards or components */}
          <div className="bg-white p-6 flex justify-between rounded-lg shadow">
            <h3 className="font-medium">Total Orders</h3>
            <p className="text-2xl text-gray-900  font-bold mt-2">13</p>
          </div>
          <div className="bg-white p-6 flex justify-between rounded-lg shadow">
            <h3 className="font-medium">Loan Unit</h3>
            <p className="text-2xl text-gray-900  font-bold mt-2">₦162,000</p>
          </div>
           <div className="bg-white p-6 flex justify-between rounded-lg shadow">
            <h3 className="font-medium">Loan Taken</h3>
            <p className="text-2xl text-gray-900  font-bold mt-2">₦0</p>
          </div>
        </div>
      </div>
      <div className='flex my-6 justify-between md:flex-row flex-col gap-4 '>
        <AdminChartDialog/>
        <OrdersChart />
      </div>
    </div>
  );
}

