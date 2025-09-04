import React from "react";
import MainLayout from "@/Pages/Layouts/MainLayout";
import HeroSection from "./Components/HeroSection";
import SearchSection from "./Components/SearchSection";
import AdvertCenter from "./Components/Advert Center";
import { RecommendedHotels } from "./Components/RecommendedHotels";
import BeachesNearYou from "./Components/BeachesNearYou";
import { EateriesCarousel } from "./Components/EateriesCarousel";

const HomePage = () => {
  return (
    <MainLayout>
        <HeroSection/>
        <SearchSection/>
        <AdvertCenter/>
        <RecommendedHotels/>
        <BeachesNearYou/>
        <EateriesCarousel/>
    </MainLayout>
  );
};

export default HomePage;
