"use client";

import React, { createContext, useState } from "react";
export const CommonDashboardContext = createContext<any>("");
const StateContext = ({ children }: { children: React.ReactNode }) => {
 const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [confirmLogout, setConfirmLogout] = useState<boolean>(false);
  const allContext = {
    showSidebar,
    setShowSidebar,
    confirmLogout,
    setConfirmLogout,
  };
  return (
    <CommonDashboardContext.Provider value={allContext}>
      {children}
    </CommonDashboardContext.Provider>
  );
};

export default StateContext;
