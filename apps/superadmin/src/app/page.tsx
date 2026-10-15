"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function SuperadminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5005/api/admin/dashboard');
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500 text-xl font-semibold">Failed to load dashboard data. Ensure backend is running.</div>
      </div>
    );
  }

  const { stats, recentOrders, recentRides } = data;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">MS Happido <span className="text-indigo-600">Superadmin</span></h1>
          <div className="flex space-x-4">
            <a href="/kyc" className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow text-sm font-medium hover:bg-indigo-700 transition">
              Verify KYC
            </a>
            <a href="/map" className="bg-teal-600 text-white px-4 py-2 rounded-lg shadow text-sm font-medium hover:bg-teal-700 transition">
              God-Mode Map 🌍
            </a>
            <div className="bg-white px-4 py-2 rounded-lg shadow text-sm font-medium text-gray-600">
              Live Monitoring Active 🟢
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Users" value={stats.totalUsers} color="bg-blue-500" />
          <StatCard title="Total Customers" value={stats.totalCustomers} color="bg-indigo-500" />
          <StatCard title="Total Riders" value={stats.totalRiders} color="bg-teal-500" />
          <StatCard title="Total Restaurants" value={stats.totalRestaurants} color="bg-orange-500" />
          
          <StatCard title="Total Orders" value={stats.totalOrders} color="bg-green-500" />
          <StatCard title="Total Rides" value={stats.totalRides} color="bg-purple-500" />
          <StatCard title="Emergency Blood Req." value={stats.totalBloodRequests} color="bg-red-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">Recent Food Orders</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {recentOrders.length === 0 ? (
                <div className="p-6 text-gray-500 text-center text-sm">No recent orders found.</div>
              ) : (
                recentOrders.map((order: any) => (
                  <div key={order._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-900">Order #{order._id.substring(order._id.length - 6)}</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="text-sm text-gray-500 mt-1">Customer: {order.customer?.name || 'Unknown'}</div>
                    <div className="text-sm text-gray-500">Total: ${order.totalAmount?.toFixed(2)}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Rides */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">Recent Rides</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {recentRides.length === 0 ? (
                <div className="p-6 text-gray-500 text-center text-sm">No recent rides found.</div>
              ) : (
                recentRides.map((ride: any) => (
                  <div key={ride._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-900">Ride #{ride._id.substring(ride._id.length - 6)}</span>
                      <StatusBadge status={ride.status} />
                    </div>
                    <div className="text-sm text-gray-500 mt-1">Customer: {ride.customer?.name || 'Unknown'}</div>
                    <div className="text-sm text-gray-500">Rider: {ride.rider?.name || 'Unassigned'}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string, value: number, color: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
      <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <div className={`mt-4 h-1 w-full rounded-full ${color} opacity-75`}></div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const getColors = () => {
    switch(status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'completed': case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getColors()}`}>
      {status}
    </span>
  );
}
