"use client";

import * as React from "react";
import { usePage } from "@inertiajs/react";
import { PageProps } from "@/types";
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent } from "@/Components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/Components/ui/carousel";
import { router } from "@inertiajs/react";

interface Eatery {
  id: number;
  name: string;
  main_image: string | null;
  location?: string;
  cuisine_type?: string | null;
  price_range?: string | null;
}

interface HomePageProps extends PageProps {
  eateries: Eatery[];
}

const EateriesCarousel: React.FC = () => {
  const { eateries } = usePage<HomePageProps>().props;

  const handleEateryClick = (eateryId: number) => {
    router.visit(`/eatery-detailed?id=${eateryId}`);
  };

  if (!eateries || eateries.length === 0) {
    return (
      <div className="py-12 px-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Eateries Near You
        </h2>
        <p className="text-gray-500">No eateries found.</p>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800">
          Eateries Near You
        </h2>
        <p className="text-gray-500 mt-2">Discover great places to eat</p>
      </div>

      <Carousel
        className="w-full"
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: true,
            stopOnMouseEnter: true,
          }),
        ]}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {eateries.map((eatery) => (
            <CarouselItem
              key={eatery.id}
              className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3"
            >
              <Card
                className="overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 relative cursor-pointer"
                onClick={() => handleEateryClick(eatery.id)}
              >
                {eatery.main_image ? (
                  <img
                    src={eatery.main_image}
                    alt={eatery.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/storage/default-eatery.jpg";
                    }}
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}

                {eatery.price_range && (
                  <div className="absolute top-2 right-2 bg-green-600 bg-opacity-80 text-white text-xs font-semibold px-2 py-1 rounded transition duration-300 hover:bg-opacity-100">
                    {eatery.price_range}
                  </div>
                )}

                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {eatery.name}
                  </h3>
                  {eatery.location && (
                    <p className="text-sm text-gray-500 mt-1">{eatery.location}</p>
                  )}
                  {eatery.cuisine_type && (
                    <p className="text-sm text-gray-500 mt-1">{eatery.cuisine_type}</p>
                  )}
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="bg-white shadow-md hover:bg-gray-100" />
        <CarouselNext className="bg-white shadow-md hover:bg-gray-100" />
      </Carousel>
    </section>
  );
};

export default EateriesCarousel;
