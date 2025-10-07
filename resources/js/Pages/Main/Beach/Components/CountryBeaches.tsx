// resources/js/Pages/Main/Beaches/CountryBeaches.tsx
"use client";

import * as React from "react";
import { usePage } from "@inertiajs/react";
import { PageProps } from "@/types";
import { Card, CardContent } from "@/Components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/Components/ui/carousel";
import { Link } from "@inertiajs/react";

interface Beach {
  id: number;
  name: string;
  price?: number;
  location?: string;
  main_image?: {
    image_path: string;
  } | null;
}

interface CountryBeachesProps extends PageProps {
  beaches: Beach[];
  country: string;
}

const CountryBeaches: React.FC = () => {
  const { beaches, country } = usePage<CountryBeachesProps>().props;

  if (!beaches || beaches.length === 0) {
    return (
      <div className="py-12 px-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Beaches in {country}
        </h2>
        <p className="text-gray-500">
          No beaches found in your country yet. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      {/* Section Heading */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800">
          Beaches in {country}
        </h2>
        <p className="text-gray-500 mt-2">
          Discover stunning beaches available near you.
        </p>
      </div>

      {/* Carousel */}
      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {beaches.map((beach) => (
            <CarouselItem
              key={beach.id}
              className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3"
            >
              <Card className="overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 relative group">
                {/* Clickable Beach Image */}
                <Link href={`/beach-detailed?id=${beach.id}`} className="block cursor-pointer">
                  {beach.main_image ? (
                    <div className="relative overflow-hidden">
                      <img
                        src={`/storage/${beach.main_image.image_path}`}
                        alt={beach.name}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                </Link>

                {/* Dynamic Price Tag */}
                {beach.price && (
                  <div className="absolute top-2 right-2 bg-green-600 bg-opacity-80 text-white text-xs font-semibold px-2 py-1 rounded transition duration-300 hover:bg-opacity-100">
                    ${beach.price}
                  </div>
                )}

                {/* Beach Info */}
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {beach.name}
                  </h3>
                  {beach.location && (
                    <p className="text-sm text-gray-500 mt-1">
                      {beach.location}
                    </p>
                  )}

                  {/* See Details Link */}
                  <Link
                    href={`/beach-detailed?id=${beach.id}`}
                    className="text-green-600 text-sm mt-2 inline-block hover:text-green-700 hover:underline"
                  >
                    See Details
                  </Link>
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

export default CountryBeaches;
