'use client';

import { useEffect, useState } from 'react';
import {
  FiUsers, FiCalendar, FiDollarSign, FiTrendingUp,
  FiUserCheck, FiUserX, FiClock, FiCheckCircle,
  FiXCircle, FiActivity, FiArrowUpRight
} from 'react-icons/fi';
import { api } from '@/lib/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { format } from 'date-fns';

const COLORS = ['#dc2626', '#f87171', '#fca5a5', '#fecaca', '#fee2e2'];

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getStats();
      if (data.success) setStats(data.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-red-600 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Failed to load dashboard data.</p>
        <button onClick={loadStats} className="mt-4 text-red-600 hover:underline">Retry</button>
      </div>
    );
  }

  const bookingStatusData = [
    { name: 'Pending', value: stats.bookings.pending },
    { name: 'Confirmed', value: stats.bookings.confirmed },
    { name: 'Completed', value: stats.bookings.completed },
    { name: 'Cancelled', value: stats.bookings.cancelled },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here&apos;s what&apos;s happening with WeCare today.</p>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={<FiUsers className="w-5 h-5" />}
          label="Total Users"
          value={stats.users.total}
          sub={`+${stats.users.newUsersToday} today`}
          color="red"
        />
        <StatCard
          icon={<FiCalendar className="w-5 h-5" />}
          label="Total Bookings"
          value={stats.bookings.total}
          sub={`${stats.bookings.today} today`}
          color="orange"
        />
        <StatCard
          icon={<FiDollarSign className="w-5 h-5" />}
          label="Total Revenue"
          value={`₹${(stats.revenue.total || 0).toLocaleString('en-IN')}`}
          sub={`₹${(stats.revenue.month || 0).toLocaleString('en-IN')} this month`}
          color="green"
        />
        <StatCard
          icon={<FiUserCheck className="w-5 h-5" />}
          label="Pending Approvals"
          value={stats.users.pendingNannies}
          sub="Nanny verifications"
          color="purple"
          highlight={stats.users.pendingNannies > 0}
        />
      </div>

      {/* User Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MiniStat icon={<FiUsers />} label="Parents" value={stats.users.totalParents} color="text-blue-600" bg="bg-blue-50" />
        <MiniStat icon={<FiUserCheck />} label="Nannies" value={stats.users.totalNannies} color="text-green-600" bg="bg-green-50" />
        <MiniStat icon={<FiActivity />} label="New This Week" value={stats.users.newUsersWeek} color="text-red-600" bg="bg-red-50" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Trend (30 Days)</h2>
          <div className="h-72">
            {stats.bookingTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.bookingTrend}>
                  <defs>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="_id"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    tickFormatter={(v) => format(new Date(v), 'dd MMM')}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '13px' }}
                    labelFormatter={(v) => format(new Date(v), 'dd MMM yyyy')}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#dc2626"
                    strokeWidth={2}
                    fill="url(#colorBookings)"
                    name="Bookings"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No booking data yet</div>
            )}
          </div>
        </div>

        {/* Booking Status Pie */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h2>
          {bookingStatusData.length > 0 ? (
            <>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={bookingStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {bookingStatusData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '13px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 mt-2">
                {bookingStatusData.map((entry, idx) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    {entry.name}: {entry.value}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-52 text-gray-400">No data</div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Nannies */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Nannies</h2>
          <div className="space-y-3">
            {stats.topNannies.length > 0 ? (
              stats.topNannies.map((nanny: any, idx: number) => (
                <div key={nanny._id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-red-50 transition">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    idx === 0 ? 'bg-red-600 text-white' : idx === 1 ? 'bg-red-400 text-white' : 'bg-red-100 text-red-700'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{nanny.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">{nanny.phoneNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">{nanny.nannyProfile?.totalJobsCompleted || 0} jobs</p>
                    <p className="text-xs text-gray-400">⭐ {nanny.nannyProfile?.rating?.toFixed(1) || '0.0'}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm text-center py-8">No nannies yet</p>
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
            <a href="/dashboard/bookings" className="text-red-600 text-sm font-medium hover:underline flex items-center gap-1">
              View All <FiArrowUpRight className="w-3 h-3" />
            </a>
          </div>
          <div className="space-y-3">
            {stats.recentBookings.length > 0 ? (
              stats.recentBookings.slice(0, 6).map((booking: any) => (
                <div key={booking._id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <StatusBadge status={booking.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {booking.bookingId}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {booking.parentId?.name || 'Parent'} → {booking.nannyId?.name || 'Nanny'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">₹{booking.totalAmount}</p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(booking.createdAt), 'dd MMM')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm text-center py-8">No bookings yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color, highlight }: any) {
  const colorMap: any = {
    red: { bg: 'bg-red-50', icon: 'text-red-600', border: 'border-red-100' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600', border: 'border-orange-100' },
    green: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-100' },
  };
  const c = colorMap[color] || colorMap.red;

  return (
    <div className={`stat-card bg-white rounded-2xl p-5 border ${highlight ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-100'} shadow-sm`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center ${c.icon}`}>
          {icon}
        </div>
        {highlight && <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

function MiniStat({ icon, label, value, color, bg }: any) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl ${bg} border border-gray-100`}>
      <div className={`${color}`}>{icon}</div>
      <div>
        <p className="text-lg font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    'in-progress': 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    rejected: 'bg-gray-100 text-gray-700',
  };
  return (
    <span className={`px-2 py-1 rounded-lg text-[10px] font-semibold uppercase ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}
