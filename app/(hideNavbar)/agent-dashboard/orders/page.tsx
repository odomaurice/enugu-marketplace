import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import axios from 'axios';
import OrdersTable from '@/components/dashboards/agent/orders/OrdersTable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect(`/agent-login?callbackUrl=${encodeURIComponent('/agent-dashboard/orders')}`);
  }

  if (session.user.role !== 'fulfillment_officer') {
    redirect('/auth/error?error=Unauthorized');
  }

  let orders = [];
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/agent/all-order`, {
      headers: { Authorization: `Bearer ${session.user.token}` }
    });
    orders = response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch orders:', error);
  }

  return (
    <div className="p-4 space-y-6 mt-[60px]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders Management</h1>
       
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <OrdersTable orders={orders} />
        </CardContent>
      </Card>
    </div>
  );
}