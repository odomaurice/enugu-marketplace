import type { Metadata } from "next";
import "../globals.css";
import Providers from "@/providers/Providers";
import { Toaster } from "@/components/ui/sonner";

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
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <Toaster position="top-center" className="z-50" />
          {children}
        </Providers>
      </body>
    </html>
  );
}