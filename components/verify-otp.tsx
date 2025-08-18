'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';

const formSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits").max(6),
});

export default function VerifyOtp() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
   const returnUrl = searchParams.get('returnUrl') || '/employee-dashboard';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(60);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (resendDisabled && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
    }
    
    return () => clearTimeout(timer);
  }, [countdown, resendDisabled]);

  const handleResendOtp = async () => {
    try {
      if (!userId) {
        toast.error('User ID is missing');
        return;
      }

      const response = await fetch('/api/auth/employee/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      toast.success('OTP resent successfully!');
      setResendDisabled(true);
      setCountdown(60); // Reset countdown to 60 seconds
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend OTP');
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userId) {
      toast.error('User ID is missing');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        userId,
        otp: values.otp,
        callbackUrl: returnUrl,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.url) {
        window.location.href = result.url;
      } else {
        throw new Error('Authentication failed');
      }

    } catch (error: any) {
      toast.error(error.message || 'OTP verification failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center font-header bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center">Verify OTP</h1>
        <p className="text-center text-gray-600">
          Enter the 6-digit OTP sent to your phone
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OTP Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter 6-digit OTP" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-green-700" disabled={isSubmitting}>
              {isSubmitting ? "Verifying..." : "Verify OTP"}
            </Button>
          </form>
        </Form>

        <div className="text-center">
          <button
            onClick={handleResendOtp}
            disabled={resendDisabled}
            className={`text-sm ${resendDisabled ? 'text-gray-400' : 'text-blue-600 hover:underline'}`}
          >
            {resendDisabled ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
          </button>
        </div>
      </div>
    </div>
  );
}