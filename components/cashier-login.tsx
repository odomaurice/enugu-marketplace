// app/cashier-login/page.tsx
'use client';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff } from "lucide-react";

const formSchema = z.object({
  identifier: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function CashierLogin() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const callbackUrl = searchParams.get('callbackUrl') || '/cashier-dashboard';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    try {
      console.log('🔄 Starting cashier signin with provider: cashier_login');
      
      const result = await signIn('cashier_login', {
        redirect: false,
        identifier: values.identifier,
        password: values.password,
        callbackUrl,
      });

      console.log('📝 Cashier SignIn result:', result);

      if (result?.error) {
        console.error('❌ Cashier SignIn error:', result.error);
        
        // Handle specific error cases for cashier
        if (result.error.includes('Network connection failed') || result.error.includes('Unable to connect')) {
          toast.error('Unable to connect to server. Please check your internet connection.');
        } else if (result.error.includes('timeout') || result.error.includes('TIMEOUT')) {
          toast.error('Request timed out. Please try again.');
        } else if (result.error.includes('Invalid email or password') || result.error.includes('Invalid credentials')) {
          toast.error('Invalid email or password. Please try again.');
        } else if (result.error.includes('Cashier account not authorized') || result.error.includes('UNAUTHORIZED')) {
          toast.error('Cashier account not authorized. Please contact administrator.');
        } else if (result.error.includes('Server is currently unavailable')) {
          toast.error('Server is currently unavailable. Please try again later.');
        } else if (result.error.includes('No cashier data received')) {
          toast.error('Cashier account not found. Please contact administrator.');
        } else if (result.error.includes('Too many login attempts')) {
          toast.error('Too many login attempts. Please wait a few minutes and try again.');
        } else {
          toast.error(result.error);
        }
        
        return;
      }
      
      if (!result?.ok) {
        console.error('❌ Cashier SignIn not ok:', result);
        toast.error('Cashier authentication failed. Please try again.');
        return;
      }

      if (result?.url) {
        console.log('✅ Cashier login successful, redirecting to:', result.url);
        toast.success('Cashier login successful!');
        window.location.href = result.url;
      } else {
        throw new Error('No redirect URL received');
      }
    } catch (error: any) {
      console.error('💥 Cashier login error:', error);
      
      if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        toast.error('Network error. Please check your internet connection and try again.');
      } else if (error.message.includes('timeout')) {
        toast.error('Request timed out. Please try again.');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex font-header items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Cashier Login</h1>
          <h3 className="text-[16px] my-4">Login to your cashier account</h3>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="cashier@example.com" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        {...field} 
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute top-2 right-4 border-none bg-transparent cursor-pointer"
                        disabled={isLoading}
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

            <Button 
              type="submit" 
              className="w-full bg-green-700 hover:bg-green-600" 
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Log In as Cashier'
              )}
            </Button>
          </form>
        </Form>

        {/* <div className="text-center text-sm text-gray-600">
          <p>Having trouble logging in? Contact your administrator.</p>
        </div> */}
      </div>
    </div>
  );
}