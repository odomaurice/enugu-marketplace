import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import UserChartDialog from '@/components/dashboards/users/UsersChartDialog';
import { OrdersChart } from '@/components/dashboards/users/OrdersChart';
import axios from 'axios';
import { LoanStats } from '@/components/dashboards/users/LoanStats'; 

<<<<<<< HEAD
interface ComplianceData {
  id: string;
  userId: string;
  form_url: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    loan_unit: number;
    loan_amount_collected: number;
    salary_per_month: number;
    government_entity: string;
    is_compliance_submitted: boolean;
    status: string;
  };
}

interface ComplianceResponse {
  message: string;
  data: ComplianceData;
}

=======
>>>>>>> ab70c87b6dff4961c84062ce18cc144a38066b4f
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
<<<<<<< HEAD
  let complianceStatus = session?.user?.is_compliance_submitted || false;
=======
>>>>>>> ab70c87b6dff4961c84062ce18cc144a38066b4f

  try {
    // Fetch orders
    const ordersResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/all-order`, {
      headers: { 
        Authorization: `Bearer ${session.user.token}` 
      }
    });
    totalOrders = ordersResponse.data.data?.length || 0;

<<<<<<< HEAD
    // Fetch compliance data for fresh loan info
    try {
      const complianceResponse = await axios.get<ComplianceResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/get-compliance`,
        {
          headers: { 
            Authorization: `Bearer ${session.user.token}` 
          }
        }
      );
      
      if (complianceResponse.data?.data?.user) {
        const userData = complianceResponse.data.data.user;
=======
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
>>>>>>> ab70c87b6dff4961c84062ce18cc144a38066b4f
        initialLoanData = {
          loan_unit: userData.loan_unit || 0,
          loan_amount_collected: userData.loan_amount_collected || 0
        };
<<<<<<< HEAD
        complianceStatus = userData.is_compliance_submitted || false;
      }
    } catch (complianceError) {
      console.log('⚠️ Using session data for loan info (compliance endpoint not available)');
      // Fallback to session data if compliance endpoint fails
=======
      }
>>>>>>> ab70c87b6dff4961c84062ce18cc144a38066b4f
    }
  } catch (error) {
    console.error('Failed to fetch data:', error);
    // Fallback to session data if there's an error
    totalOrders = 0;
  }

<<<<<<< HEAD
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Welcome, {session?.user?.name}</h1>
      {!complianceStatus && (
        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-yellow-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.103 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
            <p className="text-sm text-yellow-800">
              Please complete your <a href="/employee-dashboard/compliance" className="font-medium underline">compliance form</a> to activate your purchasing limit.
            </p>
          </div>
        </div>
      )}
=======
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
>>>>>>> ab70c87b6dff4961c84062ce18cc144a38066b4f
     
      <div className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Orders (Server component) */}
<<<<<<< HEAD
         <div className="bg-white p-6 rounded-xl border shadow-sm flex justify-between">
  <div>
    <h3 className="text-sm font-medium text-gray-600">Total Orders</h3>
    <p className="text-2xl font-bold text-gray-900 mt-2">
      {totalOrders}
    </p>
  </div>

  <div className="h-11 w-11 rounded-lg bg-green-50 flex items-center justify-center">
    <svg
      className="h-6 w-6 text-green-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      />
    </svg>
  </div>
</div>

=======
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
>>>>>>> ab70c87b6dff4961c84062ce18cc144a38066b4f

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