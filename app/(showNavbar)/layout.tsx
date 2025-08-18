import type { Metadata } from "next";
import "../globals.css";
import Providers from "@/providers/Providers";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Enugu Marketplace",
  description: "The marketplace for Enugu",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" >
      <body suppressHydrationWarning className="bg-[#FAF9F6] dark:bg-black font-header">
        <Providers>
          <Header/>
          <Toaster position="top-right" />
          {children}
        </Providers>
      </body>
    </html>
  );
}