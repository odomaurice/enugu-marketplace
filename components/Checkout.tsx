'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient, QueryClient, UseQueryOptions } from '@tanstack/react-query';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Link from 'next/link';

// Form validation schema
const formSchema = z.object({
  addressId: z.string().min(1, "Please select an address"),
});

// Address form schema
const addressFormSchema = z.object({
  label: z.string().min(1, "Label is required"),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  zipCode: z.string().min(1, "Zip code is required"),
});

interface CartItem {
  id: string;
  userId: string;
  productId: string | null;
  variantId: string | null;
  quantity: number;
  product: {
    id: string;
    name: string;
    product_image: string;
    basePrice: number;
    currency: string;
  } | null;
  variant: {
    id: string;
    name: string;
    price: number;
    image: string;
    product: {
      id: string;
      name: string;
    };
  } | null;
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

export default function CheckoutPage() {
  const { data: clientSession, status } = useSession();
  const [serverUser, setServerUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);

  
   useEffect(() => {
        fetch('/api/auth/session')
          .then(res => res.json())
          .then(setServerUser)
          .catch(console.error)
          .finally(() => setIsLoading(false));
      }, []);
  
    const user = clientSession?.user || serverUser;
    const queryClient = useQueryClient();

  // Main form for checkout
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      addressId: "",
    },
  });

  // Address form
  const addressForm = useForm<z.infer<typeof addressFormSchema>>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      label: "",
      street: "",
      city: "",
      state: "",
      country: "Nigeria",
      zipCode: "",
    },
  });

  // Fetch cart items
  const { data: cartItems, isLoading: isCartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/cart`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      return res.data.data as CartItem[];
    },
    enabled: !!user?.token
  });

  /// Fetch addresses
const { data: addresses, isLoading: isAddressLoading } = useQuery({
  queryKey: ['addresses'],
  queryFn: async (): Promise<Address[]> => {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/address`, {
      headers: { Authorization: `Bearer ${user?.token}` }
    });
    return res.data.data;
  },
  enabled: !!user?.token,
  onSuccess: (data: Address[]) => {
    if (data.length > 0) {
      const defaultAddress = data.find(addr => addr.isDefault) || data[0];
      form.setValue('addressId', defaultAddress.id);
    }
  }
} as UseQueryOptions<Address[], Error, Address[], ['addresses']>);
  // Create new address mutation
const createAddressMutation = useMutation({
  mutationFn: async (values: z.infer<typeof addressFormSchema>) => {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/address/add-address`,
      values,
      { headers: { Authorization: `Bearer ${user?.token}` } }
    );
    return res.data;
  },
  onSuccess: () => {
    toast.success('Address added successfully');
    queryClient.invalidateQueries({queryKey:['addresses']}); // This will trigger a refetch
    setIsAddressDialogOpen(false);
    addressForm.reset();
  },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add address');
    }
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!cartItems || cartItems.length === 0) {
        throw new Error('Your cart is empty');
      }

      const orderData = {
        addressId: values.addressId,
        items: cartItems.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity
        })),
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
      toast.error(error.response?.data?.message || 'Failed to place order');
    }
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    createOrderMutation.mutate(values, {
      onSettled: () => setIsSubmitting(false)
    });
  };

  const onAddressSubmit = (values: z.infer<typeof addressFormSchema>) => {
    createAddressMutation.mutate(values);
  };

  // Calculate totals
  const subtotal = cartItems?.reduce((sum, item) => {
    const price = item.variant?.price || item.product?.basePrice || 0;
    return sum + (price * item.quantity);
  }, 0) || 0;

  const total = subtotal; // Add delivery fee if needed

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/employee-login?returnUrl=${encodeURIComponent('/checkout')}`);
    }
  }, [status, router]);

  if (status === 'loading' || isCartLoading || isAddressLoading) {
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

  if (!user) {
    return <div className="container py-8">Redirecting to login...</div>;
  }

  // Helper functions for displaying cart items
  const getItemPrice = (item: CartItem) => {
    return item.variant?.price || item.product?.basePrice || 0;
  };

  const getItemImage = (item: CartItem) => {
    return item.variant?.image || item.product?.product_image || "/placeholder-product.jpg";
  };

  const getItemName = (item: CartItem) => {
    return item.variant?.product?.name || item.product?.name || "Unknown Product";
  };

  const getVariantName = (item: CartItem) => {
    return item.variant?.name || "";
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address Section */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="addressId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Address</FormLabel>
                        <div className="flex gap-2">
                          <Select onValueChange={field.onChange} value={field.value}>
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
                            </SelectContent>
                          </Select>
                          
                          <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                            <DialogTrigger asChild>
                              <Button type="button" variant="outline">
                                <Plus className="mr-2 h-4 w-4" /> Add New
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add New Address</DialogTitle>
                              </DialogHeader>
                              <Form {...addressForm}>
                                <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="space-y-4">
                                  <FormField
                                    control={addressForm.control}
                                    name="label"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Label (e.g., Home, Office)</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Home" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={addressForm.control}
                                    name="street"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Street Address</FormLabel>
                                        <FormControl>
                                          <Input placeholder="24 Richard Street Asata" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={addressForm.control}
                                    name="city"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>City</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Enugu North" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={addressForm.control}
                                    name="state"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>State</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Enugu" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={addressForm.control}
                                    name="country"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Country</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Nigeria" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={addressForm.control}
                                    name="zipCode"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Zip Code</FormLabel>
                                        <FormControl>
                                          <Input placeholder="400102" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <div className="flex justify-end gap-2 pt-4">
                                    <Button 
                                      type="button" 
                                      variant="outline" 
                                      onClick={() => setIsAddressDialogOpen(false)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button 
                                      type="submit" 
                                      disabled={createAddressMutation.isPending}
                                    >
                                      {createAddressMutation.isPending ? "Saving..." : "Save Address"}
                                    </Button>
                                  </div>
                                </form>
                              </Form>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Order Items Section */}
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
                          src={getItemImage(item)}
                          alt={getItemName(item)}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{getItemName(item)}</h3>
                        {getVariantName(item) && (
                          <p className="text-sm text-gray-600">{getVariantName(item)}</p>
                        )}
                        <p className="text-sm">
                          {item.quantity} × {new Intl.NumberFormat('en-NG', {
                            style: 'currency',
                            currency: 'NGN',
                          }).format(getItemPrice(item))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-lg mb-4">Your cart is empty</p>
                  <Button asChild>
                    <Link href="/products">Browse Products</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary Section */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal ({cartItems?.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span>
                  {new Intl.NumberFormat('en-NG', {
                    style: 'currency',
                    currency: 'NGN',
                  }).format(subtotal)}
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
                disabled={
                  isSubmitting || 
                  !cartItems || 
                  cartItems.length === 0 || 
                  !addresses || 
                  addresses.length === 0
                }
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