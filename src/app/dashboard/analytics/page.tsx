'use client';

import { useEffect, useState } from 'react';
import { FiTrendingUp, FiUsers, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { api } from '@/lib/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import { format } from 'date-fns';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getStats();
        if (data.success) setStats(data.stats);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading analytics...</div>;
  if (!stats) return <div className="text-center py-20 text-gray-400">Failed to load data</div>;

  // Process user trend data for chart
  const userTrendMap: any = {};
  stats.userTrend.forEach((item: any) => {
    if (!userTrendMap[item._id.date]) {
      userTrendMap[item._id.date] = { date: item._id.date, parents: 0, nannies: 0, admins: 0 };
    }
    userTrendMap[item._id.date][item._id.role + 's'] = item.count;
  });
  const userTrendData = Object.values(userTrendMap).sort((a: any, b: any) => a.date.localeCompare(b.date));

  const conversionRate = stats.bookings.total > 0
    ? ((stats.bookings.completed / stats.bookings.total) * 100).toFixed(1)
    : '0';

  const cancellationRate = stats.bookings.total > 0
    ? ((stats.bookings.cancelled / stats.bookings.total) * 100).toFixed(1)
    : '0';

  const avgBookingValue = stats.bookings.completed > 0
    ? Math.round(stats.revenue.total / stats.bookings.completed)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Deep dive into WeCare platform metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard label="Completion Rate" value={`${conversionRate}%`} icon={<FiTrendingUp />} description="Bookings completed" color="green" />
        <MetricCard label="Cancellation Rate" value={`${cancellationRate}%`} icon={<FiCalendar />} description="Bookings cancelled" color="red" />
        <MetricCard label="Avg. Booking Value" value={`₹${avgBookingValue}`} icon={<FiDollarSign />} description="Per completed booking" color="blue" />
        <MetricCard label="Active Nannies" value={stats.users.totalNannies - stats.users.pendingNannies} icon={<FiUsers />} description="Verified nannies" color="purple" />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend (30 Days)</h2>
        <div className="h-80">
          {stats.bookingTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.bookingTrend}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(v) => format(new Date(v), 'dd MMM')} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '13px' }} labelFormatter={(v) => format(new Date(v), 'dd MMM yyyy')} />
                <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} fill="url(#colorRevenue)" name="Revenue (₹)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">No revenue data yet</div>
          )}
        </div>
      </div>

      {/* User Registration Trend */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">User Registrations (30 Days)</h2>
        <div className="h-72">
          {userTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(v) => format(new Date(v), 'dd MMM')} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '13px' }} labelFormatter={(v) => format(new Date(v), 'dd MMM yyyy')} />
                <Legend />
                <Bar dataKey="parents" name="Parents" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="nannies" name="Nannies" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">No registration data yet</div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <SummaryCard title="Revenue Summary" items={[
          { label: 'Total', value: `₹${(stats.revenue.total || 0).toLocaleString('en-IN')}` },
          { label: 'This Month', value: `₹${(stats.revenue.month || 0).toLocaleString('en-IN')}` },
          { label: 'This Week', value: `₹${(stats.revenue.week || 0).toLocaleString('en-IN')}` },
        ]} />
        <SummaryCard title="Booking Summary" items={[
          { label: 'Total', value: stats.bookings.total },
          { label: 'Completed', value: stats.bookings.completed },
          { label: 'Pending', value: stats.bookings.pending },
          { label: 'Cancelled', value: stats.bookings.cancelled },
        ]} />
        <SummaryCard title="User Summary" items={[
          { label: 'Total Users', value: stats.users.total },
          { label: 'Parents', value: stats.users.totalParents },
          { label: 'Nannies', value: stats.users.totalNannies },
          { label: 'New Today', value: stats.users.newUsersToday },
        ]} />
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon, description, color }: any) {
  const colors: any = {
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className={`w-10 h-10 rounded-xl ${colors[color]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
      <p className="text-xs text-gray-400 mt-0.5">{description}</p>
    </div>
  );
}

function SummaryCard({ title, items }: { title: string; items: { label: string; value: any }[] }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-3">{title}</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{item.label}</span>
            <span className="font-semibold text-gray-800">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
