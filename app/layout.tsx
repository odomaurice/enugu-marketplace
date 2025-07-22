import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/providers/AuthProvider";
import QueryProvider from "@/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Enugu Marketplace",
  description: "This is the marketplace for Enugu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="">
        <AuthProvider>
          <QueryProvider>
            <main>
              <Toaster/>
              {children}
            </main>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
