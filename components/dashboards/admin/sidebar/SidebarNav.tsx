"use client";
import React from "react";
import Link from "next/link";
import { CommonDashboardContext } from "@/providers/StateContext";
import { useContext } from "react";
import { AdminSideBar, AdminSideBarType } from "@/constants/adminSidebar";


interface Isidebar {
  findpath: string;
}


export const AdminSideBarComponent = ({ findpath }: Isidebar) => {
  const {  setShowSideBar } = useContext(CommonDashboardContext);
  return (
    <div className=" flex flex-col space-y-2 ">
      {AdminSideBar.map((item: AdminSideBarType, index) => (
       <Link
       onClick={() => setShowSideBar(false)}
       href={`/admin-dashboard/${item.path}`}
       className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm ${
         findpath === item.path
           ? "bg-green-700 text-white font-semibold"
           : "text-[#000] hover:text-black font-medium hover:bg-white/10"
       }`}
       key={index}
     >
       <div className="text-lg">{item.icon && <item.icon />}</div>
       <p>{item.name}</p>
     </Link>
     
      ))}
    </div>
  );
};
