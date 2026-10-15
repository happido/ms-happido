"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { Users, Activity, ShieldCheck, MapPin, Search, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

const API_URL = 'http://localhost:5005/api';
const SOCKET_URL = 'http://localhost:5005';

export default function SuperadminPortal() {
  const [activeTab, setActiveTab] = useState<'overview' | 'kyc' | 'map'>('overview');
  const [kycFilter, setKycFilter] = useState<'rider' | 'restaurant'>('rider');
  const [stats, setStats] = useState<any>(null);
  const [pendingKyc, setPendingKyc] = useState<any[]>([]);
  const [onlineRiders, setOnlineRiders] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchPendingKyc();

    const socket: Socket = io(SOCKET_URL);
    socket.on('connect', () => {
      console.log('Admin connected to socket');
      socket.emit('joinAdmin');
    });
    
    // Simulate picking up online riders
    socket.on('riderLocationUpdate', (data) => {
      setOnlineRiders(prev => {
        const exists = prev.find(r => r.riderId === data.riderId);
        if (exists) {
          return prev.map(r => r.riderId === data.riderId ? { ...r, location: data.location } : r);
        }
        return [...prev, { ...data, timestamp: Date.now() }];
      });
    });

    return () => { socket.disconnect(); };
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/dashboard`);
      setStats(res.data.stats);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPendingKyc = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/kyc/pending`);
      setPendingKyc(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const approveKyc = async (id: string) => {
    try {
      await axios.put(`${API_URL}/admin/kyc/${id}/approve`);
      setPendingKyc(prev => prev.filter(r => r._id !== id));
      fetchStats();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans selection:bg-emerald-500/30">
      {/* Sidebar */}
      <nav className="fixed top-0 left-0 h-full w-64 bg-[#0F172A] border-r border-slate-800 p-6 flex flex-col">
        <div className="flex items-center space-x-3 mb-12">
          <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center font-black text-slate-900">H</div>
          <span className="text-xl font-bold tracking-tight text-white">Happido Admin</span>
        </div>

        <div className="space-y-2 flex-1">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'overview' ? 'bg-emerald-500/10 text-emerald-400' : 'hover:bg-slate-800 text-slate-400'}`}>
            <Activity size={18} /><span>Overview</span>
          </button>
          <button onClick={() => setActiveTab('map')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'map' ? 'bg-emerald-500/10 text-emerald-400' : 'hover:bg-slate-800 text-slate-400'}`}>
            <MapPin size={18} /><span>God's Eye Map</span>
          </button>
          <button onClick={() => setActiveTab('kyc')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'kyc' ? 'bg-emerald-500/10 text-emerald-400' : 'hover:bg-slate-800 text-slate-400'}`}>
            <ShieldCheck size={18} />
            <span>KYC Approvals</span>
            {pendingKyc.length > 0 && <span className="ml-auto bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingKyc.length}</span>}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="ml-64 p-10 min-h-screen">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {activeTab === 'overview' ? 'Command Center' : activeTab === 'kyc' ? 'Verification Desk' : 'God\'s Eye Map'}
            </h1>
            <p className="text-slate-500 mt-1">Real-time ecosystem monitoring</p>
          </div>
          <div className="flex items-center space-x-4 bg-[#0F172A] px-4 py-2 rounded-full border border-slate-800">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm font-medium text-emerald-400">System Nominal</span>
          </div>
        </header>

        {activeTab === 'overview' && stats && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* KPI Grid */}
            <div className="grid grid-cols-4 gap-6">
              {[
                { label: 'Total Customers', val: stats.totalCustomers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                { label: 'Active Riders', val: stats.totalRiders, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                { label: 'Partner Restaurants', val: stats.totalRestaurants, icon: MapPin, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                { label: 'Completed Rides', val: stats.totalRides, icon: CheckCircle2, color: 'text-purple-400', bg: 'bg-purple-400/10' }
              ].map((k, i) => (
                <div key={i} className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-colors">
                  <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-20 -mr-4 -mt-4 transition-transform group-hover:scale-110 ${k.bg}`}></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-slate-400 mb-1">{k.label}</p>
                      <h3 className="text-4xl font-black text-white">{k.val}</h3>
                    </div>
                    <div className={`p-3 rounded-xl ${k.bg} ${k.color}`}>
                      <k.icon size={24} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Simulated Live Chart Area */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 h-96 flex flex-col">
              <h3 className="text-lg font-bold text-white mb-6">Live Transaction Volume</h3>
              <div className="flex-1 flex items-end space-x-2">
                {Array.from({ length: 40 }).map((_, i) => {
                  const h = Math.floor(Math.random() * 80) + 10;
                  return (
                    <div key={i} className="flex-1 bg-slate-800 rounded-t-sm hover:bg-emerald-500 transition-colors relative group" style={{ height: `${h}%` }}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100">{h}k</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'kyc' && (
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden animate-in fade-in duration-500">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#131C31]">
              <div className="flex space-x-2 bg-slate-800/50 p-1 rounded-lg">
                <button 
                  onClick={() => setKycFilter('rider')}
                  className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${kycFilter === 'rider' ? 'bg-emerald-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  Riders
                </button>
                <button 
                  onClick={() => setKycFilter('restaurant')}
                  className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${kycFilter === 'restaurant' ? 'bg-emerald-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  Restaurants
                </button>
              </div>
              <div className="bg-slate-800 px-3 py-1.5 rounded-md flex items-center space-x-2">
                <Search size={14} className="text-slate-400" />
                <input type="text" placeholder={`Search ${kycFilter}s...`} className="bg-transparent text-sm text-white focus:outline-none placeholder-slate-500" />
              </div>
            </div>
            
            <div className="divide-y divide-slate-800/50 max-h-[70vh] overflow-y-auto">
              {pendingKyc.filter(k => k.role === kycFilter).length === 0 ? (
                <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                  <ShieldCheck size={48} className="opacity-20 mb-4" />
                  <p>All clear! No pending {kycFilter} verifications.</p>
                </div>
              ) : (
                pendingKyc.filter(k => k.role === kycFilter).map((item) => (
                  <div key={item._id} className="p-6 flex items-start justify-between hover:bg-slate-800/30 transition-colors">
                    <div className="flex space-x-6">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 text-xl border border-slate-700">
                        {(item.restaurantName || item.name || 'U').charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white flex items-center">
                          {item.restaurantName || item.name}
                          <span className="ml-3 text-xs bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">Under Review</span>
                        </h4>
                        <div className="flex space-x-4 mt-2 text-sm text-slate-400">
                          <span className="flex items-center"><AlertCircle size={14} className="mr-1" /> {item.phone || item.email}</span>
                          {kycFilter === 'rider' && <span className="flex items-center"><MapPin size={14} className="mr-1" /> {item.vehicleDetails}</span>}
                        </div>
                        
                        <div className="mt-4 flex flex-wrap gap-4">
                          {kycFilter === 'rider' ? (
                            <>
                              <div className="relative group cursor-pointer">
                                <div className="w-32 h-20 bg-slate-800 rounded-lg overflow-hidden border border-slate-700 relative">
                                  <img src={item.documents?.profilePhotoUrl || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=300&q=80'} alt="Profile" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <p className="text-xs text-center mt-1 text-slate-500 font-medium">Selfie</p>
                              </div>
                              <div className="relative group cursor-pointer">
                                <div className="w-32 h-20 bg-slate-800 rounded-lg overflow-hidden border border-slate-700 relative">
                                  <img src={item.documents?.licenseUrl || 'https://images.unsplash.com/photo-1621252179027-94459d278660?auto=format&fit=crop&w=300&q=80'} alt="License" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <p className="text-xs text-center mt-1 text-slate-500 font-medium">Driving License</p>
                              </div>
                              <div className="relative group cursor-pointer">
                                <div className="w-32 h-20 bg-slate-800 rounded-lg overflow-hidden border border-slate-700 relative">
                                  <img src={item.documents?.rcUrl || 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=300&q=80'} alt="RC" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <p className="text-xs text-center mt-1 text-slate-500 font-medium">Vehicle RC</p>
                              </div>
                              <div className="relative group cursor-pointer">
                                <div className="w-32 h-20 bg-slate-800 rounded-lg overflow-hidden border border-emerald-500/50 relative">
                                  <img src={item.documents?.aadharUrl || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=300&q=80'} alt="Aadhar" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                  <div className="absolute top-1 right-1 bg-emerald-500 text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg">✅ API Verified</div>
                                </div>
                                <p className="text-xs text-center mt-1 text-emerald-400 font-bold">Aadhar: <span className="text-white font-normal">{item.documents?.aadharNumber}</span></p>
                              </div>
                              <div className="relative group cursor-pointer">
                                <div className="w-32 h-20 bg-slate-800 rounded-lg overflow-hidden border border-emerald-500/50 relative">
                                  <img src={item.documents?.riderPanUrl || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=300&q=80'} alt="PAN" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                  <div className="absolute top-1 right-1 bg-emerald-500 text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg">✅ API Verified</div>
                                </div>
                                <p className="text-xs text-center mt-1 text-emerald-400 font-bold">PAN: <span className="text-white font-normal">{item.documents?.riderPanNumber}</span></p>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="relative group cursor-pointer">
                                <div className="w-32 h-20 bg-slate-800 rounded-lg overflow-hidden border border-slate-700 relative">
                                  <img src={item.documents?.fssaiUrl || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=300&q=80'} alt="FSSAI" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                  <div className="absolute top-1 right-1 bg-emerald-500 text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg">✅ API Verified</div>
                                </div>
                                <p className="text-xs text-center mt-1 text-emerald-400 font-bold">FSSAI: <span className="text-white font-normal">{item.documents?.fssaiNumber}</span></p>
                              </div>
                              <div className="relative group cursor-pointer">
                                <div className="w-32 h-20 bg-slate-800 rounded-lg overflow-hidden border border-slate-700 relative">
                                  <img src={item.documents?.panUrl || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=300&q=80'} alt="PAN" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                  <div className="absolute top-1 right-1 bg-emerald-500 text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg">✅ API Verified</div>
                                </div>
                                <p className="text-xs text-center mt-1 text-emerald-400 font-bold">PAN: <span className="text-white font-normal">{item.documents?.panNumber}</span></p>
                              </div>
                              <div className="relative group cursor-pointer">
                                <div className="w-32 h-20 bg-slate-800 rounded-lg overflow-hidden border border-slate-700 relative">
                                  <img src={item.documents?.cancelledChequeUrl || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=300&q=80'} alt="Cheque" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <p className="text-xs text-center mt-1 text-slate-500 font-medium">A/C: <span className="text-white">{item.bankDetails?.accountNumber}</span></p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button onClick={() => approveKyc(item._id)} className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-6 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors shadow-lg shadow-emerald-500/20">
                        <CheckCircle2 size={18} /><span>Approve</span>
                      </button>
                      <button className="bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 font-bold px-6 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors border border-slate-700 hover:border-rose-500/30">
                        <XCircle size={18} /><span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="w-full h-[80vh] bg-[#0A0F1C] rounded-2xl border border-slate-800 overflow-hidden relative animate-in fade-in duration-500">
            {/* Simulated Cyberpunk Map Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0F172A_1px,transparent_1px),linear-gradient(to_bottom,#0F172A_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
            
            {/* Glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]"></div>

            {/* Random Simulated Riders moving across the grid */}
            {Array.from({ length: 15 }).map((_, i) => (
              <div 
                key={i} 
                className="absolute w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,1)]"
                style={{
                  top: `${Math.floor(Math.random() * 80 + 10)}%`,
                  left: `${Math.floor(Math.random() * 80 + 10)}%`,
                  animation: `ping 3s cubic-bezier(0, 0, 0.2, 1) infinite ${i * 0.2}s`
                }}
              >
                <div className="absolute -inset-2 rounded-full border border-emerald-400/30 animate-pulse"></div>
              </div>
            ))}

            <div className="absolute bottom-6 left-6 bg-[#0F172A]/90 backdrop-blur border border-slate-800 p-4 rounded-xl">
              <h3 className="font-bold text-white mb-2">Live Activity</h3>
              <div className="flex items-center space-x-2 text-sm text-slate-400 mb-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span>15 Active Riders</span></div>
              <div className="flex items-center space-x-2 text-sm text-slate-400"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span>4 Active Deliveries</span></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
