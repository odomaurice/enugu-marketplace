"use client";

import { useContext } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FaPowerOff } from "react-icons/fa";
import { CommonDashboardContext } from "@/providers/StateContext";
import { Session } from "next-auth";
//import { useSession } from "next-auth/react";
import { useConversion } from "@/data-access/conversion";
import Link from "next/link";
import { UserSideBarComponent } from "./SidebarNav";
import { Skeleton } from "@/components/ui/skeleton";

interface SidebarProps {
  dashboard: string;
  session: Session;
}

const Sidebar = ({ dashboard, session }: SidebarProps) => {
  const { setConfirmLogout } = useContext(CommonDashboardContext);
  // const { data: session, status } = useSession();
  const { makeSubstring } = useConversion();
  const pathname = usePathname();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "";
    const names = name.trim().split(" ");
    return names
      .map((n) => n.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase();
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

  if (!session?.user) {
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
          <h1 className="ml-2 text-black font-bold text-[18px]">
            ENUGU MARKETPLACE
          </h1>
        </Link>
      </div>

      {/* Dashboard Navigation */}
      {dashboard === "user" && <UserSideBarComponent findpath={findpath} />}

      {/* User Profile & Logout */}
      <div className="w-full h-[120px] bg-green-800 mt-16 flex items-end justify-center relative rounded-lg">
        <div className="w-3/5 h-[120px] left-1/2 text-black rounded-xl transform -translate-x-1/2 bg-gray-100 absolute gap-1 -translate-y-1/2 flex flex-col items-center justify-center">
          {session.user.image && (
            // <Image
            //   src={session.user.image}
            //   alt="User profile"
            //   width={40}
            //   height={40}
            //   className="rounded-full"
            //   priority
            // />
          
            <span className="w-10 h-10 flex items-center justify-center bg-orange-700 text-orange-500 rounded-full">
              {getInitials(session.user.name)}
            </span>
          )}
          <p className="text-[10px] font-bold">
            {makeSubstring(session.user.name || "User", 8)}
          </p>
          {session.user.email && (
            <p className="text-[8px] text-gray-500">
              {makeSubstring(session.user.email, 12)}
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