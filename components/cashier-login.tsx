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
  identifier: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function CashierLogin() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
    
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
        throw new Error(result.error);
      }
      
      if (!result?.ok) {
        console.error('❌ Cashier SignIn not ok:', result);
        throw new Error('Cashier authentication failed - no response URL');
      }

      if (result?.url) {
        console.log('✅ Cashier login successful, redirecting to:', result.url);
        window.location.href = result.url;
      } else {
        throw new Error('No redirect URL received');
      }
    } catch (error: unknown) {
      console.error('💥 Cashier login error:', error);
      const errorMessage = typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message: unknown }).message)
        : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
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

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

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
              {isLoading ? 'Logging in...' : 'Log In as Cashier'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}