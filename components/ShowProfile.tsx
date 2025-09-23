'use client';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ShowProfile() {
const { data: clientSession, status } = useSession();
  const [serverUser, setServerUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
      fetch('/api/auth/session')
        .then(res => res.json())
        .then(setServerUser)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }, []);

const user = clientSession?.user || serverUser;

  if (!user) return null;

  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    const parts = name.split(' ').filter(Boolean);
    return parts.map(n => n[0]).join('').toUpperCase();
  };

  const handleDashboardClick = () => {
    if (user?.role === 'super_admin') {
      router.push('/admin-dashboard');
    } 

     else if (user?.role === 'fulfillment_officer') {
      router.push('/agent-dashboard');
    } 

    
     else {
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
        {getInitials(user?.name)}
      </div>
    </div>
  );
}