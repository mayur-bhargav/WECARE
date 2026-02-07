'use client';

import { useEffect, useState, useCallback } from 'react';
import { FiSearch, FiFilter, FiEye, FiTrash2, FiUserX, FiUserCheck, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import { api } from '@/lib/api';
import { format } from 'date-fns';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>({ total: 0, page: 1, pages: 1 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [userDetail, setUserDetail] = useState<any>(null);

  const loadUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '15');
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);

      const data = await api.getUsers(params.toString());
      if (data.success) {
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleToggleStatus = async (id: string) => {
    const data = await api.toggleUserStatus(id);
    if (data.success) loadUsers(pagination.page);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will delete the user and all their bookings.')) return;
    const data = await api.deleteUser(id);
    if (data.success) loadUsers(pagination.page);
  };

  const handleViewUser = async (id: string) => {
    setDetailLoading(true);
    setSelectedUser(id);
    try {
      const data = await api.getUser(id);
      if (data.success) setUserDetail(data);
    } catch (error) {
      console.error(error);
    } finally {
      setDetailLoading(false);
    }
  };

  const roleColors: any = {
    parent: 'bg-blue-100 text-blue-700',
    nanny: 'bg-green-100 text-green-700',
    admin: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all registered users</p>
        </div>
        <span className="text-sm text-gray-400">{pagination.total} total</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[250px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none bg-white"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); }}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-red-500 outline-none"
        >
          <option value="">All Roles</option>
          <option value="parent">Parents</option>
          <option value="nanny">Nannies</option>
          <option value="admin">Admins</option>
        </select>
        <button onClick={() => loadUsers()} className="px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition">
          Search
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 font-semibold text-gray-600">User</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Phone</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Role</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Joined</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-16 text-gray-400">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-gray-400">No users found</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="border-b border-gray-50 hover:bg-red-50/30 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-semibold text-sm">{(user.name || '?').charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{user.name || 'No name'}</p>
                          <p className="text-xs text-gray-400">{user.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{user.phoneNumber}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${roleColors[user.role] || 'bg-gray-100 text-gray-600'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {user.isDeactivated ? (
                        <span className="text-red-600 text-xs font-medium">Deactivated</span>
                      ) : (
                        <span className="text-green-600 text-xs font-medium">Active</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">
                      {format(new Date(user.createdAt), 'dd MMM yyyy')}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleViewUser(user._id)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="View">
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleToggleStatus(user._id)} className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition" title={user.isDeactivated ? 'Activate' : 'Deactivate'}>
                          {user.isDeactivated ? <FiUserCheck className="w-4 h-4" /> : <FiUserX className="w-4 h-4" />}
                        </button>
                        {user.role !== 'admin' && (
                          <button onClick={() => handleDelete(user._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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
              <button
                onClick={() => loadUsers(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => loadUsers(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setSelectedUser(null); setUserDetail(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-lg font-bold text-gray-900">User Details</h2>
              <button onClick={() => { setSelectedUser(null); setUserDetail(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {detailLoading ? (
                <p className="text-center py-10 text-gray-400">Loading...</p>
              ) : userDetail ? (
                <div className="space-y-6">
                  {/* Profile */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
                      <span className="text-red-700 font-bold text-2xl">{(userDetail.user.name || '?').charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{userDetail.user.name || 'No name'}</h3>
                      <p className="text-gray-500">{userDetail.user.phoneNumber} • {userDetail.user.email || 'No email'}</p>
                      <div className="flex gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold capitalize ${roleColors[userDetail.user.role]}`}>
                          {userDetail.user.role}
                        </span>
                        {userDetail.user.isVerified && <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-green-100 text-green-700">Verified</span>}
                      </div>
                    </div>
                  </div>

                  {/* Booking Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-gray-800">{userDetail.bookingStats.totalBookings}</p>
                      <p className="text-xs text-gray-500 mt-1">Total Bookings</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-green-700">{userDetail.bookingStats.completedBookings}</p>
                      <p className="text-xs text-gray-500 mt-1">Completed</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-red-700">{userDetail.bookingStats.cancelledBookings}</p>
                      <p className="text-xs text-gray-500 mt-1">Cancelled</p>
                    </div>
                  </div>

                  {/* Nanny Profile */}
                  {userDetail.user.role === 'nanny' && userDetail.user.nannyProfile && (
                    <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                      <h4 className="font-semibold text-gray-800">Nanny Profile</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-gray-500">Experience:</span> <span className="font-medium">{userDetail.user.nannyProfile.experience} yrs</span></div>
                        <div><span className="text-gray-500">Rate:</span> <span className="font-medium">₹{userDetail.user.nannyProfile.hourlyRate}/hr</span></div>
                        <div><span className="text-gray-500">Rating:</span> <span className="font-medium">⭐ {userDetail.user.nannyProfile.rating?.toFixed(1) || '0'}</span></div>
                        <div><span className="text-gray-500">Jobs:</span> <span className="font-medium">{userDetail.user.nannyProfile.totalJobsCompleted}</span></div>
                        <div><span className="text-gray-500">Earnings:</span> <span className="font-medium">₹{(userDetail.user.nannyProfile.totalEarnings || 0).toLocaleString('en-IN')}</span></div>
                        <div><span className="text-gray-500">Verified:</span> <span className={`font-medium ${userDetail.user.nannyProfile.isVerifiedNanny ? 'text-green-600' : 'text-orange-600'}`}>{userDetail.user.nannyProfile.isVerifiedNanny ? 'Yes' : 'No'}</span></div>
                      </div>
                      {userDetail.user.nannyProfile.bio && (
                        <p className="text-sm text-gray-600 mt-2">{userDetail.user.nannyProfile.bio}</p>
                      )}
                      {userDetail.user.nannyProfile.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {userDetail.user.nannyProfile.skills.map((s: string) => (
                            <span key={s} className="px-2 py-1 bg-white rounded-lg text-xs text-gray-600 border border-gray-200">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Addresses */}
                  {userDetail.user.addresses?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Addresses</h4>
                      <div className="space-y-2">
                        {userDetail.user.addresses.map((addr: any, idx: number) => (
                          <div key={idx} className="bg-gray-50 rounded-xl p-3 text-sm">
                            <span className="text-xs font-semibold text-red-600 uppercase">{addr.tag}</span>
                            <p className="text-gray-700 mt-1">{addr.formattedAddress || `${addr.street}, ${addr.city}, ${addr.state} ${addr.pincode}`}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Bookings */}
                  {userDetail.recentBookings?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Recent Bookings</h4>
                      <div className="space-y-2">
                        {userDetail.recentBookings.map((b: any) => (
                          <div key={b._id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3 text-sm">
                            <div>
                              <span className="font-medium text-gray-800">{b.bookingId}</span>
                              <span className="text-gray-400 ml-2">{format(new Date(b.date), 'dd MMM yyyy')}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold capitalize ${
                              b.status === 'completed' ? 'bg-green-100 text-green-700' :
                              b.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              b.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                            }`}>{b.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center py-10 text-gray-400">Failed to load user data</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
