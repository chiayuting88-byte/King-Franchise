import React, { useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lock,
  Unlock,
  AlertTriangle,
  Plus,
  Download,
  Send,
  Zap,
  Briefcase,
  Check,
  CheckCircle2,
  Clock,
  Filter,
} from 'lucide-react';
import { Shift, StaffMember, ContractWorker, TimeOffRequest, RoleType, PublicHoliday } from '../types';
import {
  getWeekDates,
  isStaffOnApprovedLeave,
  calculateStaffScheduledHours,
  detectConflicts,
} from '../utils/scheduler';

interface RosterViewProps {
  shifts: Shift[];
  staffList: StaffMember[];
  contractPool: ContractWorker[];
  timeOffRequests: TimeOffRequest[];
  publicHolidays?: PublicHoliday[];
  baseDate: string;
  setBaseDate: (date: string) => void;
  onOpenShiftModal: (shift?: Shift, defaultDate?: string, defaultStaffId?: string | null) => void;
  onOpenAutoSchedule: () => void;
  onToggleShiftLock: (shiftId: string) => void;
  onNavigateToContractPool: () => void;
  onQuickAssignContract: (shortageId: string, contractWorkerId: string) => void;
}

export const RosterView: React.FC<RosterViewProps> = ({
  shifts,
  staffList,
  contractPool,
  timeOffRequests,
  publicHolidays = [],
  baseDate,
  setBaseDate,
  onOpenShiftModal,
  onOpenAutoSchedule,
  onToggleShiftLock,
  onNavigateToContractPool,
  onQuickAssignContract,
}) => {
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [notificationSent, setNotificationSent] = useState(false);
  const [quickContractSelectShiftId, setQuickContractSelectShiftId] = useState<string | null>(null);

  const weekDates = getWeekDates(baseDate);
  const startDateStr = weekDates[0].dateStr;
  const endDateStr = weekDates[6].dateStr;

  // Filter shifts to current week
  const weekShifts = shifts.filter(
    (s) => s.date >= startDateStr && s.date <= endDateStr
  );

  // Conflicts check
  const conflicts = detectConflicts(weekShifts, timeOffRequests);

  // Navigation handlers
  const handlePrevWeek = () => {
    const d = new Date(baseDate + 'T00:00:00');
    d.setDate(d.getDate() - 7);
    setBaseDate(d.toISOString().split('T')[0]);
  };

  const handleNextWeek = () => {
    const d = new Date(baseDate + 'T00:00:00');
    d.setDate(d.getDate() + 7);
    setBaseDate(d.toISOString().split('T')[0]);
  };

  const handleCurrentWeek = () => {
    setBaseDate('2026-10-15');
  };

  // Metrics calculation
  const totalScheduledHours = weekShifts.reduce((acc, s) => acc + s.hours, 0);
  const openShortages = weekShifts.filter((s) => s.staffId === null);
  const contractShifts = weekShifts.filter((s) => s.isContract);
  const lockedShifts = weekShifts.filter((s) => s.isLocked);

  // Projected labor cost
  const projectedLaborCost = weekShifts.reduce((acc, s) => {
    if (!s.staffId) return acc;
    const staff = staffList.find((member) => member.id === s.staffId);
    if (staff) return acc + staff.hourlyRate * s.hours;
    const contractor = contractPool.find((c) => c.id === s.staffId);
    if (contractor) return acc + contractor.hourlyRate * s.hours;
    return acc;
  }, 0);

  // Coverage percentage
  const totalSlotsCount = weekShifts.length;
  const filledSlotsCount = totalSlotsCount - openShortages.length;
  const coveragePercent =
    totalSlotsCount > 0 ? Math.round((filledSlotsCount / totalSlotsCount) * 100) : 100;

  // Filter staff by role
  const displayedStaff = staffList.filter((s) => {
    if (roleFilter === 'all') return true;
    return s.role === roleFilter;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Day', 'Shift', 'Start', 'End', 'Hours', 'Role', 'Assigned Staff', 'Type', 'Locked', 'Notes'];
    const rows = weekShifts.map((s) => {
      const staff = staffList.find((m) => m.id === s.staffId);
      const contractor = contractPool.find((c) => c.id === s.staffId);
      const assignedName = staff
        ? staff.name
        : contractor
        ? `[Contract] ${contractor.name}`
        : 'UNASSIGNED SHORTAGE';

      return [
        s.date,
        s.date,
        s.shiftType,
        s.startTime,
        s.endTime,
        s.hours,
        `"${s.role}"`,
        `"${assignedName}"`,
        s.isContract ? 'Contract' : s.isAutoScheduled ? 'Auto' : 'Manual',
        s.isLocked ? 'Yes' : 'No',
        `"${s.notes || ''}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Roster_${startDateStr}_to_${endDateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNotifyTeam = () => {
    setNotificationSent(true);
    setTimeout(() => setNotificationSent(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Week Navigator */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Week Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-neutral-200 rounded-lg p-0.5 bg-neutral-50">
              <button
                onClick={handlePrevWeek}
                className="p-1.5 hover:bg-white rounded-md text-neutral-600 hover:text-slate-900 transition-colors"
                title="Previous Week"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleCurrentWeek}
                className="px-3 py-1 text-xs font-semibold text-slate-800 hover:bg-white rounded-md transition-colors"
              >
                Today
              </button>
              <button
                onClick={handleNextWeek}
                className="p-1.5 hover:bg-white rounded-md text-neutral-600 hover:text-slate-900 transition-colors"
                title="Next Week"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {weekDates[0].formatted} – {weekDates[6].formatted}
              </h2>
              <p className="text-xs text-neutral-500">
                Weekly shift distribution and real-time coverage solver
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg transition-colors"
              title="Download CSV of this weekly roster"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleNotifyTeam}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg transition-colors"
              title="Send notification to team members"
            >
              {notificationSent ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Roster Dispatched!</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Notify Team</span>
                </>
              )}
            </button>

            {/* Core Auto-Schedule Button (Canvas key proposition) */}
            <button
              onClick={onOpenAutoSchedule}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Auto-Schedule Week</span>
            </button>
          </div>
        </div>

        {/* Operational Roster KPI Strip (Tabular Figures) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6 pt-6 border-t border-neutral-100">
          <div>
            <span className="text-xs text-neutral-500 block">Total Scheduled</span>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
              {totalScheduledHours} hrs
            </span>
          </div>

          <div>
            <span className="text-xs text-neutral-500 block">Roster Coverage</span>
            <span
              className={`text-xl font-bold font-mono tabular-nums ${
                coveragePercent >= 95 ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {coveragePercent}%
            </span>
          </div>

          <div>
            <span className="text-xs text-neutral-500 block">Open Shortages</span>
            <div className="flex items-center gap-1.5">
              <span
                className={`text-xl font-bold font-mono tabular-nums ${
                  openShortages.length > 0 ? 'text-amber-600' : 'text-slate-900'
                }`}
              >
                {openShortages.length}
              </span>
              {openShortages.length > 0 && (
                <button
                  onClick={onNavigateToContractPool}
                  className="text-xs text-slate-900 underline font-medium hover:text-slate-700"
                >
                  Tap Pool
                </button>
              )}
            </div>
          </div>

          <div>
            <span className="text-xs text-neutral-500 block">Locked Shifts (Tweaks)</span>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
              {lockedShifts.length}
            </span>
          </div>

          <div>
            <span className="text-xs text-neutral-500 block">Projected Labor Cost</span>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
              ${projectedLaborCost.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>

      {/* Conflict Notification Banner if any exist */}
      {conflicts.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-xs text-amber-900">
              <span className="font-semibold">{conflicts.length} Roster Conflict Detected:</span>{' '}
              {conflicts[0].reason}. Check highlighted shifts below to adjust or dispatch contract relievers.
            </div>
          </div>
        </div>
      )}

      {/* Role Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-neutral-100 rounded-lg text-xs">
          {['all', 'Store Supervisor', 'Senior Barista', 'Floor Associate', 'Cashier & POS', 'Kitchen Prep'].map(
            (role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                  roleFilter === role
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-neutral-600 hover:text-slate-900'
                }`}
              >
                {role === 'all' ? 'All Roles' : role}
              </button>
            )
          )}
        </div>

        <div className="text-xs text-neutral-500 hidden sm:block">
          <span className="font-mono text-slate-700 font-semibold">{weekShifts.length}</span> shifts in active week
        </div>
      </div>

      {/* Interactive Weekly Roster Table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[960px]">
            {/* Table Header: Days of the Week */}
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/80 text-xs text-neutral-700">
                <th className="py-3 px-4 font-semibold w-64 border-r border-neutral-200">
                  Staff Member / Capacity
                </th>
                {weekDates.map((day) => {
                  const holiday = publicHolidays.find((h) => h.date === day.dateStr);

                  return (
                    <th
                      key={day.dateStr}
                      className={`py-3 px-3 font-semibold border-r border-neutral-200 last:border-r-0 ${
                        day.isToday ? 'bg-amber-50/40 text-slate-900 font-bold' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{day.formatted}</span>
                        {day.isToday && (
                          <span className="text-xs font-mono font-medium text-amber-700">
                            Today
                          </span>
                        )}
                      </div>
                      {holiday && (
                        <div
                          className="mt-1 text-xs text-amber-800 font-medium truncate flex items-center gap-1"
                          title={`Singapore Public Holiday: ${holiday.name} (${holiday.localName})`}
                        >
                          <span className="text-amber-600">★</span>
                          <span>{holiday.name}</span>
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Table Body: Staff Rows */}
            <tbody className="divide-y divide-neutral-200 text-xs">
              {displayedStaff.map((staff) => {
                const totalHours = calculateStaffScheduledHours(staff.id, weekShifts);
                const isOvertime = totalHours > staff.maxWeeklyHours;

                return (
                  <tr key={staff.id} className="hover:bg-neutral-50/40 transition-colors">
                    {/* Staff identity cell */}
                    <td className="py-3 px-4 border-r border-neutral-200 align-top">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={staff.avatarUrl}
                          alt={staff.name}
                          className="w-8 h-8 rounded-full object-cover border border-neutral-200"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate">
                            {staff.name}
                          </div>
                          <div className="text-xs text-neutral-500 truncate">
                            {staff.role}
                          </div>
                          <div className="mt-1 flex items-center gap-1.5 text-xs">
                            <span
                              className={`font-mono font-semibold tabular-nums ${
                                isOvertime ? 'text-rose-600' : 'text-slate-700'
                              }`}
                            >
                              {totalHours}h
                            </span>
                            <span className="text-neutral-400">/ {staff.maxWeeklyHours}h</span>
                            {isOvertime && (
                              <span className="text-rose-600 font-semibold" title="Overtime warning">
                                ⚠ OT
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 7 Day cells */}
                    {weekDates.map((day) => {
                      const onLeave = isStaffOnApprovedLeave(
                        staff.id,
                        day.dateStr,
                        timeOffRequests
                      );
                      const dayShifts = weekShifts.filter(
                        (s) => s.staffId === staff.id && s.date === day.dateStr
                      );

                      return (
                        <td
                          key={day.dateStr}
                          className={`py-2 px-2.5 border-r border-neutral-200 last:border-r-0 align-top h-24 ${
                            day.isToday ? 'bg-amber-50/15' : ''
                          }`}
                        >
                          {/* If on approved leave */}
                          {onLeave ? (
                            <div className="h-full min-h-[56px] rounded-lg border border-dashed border-amber-300 bg-amber-50/50 p-2 text-xs flex flex-col justify-center text-amber-900">
                              <span className="font-semibold flex items-center gap-1 text-amber-800">
                                <Clock className="w-3 h-3 text-amber-600" />
                                On Leave
                              </span>
                              <span className="text-amber-700 text-xs mt-0.5">
                                Approved time-off
                              </span>
                            </div>
                          ) : dayShifts.length > 0 ? (
                            <div className="space-y-1.5">
                              {dayShifts.map((shift) => (
                                <div
                                  key={shift.id}
                                  onClick={() => onOpenShiftModal(shift)}
                                  className="group relative p-2 rounded-lg border border-neutral-200 bg-white hover:border-slate-800 cursor-pointer shadow-2xs transition-all"
                                >
                                  {/* Shift times & Lock */}
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                                      {shift.startTime}–{shift.endTime}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleShiftLock(shift.id);
                                      }}
                                      className="p-0.5 rounded text-neutral-400 hover:text-slate-800 transition-colors"
                                      title={
                                        shift.isLocked
                                          ? 'Shift locked (Protected from auto-scheduler)'
                                          : 'Shift unlocked (Auto-scheduler can modify)'
                                      }
                                    >
                                      {shift.isLocked ? (
                                        <Lock className="w-3 h-3 text-amber-600" />
                                      ) : (
                                        <Unlock className="w-3 h-3 text-neutral-300 group-hover:text-neutral-500" />
                                      )}
                                    </button>
                                  </div>

                                  {/* Role & Hours */}
                                  <div className="flex items-center justify-between text-xs text-neutral-500 mt-1">
                                    <span className="truncate max-w-[90px]">{shift.role}</span>
                                    <span className="font-mono tabular-nums font-medium text-slate-700">
                                      {shift.hours}h
                                    </span>
                                  </div>

                                  {/* Subtle badge indicator */}
                                  {shift.isAutoScheduled && !shift.isLocked && (
                                    <div className="mt-1 text-xs text-neutral-400">
                                      Auto-scheduled
                                    </div>
                                  )}
                                  {shift.notes && (
                                    <div className="mt-1 text-xs text-neutral-500 truncate" title={shift.notes}>
                                      {shift.notes}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            /* Empty Slot with hover "+ Add Shift" */
                            <div
                              onClick={() => onOpenShiftModal(undefined, day.dateStr, staff.id)}
                              className="h-full min-h-[56px] rounded-lg border border-transparent hover:border-neutral-200 hover:bg-neutral-50 cursor-pointer flex items-center justify-center text-neutral-300 hover:text-neutral-600 transition-colors group"
                            >
                              <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Special Contract Worker Rows (if scheduled) */}
              {contractPool
                .filter((cw) => weekShifts.some((s) => s.staffId === cw.id))
                .map((cw) => {
                  const totalHours = calculateStaffScheduledHours(cw.id, weekShifts);

                  return (
                    <tr key={cw.id} className="bg-sky-50/20 hover:bg-sky-50/40 transition-colors">
                      <td className="py-3 px-4 border-r border-neutral-200 align-top">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={cw.avatarUrl}
                            alt={cw.name}
                            className="w-8 h-8 rounded-full object-cover border border-sky-300"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate flex items-center gap-1">
                              <span>{cw.name}</span>
                              <span className="text-xs text-sky-700 font-mono">[Contract]</span>
                            </div>
                            <div className="text-xs text-neutral-500 truncate">
                              {cw.primaryRole} · ${cw.hourlyRate}/hr
                            </div>
                            <div className="mt-0.5 text-xs text-emerald-600 font-mono">
                              {totalHours}h scheduled
                            </div>
                          </div>
                        </div>
                      </td>

                      {weekDates.map((day) => {
                        const dayShifts = weekShifts.filter(
                          (s) => s.staffId === cw.id && s.date === day.dateStr
                        );

                        return (
                          <td
                            key={day.dateStr}
                            className="py-2 px-2.5 border-r border-neutral-200 last:border-r-0 align-top h-24"
                          >
                            {dayShifts.map((shift) => (
                              <div
                                key={shift.id}
                                onClick={() => onOpenShiftModal(shift)}
                                className="p-2 rounded-lg border border-sky-200 bg-sky-50/70 hover:border-slate-800 cursor-pointer shadow-2xs transition-all"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                                    {shift.startTime}–{shift.endTime}
                                  </span>
                                  <span title="On-Call Contract Specialist">
                                    <Briefcase className="w-3 h-3 text-sky-700" />
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-neutral-600 mt-1">
                                  <span className="truncate">{shift.role}</span>
                                  <span className="font-mono tabular-nums">{shift.hours}h</span>
                                </div>
                                <div className="mt-1 text-xs text-sky-800 font-medium truncate">
                                  Reliever dispatched
                                </div>
                              </div>
                            ))}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

              {/* Special Pinned Row: Unassigned Shifts & Shortages (Key Canvas Proposition!) */}
              <tr className="bg-amber-50/30 border-t-2 border-amber-200">
                <td className="py-3 px-4 border-r border-neutral-200 align-top">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <div className="font-bold text-amber-950 text-xs">
                        Open Shortages ({openShortages.length})
                      </div>
                      <div className="text-xs text-amber-700">
                        Uncovered shifts needing relief
                      </div>
                    </div>
                  </div>
                </td>

                {weekDates.map((day) => {
                  const dayShortages = openShortages.filter((s) => s.date === day.dateStr);

                  return (
                    <td
                      key={day.dateStr}
                      className="py-2 px-2.5 border-r border-neutral-200 last:border-r-0 align-top h-24"
                    >
                      {dayShortages.length > 0 ? (
                        <div className="space-y-2">
                          {dayShortages.map((shortage) => (
                            <div
                              key={shortage.id}
                              className="p-2 rounded-lg border border-amber-300 bg-amber-50 shadow-2xs text-xs space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-semibold text-amber-950 tabular-nums">
                                  {shortage.startTime}–{shortage.endTime}
                                </span>
                                <span className="text-xs font-semibold text-amber-800">
                                  Cover Needed
                                </span>
                              </div>

                              <div className="font-medium text-slate-900 truncate">
                                {shortage.role}
                              </div>

                              {/* 1-Click Tap Contract Pool Action Button */}
                              <button
                                type="button"
                                onClick={() => setQuickContractSelectShiftId(shortage.id)}
                                className="w-full py-1 px-1.5 text-xs font-medium bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors flex items-center justify-center gap-1 shadow-2xs"
                              >
                                <Zap className="w-3 h-3 text-amber-300" />
                                <span>Fill with Contract</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs text-neutral-400 font-mono">
                          ✓ Covered
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Contract Reliever Selector Popover/Modal */}
      {quickContractSelectShiftId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Select On-Call Contract Reliever
                </h3>
                <p className="text-xs text-neutral-500">
                  Ready specialists matching this open shift
                </p>
              </div>
              <button
                onClick={() => setQuickContractSelectShiftId(null)}
                className="p-1 rounded-md text-neutral-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-2.5">
              {contractPool.map((cw) => (
                <div
                  key={cw.id}
                  className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg hover:border-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={cw.avatarUrl}
                      alt={cw.name}
                      className="w-10 h-10 rounded-lg object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="font-semibold text-slate-900 text-xs">
                        {cw.name}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {cw.primaryRole} · ${cw.hourlyRate}/hr
                      </div>
                      <div className="text-xs text-emerald-600 font-mono">
                        {cw.reliabilityScore}% reliability · {cw.rating}★
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onQuickAssignContract(quickContractSelectShiftId, cw.id);
                      setQuickContractSelectShiftId(null);
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
                  >
                    Dispatch Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
