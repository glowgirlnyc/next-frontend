"use client"

import { useEffect, useRef, useState } from 'react'
import { Loader } from "@googlemaps/js-api-loader";

interface Salon {
  _id: string;
  salonName: string;
  location: {
    inputLocation: string;
    city: string;
    state: string;
  };
  latitude: number;
  longitude: number;
  services: Array<{
    categoryName: string;
    subServices: Array<{
      title: string;
      price: number;
    }>;
  }>;
  reviews: Array<{
    rating: number;
  }>;
}

interface MapViewProps {
  selectedSalon: Salon | null;
  setSelectedSalon: (salon: Salon | null) => void;
  salons: Salon[];
}

export const MapView = ({ selectedSalon, setSelectedSalon, salons }: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mapRef.current) return;

    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
      version: "weekly",
      libraries: ["places"],
    });

    const initializeMap = async () => {
      try {
        await loader.load();
        const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
        const { Marker } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

        // Default center (fallback if geolocation fails)
        let center = { lat: 37.7749, lng: -122.4194 };
        let userPosition: { lat: number; lng: number } | null = null;

        // Get user's location if available
        if (navigator.geolocation) {
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 10000, // 10 second timeout
                maximumAge: 0, // No cached position
                enableHighAccuracy: true // Request more accurate location
              });
            });
            center = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            userPosition = center;
          } catch (error) {
            console.log("Geolocation failed, using default location:", error);
          }
        }

        const newMap = new Map(mapRef.current!, {
          center: center,
          zoom: 12,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
        });

        setMap(newMap);
        markers.forEach(marker => marker.setMap(null));
        const newMarkers: google.maps.Marker[] = [];

        // Add salon markers
        salons.forEach((salon) => {
          if (salon.latitude && salon.longitude) {
            const marker = new Marker({
              position: { lat: salon.latitude, lng: salon.longitude },
              map: newMap,
              title: salon.salonName,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#ec4899",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              },
            });

            marker.addListener("click", () => {
              setSelectedSalon(salon);
            });

            newMarkers.push(marker);
          }
        });

        // Add current location marker if we got a position
        if (userPosition) {
          const userMarker = new Marker({
            position: userPosition,
            map: newMap,
            title: "Your Location",
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#0000ff",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            },
          });
          newMarkers.push(userMarker);
        }

        setMarkers(newMarkers);
        setIsLoading(false);

      } catch (error) {
        console.error("Failed to initialize map:", error);
        setIsLoading(false);
      }
    };

    initializeMap();
  }, [salons, setSelectedSalon]);

  useEffect(() => {
    markers.forEach((marker) => {
      const salon = salons.find(s => s.salonName === marker.getTitle());
      if (salon && map) {
        marker.setIcon({
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: selectedSalon?._id === salon._id ? "#be185d" : "#ec4899",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        });
      }
      // Keep user marker blue
      if (marker.getTitle() === "Your Location" && map) {
        marker.setIcon({
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#0000ff",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        });
      }
    });
  }, [selectedSalon, markers, salons, map]);

  return (
    <div className="h-screen w-screen bg-slate-100 relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 z-10">
          <div className="text-lg font-semibold">Loading map...</div>
        </div>
      )}
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
};

export default MapView;