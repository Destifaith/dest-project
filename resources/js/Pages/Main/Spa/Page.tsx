import React from "react";
import { usePage } from "@inertiajs/react";
import MainLayout from "@/Pages/Layouts/MainLayout";
import SpaHero from "./Components/Hero";
import SpaSearch from "./Components/spa-search";
import SpaCategory from "./Components/spa-category";

// Unified Spa interface with all properties
interface Spa {
  id: number;
  name: string;
  location: string;
  description: string;
  price: string;
  main_image: string;
  treatment_type: string;
  ambiance_type: string;
  facilities: string[];
  opening_hours: any;
  status: string;
  latitude: number;
  longitude: number;
  gallery_images?: string[];
}

const SpaPage = () => {
  const { props } = usePage();
  // Use type assertion with the complete Spa interface
  const spas = (props as { spas?: Spa[] }).spas || [];

  return (
    <MainLayout>
      <SpaHero />
      <SpaSearch />
      <SpaCategory spas={spas} />
    </MainLayout>
  );
};

export default SpaPage;
