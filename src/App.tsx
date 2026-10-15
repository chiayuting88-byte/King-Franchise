import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { RosterView } from './components/RosterView';
import { TimeOffView } from './components/TimeOffView';
import { ContractPoolView } from './components/ContractPoolView';
import { StaffDirectoryView } from './components/StaffDirectoryView';
import { ManagerForumView } from './components/ManagerForumView';
import { ShiftModal } from './components/ShiftModal';
import { AutoScheduleModal } from './components/AutoScheduleModal';
import { SupportModal } from './components/SupportModal';

import {
  INITIAL_STAFF,
  INITIAL_CONTRACT_POOL,
  INITIAL_SHIFTS,
  INITIAL_TIME_OFF_REQUESTS,
  INITIAL_FORUM_POSTS,
} from './data/mockData';
import { Shift, StaffMember, ContractWorker, TimeOffRequest, ForumPost } from './types';
import { getWeekDates } from './utils/scheduler';
import { RotateCcw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('roster');

  // Core state persisted with fallback to mock data
  const [shifts, setShifts] = useState<Shift[]>(() => {
    const saved = localStorage.getItem('shiftflow_shifts');
    return saved ? JSON.parse(saved) : INITIAL_SHIFTS;
  });

  const [staffList, setStaffList] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem('shiftflow_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  const [contractPool, setContractPool] = useState<ContractWorker[]>(() => {
    const saved = localStorage.getItem('shiftflow_contract_pool');
    return saved ? JSON.parse(saved) : INITIAL_CONTRACT_POOL;
  });

  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>(() => {
    const saved = localStorage.getItem('shiftflow_timeoff');
    return saved ? JSON.parse(saved) : INITIAL_TIME_OFF_REQUESTS;
  });

  const [forumPosts, setForumPosts] = useState<ForumPost[]>(() => {
    const saved = localStorage.getItem('shiftflow_forum');
    return saved ? JSON.parse(saved) : INITIAL_FORUM_POSTS;
  });

  // Current active date context: Thursday Oct 15, 2026
  const [baseDate, setBaseDate] = useState<string>('2026-10-15');

  // Modals state
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [shiftToEdit, setShiftToEdit] = useState<Shift | null>(null);
  const [defaultShiftDate, setDefaultShiftDate] = useState<string>('2026-10-15');
  const [defaultStaffId, setDefaultStaffId] = useState<string | null>(null);

  const [isAutoScheduleOpen, setIsAutoScheduleOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('shiftflow_shifts', JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    localStorage.setItem('shiftflow_staff', JSON.stringify(staffList));
  }, [staffList]);

  useEffect(() => {
    localStorage.setItem('shiftflow_contract_pool', JSON.stringify(contractPool));
  }, [contractPool]);

  useEffect(() => {
    localStorage.setItem('shiftflow_timeoff', JSON.stringify(timeOffRequests));
  }, [timeOffRequests]);

  useEffect(() => {
    localStorage.setItem('shiftflow_forum', JSON.stringify(forumPosts));
  }, [forumPosts]);

  // Handler: Save Shift (create or update)
  const handleSaveShift = (updatedShift: Shift) => {
    setShifts((prev) => {
      const idx = prev.findIndex((s) => s.id === updatedShift.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedShift;
        return copy;
      }
      return [...prev, updatedShift];
    });
  };

  // Handler: Delete Shift
  const handleDeleteShift = (shiftId: string) => {
    setShifts((prev) => prev.filter((s) => s.id !== shiftId));
  };

  // Handler: Toggle Shift Lock
  const handleToggleShiftLock = (shiftId: string) => {
    setShifts((prev) =>
      prev.map((s) => (s.id === shiftId ? { ...s, isLocked: !s.isLocked } : s))
    );
  };

  // Handler: Open Shift Modal
  const handleOpenShiftModal = (
    shift?: Shift,
    defaultDateParam?: string,
    defaultStaffIdParam?: string | null
  ) => {
    setShiftToEdit(shift || null);
    setDefaultShiftDate(defaultDateParam || baseDate);
    setDefaultStaffId(defaultStaffIdParam !== undefined ? defaultStaffIdParam : null);
    setIsShiftModalOpen(true);
  };

  // Handler: Apply Auto-Schedule
  const handleApplyAutoSchedule = (newShifts: Shift[]) => {
    setShifts(newShifts);
  };

  // Handler: Quick Assign Contract Worker to Shortage
  const handleQuickAssignContract = (shortageId: string, contractWorkerId: string) => {
    const contractor = contractPool.find((cw) => cw.id === contractWorkerId);
    setShifts((prev) =>
      prev.map((s) => {
        if (s.id === shortageId) {
          return {
            ...s,
            staffId: contractWorkerId,
            isContract: true,
            isLocked: true, // Lock so manager's decision is protected
            notes: contractor ? `Covered by On-Call Reliever ${contractor.name}` : s.notes,
          };
        }
        return s;
      })
    );
  };

  // Handler: Approve Leave Request
  const handleApproveLeave = (requestId: string, autoVacateConflictingShifts: boolean) => {
    const targetReq = timeOffRequests.find((r) => r.id === requestId);
    if (!targetReq) return;

    setTimeOffRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'approved' } : r))
    );

    if (autoVacateConflictingShifts) {
      setShifts((prev) =>
        prev.map((s) => {
          if (
            s.staffId === targetReq.staffId &&
            s.date >= targetReq.startDate &&
            s.date <= targetReq.endDate
          ) {
            return {
              ...s,
              staffId: null, // Mark as open shortage!
              isLocked: false,
              notes: `Shortage: ${targetReq.staffName} on ${targetReq.type}. Tap contract pool to fill.`,
            };
          }
          return s;
        })
      );
    }
  };

  // Handler: Reject Leave Request
  const handleRejectLeave = (requestId: string, notes?: string) => {
    setTimeOffRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, status: 'rejected', managerNotes: notes } : r
      )
    );
  };

  // Handler: Submit New Leave Request
  const handleSubmitNewLeave = (
    newRequest: Omit<TimeOffRequest, 'id' | 'submittedAt' | 'status'>
  ) => {
    const created: TimeOffRequest = {
      ...newRequest,
      id: `to-${Date.now()}`,
      status: 'pending',
      submittedAt: 'Just now',
    };
    setTimeOffRequests((prev) => [created, ...prev]);
  };

  // Handler: Add Staff Member
  const handleAddStaff = (newStaff: StaffMember) => {
    setStaffList((prev) => [...prev, newStaff]);
  };

  // Handler: Update Staff Member
  const handleUpdateStaff = (updatedStaff: StaffMember) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === updatedStaff.id ? updatedStaff : s))
    );
  };

  // Handler: Direct booking from contract pool
  const handleDirectBookContract = (cw: ContractWorker) => {
    handleOpenShiftModal(undefined, baseDate, cw.id);
  };

  // Reset to original demo dataset
  const handleResetData = () => {
    setShifts(INITIAL_SHIFTS);
    setStaffList(INITIAL_STAFF);
    setContractPool(INITIAL_CONTRACT_POOL);
    setTimeOffRequests(INITIAL_TIME_OFF_REQUESTS);
    setForumPosts(INITIAL_FORUM_POSTS);
    setBaseDate('2026-10-15');
    localStorage.clear();
  };

  // Aggregate badge counts
  const weekDates = getWeekDates(baseDate);
  const weekShifts = shifts.filter(
    (s) => s.date >= weekDates[0].dateStr && s.date <= weekDates[6].dateStr
  );
  const openShortages = weekShifts.filter((s) => s.staffId === null);
  const pendingLeaves = timeOffRequests.filter((r) => r.status === 'pending');

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans">
      {/* Primary Top Bar Contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewShift={() => handleOpenShiftModal(undefined, baseDate, null)}
        onOpenSupport={() => setIsSupportModalOpen(true)}
        shortagesCount={openShortages.length}
        pendingLeavesCount={pendingLeaves.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'roster' && (
          <RosterView
            shifts={shifts}
            staffList={staffList}
            contractPool={contractPool}
            timeOffRequests={timeOffRequests}
            baseDate={baseDate}
            setBaseDate={setBaseDate}
            onOpenShiftModal={handleOpenShiftModal}
            onOpenAutoSchedule={() => setIsAutoScheduleOpen(true)}
            onToggleShiftLock={handleToggleShiftLock}
            onNavigateToContractPool={() => setActiveTab('contract')}
            onQuickAssignContract={handleQuickAssignContract}
          />
        )}

        {activeTab === 'timeoff' && (
          <TimeOffView
            timeOffRequests={timeOffRequests}
            staffList={staffList}
            shifts={shifts}
            onApproveRequest={handleApproveLeave}
            onRejectRequest={handleRejectLeave}
            onSubmitNewRequest={handleSubmitNewLeave}
            onNavigateToContractPool={() => setActiveTab('contract')}
          />
        )}

        {activeTab === 'contract' && (
          <ContractPoolView
            contractPool={contractPool}
            openShortages={openShortages}
            onAssignToShortage={handleQuickAssignContract}
            onDirectBook={handleDirectBookContract}
          />
        )}

        {activeTab === 'staff' && (
          <StaffDirectoryView
            staffList={staffList}
            shifts={shifts}
            onAddStaff={handleAddStaff}
            onUpdateStaff={handleUpdateStaff}
          />
        )}

        {activeTab === 'exchange' && (
          <ManagerForumView
            forumPosts={forumPosts}
            onAddPost={(p) => setForumPosts([p, ...forumPosts])}
            onOpenSupport={() => setIsSupportModalOpen(true)}
          />
        )}
      </main>

      {/* Subtle, purposeful footer */}
      <footer className="border-t border-neutral-200 bg-white py-6 mt-12 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">ShiftFlow</span>
            <span aria-hidden="true">·</span>
            <span>Intelligent Roster Scheduling & On-Call Contract Backfill</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleResetData}
              className="inline-flex items-center gap-1.5 text-neutral-500 hover:text-slate-900 transition-colors"
              title="Reset application to initial demo roster state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Data</span>
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsSupportModalOpen(true)}
              className="hover:text-slate-900 transition-colors"
            >
              Email Desk
            </button>
          </div>
        </div>
      </footer>

      {/* Shift Modal (Add / Edit / Tweak / Lock) */}
      <ShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        shiftToEdit={shiftToEdit}
        defaultDate={defaultShiftDate}
        defaultStaffId={defaultStaffId}
        staffList={staffList}
        contractPool={contractPool}
        timeOffRequests={timeOffRequests}
        onSaveShift={handleSaveShift}
        onDeleteShift={handleDeleteShift}
      />

      {/* Auto-Scheduler Modal (Key canvas proposition) */}
      <AutoScheduleModal
        isOpen={isAutoScheduleOpen}
        onClose={() => setIsAutoScheduleOpen(false)}
        currentShifts={shifts}
        staffList={staffList}
        contractPool={contractPool}
        timeOffRequests={timeOffRequests}
        weekDates={weekDates}
        onApplySchedule={handleApplyAutoSchedule}
      />

      {/* Manager Support Modal (Canvas customer relationship) */}
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
    </div>
  );
}
