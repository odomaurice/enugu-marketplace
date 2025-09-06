"use client";
import { Session } from "next-auth";
import Sidebar from "@/components/dashboards/admin/sidebar/Sidebar";
import MobileSidebar from "@/components/dashboards/admin/sidebar/MobileSidebar";
import MobileNavbar from "@/components/dashboards/admin/navbar/MobileNavbar";
import ConfirmLogout from "@/components/ConfirmLogout";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";


export default function AdminLayoutClient({
  children,
  session
}: {
  children: React.ReactNode;
  session: Session;
}) {
  return (
    <div className="flex font-header ">
      {/* Desktop Sidebar */}
      <div className="hidden sm:block sm:flex-4 md:flex-2  text-black font-semibold py-2 h-screen sticky top-0 overflow-auto scrollbar-hide">
        <Sidebar dashboard="admin"  />
      </div>

      {/* Main Content */}
      <section className="flex-1 flex flex-col w-full  overflow-hidden">
        {/* Mobile Sidebar */}
        <div className="sm:hidden">
          <MobileSidebar dashboard="admin" session={session}  />
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