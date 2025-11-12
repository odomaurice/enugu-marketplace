import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import UserChartDialog from '@/components/dashboards/users/UsersChartDialog';
import { OrdersChart } from '@/components/dashboards/users/OrdersChart';
import axios from 'axios';
import { LoanStats } from '@/components/dashboards/users/LoanStats'; 

export default async function EmployeeDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.token) {
    redirect('/login');
  }

  // Fetch initial data on server
  let totalOrders = 0;
  let initialLoanData = {
    loan_unit: session?.user?.loan_unit || 0,
    loan_amount_collected: session?.user?.loan_amount_collected || 0
  };

  try {
    // Fetch orders
    const ordersResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/all-order`, {
      headers: { 
        Authorization: `Bearer ${session.user.token}` 
      }
    });
    totalOrders = ordersResponse.data.data?.length || 0;

    // Fetch address data to get fresh loan info
    const addressResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/address`, {
      headers: { 
        Authorization: `Bearer ${session.user.token}` 
      }
    });
    
    // FIX: Access the first item in the array and get user data from it
    if (addressResponse.data.data && addressResponse.data.data.length > 0) {
      const userData = addressResponse.data.data[0].user; // Changed from [1] to [0]
      if (userData) {
        initialLoanData = {
          loan_unit: userData.loan_unit || 0,
          loan_amount_collected: userData.loan_amount_collected || 0
        };
      }
    }
  } catch (error) {
    console.error('Failed to fetch data:', error);
    // Fallback to session data if there's an error
    totalOrders = 0;
  }

  const formatCurrency = (value: number | undefined) => {
    const numValue = value || 0;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(numValue);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Welcome, {session?.user?.name}</h1>
     
      <div className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Orders (Server component) */}
          <div className="bg-white p-6 flex justify-between rounded-lg shadow">
            <div>
              <h3 className="font-medium text-md">Total Orders</h3>
              <p className="text-xl text-gray-900 font-bold mt-2">{totalOrders}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>

          {/* Loan Stats (Client component with auto-refresh) */}
          <LoanStats 
            initialLoanUnit={initialLoanData.loan_unit}
            initialLoanTaken={initialLoanData.loan_amount_collected}
            token={session.user.token}
          />
        </div>
        <div className='my-6 flex md:flex-row flex-col justify-between gap-4'>
          <UserChartDialog />
          <OrdersChart />
        </div>
      </div>
    </div>
  );
}