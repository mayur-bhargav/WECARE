'use client';

import { useEffect, useState, useCallback } from 'react';
import { FiSearch, FiFilter, FiEye, FiChevronLeft, FiChevronRight, FiX, FiMapPin, FiClock, FiUser } from 'react-icons/fi';
import { api } from '@/lib/api';
import { format } from 'date-fns';

const statusColors: any = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  'in-progress': 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  rejected: 'bg-gray-100 text-gray-700',
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>({ total: 0, page: 1, pages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadBookings = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '15');
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const data = await api.getBookings(params.toString());
      if (data.success) {
        setBookings(data.bookings);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleViewBooking = async (id: string) => {
    setDetailLoading(true);
    try {
      const data = await api.getBooking(id);
      if (data.success) setSelectedBooking(data.booking);
    } catch (error) {
      console.error(error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    const reason = status === 'cancelled' ? prompt('Reason for cancellation:') : undefined;
    if (status === 'cancelled' && !reason) return;

    const data = await api.updateBookingStatus(id, status, reason || undefined);
    if (data.success) {
      loadBookings(pagination.page);
      if (selectedBooking?._id === id) {
        setSelectedBooking({ ...selectedBooking, status });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-500 text-sm mt-1">View and manage all bookings</p>
        </div>
        <span className="text-sm text-gray-400">{pagination.total} total</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[250px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by Booking ID (e.g. WC12345678)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadBookings()}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-red-500 outline-none"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="rejected">Rejected</option>
        </select>
        <button onClick={() => loadBookings()} className="px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition">
          Search
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Booking ID</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Parent</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Nanny</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Date</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Amount</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-16 text-gray-400">Loading...</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16 text-gray-400">No bookings found</td></tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking._id} className="border-b border-gray-50 hover:bg-red-50/30 transition">
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-gray-800">{booking.bookingId}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-800 text-sm">{booking.parentId?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-400">{booking.parentId?.phoneNumber}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-800 text-sm">{booking.nannyId?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-400">{booking.nannyId?.phoneNumber}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 text-xs">
                      {format(new Date(booking.date), 'dd MMM yyyy')}
                      <br />
                      <span className="text-gray-400">{booking.startTime} - {booking.endTime}</span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-gray-800">₹{booking.totalAmount}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${statusColors[booking.status]}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => handleViewBooking(booking._id)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                        <FiEye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">Page {pagination.page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <button onClick={() => loadBookings(pagination.page - 1)} disabled={pagination.page <= 1} className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 disabled:opacity-30">
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => loadBookings(pagination.page + 1)} disabled={pagination.page >= pagination.pages} className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 disabled:opacity-30">
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedBooking(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedBooking.bookingId}</h2>
                <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold capitalize ${statusColors[selectedBooking.status]}`}>
                  {selectedBooking.status}
                </span>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* People */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2"><FiUser className="w-4 h-4 text-blue-600" /><span className="text-xs font-semibold text-blue-600">PARENT</span></div>
                  <p className="font-semibold text-gray-800">{selectedBooking.parentId?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500">{selectedBooking.parentId?.phoneNumber}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2"><FiUser className="w-4 h-4 text-green-600" /><span className="text-xs font-semibold text-green-600">NANNY</span></div>
                  <p className="font-semibold text-gray-800">{selectedBooking.nannyId?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500">{selectedBooking.nannyId?.phoneNumber}</p>
                </div>
              </div>

              {/* Timing */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2"><FiClock className="w-4 h-4 text-gray-400" /><span className="text-sm font-medium text-gray-800">{format(new Date(selectedBooking.date), 'EEEE, dd MMMM yyyy')}</span></div>
                <p className="text-sm text-gray-600 ml-6">{selectedBooking.startTime} – {selectedBooking.endTime} ({selectedBooking.totalHours}h)</p>
              </div>

              {/* Address */}
              {selectedBooking.address && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1"><FiMapPin className="w-4 h-4 text-gray-400" /><span className="text-xs font-semibold text-gray-500">ADDRESS</span></div>
                  <p className="text-sm text-gray-700">{selectedBooking.address.formattedAddress || `${selectedBooking.address.street}, ${selectedBooking.address.city}`}</p>
                </div>
              )}

              {/* Payment */}
              <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-3 gap-4">
                <div><p className="text-xs text-gray-500">Rate</p><p className="font-semibold text-gray-800">₹{selectedBooking.hourlyRate}/hr</p></div>
                <div><p className="text-xs text-gray-500">Total</p><p className="font-bold text-gray-800 text-lg">₹{selectedBooking.totalAmount}</p></div>
                <div><p className="text-xs text-gray-500">Payment</p><p className="font-semibold text-gray-800 capitalize">{selectedBooking.payment?.method || 'cash'} • {selectedBooking.payment?.status || 'pending'}</p></div>
              </div>

              {/* Admin Actions */}
              {['pending', 'confirmed'].includes(selectedBooking.status) && (
                <div className="flex gap-3">
                  {selectedBooking.status === 'pending' && (
                    <button onClick={() => handleStatusChange(selectedBooking._id, 'confirmed')} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition">
                      Confirm
                    </button>
                  )}
                  <button onClick={() => handleStatusChange(selectedBooking._id, 'cancelled')} className="flex-1 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition">
                    Cancel Booking
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
