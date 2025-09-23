import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import axios from 'axios';
import DeliveryVerificationClient from './DeliveryVerificationClient';

export default async function DeliveryVerificationPage({ 
  params 
}: { 
  params: Promise<{ order_id: string }> 
}) {
  const { order_id } = await params;

  // First get the session
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect(`/agent-login?callbackUrl=${encodeURIComponent(`/agent-dashboard/delivery/verify/${order_id}`)}`);
  }

  if (session.user.role !== 'fulfillment_officer') {
    redirect('/auth/error?error=Unauthorized');
  }

  // Fetch order data
  let order = null;
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/agent/single-order?order_id=${order_id}`,
      {
        headers: { Authorization: `Bearer ${session.user.token}` }
      }
    );
    order = response.data.data;
  } catch (error) {
    console.error('Failed to fetch order:', error);
    redirect('/agent-dashboard/orders');
  }

  if (!order) {
    redirect('/agent-dashboard/orders');
  }

  // Check if order is already delivered
  if (order.orderStatus === 'DELIVERED') {
    redirect(`/agent-dashboard/orders/${order_id}`);
  }

  return <DeliveryVerificationClient order={order} token={session.user.token} />;
}