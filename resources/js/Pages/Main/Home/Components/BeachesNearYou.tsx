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

interface Beach {
  id: number;
  name: string;
  location?: string;
  main_image?: {
    image_path: string;
  } | null;
}

interface HomePageProps extends PageProps {
  beaches: Beach[];
}

const BeachesNearYou: React.FC = () => {
  const { beaches } = usePage<HomePageProps>().props;

  if (!beaches || beaches.length === 0) {
    return (
      <div className="py-12 px-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Available Beaches
        </h2>
        <p className="text-gray-500">No beaches found.</p>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      {/* Section Heading */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800">
         Available Beaches
        </h2>
        <p className="text-gray-500 mt-2">
          Discover the best beaches in the world
        </p>
      </div>

      {/* Carousel */}
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
          {beaches.map((beach) => (
            <CarouselItem
              key={beach.id}
              className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3"
            >
              <Card className="overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 relative">
                {/* Main Image */}
                {beach.main_image ? (
                  <img
                    src={`/storage/${beach.main_image.image_path}`}
                    alt={beach.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}

                {/* Default Price Tag with hover effect */}
                <div className="absolute top-2 right-2 bg-green-600 bg-opacity-80 text-white text-xs font-semibold px-2 py-1 rounded transition duration-300 hover:bg-opacity-100">
                  $50
                </div>

                {/* Beach Name and Location */}
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {beach.name}
                  </h3>
                  {beach.location && (
                    <p className="text-sm text-gray-500 mt-1">{beach.location}</p>
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

export default BeachesNearYou;
