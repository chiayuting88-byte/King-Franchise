import React, { useState } from 'react';
import { X, Sparkles, Lock, ShieldCheck, Briefcase, CheckCircle2, RotateCcw } from 'lucide-react';
import { AutoScheduleSettings, Shift, StaffMember, ContractWorker, TimeOffRequest } from '../types';
import { generateAutoSchedule } from '../utils/scheduler';

interface AutoScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentShifts: Shift[];
  staffList: StaffMember[];
  contractPool: ContractWorker[];
  timeOffRequests: TimeOffRequest[];
  weekDates: { dateStr: string; dayName: string }[];
  onApplySchedule: (newShifts: Shift[]) => void;
}

export const AutoScheduleModal: React.FC<AutoScheduleModalProps> = ({
  isOpen,
  onClose,
  currentShifts,
  staffList,
  contractPool,
  timeOffRequests,
  weekDates,
  onApplySchedule,
}) => {
  const [settings, setSettings] = useState<AutoScheduleSettings>({
    targetStaffPerMorning: 3,
    targetStaffPerAfternoon: 2,
    targetStaffPerEvening: 2,
    preserveLockedShifts: true,
    avoidOvertime: true,
    respectTimeOff: true,
    autoAssignContractShortages: false,
  });

  const [previewResult, setPreviewResult] = useState<ReturnType<typeof generateAutoSchedule> | null>(null);
  const [isGenerated, setIsGenerated] = useState(false);

  if (!isOpen) return null;

  const lockedShiftsCount = currentShifts.filter((s) => s.isLocked).length;

  const handlePreview = () => {
    const res = generateAutoSchedule(
      currentShifts,
      staffList,
      contractPool,
      timeOffRequests,
      settings,
      weekDates
    );
    setPreviewResult(res);
    setIsGenerated(true);
  };

  const handleApply = () => {
    if (previewResult) {
      onApplySchedule(previewResult.newShifts);
      onClose();
    } else {
      const res = generateAutoSchedule(
        currentShifts,
        staffList,
        contractPool,
        timeOffRequests,
        settings,
        weekDates
      );
      onApplySchedule(res.newShifts);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Automatic Roster Scheduling
              </h3>
              <p className="text-xs text-neutral-500">
                Generate balanced shifts with manual lock protection & contract backfill
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-slate-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Tweak & Lock Protection Banner */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
            <Lock className="w-4 h-4 text-slate-800 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700">
              <div className="font-semibold text-slate-900 mb-0.5">
                Roster Tweak Protection Active
              </div>
              You have <span className="font-mono font-semibold">{lockedShiftsCount} locked shift(s)</span> in this weekly schedule. The auto-scheduler will honor these exact assignments without overwriting your manual tweaks.
            </div>
          </div>

          {/* Engine Parameters */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 tracking-wide uppercase">
              Scheduling Parameters
            </h4>

            {/* Checkbox 1: Preserve Locked Shifts */}
            <label className="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={settings.preserveLockedShifts}
                onChange={(e) =>
                  setSettings({ ...settings, preserveLockedShifts: e.target.checked })
                }
                className="mt-0.5 rounded text-slate-900 focus:ring-slate-900"
              />
              <div className="text-xs">
                <span className="font-medium text-slate-900 block">
                  Preserve locked and manual shifts
                </span>
                <span className="text-neutral-500">
                  Keeps custom adjustments you previously tuned for specific staff members.
                </span>
              </div>
            </label>

            {/* Checkbox 2: Respect Approved Time Off */}
            <label className="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={settings.respectTimeOff}
                onChange={(e) =>
                  setSettings({ ...settings, respectTimeOff: e.target.checked })
                }
                className="mt-0.5 rounded text-slate-900 focus:ring-slate-900"
              />
              <div className="text-xs">
                <span className="font-medium text-slate-900 block">
                  Enforce approved time-off requests
                </span>
                <span className="text-neutral-500">
                  Staff with approved vacation or sick leave are automatically skipped.
                </span>
              </div>
            </label>

            {/* Checkbox 3: Avoid Overtime / Max Hours */}
            <label className="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={settings.avoidOvertime}
                onChange={(e) =>
                  setSettings({ ...settings, avoidOvertime: e.target.checked })
                }
                className="mt-0.5 rounded text-slate-900 focus:ring-slate-900"
              />
              <div className="text-xs">
                <span className="font-medium text-slate-900 block">
                  Enforce weekly max hours (Prevent overtime)
                </span>
                <span className="text-neutral-500">
                  Distributes hours fairly across full-time and part-time team members.
                </span>
              </div>
            </label>

            {/* Checkbox 4: Contract Staff Pool Backfill */}
            <label className="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={settings.autoAssignContractShortages}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    autoAssignContractShortages: e.target.checked,
                  })
                }
                className="mt-0.5 rounded text-slate-900 focus:ring-slate-900"
              />
              <div className="text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-slate-900">
                    Tap contract staff pool for remaining shortages
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">
                    (On-demand pool)
                  </span>
                </div>
                <span className="text-neutral-500">
                  When regular staff are at capacity or on leave, automatically dispatch matched contract relievers.
                </span>
              </div>
            </label>
          </div>

          {/* Real-time simulation preview */}
          {isGenerated && previewResult && (
            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wide uppercase text-neutral-300">
                  Auto-Roster Simulation Output
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  {previewResult.newShifts.length} total shifts
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1 border-t border-slate-800 text-center">
                <div className="p-2 bg-slate-800/80 rounded-lg">
                  <span className="block text-lg font-bold font-mono tabular-nums text-white">
                    {previewResult.stats.preservedCount}
                  </span>
                  <span className="text-xs text-neutral-400">Locked Kept</span>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-lg">
                  <span className="block text-lg font-bold font-mono tabular-nums text-emerald-400">
                    {previewResult.stats.generatedCount}
                  </span>
                  <span className="text-xs text-neutral-400">Staff Assigned</span>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-lg">
                  <span className="block text-lg font-bold font-mono tabular-nums text-sky-400">
                    {previewResult.stats.contractAssignedCount}
                  </span>
                  <span className="text-xs text-neutral-400">Contract Pool</span>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-lg">
                  <span className="block text-lg font-bold font-mono tabular-nums text-amber-400">
                    {previewResult.stats.shortageCount}
                  </span>
                  <span className="text-xs text-neutral-400">Open Shortages</span>
                </div>
              </div>

              <div className="text-xs text-neutral-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  Ready to deploy. You can tweak individual shifts on the grid after applying.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-neutral-50/50 border-t border-neutral-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePreview}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-800 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Simulate / Preview</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isGenerated ? 'Apply Auto-Roster' : 'Generate & Apply'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
