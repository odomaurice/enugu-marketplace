'use client'

import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { toast } from "sonner";
import { useCallback, useState, useEffect } from "react";

export const useAuth = () => {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [loading, setLoading] = useState(false);

  const handleSessionSync = useCallback(async () => {
    try {
      if (status === "authenticated" && !session?.user) {
        // Add a small delay to allow session to stabilize
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const updated = await update();
        if (!updated?.user) {
          console.error('Session update failed - no user data');
          return false;
        }
        return true;
      }
      return true;
    } catch (error) {
      console.error('Session sync error:', error);
      return false;
    }
  }, [status, session, update]);

  const redirectBasedOnRole = useCallback(async () => {
    setLoading(true);
    try {
      // First check if we're already authenticated
      if (status === "authenticated" && session?.user) {
        redirectUser(session.user.role);
        return;
      }

      // If not, try to sync session
      const sessionValid = await handleSessionSync();
      if (!sessionValid) {
        throw new Error('Session synchronization failed');
      }

      // After sync, check again
      if (status === "authenticated" && session?.user) {
        redirectUser(session.user.role);
      } else {
        throw new Error('No active session');
      }
    } catch (error) {
      console.error('Redirect error:', error);
      router.push('/admin-login');
    } finally {
      setLoading(false);
    }
  }, [session, status, router, handleSessionSync]);

  const redirectUser = (role: string | undefined) => {
    switch (role) {
      case "admin":
        router.push('/admin-dashboard');
        break;
      case "user":
        router.push('/employee-dashboard');
        break;
      default:
        router.push('/');
    }
  };

  const handleOTPLogin = async (userId: string, otp: string) => {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        userId,
        otp,
        redirect: false
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // Force session update after successful login
      await new Promise(resolve => setTimeout(resolve, 300));
      await update();
      
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { 
    handleOTPLogin,
    redirectBasedOnRole,
    loading,
    session,
    status
  };
};