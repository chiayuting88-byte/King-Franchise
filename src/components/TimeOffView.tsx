import React, { useState } from 'react';
import { Clock, CheckCircle2, XCircle, AlertTriangle, Calendar, Plus, Briefcase, Filter } from 'lucide-react';
import { TimeOffRequest, StaffMember, Shift, TimeOffType } from '../types';

interface TimeOffViewProps {
  timeOffRequests: TimeOffRequest[];
  staffList: StaffMember[];
  shifts: Shift[];
  onApproveRequest: (requestId: string, autoVacateConflictingShifts: boolean) => void;
  onRejectRequest: (requestId: string, notes?: string) => void;
  onSubmitNewRequest: (newRequest: Omit<TimeOffRequest, 'id' | 'submittedAt' | 'status'>) => void;
  onNavigateToContractPool: () => void;
}

export const TimeOffView: React.FC<TimeOffViewProps> = ({
  timeOffRequests,
  staffList,
  shifts,
  onApproveRequest,
  onRejectRequest,
  onSubmitNewRequest,
  onNavigateToContractPool,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);

  // New leave form state
  const [selectedStaffId, setSelectedStaffId] = useState(staffList[0]?.id || '');
  const [leaveType, setLeaveType] = useState<TimeOffType>('Vacation');
  const [startDate, setStartDate] = useState('2026-10-19');
  const [endDate, setEndDate] = useState('2026-10-20');
  const [reason, setReason] = useState('');

  const filteredRequests = timeOffRequests.filter((req) => {
    if (filterStatus === 'all') return true;
    return req.status === filterStatus;
  });

  const pendingCount = timeOffRequests.filter((r) => r.status === 'pending').length;
  const approvedCount = timeOffRequests.filter((r) => r.status === 'approved').length;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const staff = staffList.find((s) => s.id === selectedStaffId);
    if (!staff) return;

    onSubmitNewRequest({
      staffId: staff.id,
      staffName: staff.name,
      staffRole: staff.role,
      avatarUrl: staff.avatarUrl,
      type: leaveType,
      startDate,
      endDate,
      reason: reason.trim() || `${leaveType} request`,
    });

    setIsNewRequestModalOpen(false);
    setReason('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
              <span>Attendance & Leave Management</span>
              <span aria-hidden="true">·</span>
              <span>Roster Conflict Auto-Detection</span>
              <span aria-hidden="true">·</span>
              <span>Contract Backfill Link</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Time Off & Leave Requests
            </h1>
            <p className="text-sm text-neutral-600 mt-1 max-w-2xl">
              Track vacation, sick days, and personal leaves. ShiftFlow checks scheduled shifts automatically and warns you when approving leave causes a shift shortage.
            </p>
          </div>

          <button
            onClick={() => setIsNewRequestModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shadow-sm self-start md:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Submit Leave Request</span>
          </button>
        </div>

        {/* Metric summary strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-neutral-100">
          <div>
            <span className="text-xs text-neutral-500 block">Pending Manager Review</span>
            <span className="text-xl font-bold font-mono tabular-nums text-amber-600">
              {pendingCount} request{pendingCount === 1 ? '' : 's'}
            </span>
          </div>
          <div>
            <span className="text-xs text-neutral-500 block">Approved Leaves (October)</span>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
              {approvedCount} active
            </span>
          </div>
          <div>
            <span className="text-xs text-neutral-500 block">Shortage Auto-Backfill</span>
            <span className="text-xl font-bold font-mono tabular-nums text-emerald-600">
              Enabled
            </span>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg text-xs">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-md font-medium capitalize transition-colors ${
                filterStatus === status
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-neutral-600 hover:text-slate-900'
              }`}
            >
              {status}
              {status === 'pending' && pendingCount > 0 && (
                <span className="ml-1.5 font-mono text-amber-600">({pendingCount})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Request Cards List */}
      <div className="space-y-4">
        {filteredRequests.map((req) => {
          // Find any conflicting shifts in the schedule during this request
          const conflictingShifts = shifts.filter(
            (s) =>
              s.staffId === req.staffId &&
              s.date >= req.startDate &&
              s.date <= req.endDate
          );

          return (
            <div
              key={req.id}
              className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-neutral-300 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Staff Info & Request Details */}
                <div className="flex items-start gap-3.5">
                  <img
                    src={req.avatarUrl}
                    alt={req.staffName}
                    className="w-11 h-11 rounded-lg object-cover border border-neutral-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 text-sm">
                        {req.staffName}
                      </h3>
                      <span className="text-xs text-neutral-500">·</span>
                      <span className="text-xs text-neutral-600 font-medium">
                        {req.staffRole}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                      <span className="font-medium text-slate-800">{req.type}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{req.startDate} to {req.endDate}</span>
                      <span aria-hidden="true">·</span>
                      <span>Submitted {req.submittedAt}</span>
                    </div>

                    <p className="text-xs text-neutral-700 mt-2 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                      "{req.reason}"
                    </p>

                    {req.managerNotes && (
                      <p className="text-xs text-neutral-500 mt-1.5 italic">
                        Manager note: {req.managerNotes}
                      </p>
                    )}

                    {/* Conflict Alert banner if shifts clash */}
                    {conflictingShifts.length > 0 && req.status !== 'rejected' && (
                      <div className="mt-3 p-3 bg-amber-50/80 border border-amber-200 rounded-lg flex items-start gap-2 text-xs text-amber-900">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold">
                            Roster Conflict: {conflictingShifts.length} shift{conflictingShifts.length > 1 ? 's' : ''} currently assigned during this period.
                          </span>
                          <div className="text-amber-800 mt-0.5">
                            Approving will automatically mark these shifts as open shortages so you can backfill from the Contract Pool.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status & Review Controls */}
                <div className="flex flex-col items-end gap-3 shrink-0">
                  {/* Status Indicator (Clean text, unboxed) */}
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    {req.status === 'approved' && (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">Approved</span>
                      </>
                    )}
                    {req.status === 'rejected' && (
                      <>
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span className="text-rose-700">Declined</span>
                      </>
                    )}
                    {req.status === 'pending' && (
                      <>
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span className="text-amber-700">Awaiting Manager Review</span>
                      </>
                    )}
                  </div>

                  {/* Actions for pending requests */}
                  {req.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onRejectRequest(req.id, 'Declined due to peak store coverage requirements.')}
                        className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => onApproveRequest(req.id, true)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
                      >
                        Approve Leave
                      </button>
                    </div>
                  )}

                  {/* If approved and caused a shortage, offer shortcut to contract pool */}
                  {req.status === 'approved' && (
                    <button
                      onClick={onNavigateToContractPool}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:underline"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                      <span>Check contract relievers</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRequests.length === 0 && (
        <div className="p-12 text-center bg-white border border-neutral-200 rounded-xl">
          <Clock className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-900">No leave requests found</h3>
          <p className="text-xs text-neutral-500 mt-1">
            No time-off submissions currently match this filter.
          </p>
        </div>
      )}

      {/* New Request Modal */}
      {isNewRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
              <h3 className="text-base font-semibold text-slate-900">
                Submit Time-Off Request
              </h3>
              <button
                onClick={() => setIsNewRequestModalOpen(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Staff Member
                </label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Leave Category
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as TimeOffType)}
                  className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  {(['Vacation', 'Sick Leave', 'Personal', 'Bereavement', 'Unpaid'] as TimeOffType[]).map(
                    (t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Reason / Additional Details
                </label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Doctor's appointment, family commitment, planned vacation..."
                  className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsNewRequestModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
