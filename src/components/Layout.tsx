import React from "react";
import Sidebar from "./Sidebar";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="lg:flex min-h-screen">
    <Sidebar />
    <main className="flex-1 min-w-0">{children}</main>
  </div>
);

export default Layout;
