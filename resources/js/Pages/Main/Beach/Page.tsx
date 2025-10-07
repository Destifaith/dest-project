import React from "react";
import MainLayout from "@/Pages/Layouts/MainLayout";
import BeachHero from "./Components/BeachHero";
import CountryBeaches from "./Components/CountryBeaches";
import BeachExplorerSection from "./Components/BeachExplorerSection";

const BeachPage = () => {
  return (
    <MainLayout>
    <BeachHero/>
    <CountryBeaches/>
    <BeachExplorerSection/>
    </MainLayout>
  );
};

export default BeachPage;
