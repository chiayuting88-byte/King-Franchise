import React, { useState, useEffect } from 'react';
import { X, Lock, Unlock, AlertTriangle, UserCheck, Briefcase } from 'lucide-react';
import { Shift, StaffMember, ContractWorker, RoleType, ShiftType, TimeOffRequest } from '../types';
import { isStaffOnApprovedLeave } from '../utils/scheduler';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftToEdit: Shift | null;
  defaultDate?: string;
  defaultStaffId?: string | null;
  staffList: StaffMember[];
  contractPool: ContractWorker[];
  timeOffRequests: TimeOffRequest[];
  onSaveShift: (shift: Shift) => void;
  onDeleteShift: (shiftId: string) => void;
}

const ROLES: RoleType[] = [
  'Store Supervisor',
  'Senior Barista',
  'Floor Associate',
  'Cashier & POS',
  'Inventory Specialist',
  'Kitchen Prep',
];

const SHIFT_TIMES: Record<ShiftType, { start: string; end: string; hours: number }> = {
  morning: { start: '07:00', end: '15:30', hours: 8 },
  afternoon: { start: '12:00', end: '20:00', hours: 7.5 },
  evening: { start: '15:30', end: '22:30', hours: 7 },
  night: { start: '22:00', end: '06:00', hours: 8 },
};

