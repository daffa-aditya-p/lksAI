"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { FacilityItem } from "./CariBantuanClient";

interface FacilitiesMapProps {
  facilities: FacilityItem[];
  onSelectFacility: (fac: FacilityItem) => void;
}

export default function FacilitiesMap({
  facilities,
  onSelectFacility,
}: FacilitiesMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const defaultCenter: [number, number] =
        facilities.length > 0
          ? [facilities[0].lat, facilities[0].lng]
          : [-6.2088, 106.8456];

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }

    // Refresh markers
    if (markersLayerRef.current && mapInstanceRef.current) {
      markersLayerRef.current.clearLayers();

      facilities.forEach((fac) => {
        const isMedis = fac.kategori === "medis";
        const isPosko = fac.kategori === "posko";
        const pinColor = isMedis ? "#0098A6" : isPosko ? "#FFA800" : "#005AE0";

        const customPin = L.divIcon({
          className: "facility-pin",
          html: `<div style="width: 30px; height: 30px; border-radius: 50%; background: ${pinColor}; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: white;">
            <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a8 8 0 0 0-8 8c0 5.4 7 11.5 7.7 12.1a.5.5 0 0 0 .6 0C13 21.5 20 15.4 20 10a8 8 0 0 0-8-8z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        });

        const marker = L.marker([fac.lat, fac.lng], { icon: customPin });
        marker.on("click", () => {
          onSelectFacility(fac);
        });
        marker.addTo(markersLayerRef.current!);
      });
    }
  }, [facilities, onSelectFacility]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return <div ref={mapContainerRef} className="w-full h-full" />;
}
