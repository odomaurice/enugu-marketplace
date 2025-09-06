import type { Metadata } from "next";
import "../globals.css";
import Providers from "@/providers/Providers";
import Header from "@/components/Header";
import StatusCheckWrapper from "@/components/StatusCheckWrapper";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Enugu Food Scheme",
  description: "Food Loan Scheme for Enugu State Workers",

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className=" font-header">
        <Providers>
          <Header />
          <Toaster/>
          <Suspense fallback={<div>Loading...</div>}>
            <StatusCheckWrapper>{children}</StatusCheckWrapper>
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
