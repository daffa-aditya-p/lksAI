"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from "react";
import L from "leaflet";

export interface UserMiniMapRef {
  centerToPosko: () => void;
  openPopup: () => void;
  setCategoryLocation: (category: string) => { nama: string; jarak: string };
}

interface PoskoMarkerData {
  id: string;
  namaPosko: string;
  areaPublik: string;
  alamatText: string;
  lat: number;
  lng: number;
  tipe: "pengungsian" | "medis" | "logistik";
  kebutuhan: string[];
}

export const FALLBACK_LOKASI: Record<string, { coords: [number, number]; nama: string; jarak: string }> = {
  "Posko Terdekat": {
    coords: [-6.2245, 106.8665],
    nama: "Posko Pengungsian RW 05 Kampung Melayu",
    jarak: "1,2 km Tersedia",
  },
  "Layanan Medis": {
    coords: [-6.2218, 106.8692],
    nama: "Pos Medis Darurat Kampung Melayu",
    jarak: "0,8 km Siaga 24 Jam",
  },
  "Kebutuhan Logistik": {
    coords: [-6.2265, 106.8635],
    nama: "Gudang Logistik & Dapur Umum RW 03",
    jarak: "1,5 km Tersedia",
  },
  "Cari Bantuan": {
    coords: [-6.2245, 106.8665],
    nama: "Posko Pengungsian RW 05 Kampung Melayu",
    jarak: "1,2 km Tersedia",
  },
};

const UserMiniMap = forwardRef<
  UserMiniMapRef,
  { onSelectLocation?: (info: { nama: string; jarak: string }) => void }
