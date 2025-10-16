import React from "react";
import { usePage } from "@inertiajs/react";
import MainLayout from "../../Layouts/MainLayout";
import GymHero from "./Components.tsx/Hero";
import GymSearch from "./Components.tsx/gym-search";
import GymCategory from "./Components.tsx/GymCategory";
import GymBenefits from "./Components.tsx/GymBenefits";

interface Gym {
  id: number
  name: string
  location: string
  gym_type: string
  equipment_type: string
  price: string
  description: string
  main_image: string | null
  facilities: string
  is_active: boolean
  opening_hours: string
  latitude: number
  longitude: number
}

const GymsPage = () => {
  const { props } = usePage();
  // Use type assertion to avoid complex TypeScript interfaces
  const gyms = (props as { gyms?: Gym[] }).gyms || [];

  return (
    <MainLayout>
      <GymHero />
      <GymSearch />
      <GymCategory gyms={gyms} />
      <GymBenefits />
    </MainLayout>
  );
};

export default GymsPage;
