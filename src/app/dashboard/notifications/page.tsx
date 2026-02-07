'use client';

import { useState } from 'react';
import { FiSend, FiBell, FiUsers, FiUser, FiCheckCircle } from 'react-icons/fi';
import { api } from '@/lib/api';

export default function NotificationsPage() {
  const [mode, setMode] = useState<'user' | 'role' | 'broadcast'>('user');
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('parent');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      let data;
      if (mode === 'user') {
        if (!userId.trim()) {
          setResult({ success: false, message: 'User ID is required' });
          setLoading(false);
          return;
        }
        data = await api.sendNotification(userId, title, body, { screen: 'Dashboard' });
      } else if (mode === 'role') {
        data = await api.broadcastNotification(title, body, role);
      } else {
        data = await api.broadcastNotification(title, body);
      }

      setResult({ success: data.success, message: data.message || (data.success ? 'Notification sent successfully!' : 'Failed to send') });
      if (data.success) {
        setTitle('');
        setBody('');
        setUserId('');
      }
    } catch (error) {
      setResult({ success: false, message: 'Failed to connect to server' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Send Notifications</h1>
        <p className="text-gray-500 text-sm mt-1">Push notifications to users, roles, or everyone</p>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-3">
        {[
          { key: 'user', label: 'Single User', icon: FiUser },
          { key: 'role', label: 'By Role', icon: FiUsers },
          { key: 'broadcast', label: 'Broadcast All', icon: FiBell },
        ].map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
              mode === m.key
                ? 'bg-red-600 text-white shadow-md shadow-red-200'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <m.icon className="w-4 h-4" />
            {m.label}
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSend} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        {mode === 'user' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">User ID</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter MongoDB User ID"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              required
            />
          </div>
        )}

        {mode === 'role' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Target Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none bg-white"
            >
              <option value="parent">All Parents</option>
              <option value="nanny">All Nannies</option>
            </select>
          </div>
        )}

        {mode === 'broadcast' && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-700">
            ⚠️ This will send a notification to <strong>all users</strong> who have notifications enabled.
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Notification title"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Notification message..."
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
            required
          />
        </div>

        {result && (
          <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
            result.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {result.success && <FiCheckCircle className="inline w-4 h-4 mr-2" />}
            {result.message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50 shadow-lg shadow-red-200"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Sending...
            </>
          ) : (
            <>
              <FiSend className="w-4 h-4" />
              Send Notification
            </>
          )}
        </button>
      </form>

      {/* Quick Templates */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Quick Templates</h3>
        <div className="space-y-2">
          {[
            { t: 'Welcome to WeCare!', b: 'Thank you for joining. Start exploring our services today!' },
            { t: 'Profile Approved', b: 'Congratulations! Your nanny profile has been verified. You can now receive booking requests.' },
            { t: 'New Feature Available', b: 'Check out our latest features in the app. Update now for the best experience!' },
            { t: 'Scheduled Maintenance', b: 'WeCare will undergo maintenance tonight from 2 AM to 4 AM IST. We apologize for the inconvenience.' },
          ].map((tmpl, i) => (
            <button
              key={i}
              onClick={() => { setTitle(tmpl.t); setBody(tmpl.b); }}
              className="w-full text-left px-4 py-3 rounded-xl bg-gray-50 hover:bg-red-50 transition text-sm"
            >
              <p className="font-medium text-gray-800">{tmpl.t}</p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">{tmpl.b}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