>(({ onSelectLocation }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const primaryMarkerRef = useRef<L.Marker | null>(null);
  const [poskoList, setPoskoList] = useState<PoskoMarkerData[]>([]);

  // Default focus: Kampung Melayu, Jakarta Timur
  const defaultCoords: [number, number] = [-6.2245, 106.8665];

  // Helper create custom pin icon
  const createPinIcon = (tipe: "pengungsian" | "medis" | "logistik", isPrimary = false) => {
    let bgColor = "#10222E"; // Default navy posko
    let iconSvg = `
      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3l9-8z"/>
      </svg>`;

    if (tipe === "medis") {
      bgColor = "#C8102E"; // Merah PMI / Medis
      iconSvg = `
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 5v14M5 12h14" stroke-linecap="round"/>
        </svg>`;
    } else if (tipe === "logistik") {
      bgColor = "#FFA800"; // Kuning-Oranye Logistik
      iconSvg = `
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 7l-8-4-8 4 8 4 8-4zM4 9v6l8 4 8-4V9l-8 4-8-4z"/>
        </svg>`;
    }

    const pinSize = isPrimary ? 34 : 28;
    const anchor = isPrimary ? 17 : 14;

    return L.divIcon({
      className: "custom-posko-pin",
      html: `
        <div class="relative flex items-center justify-center">
          ${isPrimary ? '<span class="animate-ping absolute inline-flex h-9 w-9 rounded-full bg-cyan-400 opacity-60"></span>' : ""}
          <div style="background-color: ${bgColor}; width: ${pinSize}px; height: ${pinSize}px;" class="relative rounded-full border-2 border-white shadow-md flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform">
            ${iconSvg}
          </div>
        </div>
      `,
      iconSize: [pinSize, pinSize],
      iconAnchor: [anchor, anchor],
      popupAnchor: [0, -anchor],
    });
  };

  useImperativeHandle(ref, () => ({
    centerToPosko: () => {
      if (!mapInstanceRef.current) return;
      mapInstanceRef.current.flyTo(defaultCoords, 16, { duration: 0.8 });
    },
    openPopup: () => {
      if (!mapInstanceRef.current || !primaryMarkerRef.current) return;
      mapInstanceRef.current.flyTo(primaryMarkerRef.current.getLatLng(), 16, { duration: 0.6 });
      primaryMarkerRef.current.openPopup();
    },
    setCategoryLocation: (category: string) => {
      if (!mapInstanceRef.current) {
        const item = FALLBACK_LOKASI[category] || FALLBACK_LOKASI["Posko Terdekat"];
        return { nama: item.nama, jarak: item.jarak };
      }

      // Filter posko matching category if available in poskoList
      let target: PoskoMarkerData | undefined;
      let matchedInfo = {
        nama: "Posko Pengungsian RW 05",
        jarak: "1,2 km Tersedia",
      };

      if (category === "Layanan Medis") {
        target = poskoList.find((p) => p.tipe === "medis");
        matchedInfo = {
          nama: target ? target.namaPosko : "Pos Medis Darurat Kampung Melayu",
          jarak: "0,8 km Siaga 24 Jam",
        };
      } else if (category === "Kebutuhan Logistik") {
        target = poskoList.find((p) => p.tipe === "logistik");
        matchedInfo = {
          nama: target ? target.namaPosko : "Gudang Logistik & Dapur Umum RW 03",
          jarak: "1,5 km Tersedia",
        };
      } else {
        target = poskoList.find((p) => p.tipe === "pengungsian") || poskoList[0];
        matchedInfo = {
          nama: target ? target.namaPosko : "Posko Pengungsian RW 05",
          jarak: "1,2 km Tersedia",
        };
      }

      const coords: [number, number] = target ? [target.lat, target.lng] : defaultCoords;
      mapInstanceRef.current.flyTo(coords, 16, { duration: 0.7 });

      // Open popup if primary marker or target exists
      if (primaryMarkerRef.current) {
        primaryMarkerRef.current.setLatLng(coords);
        primaryMarkerRef.current.setPopupContent(
          `<b>${matchedInfo.nama}</b><br><span style="font-size:11px;color:#555;">Kapasitas: ${matchedInfo.jarak}</span>`
        );
        primaryMarkerRef.current.openPopup();
      }

      return matchedInfo;
    },
  }));

  // Inisialisasi Map Leaflet menggunakan OpenStreetMap standar (100% Bebas API Key)
  useEffect(() => {
    if (!containerRef.current || mapInstanceRef.current) return;

    const map = L.map(containerRef.current, {
      center: defaultCoords,
      zoom: 15,
      zoomControl: false,
      attributionControl: true,
      minZoom: 10,
      maxZoom: 18,
    });

    // Gunakan OpenStreetMap standar — 100% FREE & ZERO API KEY
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      className: "custom-map-tiles",
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = layerGroup;

    // Primary marker default
    const primaryIcon = createPinIcon("pengungsian", true);
    const marker = L.marker(defaultCoords, { icon: primaryIcon })
      .addTo(layerGroup)
      .bindPopup(
        '<b>Posko Pengungsian RW 05 Kampung Melayu</b><br><span style="font-size:11px;color:#555;">Kapasitas: Tersedia (1,2 km)</span>'
      );

    marker.on("click", () => {
      onSelectLocation?.({
        nama: "Posko Pengungsian RW 05 Kampung Melayu",
        jarak: "1,2 km Tersedia",
      });
    });

    mapInstanceRef.current = map;
    primaryMarkerRef.current = marker;

    // Perbaiki ukuran container agar tile langsung ter-render tanpa lag
    const t1 = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    const t2 = setTimeout(() => {
      map.invalidateSize();
    }, 600);

    const handleResize = () => map.invalidateSize();
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", handleResize);
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
      primaryMarkerRef.current = null;
    };
  }, [onSelectLocation]);

  // Fetch semua posko riil dari endpoint database
  useEffect(() => {
    fetch("/api/posko")
      .then((res) => res.json())
      .then((json) => {
        if (!json.ok || !Array.isArray(json.data) || !mapInstanceRef.current || !markersLayerRef.current) {
          return;
        }

        const items: PoskoMarkerData[] = json.data;
        setPoskoList(items);

        // Render semua marker posko ke peta
        markersLayerRef.current.clearLayers();

        items.forEach((p, idx) => {
          const isPrimary = idx === 0 || p.namaPosko.includes("RW 05");
          const icon = createPinIcon(p.tipe, isPrimary);
          const marker = L.marker([p.lat, p.lng], { icon }).addTo(markersLayerRef.current!);

          const badgeTipe =
            p.tipe === "medis" ? "Layanan Medis" : p.tipe === "logistik" ? "Dapur Umum & Logistik" : "Pengungsian";

          marker.bindPopup(`
            <div style="min-width: 170px;">
              <b style="font-size: 13px; color: #10222E;">${p.namaPosko}</b>
              <p style="font-size: 11px; color: #666; margin: 3px 0 2px;">${p.areaPublik}</p>
              <span style="display:inline-block; font-size: 10px; font-weight:600; padding: 2px 6px; border-radius: 99px; background: #e0f2fe; color: #0284c7; margin-top: 4px;">
                ${badgeTipe}
              </span>
            </div>
          `);

          marker.on("click", () => {
            onSelectLocation?.({
              nama: p.namaPosko,
              jarak: "Tersedia di Lokasi",
            });
          });

          if (isPrimary) {
            primaryMarkerRef.current = marker;
          }
        });
      })
      .catch((err) => {
        console.warn("[UserMiniMap] Gagal mengambil data posko:", err);
      });
  }, [onSelectLocation]);

  return <div ref={containerRef} className="w-full h-full z-10" />;
});

UserMiniMap.displayName = "UserMiniMap";

export default UserMiniMap;
