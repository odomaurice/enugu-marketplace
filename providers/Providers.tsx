'use client';

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import StateContext, { CommonDashboardContext } from "./StateContext";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [confirmLogout, setConfirmLogout] = useState(false);
   const [showSidebar, setShowSidebar] = useState<boolean>(false);

  return (
    <SessionProvider 
      refetchInterval={5 * 60}
      refetchOnWindowFocus={true}
    >
      <QueryClientProvider client={queryClient}>
        <StateContext>
       
          {children}
        </StateContext>
        
      </QueryClientProvider>
    </SessionProvider>
  );
}