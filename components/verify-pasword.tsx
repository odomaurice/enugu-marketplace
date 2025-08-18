"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

const formSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export default function VerifyPassword() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });



  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userId) {
      toast.error("User ID is missing");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/employee/verify-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Password verification failed");
      }

      // Get the returnUrl from query params
      const searchParams = new URLSearchParams(window.location.search);
      const returnUrl = searchParams.get("returnUrl") || "/employee-dashboard";

      // Redirect to OTP verification with userId
      window.location.href = `/auth/verify-otp?userId=${
        data.userId
      }&returnUrl=${encodeURIComponent(returnUrl)}`;
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
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
        <h1 className="text-2xl font-bold text-center">Verify Password</h1>
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
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...field}
                    />
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
            <Button
              type="submit"
              className="w-full bg-green-700 hover:bg-green-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Verifying..." : "Verify Password"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
