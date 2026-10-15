"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function KYCVerification() {
  const [kycRequests, setKycRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingKYC();
  }, []);

  const fetchPendingKYC = async () => {
    try {
      const response = await axios.get('http://localhost:5005/api/admin/kyc/pending');
      setKycRequests(response.data);
    } catch (error) {
      console.error("Failed to fetch KYC requests", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, action: 'approve' | 'reject') => {
    setProcessingId(id);
    try {
      await axios.put(`http://localhost:5005/api/admin/kyc/${id}/approve`, { action });
      // Remove the item from the list
      setKycRequests((prev) => prev.filter((req) => req._id !== id));
      alert(`KYC request ${action}d successfully`);
    } catch (error) {
      console.error(`Failed to ${action} KYC`, error);
      alert(`Failed to ${action} KYC request.`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mb-2 inline-block">
              &larr; Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">KYC Verification</h1>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow text-sm font-medium text-gray-600">
            {kycRequests.length} Pending Requests
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
          {kycRequests.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-medium text-gray-900">All caught up!</h3>
              <p className="mt-2">No pending KYC verification requests.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {kycRequests.map((request) => (
                <li key={request._id} className="p-6 hover:bg-gray-50 transition duration-150">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                          {request.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="ml-4">
                          <h2 className="text-lg font-medium text-gray-900">{request.user?.name || 'Unknown User'}</h2>
                          <div className="text-sm text-gray-500">
                            {request.user?.phone} • {request.user?.role}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="block font-medium text-gray-500 text-xs uppercase tracking-wider mb-1">Aadhar Number</span>
                          {request.aadharNumber}
                        </div>
                        <div>
                          <span className="block font-medium text-gray-500 text-xs uppercase tracking-wider mb-1">PAN Number</span>
                          {request.panNumber}
                        </div>
                      </div>
                      
                      <div className="mt-4 flex space-x-4">
                        <a href={request.aadharImageUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium underline">
                          View Aadhar
                        </a>
                        <a href={request.panImageUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium underline">
                          View PAN
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 mt-4 md:mt-0">
                      <button
                        onClick={() => handleApprove(request._id, 'reject')}
                        disabled={processingId === request._id}
                        className="px-4 py-2 border border-red-300 text-red-700 bg-white hover:bg-red-50 rounded-md shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(request._id, 'approve')}
                        disabled={processingId === request._id}
                        className="px-4 py-2 border border-transparent text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        {processingId === request._id ? 'Processing...' : 'Approve'}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
