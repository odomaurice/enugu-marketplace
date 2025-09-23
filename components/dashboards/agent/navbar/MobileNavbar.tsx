"use client";
import { CommonDashboardContext } from "@/providers/StateContext";
import Image from "next/image";
import React, { useContext } from "react";
import { GiHamburgerMenu } from "react-icons/gi";


const MobileNav = () => {
  const { setShowSidebar } = useContext(CommonDashboardContext);
  const handleSideBar = () => {
    setShowSidebar(true);
  };
  return (
    <div className=" sm:hidden w-full font-header justify-between fixed  top-0 left-0 h-[70px] px-4 bg-white border-b mb-10 flex items-center z-50">
      {/* <Image
        className=" h-[40px] w-[80px]"
        src="/logo.svg"
        alt="logo"
        width={200}
        height={200}
      /> */}
      <h1 className="text-black font-bold">Enugu Food Scheme</h1>
      <GiHamburgerMenu
        className=" text-[30px] cursor-pointer"
        onClick={handleSideBar}
      />
    </div>
  );
};

export default MobileNav;
