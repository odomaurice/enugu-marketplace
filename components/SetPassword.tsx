'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff } from "lucide-react";

const formSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  password_confirmation: z.string(),
}).refine(data => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});

export default function SetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      password_confirmation: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userId) {
      toast.error('User ID is missing');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/employee/set-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          password: values.password,
          password_confirmation: values.password_confirmation,
        }),
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to set password');
      }

      // Get the returnUrl from query params
    const searchParams = new URLSearchParams(window.location.search);
    const returnUrl = searchParams.get('returnUrl') || '/employee-dashboard';

      // Redirect to OTP verification after successful password set
      window.location.href = `/auth/verify-otp?userId=${userId}&returnUrl=${encodeURIComponent(returnUrl)}`;

    } catch (error: any) {
      toast.error(error.message || 'Password setup failed');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

   const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center font-header justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center">Set Your Password</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input  type={showPassword ? "text" : "password"} placeholder="Enter password" {...field} />

                      <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute top-2 right-4 border-none bg-transparent cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="text-orange-700 h-4 w-4" />
                      ) : (
                        <Eye className="text-orange-700 h-4 w-4" />
                      )}
                    </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password_confirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                     <div className="relative">
                    <Input  type={showPassword ? "text" : "password"} placeholder="Confirm password" {...field} />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute top-2 right-4 border-none bg-transparent cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="text-orange-700 h-4 w-4" />
                      ) : (
                        <Eye className="text-orange-700 h-4 w-4" />
                      )}
                    </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-green-700 hover:bg-green-600" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Continue"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}