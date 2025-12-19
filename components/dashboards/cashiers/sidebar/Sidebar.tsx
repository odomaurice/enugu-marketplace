"use client";

import { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FaPowerOff } from "react-icons/fa";
import { CommonDashboardContext } from "@/providers/StateContext";
//import { Session } from "next-auth";
//import { useSession } from "next-auth/react";
import { useConversion } from "@/data-access/conversion";
import Link from "next/link";
import { CashierSideBarComponent } from "./SidebarNav";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";

interface SidebarProps {
  dashboard: string;
  // session: user;
}

const Sidebar = ({ dashboard }: SidebarProps) => {
  const { setConfirmLogout } = useContext(CommonDashboardContext);
    const { data: clientSession, status } = useSession();
    const [serverUser, setServerUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
  // const { data: session, status } = useSession();
  const { makeSubstring } = useConversion();
  const pathname = usePathname();

   useEffect(() => {
      fetch("/api/auth/session")
        .then((res) => res.json())
        .then(setServerUser)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }, []);

  // const getInitials = (name: string | null | undefined) => {
  //   if (!name) return "";
  //   const names = name.trim().split(" ");
  //   return names
  //     .map((n) => n.charAt(0))
  //     .slice(0, 2)
  //     .join("")
  //     .toUpperCase();
  // };

  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    const parts = name.split(' ').filter(Boolean);
    return parts.map(n => n[0]).join('').toUpperCase();
  };

  const pathSegments = pathname?.split("/") || [];
  const findpath = pathSegments.length === 2 ? "" : pathSegments[2];

  if (status === "loading") {
    return (
      <div className="flex flex-col w-[240px] font-header gap-12 p-4">
        <Skeleton className="h-8 w-[160px]" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
        <Skeleton className="w-full h-[120px] mt-16 rounded-lg" />
      </div>
    );
  }

  const user = clientSession?.user || serverUser;

  

  

  if (!user) {
    return (
      <div className="flex flex-col w-[240px] font-header gap-12 p-4">
        <div className="text-red-500">Not authenticated</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-[240px] font-header gap-12 p-3">
      {/* Logo */}
      <div>
        <Link href="/" className="flex items-center">
        <Image
                      src={"/logo2.png"}
                      alt="logo"
                      width={50}
                      height={50}
                      className="text-[20px] text-green-600"
                    />
          <h1 className="ml-2 text-black font-bold text-[18px]">
            Enugu Market Food Scheme
          </h1>
        </Link>
      </div>

      {/* Dashboard Navigation */}
      {dashboard === "cashier" && <CashierSideBarComponent findpath={findpath} />}

      {/* User Profile & Logout */}
      <div className="w-full h-[120px] bg-green-800 mt-16 flex items-end justify-center relative rounded-lg">
        <div className="w-3/5 h-[120px] left-1/2 text-black rounded-xl transform -translate-x-1/2 bg-gray-100 absolute gap-1 -translate-y-1/2 flex flex-col items-center justify-center">
          {user && (
            // <Image
            //   src={session.user.image}
            //   alt="User profile"
            //   width={40}
            //   height={40}
            //   className="rounded-full"
            //   priority
            // />
          
            <div className="w-12 h-12 flex items-center justify-center bg-orange-700 text-white rounded-full">
              {getInitials(user.name)}
            </div>
          )}
          <p className="text-[10px] font-bold">
            {makeSubstring(user.name || "User", 8)}
          </p>
          {user.email && (
            <p className="text-[8px] text-gray-500">
              {makeSubstring(user.email, 12)}
            </p>
          )}
        </div>
        <button
          onClick={() => setConfirmLogout(true)}
          className="text-white mb-6 flex gap-1 items-center text-[12px] cursor-pointer"
          aria-label="Logout"
        >
          <span>logout</span>
          <FaPowerOff />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
