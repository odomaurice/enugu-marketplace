"use client";
import { Session } from "next-auth";
import ConfirmLogout from "@/components/ConfirmLogout";
import { ToastContainer } from "react-toastify";
//import "react-toastify/dist/ReactToastify.css";
import MobileSideBar from "@/components/dashboards/cashiers/sidebar/MobileSidebar";
import MobileNavbar from "@/components/dashboards/cashiers/navbar/MobileNavbar";
import Sidebar from "@/components/dashboards/cashiers/sidebar/Sidebar";

export default function CashierLayoutClient({
  children,
  session
}: {
  children: React.ReactNode;
  session: Session;
}) {
  return (
    <div className="flex font-header">
      {/* Desktop Sidebar */}
      <div className="hidden sm:block sm:flex-4 md:flex-2 bg-[#FFF] text-black font-semibold py-2 h-screen sticky top-0 overflow-auto scrollbar-hide">
        <Sidebar dashboard="cashier"  />
        
      </div>

      {/* Main Content */}
      <section className="flex-1 flex flex-col w-full overflow-hidden">
        {/* Mobile Sidebar */}
        <div className="sm:hidden">
          <MobileSideBar dashboard="cashier" session={session}  />
        </div>

        {/* Navbar */}
        <div className="sticky top-0 z-20 bg-white shadow-sm">
          {/* <Navbar /> */}
          <MobileNavbar />
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-1 scrollbar-hide bg-stone-100 relative">
          <ConfirmLogout />
          {children}
          <ToastContainer position="top-right" autoClose={3000} />
        </main>
      </section>
    </div>
  );
}