"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { PoskoMapData } from "./page";

interface GoogleMapLeafletProps {
  poskoList: PoskoMapData[];
  selectedPosko: PoskoMapData | null;
  onSelectPosko: (posko: PoskoMapData) => void;
  userLocation: { lat: number; lng: number };
  activeRoute: PoskoMapData | null;
  centerTrigger?: number;
}

export default function GoogleMapLeaflet({
  poskoList,
  selectedPosko,
  onSelectPosko,
  userLocation,
  activeRoute,
  centerTrigger,
}: GoogleMapLeafletProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  // Inisialisasi Peta Leaflet
  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      const initialCenter: [number, number] = [
        userLocation.lat || -6.2245,
        userLocation.lng || 106.8665,
      ];

      const map = L.map(containerRef.current, {
        center: initialCenter,
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      // Layer peta CartoDB Positron bergaya Google Maps yang bersih dan elegan
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          subdomains: "abcd",
        }
      ).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update User Marker (Google Maps Blue Pulsing Dot)
  useEffect(() => {
    if (!mapRef.current) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      const userDotIcon = L.divIcon({
        className: "google-user-location-pin",
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute inline-flex w-8 h-8 rounded-full bg-blue-500/35 animate-ping"></span>
            <span class="absolute inline-flex w-6 h-6 rounded-full bg-blue-400/50"></span>
            <div class="relative w-4 h-4 rounded-full bg-[#007AFF] border-[2.5px] border-white shadow-[0_2px_8px_rgba(0,122,255,0.6)]"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([userLocation.lat, userLocation.lng], {
        icon: userDotIcon,
        zIndexOffset: 1000,
      });
      marker.bindTooltip("Lokasi Kamu Saat Ini", {
        direction: "top",
        offset: [0, -12],
        className: "user-loc-tooltip font-semibold text-[11px]",
      });
      marker.addTo(mapRef.current);
      userMarkerRef.current = marker;
    }
  }, [userLocation]);

  // Render Posko Markers
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    poskoList.forEach((posko) => {
      const isSelected = selectedPosko?.id === posko.id;
      const isRouteTarget = activeRoute?.id === posko.id;

      // Warna & Ikon pin
      let pinColor = "#0F1E26"; // Navy default
      let iconSvg = `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3l9-8z"/></svg>`;

      if (posko.tipe === "medis") {
        pinColor = "#C8102E"; // Red PMI
        iconSvg = `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>`;
      } else if (posko.tipe === "logistik") {
        pinColor = "#FFA800"; // Amber
        iconSvg = `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20 7l-8-4-8 4 8 4 8-4zM4 9v6l8 4 8-4V9l-8 4-8-4z"/></svg>`;
      }

      const pinSize = isSelected || isRouteTarget ? 40 : 32;
      const anchor = isSelected || isRouteTarget ? 20 : 16;

      const customPin = L.divIcon({
        className: "custom-posko-map-pin",
        html: `
          <div class="relative flex flex-col items-center group cursor-pointer">
            ${
              isSelected || isRouteTarget
                ? '<span class="absolute -top-1 inline-flex w-11 h-11 rounded-full bg-cyan-400/50 animate-ping"></span>'
                : ""
            }
            <div style="background-color: ${pinColor}; width: ${pinSize}px; height: ${pinSize}px;"
                 class="relative rounded-full border-2 border-white shadow-[0_4px_12px_rgba(0,0,0,0.3)] flex items-center justify-center text-white transition-all transform hover:scale-115 ${
                   isSelected ? "ring-4 ring-[#00A8B8] ring-offset-1 scale-110" : ""
                 }">
              ${iconSvg}
            </div>
            <!-- Segitiga Pin Bawah -->
            <div style="border-top-color: ${pinColor};"
                 class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] -mt-[1px] drop-shadow-sm"></div>
          </div>
        `,
        iconSize: [pinSize, pinSize + 6],
        iconAnchor: [anchor, pinSize + 6],
        popupAnchor: [0, -(pinSize + 6)],
      });

      const marker = L.marker([posko.lat, posko.lng], { icon: customPin });
      marker.on("click", () => {
        onSelectPosko(posko);
      });

      marker.addTo(markersLayerRef.current!);
    });
  }, [poskoList, selectedPosko, activeRoute, onSelectPosko]);

  // Center or Pan to Selected Posko
  useEffect(() => {
    if (!mapRef.current || !selectedPosko) return;
    mapRef.current.flyTo([selectedPosko.lat, selectedPosko.lng], 16, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [selectedPosko, centerTrigger]);

  // Render Rute Navigasi Google Maps Style Polyline
  useEffect(() => {
    if (!mapRef.current) return;

    if (routePolylineRef.current) {
      mapRef.current.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    if (activeRoute) {
      // Simulasikan rute berbelok realistis antara titik user dan posko tujuan
      const startLat = userLocation.lat;
      const startLng = userLocation.lng;
      const endLat = activeRoute.lat;
      const endLng = activeRoute.lng;

      // Titik tengah berbelok realistis mengikuti grid jalan kota
      const midLat = startLat + (endLat - startLat) * 0.55;
      const midLng = startLng + (endLng - startLng) * 0.45;

      const routePoints: [number, number][] = [
        [startLat, startLng],
        [midLat, startLng],
        [midLat, midLng],
        [endLat, endLng],
      ];

      // Garis rute utama biru Google Maps
      const polyline = L.polyline(routePoints, {
        color: "#007AFF",
        weight: 6,
        opacity: 0.92,
        lineJoin: "round",
        lineCap: "round",
      });

      polyline.addTo(mapRef.current);
      routePolylineRef.current = polyline;

      // Zoom dan sesuaikan bounds agar seluruh rute terlihat
      mapRef.current.fitBounds(polyline.getBounds(), {
        padding: [80, 80],
        maxZoom: 16,
      });
    }
  }, [activeRoute, userLocation]);

  return <div ref={containerRef} className="w-full h-full" />;
}
