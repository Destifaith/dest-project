import React from "react";
import MainLayout from "../../Layouts/MainLayout";
import EateryHero from "./Components/eatery-hero";
import EaterySearch from "./Components/eatery-search";
import FeaturedCategories from "./Components/featured-categories";
import Testimonials from "./Components/testimonials";
import DinerReviews from "./Components/diner-reviews";


const EateriesPage = () => {
  return (
    <MainLayout>
      {/* This is where your actual page content goes.
        The component currently renders nothing inside the layout.
      */}
            <EateryHero />
            <EaterySearch/>
            <FeaturedCategories />
            <Testimonials />
      <DinerReviews />
    </MainLayout>
  );
};

export default EateriesPage;
