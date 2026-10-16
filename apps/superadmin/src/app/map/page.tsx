"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

export default function GodModeMap() {
  const [mapplsLoaded, setMapplsLoaded] = useState(false);
  const mapRef = useRef<any>(null);
  const [riders, setRiders] = useState([
    { id: '1', name: 'Rider 1 (Raju)', lat: 14.4752, lng: 78.8228, status: 'Active' },
    { id: '2', name: 'Rider 2 (Suresh)', lat: 14.4841, lng: 78.8251, status: 'Busy' },
    { id: '3', name: 'Rider 3 (Kiran)', lat: 14.4600, lng: 78.8100, status: 'Active' },
  ]);

  useEffect(() => {
    async function initMappls() {
      try {
        const res = await fetch('http://localhost:5005/api/mappls/token', { method: 'POST' });
        const data = await res.json();
        if (data.access_token) {
          if (!document.getElementById('mappls-superadmin-sdk')) {
            const script = document.createElement('script');
            script.id = 'mappls-superadmin-sdk';
            script.src = `https://apis.mappls.com/advancedmaps/api/${data.access_token}/map_sdk?layer=vector&v=3.0`;
            script.async = true;
            script.onload = () => setMapplsLoaded(true);
            document.head.appendChild(script);
          } else if ((window as any).mappls?.Map) {
            setMapplsLoaded(true);
          }
        }
      } catch (err) {
        console.error('Failed to load Mappls token for superadmin', err);
      }
    }
    initMappls();
  }, []);

  useEffect(() => {
    if (mapplsLoaded && !mapRef.current) {
      const container = document.getElementById('superadmin-mappls-map');
      if (container && (window as any).mappls?.Map) {
        mapRef.current = new (window as any).mappls.Map(container, {
          center: [14.4752, 78.8228],
          zoom: 14,
          zoomControl: true,
          fullscreenControl: true,
          backgroundColor: '#F8FAFC'
        });

        riders.forEach((rider) => {
          new (window as any).mappls.Marker({
            map: mapRef.current,
            position: { lat: rider.lat, lng: rider.lng },
            html: `<div style="background:#FFF;padding:4px 8px;border-radius:12px;box-shadow:0 2px 6px rgba(0,0,0,0.2);display:flex;align-items:center;gap:4px;border:1px solid #E2E8F0;font-size:12px;font-weight:700;"><span style="color:${rider.status === 'Active' ? '#16A34A' : '#EA580C'};">●</span> ${rider.name}</div>`,
          });
        });
      }
    }
  }, [mapplsLoaded, riders]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow px-8 py-4 flex justify-between items-center z-10 relative">
        <div>
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mb-1 inline-block">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">God-Mode Map 🌍 (Mappls Edition)</h1>
        </div>
        <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 text-sm font-medium text-indigo-700 shadow-sm flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span>Live Mappls Fleet: {riders.length} Active Units</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative z-0">
        <div 
          id="superadmin-mappls-map" 
          style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} 
        />
        {!mapplsLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-3"></div>
              <p className="text-sm font-medium text-gray-600">Connecting to Mappls Vector Tiles...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
