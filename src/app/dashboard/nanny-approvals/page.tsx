'use client';

import { useEffect, useState } from 'react';
import { FiCheck, FiX, FiUser, FiHome, FiHeart, FiRefreshCw } from 'react-icons/fi';
import { api } from '@/lib/api';
import { format } from 'date-fns';

export default function ApprovalsPage() {
  const [tab, setTab] = useState<'nannies' | 'daycare' | 'eldercare'>('nannies');
  const [loading, setLoading] = useState(true);

  const [pendingNannies, setPendingNannies] = useState<any[]>([]);
  const [pendingDaycares, setPendingDaycares] = useState<any[]>([]);
  const [pendingElders, setPendingElders] = useState<any[]>([]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [nanniesRes, daycareRes, elderRes] = await Promise.all([
        api.getUsers('role=nanny&verified=false&limit=100'),
        api.getPendingDaycares(),
        api.getPendingElderCare(),
      ]);

      if (nanniesRes.success) setPendingNannies(nanniesRes.users || []);
      if (daycareRes.success) setPendingDaycares(daycareRes.data?.providers || []);
      if (elderRes.success) setPendingElders(elderRes.data?.providers || []);
    } catch (error) {
      console.error('Failed to load approvals', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleNannyDecision = async (id: string, approved: boolean) => {
    const res = await api.verifyNanny(id, approved);
    if (res.success) loadAll();
  };

  const handleDaycareDecision = async (id: string, approved: boolean) => {
    const rejectionReason = approved ? undefined : prompt('Reason for rejection (optional):') || '';
    const priceInput = approved ? prompt('Estimated monthly price (₹) for users:') : null;
    const adminEstimatedPrice = approved && priceInput ? Number(priceInput) : undefined;
    const res = await api.verifyDaycare(
      id,
      approved ? 'approved' : 'rejected',
      rejectionReason,
      adminEstimatedPrice
    );
    if (res.success) loadAll();
  };

  const handleElderDecision = async (id: string, approved: boolean) => {
    const rejectionReason = approved ? undefined : prompt('Reason for rejection (optional):') || '';
    const priceInput = approved ? prompt('Estimated hourly price (₹) for users:') : null;
    const adminEstimatedPrice = approved && priceInput ? Number(priceInput) : undefined;
    const res = await api.verifyElderCare(
      id,
      approved ? 'approved' : 'rejected',
      rejectionReason,
      adminEstimatedPrice
    );
    if (res.success) loadAll();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
          <p className="text-gray-500 text-sm mt-1">Approve or reject providers</p>
        </div>
        <button
          onClick={loadAll}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50"
        >
          <FiRefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="flex gap-3">
        <TabButton active={tab === 'nannies'} onClick={() => setTab('nannies')} icon={<FiUser />} label={`Nannies (${pendingNannies.length})`} />
        <TabButton active={tab === 'daycare'} onClick={() => setTab('daycare')} icon={<FiHome />} label={`Daycare (${pendingDaycares.length})`} />
        <TabButton active={tab === 'eldercare'} onClick={() => setTab('eldercare')} icon={<FiHeart />} label={`Elder Care (${pendingElders.length})`} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        {loading ? (
          <p className="text-center py-10 text-gray-400">Loading...</p>
        ) : tab === 'nannies' ? (
          <ApprovalList
            items={pendingNannies}
            emptyText="No pending nanny applications"
            renderTitle={(n: any) => n.name || 'Unnamed Nanny'}
            renderSubtitle={(n: any) => `${n.phoneNumber} • ${n.email || 'No email'}`}
            renderMeta={(n: any) => `Applied: ${format(new Date(n.createdAt), 'dd MMM yyyy')}`}
            onApprove={(n: any) => handleNannyDecision(n._id, true)}
            onReject={(n: any) => handleNannyDecision(n._id, false)}
          />
        ) : tab === 'daycare' ? (
          <ApprovalList
            items={pendingDaycares}
            emptyText="No pending daycare registrations"
            renderTitle={(d: any) => d.centerName || 'Unnamed Daycare'}
            renderSubtitle={(d: any) => `${d.ownerName || 'Owner'} • ${d.phoneNumber}`}
            renderMeta={(d: any) => `City: ${d.address?.city || '—'} • Capacity: ${d.totalCapacity || '—'}`}
            onApprove={(d: any) => handleDaycareDecision(d._id, true)}
            onReject={(d: any) => handleDaycareDecision(d._id, false)}
          />
        ) : (
          <ApprovalList
            items={pendingElders}
            emptyText="No pending elder care registrations"
            renderTitle={(e: any) => e.name || 'Unnamed Caregiver'}
            renderSubtitle={(e: any) => `${e.phoneNumber} • ${e.email || 'No email'}`}
            renderMeta={(e: any) => `Experience: ${e.experience || 0} yrs • City: ${e.address?.city || '—'}`}
            onApprove={(e: any) => handleElderDecision(e._id, true)}
            onReject={(e: any) => handleElderDecision(e._id, false)}
          />
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
        active ? 'bg-red-600 text-white shadow-md shadow-red-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ApprovalList({ items, emptyText, renderTitle, renderSubtitle, renderMeta, onApprove, onReject }: any) {
  if (!items || items.length === 0) {
    return <p className="text-center py-12 text-gray-400">{emptyText}</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item: any) => (
        <div key={item._id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-red-50/20 transition">
          <div>
            <p className="font-semibold text-gray-800">{renderTitle(item)}</p>
            <p className="text-sm text-gray-500">{renderSubtitle(item)}</p>
            <p className="text-xs text-gray-400 mt-1">{renderMeta(item)}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onReject(item)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Reject">
              <FiX className="w-4 h-4" />
            </button>
            <button onClick={() => onApprove(item)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="Approve">
              <FiCheck className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
