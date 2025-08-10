"use client";

import { useContext } from "react";
import { usePathname } from "next/navigation";
import { FaPowerOff } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { CommonDashboardContext } from "@/providers/StateContext";
import { useConversion } from "@/data-access/conversion";
import { UserSideBarComponent } from "./SidebarNav";

interface ClientSidebarProps {
  dashboard: string;
  userName: string;
  userImage?: string;
  userEmail?: string;
}

export default function ClientSidebar({
  dashboard,
  userName,
  userImage,
  userEmail
}: ClientSidebarProps) {
  const { setConfirmLogout } = useContext(CommonDashboardContext);
  const { makeSubstring } = useConversion();
  const pathname = usePathname();

  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .trim()
      .split(" ")
      .map(n => n.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const pathSegments = pathname.split("/");
  const findpath = pathSegments.length === 2 ? "" : pathSegments[2];

  return (
    <div className="flex flex-col w-[240px] font-header gap-12 p-4">
      {/* Logo */}
      <div>
        <Link href="/" className="flex items-center">
          <h1 className="ml-2 text-black font-bold text-[18px]">
            ENUGU MARKETPLACE
          </h1>
        </Link>
      </div>

      {/* Dashboard-specific sidebar */}
      {dashboard === "user" && <UserSideBarComponent findpath={findpath} />}

      {/* User profile and logout */}
      <div className="w-full h-[120px] bg-green-800 mt-16 flex items-end justify-center relative rounded-lg">
        <div className="w-3/5 h-[120px] left-1/2 text-black rounded-xl transform -translate-x-1/2 bg-gray-100 absolute gap-1 -translate-y-1/2 flex flex-col items-center justify-center">
          {userName ? (
            <>
              {userImage && (
                
               
                <span className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-full">
                  {getInitials(userName)}
                </span>
              )}
              <p className="text-[10px] font-bold">
                {makeSubstring(userName, 8)}
              </p>
              {userEmail && (
                <p className="text-[8px] text-gray-500">
                  {makeSubstring(userEmail, 12)}
                </p>
              )}
            </>
          ) : (
            <div className="text-xs text-gray-400">Loading...</div>
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
}