"use client";
import React from "react";
import Link from "next/link";
import { CommonDashboardContext } from "@/providers/StateContext";
import { useContext } from "react";
import { AgentSideBar, AgentSideBarType } from "@/constants/agentSidebar";


interface Isidebar {
  findpath: string;
}


export const AgentSideBarComponent = ({ findpath }: Isidebar) => {
  const {  setShowSideBar } = useContext(CommonDashboardContext);
  return (
    <div className=" flex flex-col space-y-2 ">
      {AgentSideBar.map((item: AgentSideBarType, index) => (
       <Link
       onClick={() => setShowSideBar(false)}
       href={`/agent-dashboard/${item.path}`}
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