export const ShiftModal: React.FC<ShiftModalProps> = ({
  isOpen,
  onClose,
  shiftToEdit,
  defaultDate = '2026-10-15',
  defaultStaffId = null,
  staffList,
  contractPool,
  timeOffRequests,
  onSaveShift,
  onDeleteShift,
}) => {
  const [staffId, setStaffId] = useState<string | null>(defaultStaffId);
  const [role, setRole] = useState<RoleType>('Floor Associate');
  const [date, setDate] = useState<string>(defaultDate);
  const [shiftType, setShiftType] = useState<ShiftType>('morning');
  const [startTime, setStartTime] = useState<string>('07:00');
  const [endTime, setEndTime] = useState<string>('15:30');
  const [hours, setHours] = useState<number>(8);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (shiftToEdit) {
      setStaffId(shiftToEdit.staffId);
      setRole(shiftToEdit.role);
      setDate(shiftToEdit.date);
      setShiftType(shiftToEdit.shiftType);
      setStartTime(shiftToEdit.startTime);
      setEndTime(shiftToEdit.endTime);
      setHours(shiftToEdit.hours);
      setIsLocked(shiftToEdit.isLocked);
      setNotes(shiftToEdit.notes || '');
    } else {
      setStaffId(defaultStaffId);
      setDate(defaultDate);
      const defaults = SHIFT_TIMES['morning'];
      setStartTime(defaults.start);
      setEndTime(defaults.end);
      setHours(defaults.hours);
      setShiftType('morning');
      setIsLocked(false);
      setNotes('');
    }
  }, [shiftToEdit, defaultDate, defaultStaffId, isOpen]);

  if (!isOpen) return null;

  const handleShiftTypeChange = (type: ShiftType) => {
    setShiftType(type);
    const preset = SHIFT_TIMES[type];
    setStartTime(preset.start);
    setEndTime(preset.end);
    setHours(preset.hours);
  };

  // Check if chosen staff is on leave
  const staffOnLeave = staffId ? isStaffOnApprovedLeave(staffId, date, timeOffRequests) : false;

  // Check if assigned staff is a contract worker
  const isContractStaff = contractPool.some(cw => cw.id === staffId);

  // Suggested contract workers for this role if shift is unassigned
  const recommendedContractors = contractPool.filter(cw => 
    (cw.primaryRole === role || cw.secondaryRoles.includes(role)) &&
    cw.availableDates.includes(date)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedShift: Shift = {
      id: shiftToEdit ? shiftToEdit.id : `shift-${Date.now()}`,
      staffId: staffId === 'unassigned' || !staffId ? null : staffId,
      role,
      date,
      startTime,
      endTime,
      shiftType,
      hours: Number(hours),
      isLocked,
      isAutoScheduled: shiftToEdit ? shiftToEdit.isAutoScheduled : false,
      isContract: isContractStaff,
      notes: notes.trim(),
    };

    onSaveShift(updatedShift);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {shiftToEdit ? 'Edit & Tweak Shift' : 'Create New Shift'}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Assign to regular staff or tap contract relievers
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-slate-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Shift Type selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Shift Window
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['morning', 'afternoon', 'evening', 'night'] as ShiftType[]).map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => handleShiftTypeChange(type)}
                  className={`py-2 px-2 text-xs font-medium rounded-lg capitalize border text-center transition-colors ${
                    shiftType === type
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Date and Role */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs font-mono px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Role Requirement
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as RoleType)}
                className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Start & End Times */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full text-xs font-mono px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                End Time
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full text-xs font-mono px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Total Hours
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="16"
                required
                value={hours}
                onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-mono tabular-nums px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Staff Assignment */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-700">
                Assigned Personnel
              </label>
              <span className="text-xs text-neutral-500">
                Regular staff or on-call contract pool
              </span>
            </div>
            <select
              value={staffId || 'unassigned'}
              onChange={(e) => setStaffId(e.target.value === 'unassigned' ? null : e.target.value)}
              className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
            >
              <option value="unassigned">— Leave Unassigned (Mark as Shortage) —</option>
              <optgroup label="Internal Regular Staff">
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.role}) · ${s.hourlyRate}/hr
                  </option>
                ))}
              </optgroup>
              <optgroup label="Ready Contract Pool (On-Call)">
                {contractPool.map((cw) => (
                  <option key={cw.id} value={cw.id}>
                    [Contract] {cw.name} ({cw.primaryRole}) · ${cw.hourlyRate}/hr · {cw.rating}★
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Conflict warning if staff is on leave */}
          {staffOnLeave && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                <span className="font-semibold">Time-Off Clash Warning:</span> This staff member has an approved time-off request on {date}. Assigning this shift may lead to a staffing shortfall.
              </div>
            </div>
          )}

          {/* If unassigned, show 1-click contract pool recommendation */}
          {!staffId && recommendedContractors.length > 0 && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-700" />
                  Available Contract Relievers
                </span>
                <span className="text-xs text-slate-600 font-mono">
                  {recommendedContractors.length} ready on {date}
                </span>
              </div>
              <div className="space-y-1.5">
                {recommendedContractors.slice(0, 2).map((cw) => (
                  <div
                    key={cw.id}
                    className="flex items-center justify-between p-2 bg-white border border-neutral-200 rounded-md text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={cw.avatarUrl}
                        alt={cw.name}
                        className="w-6 h-6 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <span className="font-medium text-slate-900">{cw.name}</span>
                        <span className="text-neutral-500 text-xs ml-1.5">
                          ${cw.hourlyRate}/hr · {cw.rating}★
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStaffId(cw.id)}
                      className="px-2.5 py-1 text-xs font-medium bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors"
                    >
                      Quick Assign
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lock Shift Toggle (Crucial for Tweak proposition!) */}
          <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200">
            <div className="flex items-center gap-2">
              {isLocked ? (
                <Lock className="w-4 h-4 text-amber-600" />
              ) : (
                <Unlock className="w-4 h-4 text-neutral-400" />
              )}
              <div>
                <span className="text-xs font-semibold text-slate-900">
                  Lock this shift
                </span>
                <p className="text-xs text-neutral-500">
                  Protected from automated schedule re-generation and AI tweaks
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsLocked(!isLocked)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                isLocked
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-100'
              }`}
            >
              {isLocked ? 'Locked' : 'Unlocked'}
            </button>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Shift Notes / Instructions
            </label>
            <input
              type="text"
              placeholder="e.g., Opening keyholder, delivery receiving, closing cashier"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-between border-t border-neutral-100">
            {shiftToEdit ? (
              <button
                type="button"
                onClick={() => {
                  onDeleteShift(shiftToEdit.id);
                  onClose();
                }}
                className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:underline"
              >
                Delete Shift
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
              >
                {shiftToEdit ? 'Save Changes' : 'Create Shift'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
