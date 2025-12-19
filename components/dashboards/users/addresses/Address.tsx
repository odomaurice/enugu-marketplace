'use client';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';



// Updated schema to include isDefault
const addressFormSchema = z.object({
  label: z.string().min(1, "Label is required"),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  isDefault: z.boolean(),
});

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

export default function AddressesPage() {
  const { data: clientSession, status} = useSession();
  const [serverUser, setServerUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        setServerUser(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Session error:", err);
        setIsLoading(false);
      });
  }, []);
  
  const user = clientSession?.user || serverUser;

  const form = useForm<z.infer<typeof addressFormSchema>>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      label: '',
      street: '',
      city: '',
      state: '',
      country: 'Nigeria',
      zipCode: '',
      isDefault: false,
    },
  });

  // Fetch addresses
  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/address`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      return res.data.data as Address[];
    },
    enabled: !!user?.token,
  });

  // Create address mutation
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
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add address');
    }
  });

  // Update address mutation
  const updateAddressMutation = useMutation({
    mutationFn: async (values: z.infer<typeof addressFormSchema>) => {
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/address/update-address?address_id=${isEditing}`,
        values,
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success('Address updated successfully');
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update address');
    }
  });

  // Set default address mutation
  const setDefaultAddressMutation = useMutation({
    mutationFn: async (addressId: string) => {
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/address/set-default-address?address_id=${addressId}`,
        {},
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success('Default address updated successfully');
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to set default address');
    }
  });

  // Delete address mutation
  const deleteAddressMutation = useMutation({
    mutationFn: async (addressId: string) => {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/address/delete-address?address_id=${addressId}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
    },
    onSuccess: () => {
      toast.success('Address deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete address');
    }
  });

  const resetForm = () => {
    form.reset();
    setIsEditing(null);
    setIsFormOpen(false);
  };

  const handleEdit = (address: Address) => {
    form.reset({
      label: address.label,
      street: address.street,
      city: address.city,
      state: address.state,
      country: address.country,
      zipCode: address.zipCode,
      isDefault: address.isDefault,
    });
    setIsEditing(address.id);
    setIsFormOpen(true);
  };

  const onSubmit = (values: z.infer<typeof addressFormSchema>) => {
    if (isEditing) {
      updateAddressMutation.mutate(values);
    } else {
      createAddressMutation.mutate(values);
    }
  };

  const handleSetDefault = (addressId: string) => {
    setDefaultAddressMutation.mutate(addressId);
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Addresses</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New Address
        </Button>
      </div>

      {isFormOpen && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Address' : 'Add New Address'}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                  <FormField
                    control={form.control}
                    name="isDefault"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Set as default address</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" type="button" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createAddressMutation.isPending || updateAddressMutation.isPending}
                  >
                    {createAddressMutation.isPending || updateAddressMutation.isPending 
                      ? 'Saving...' 
                      : 'Save Address'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {addresses?.map((address) => (
          <Card key={address.id} className={address.isDefault ? 'border-primary border-2' : ''}>
            <CardHeader className="flex flex-row justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {address.label}
                  {address.isDefault && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Default
                    </span>
                  )}
                </CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(address)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteAddressMutation.mutate(address.id)}
                  disabled={deleteAddressMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{address.street}</p>
              <p className="text-sm">
                {address.city}, {address.state}
              </p>
              <p className="text-sm">
                {address.country}, {address.zipCode}
              </p>
              {!address.isDefault && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => handleSetDefault(address.id)}
                  disabled={setDefaultAddressMutation.isPending}
                >
                  Set as Default
                </Button>
              )}
            </CardContent>
          </Card>
        ))}

        {addresses?.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 mb-4">You haven't added any addresses yet</p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Your First Address
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}