// resources/js/Pages/Main/Beach/Components/BeachExplorerSection.tsx
"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { usePage } from "@inertiajs/react";
import { PageProps } from "@/types";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  Circle,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

// Fix default marker icons
delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Green icon for current location
const greenIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/487/487021.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

interface Beach {
  id: number;
  name: string;
  location?: string;
  latitude?: string | number | null;
  longitude?: string | number | null;
  main_image?: { image_path?: string } | null;
  lat?: number | null;
  lon?: number | null;
}

interface Props extends PageProps {
  beaches?: Beach[];
}

function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatTravelTime(distanceKm: number, speedKmh: number = 50) {
  const timeHrs = distanceKm / speedKmh;
  const totalMinutes = Math.round(timeHrs * 60);
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} h ${minutes} min`;
}

// Map click handler
function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Routing component
interface RoutingProps {
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
  map: L.Map;
}
const RoutingMachine: React.FC<RoutingProps> = ({ start, end, map }) => {
  useEffect(() => {
    if (!start || !end) return;
    const control = (L as any).Routing.control({
      waypoints: [L.latLng(start.lat, start.lng), L.latLng(end.lat, end.lng)],
      lineOptions: { styles: [{ color: "#6fa3ef", weight: 4, opacity: 0.7 }] },
      addWaypoints: false,
      draggableWaypoints: false,
      routeWhileDragging: false,
      show: false,
    }).addTo(map);

    return () => {
      map.removeControl(control);
    };
  }, [start, end, map]);

  return null;
};

const BeachExplorerSection: React.FC = () => {
  const { beaches: rawBeaches = [] } = usePage<Props>().props;

  const beaches = useMemo(() => {
    return (rawBeaches || [])
      .map((b: Beach) => {
        const lat = b.latitude != null ? parseFloat(String(b.latitude)) : NaN;
        const lon = b.longitude != null ? parseFloat(String(b.longitude)) : NaN;
        return { ...b, lat: Number.isFinite(lat) ? lat : null, lon: Number.isFinite(lon) ? lon : null };
      })
      .filter((b: Beach) => b.lat != null && b.lon != null);
  }, [rawBeaches]);

  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [pickedPoint, setPickedPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(50);
  const [selectedBeach, setSelectedBeach] = useState<Beach | null>(null);

  const mapRef = useRef<L.Map>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCenter(loc);
          setCurrentLocation(loc);
        },
        () => {
          if (beaches.length > 0) {
            const loc = { lat: beaches[0].lat!, lng: beaches[0].lon! };
            setCenter(loc);
            setCurrentLocation(loc);
          } else {
            const loc = { lat: 5.55929, lng: -0.19743 };
            setCenter(loc);
            setCurrentLocation(loc);
          }
        },
        { timeout: 5000 }
      );
    }
  }, [beaches]);

  const nearby = useMemo(() => {
    const centerPoint = pickedPoint || center;
    if (!centerPoint) return [];
    return beaches
      .map((b: Beach) => {
        const dist = haversineDistanceKm(centerPoint.lat, centerPoint.lng, b.lat!, b.lon!);
        return { ...b, distanceKm: dist };
      })
      .filter((b: Beach & { distanceKm: number }) => b.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [pickedPoint, radiusKm, beaches, center]);

  const useMyLocation = () => {
    if (!("geolocation" in navigator)) return alert("Geolocation not available.");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPickedPoint(loc);
        setCenter(loc);
        setCurrentLocation(loc);
      },
      () => alert("Unable to get your location.")
    );
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Explorer — find beaches near a location</h2>
      <p className="text-gray-500 mb-6">
        Click the map to pick a location (or use your current location). Beaches within the selected radius will appear on the right.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 bg-white rounded-lg overflow-hidden shadow h-[60vh]">
          {center && currentLocation ? (
            <MapContainer
              center={[center.lat, center.lng]}
              zoom={10}
              style={{ height: "100%", width: "100%" }}
              ref={mapRef}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {beaches.map((b) => (
                <Marker
                  key={b.id}
                  position={[b.lat!, b.lon!]}
                  eventHandlers={{ click: () => setSelectedBeach(b) }}
                >
                  <Popup>
                    <div className="text-sm">
                      <strong>{b.name}</strong>
                      {b.location && <div className="text-xs text-gray-500">{b.location}</div>}
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Current location */}
              <Marker position={[currentLocation.lat, currentLocation.lng]} icon={greenIcon}>
                <Popup>Your location</Popup>
              </Marker>

              {/* Picked point */}
              {pickedPoint && (
                <>
                  <Marker position={[pickedPoint.lat, pickedPoint.lng]}>
                    <Popup>Selected location</Popup>
                  </Marker>
                  <Circle center={[pickedPoint.lat, pickedPoint.lng]} radius={radiusKm * 1000} />
                </>
              )}

              {/* Routing */}
              {selectedBeach && currentLocation && mapRef.current && (
                <RoutingMachine
                  start={currentLocation}
                  end={{ lat: selectedBeach.lat!, lng: selectedBeach.lon! }}
                  map={mapRef.current}
                />
              )}

              <MapClickHandler onClick={(lat, lng) => setPickedPoint({ lat, lng })} />
            </MapContainer>
          ) : (
            <div className="flex items-center justify-center h-full">Loading map…</div>
          )}
        </div>

        {/* Sidebar */}
 <aside className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 h-[60vh] overflow-y-auto transition-colors duration-200">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
    <div>
      <label className="block text-sm text-gray-600 dark:text-gray-300">Radius</label>
        <select
  value={radiusKm}
  onChange={(e) => setRadiusKm(parseInt(e.target.value, 10))}
  className="mt-1 block rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-5 py-3.5 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
>
  <option value={10}>10 km</option>
  <option value={25}>25 km</option>
  <option value={50}>50 km</option>
  <option value={100}>100 km</option>
        </select>
    </div>

    <div className="flex items-center gap-2">
      <button
        onClick={() => { setPickedPoint(null); useMyLocation(); }}
        className="px-3 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
      >
        My location
      </button>
      <button
        onClick={() => setPickedPoint(null)}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
      >
        Reset selection
      </button>
    </div>
  </div>

  <hr className="my-4 border-gray-200 dark:border-gray-600" />

  <div className="mb-2 text-sm text-gray-600 dark:text-gray-300">
    {pickedPoint ? (
      <div>Showing beaches within <strong>{radiusKm} km</strong> of selected point.</div>
    ) : (
      <div>Showing beaches within <strong>{radiusKm} km</strong> of map center.</div>
    )}
  </div>

  <div>
    {nearby.length === 0 ? (
      <div className="text-gray-500 dark:text-gray-400">No beaches found within that radius.</div>
    ) : (
      nearby.map((b) => (
        <div key={b.id} className="flex items-start gap-3 mb-4">
          <div className="w-20 h-16 bg-gray-100 dark:bg-gray-700 flex items-center justify-center rounded overflow-hidden">
            {b.main_image?.image_path ? (
              <img src={`/storage/${b.main_image.image_path}`} alt={b.name} className="w-full h-full object-cover" />
            ) : <div className="text-xs text-gray-400 dark:text-gray-500">No image</div>}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">{b.name}</h4>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {b.distanceKm.toFixed(1)} km • {formatTravelTime(b.distanceKm)}
              </div>
            </div>
            {b.location && <div className="text-sm text-gray-500 dark:text-gray-400">{b.location}</div>}
            <div className="mt-2 flex gap-4">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedBeach(b);
                  if (b.lat != null && b.lon != null) setPickedPoint(null);
                }}
                className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
              >
                View on map
              </a>
              <a
                href={`/beach-detailed?id=${b.id}`}
                className="text-green-600 dark:text-green-400 text-sm hover:underline"
              >
                See Details
              </a>
            </div>
          </div>
        </div>
      ))
    )}
  </div>
</aside>
      </div>
    </section>
  );
};

export default BeachExplorerSection;
