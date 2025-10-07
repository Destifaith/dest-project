import React from "react";
import MainNavbar from "./MainNavbar";
import TopNav from "./TopNav";
import Footer from "./Footer";

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <TopNav/>
      <MainNavbar />
      <main className="pt-16">{children}</main>
      <Footer/>
    </div>
  );
};

export default MainLayout;
