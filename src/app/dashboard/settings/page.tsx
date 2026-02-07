'use client';

import { useState, useEffect } from 'react';
import { FiUserPlus, FiShield, FiSave, FiCheckCircle, FiServer } from 'react-icons/fi';
import { api } from '@/lib/api';
import { API_BASE_URL } from '@/lib/config';

export default function SettingsPage() {
  const [admin, setAdmin] = useState<any>(null);
  const [serverHealth, setServerHealth] = useState<any>(null);

  // Create Admin form
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPin, setNewAdminPin] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createResult, setCreateResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('wecare_admin');
    if (stored) setAdmin(JSON.parse(stored));

    // Check server health
    fetch(`${API_BASE_URL.replace('/api', '')}/health`)
      .then(r => r.json())
      .then(d => setServerHealth(d))
      .catch(() => setServerHealth({ status: 'error' }));
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPhone || !newAdminPin) return;

    setCreateLoading(true);
    setCreateResult(null);

    try {
      const data = await api.createAdmin(admin.id, {
        phoneNumber: newAdminPhone,
        name: newAdminName,
        email: newAdminEmail,
        pin: newAdminPin,
      });

      setCreateResult({
        success: data.success,
        message: data.success ? `Admin ${data.admin?.name} created successfully!` : data.message || 'Failed to create admin',
      });

      if (data.success) {
        setNewAdminPhone('');
        setNewAdminName('');
        setNewAdminEmail('');
        setNewAdminPin('');
      }
    } catch (error) {
      setCreateResult({ success: false, message: 'Failed to connect to server' });
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Admin configuration and management</p>
      </div>

      {/* Current Admin */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <FiShield className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-semibold text-gray-900">Current Admin</h2>
        </div>
        {admin && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Name:</span> <span className="font-medium text-gray-800 ml-2">{admin.name}</span></div>
            <div><span className="text-gray-500">Phone:</span> <span className="font-medium text-gray-800 ml-2">{admin.phoneNumber}</span></div>
            <div><span className="text-gray-500">Email:</span> <span className="font-medium text-gray-800 ml-2">{admin.email || '—'}</span></div>
            <div><span className="text-gray-500">Role:</span> <span className="font-medium text-red-600 ml-2 capitalize">{admin.role}</span></div>
          </div>
        )}
      </div>

      {/* Server Health */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <FiServer className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Server Status</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${serverHealth?.status === 'ok' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
          <span className={`text-sm font-medium ${serverHealth?.status === 'ok' ? 'text-green-700' : 'text-red-700'}`}>
            {serverHealth?.status === 'ok' ? 'Server Online' : 'Server Offline'}
          </span>
          {serverHealth?.timestamp && (
            <span className="text-xs text-gray-400 ml-2">Last checked: {new Date(serverHealth.timestamp).toLocaleTimeString()}</span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2">API: {API_BASE_URL}</p>
      </div>

      {/* Create Admin */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <FiUserPlus className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-semibold text-gray-900">Create New Admin</h2>
        </div>
        <p className="text-sm text-gray-500 mb-5">Add a new administrator. If the phone number belongs to an existing user, they will be upgraded to admin.</p>

        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                value={newAdminPhone}
                onChange={(e) => setNewAdminPhone(e.target.value)}
                placeholder="+91XXXXXXXXXX"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                placeholder="Admin name"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="admin@wecare.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Security PIN *</label>
              <input
                type="password"
                value={newAdminPin}
                onChange={(e) => setNewAdminPin(e.target.value)}
                placeholder="4-digit PIN"
                maxLength={4}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none tracking-[0.5em]"
                required
              />
            </div>
          </div>

          {createResult && (
            <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
              createResult.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {createResult.success && <FiCheckCircle className="inline w-4 h-4 mr-2" />}
              {createResult.message}
            </div>
          )}

          <button
            type="submit"
            disabled={createLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50 shadow-lg shadow-red-200"
          >
            {createLoading ? 'Creating...' : (
              <><FiUserPlus className="w-4 h-4" /> Create Admin</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
