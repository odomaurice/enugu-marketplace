// components/CartPreview.tsx
'use client';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

export function CartPreview() {
  const { data: session } = useSession();
  
  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/cart`, {
        headers: { Authorization: `Bearer ${session?.user.token}` }
      });
      return res.data.data;
    },
    enabled: !!session?.user.token
  });

  return (
    <Link href="/cart">
      <Button variant="outline" size="icon" className="relative">
        <ShoppingCart className="h-4 w-4" />
        {cart?.items?.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
            {cart.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0)}
          </span>
        )}
      </Button>
    </Link>
  );
}