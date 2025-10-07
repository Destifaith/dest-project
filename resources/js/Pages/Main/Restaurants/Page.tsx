import React from "react";
import MainLayout from "../../Layouts/MainLayout";
import Hero from "./Components/Hero";



const RestaurantsPage = () => {
  return (
    <MainLayout>
      {/* This is where your actual page content goes.
        The component currently renders nothing inside the layout.
      */}
            <Hero/>
    </MainLayout>
  );
};

export default RestaurantsPage;
