'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import Image from 'next/image';

// Form validation schema
const formSchema = z.object({
  deliveryOption: z.enum(['pickup', 'delivery'], {
    error: "Please select a delivery option",
  }),
  deliveryAddress: z.string().optional(),
  paymentMethod: z.enum(['card', 'transfer', 'wallet'], {
    error: "Please select a payment method",
  }),
  deliveryDate: z.string().min(1, "Please select a delivery date"),
  deliveryTime: z.string().min(1, "Please select a delivery time"),
  addressId: z.string().min(1, "Please select an address"),
});

interface CartItem {
  id: string;
  variantId: string;
  productId: string;
  quantity: number;
  variant?: {
    id: string;
    name: string;
    price: number;
    image: string;
    product: {
      id: string;
      name: string;
    };
  };
}

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isDefault: boolean;
}

interface UserSession {
  user?: {
    token: string;
    role?: string;
   
  };
}

export default function CheckoutPage() {
  const { data: clientSession, status } = useSession();
  const [serverUser, setServerUser] = useState<UserSession | null>(null);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then((data: UserSession) => {
        setServerUser(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Session error:", err);
        setIsLoading(false);
      });
  }, []);

  const user = clientSession?.user || serverUser?.user;

  // Fetch cart items
  const { data: cartItems, isLoading: isCartLoading, error: cartError } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/cart`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      return (res.data.data as CartItem[]).filter(item => item.variant);
    },
    enabled: !!user?.token
  });

  // Fetch addresses
  const { data: addresses, isLoading: isAddressLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/address`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      return res.data.data as Address[];
    },
    enabled: !!user?.token
  });

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deliveryOption: 'pickup',
      paymentMethod: 'card',
      deliveryDate: '',
      deliveryTime: '',
      addressId: '',
    },
  });

  const deliveryOption = form.watch('deliveryOption');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/employee-login?returnUrl=${encodeURIComponent('/checkout')}`);
    } else if (user && user.role !== 'user') {
      router.push('/employee-dashboard');
    }
  }, [status, user, router, isLoading]);

  // Calculate totals with null checks
  const subtotal = cartItems?.reduce((sum, item) => {
    if (!item.variant?.price) return sum;
    return sum + (item.variant.price * item.quantity);
  }, 0) || 0;

  const deliveryFee = deliveryOption === 'delivery' ? 500 : 0;
  const total = subtotal + deliveryFee;

  // Handle order submission
  const placeOrderMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!cartItems || cartItems.length === 0) {
        throw new Error('Your cart is empty');
      }

      const validItems = cartItems.filter(item => item.variant && item.variant.price);
      if (validItems.length !== cartItems.length) {
        throw new Error('Some items in your cart are invalid');
      }

      const orderData = {
        items: validItems.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity
        })),
        addressId: values.addressId,
        deliveryOption: values.deliveryOption,
        deliveryAddress: values.deliveryOption === 'delivery' ? values.deliveryAddress : undefined,
        paymentMethod: values.paymentMethod,
        deliveryDate: values.deliveryDate,
        deliveryTime: values.deliveryTime,
        totalAmount: total,
      };

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/create-order`,
        orderData,
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success('Order placed successfully!');
      router.push('/order-confirmation');
    },
    onError: (error: any) => {
      toast.error(error.message || error.response?.data?.message || 'Failed to place order');
    }
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    placeOrderMutation.mutate(values, {
      onSettled: () => setIsSubmitting(false)
    });
  };

  if (isLoading || isCartLoading || isAddressLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Failed to load cart items. Please try again.
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'user') {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="addressId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Address</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an address" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {addresses?.map((address) => (
                              <SelectItem key={address.id} value={address.id}>
                                {address.label} - {address.street}, {address.city}
                              </SelectItem>
                            ))}
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => router.push('/dashboard/addresses')}
                            >
                              <Plus className="mr-2 h-4 w-4" /> Add New Address
                            </Button>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deliveryOption"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Select Delivery Method</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1 "
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="pickup" className='checked:bg-green-700' />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Pickup at office
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="delivery" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Delivery to my location
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {deliveryOption === 'delivery' && (
                    <FormField
                      control={form.control}
                      name="deliveryAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your delivery address"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="deliveryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              min={new Date().toISOString().split('T')[0]}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deliveryTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Time</FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div> */}

                 
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              {cartItems && cartItems.length > 0 ? (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative h-16 w-16 rounded-md overflow-hidden">
                        <Image
                          src={item.variant?.image || '/placeholder-product.jpg'}
                          alt={item.variant?.product?.name || 'Product image'}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{item.variant?.product?.name || 'Unknown Product'}</h3>
                        <p className="text-sm text-gray-600">{item.variant?.name || 'No variant'}</p>
                        <p className="text-sm">
                          {item.quantity} × {new Intl.NumberFormat('en-NG', {
                            style: 'currency',
                            currency: 'NGN',
                          }).format(item.variant?.price || 0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Your cart is empty</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>
                  {new Intl.NumberFormat('en-NG', {
                    style: 'currency',
                    currency: 'NGN',
                  }).format(subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>
                  {new Intl.NumberFormat('en-NG', {
                    style: 'currency',
                    currency: 'NGN',
                  }).format(deliveryFee)}
                </span>
              </div>
              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>
                  {new Intl.NumberFormat('en-NG', {
                    style: 'currency',
                    currency: 'NGN',
                  }).format(total)}
                </span>
              </div>
            </CardContent>
            <CardContent>
              <Button 
                className="w-full bg-green-700 hover:bg-green-600 text-white" 
                size="lg"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isSubmitting || !cartItems || cartItems.length === 0 || !addresses || addresses.length === 0}
              >
                {isSubmitting ? "Processing..." : "Place Order"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}