"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import react-leaflet components to avoid SSR errors
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon issues in Next.js
const fixLeafletIcons = () => {
  if (typeof window !== 'undefined') {
    const L = require('leaflet');
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }
};

export default function GodModeMap() {
  const [isClient, setIsClient] = useState(false);
  const [riders, setRiders] = useState([
    { id: '1', name: 'Rider 1', lat: 17.3850, lng: 78.4867, status: 'Active' },
    { id: '2', name: 'Rider 2', lat: 17.3870, lng: 78.4880, status: 'Busy' },
    { id: '3', name: 'Rider 3', lat: 17.3820, lng: 78.4810, status: 'Active' },
  ]);

  useEffect(() => {
    fixLeafletIcons();
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow px-8 py-4 flex justify-between items-center z-10 relative">
        <div>
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mb-1 inline-block">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">God-Mode Map 🌍</h1>
        </div>
        <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 text-sm font-medium text-indigo-700 shadow-sm flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span>Live Tracking {riders.length} Riders</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative z-0">
        <MapContainer
          center={[17.3850, 78.4867]}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {riders.map((rider) => (
            <Marker key={rider.id} position={[rider.lat, rider.lng]}>
              <Popup>
                <div className="text-center">
                  <div className="font-bold text-gray-900">{rider.name}</div>
                  <div className={`text-xs mt-1 font-medium ${rider.status === 'Active' ? 'text-green-600' : 'text-orange-500'}`}>
                    {rider.status}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
