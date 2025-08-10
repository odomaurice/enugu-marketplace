'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ShowProfile() {
  const { data: clientSession, status } = useSession();
  const [serverUser, setServerUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Fetch server session as fallback
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(setServerUser)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // Prefer client session, fallback to server session
  const user = clientSession?.user || serverUser;

  // useEffect(() => {
   
  //   if (!isLoading && user?.role) {
  //     if (user.role === 'admin') {
  //       router.push('/admin-dashboard');
  //     } else if (user.role === 'user') {
  //       router.push('/employee-dashboard');
  //     }
  //   }
  // }, [user, isLoading, router]);

  if (isLoading || status === "loading") {
    return (
      <div className="flex items-center gap-2 mr-8">
        <div className="w-[80px] h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-[40px] h-[40px] rounded-full bg-gray-200 animate-pulse"></div>
      </div>
    );
  }

  if (!user) {
    console.error("No user data available");
    return null;
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleDashboardClick = () => {
    
    if (user.role === 'admin') {
      router.push('/admin-dashboard');
    } else {
      router.push('/employee-dashboard');
    }
  };

  return (
    <div 
      className="flex items-center gap-2 cursor-pointer mr-8"
      onClick={handleDashboardClick}
    >
      <p className="text-green-700 text-[12px] font-bold">My Dashboard</p>
      <div className="w-[40px] h-[40px] border border-green-700 rounded-full overflow-hidden flex items-center justify-center bg-green-100 text-green-700 font-bold">
        {getInitials(user.name)}
      </div>
    </div>
  );
}