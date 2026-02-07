'use client';

import { useEffect, useState } from 'react';
import { FiHome, FiHeart, FiSearch, FiRefreshCw } from 'react-icons/fi';
import { api } from '@/lib/api';
import { format } from 'date-fns';

export default function ProvidersPage() {
  const [tab, setTab] = useState<'daycare' | 'eldercare'>('daycare');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [daycares, setDaycares] = useState<any[]>([]);
  const [eldercare, setEldercare] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [approvedDaycares, pendingDaycares, approvedElders, pendingElders] = await Promise.all([
        api.getDaycareProviders('limit=100'),
        api.getPendingDaycares(),
        api.getElderCareProviders('limit=100'),
        api.getPendingElderCare(),
      ]);

      const pendingDaycareList = pendingDaycares.data?.providers || [];
      const approvedDaycareList = approvedDaycares.data?.daycares || [];
      const mergedDaycares = [...pendingDaycareList, ...approvedDaycareList];

      const pendingElderList = pendingElders.data?.providers || [];
      const approvedElderList = approvedElders.data?.caregivers || [];
      const mergedElders = [...pendingElderList, ...approvedElderList];

      setDaycares(mergedDaycares);
      setEldercare(mergedElders);
    } catch (error) {
      console.error('Failed to load providers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filterList = (list: any[]) => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((p) => {
      const name = p.centerName || p.name || '';
      const owner = p.ownerName || '';
      const city = p.address?.city || '';
      const phone = p.phoneNumber || '';
      return [name, owner, city, phone].some((v) => v.toLowerCase().includes(q));
    });
  };

  const list = tab === 'daycare' ? filterList(daycares) : filterList(eldercare);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Providers</h1>
          <p className="text-gray-500 text-sm mt-1">All registered daycare and elder care providers</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50"
        >
          <FiRefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setTab('daycare')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
            tab === 'daycare' ? 'bg-red-600 text-white shadow-md shadow-red-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <FiHome className="w-4 h-4" /> Daycare ({daycares.length})
        </button>
        <button
          onClick={() => setTab('eldercare')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
            tab === 'eldercare' ? 'bg-red-600 text-white shadow-md shadow-red-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <FiHeart className="w-4 h-4" /> Elder Care ({eldercare.length})
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[250px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, owner, city, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        {loading ? (
          <p className="text-center py-10 text-gray-400">Loading...</p>
        ) : list.length === 0 ? (
          <p className="text-center py-10 text-gray-400">No providers found</p>
        ) : (
          <div className="space-y-3">
            {list.map((p) => (
              <div key={p._id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-red-50/20 transition">
                <div>
                  <p className="font-semibold text-gray-800">
                    {tab === 'daycare' ? (p.centerName || 'Daycare Center') : (p.name || 'Caregiver')}
                  </p>
                  <p className="text-sm text-gray-500">
                    {tab === 'daycare' ? (p.ownerName || 'Owner') : (p.phoneNumber || '')} • {p.phoneNumber}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {p.address?.city || 'City not set'} • Registered {format(new Date(p.createdAt), 'dd MMM yyyy')}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold capitalize ${
                    p.verificationStatus === 'approved' ? 'bg-green-100 text-green-700' :
                    p.verificationStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {p.verificationStatus || 'pending'}
                  </span>
                  <p className="text-sm font-semibold text-gray-800 mt-2">
                    {p.adminEstimatedPrice ? `₹${p.adminEstimatedPrice.toLocaleString('en-IN')}` : 'Price on request'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
