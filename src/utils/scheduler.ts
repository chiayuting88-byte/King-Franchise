import { StaffMember, Shift, TimeOffRequest, ContractWorker, AutoScheduleSettings, RoleType, ShiftType } from '../types';

export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function getWeekDates(baseDateStr: string = '2026-10-15'): { dateStr: string; dayName: string; formatted: string; isToday: boolean }[] {
  const base = new Date(baseDateStr + 'T00:00:00');
  // Determine current day of week (0 is Sunday, 1 is Monday...)
  const day = base.getDay();
  // Monday is index 1; diff to Monday:
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(base);
  monday.setDate(base.getDate() + diffToMonday);

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayNum = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${dayNum}`;
    
    const dayName = DAYS_OF_WEEK[i];
    const monthShort = d.toLocaleDateString('en-US', { month: 'short' });
    const formatted = `${dayName}, ${monthShort} ${d.getDate()}`;
    const isToday = dateStr === '2026-10-15';

    dates.push({ dateStr, dayName, formatted, isToday });
  }

  return dates;
}

export function isStaffOnApprovedLeave(staffId: string, dateStr: string, timeOffRequests: TimeOffRequest[]): boolean {
  return timeOffRequests.some(
    req =>
      req.staffId === staffId &&
      req.status === 'approved' &&
      dateStr >= req.startDate &&
      dateStr <= req.endDate
  );
}

export function calculateStaffScheduledHours(staffId: string, shifts: Shift[]): number {
  return shifts
    .filter(s => s.staffId === staffId)
    .reduce((total, s) => total + s.hours, 0);
}

export function detectConflicts(shifts: Shift[], timeOffRequests: TimeOffRequest[]): { shiftId: string; reason: string }[] {
  const conflicts: { shiftId: string; reason: string }[] = [];

  shifts.forEach(shift => {
    if (!shift.staffId) return;

    // Check time off conflict
    const onLeave = isStaffOnApprovedLeave(shift.staffId, shift.date, timeOffRequests);
    if (onLeave) {
      conflicts.push({
        shiftId: shift.id,
        reason: 'Staff is on approved time off on this date',
      });
    }

    // Check double booking on the same date
    const sameDayShifts = shifts.filter(s => s.staffId === shift.staffId && s.date === shift.date && s.id !== shift.id);
    if (sameDayShifts.length > 0) {
      conflicts.push({
        shiftId: shift.id,
        reason: 'Staff has overlapping or double-booked shifts on this day',
      });
    }
  });

  return conflicts;
}

export interface AutoScheduleResult {
  newShifts: Shift[];
  stats: {
    preservedCount: number;
    generatedCount: number;
    contractAssignedCount: number;
    shortageCount: number;
  };
}

export function generateAutoSchedule(
  currentShifts: Shift[],
  staffList: StaffMember[],
  contractPool: ContractWorker[],
  timeOffRequests: TimeOffRequest[],
  settings: AutoScheduleSettings,
  targetDates: { dateStr: string; dayName: string }[]
): AutoScheduleResult {
  // 1. Separate preserved shifts (locked or manual if preserveLockedShifts is on)
  const preservedShifts = settings.preserveLockedShifts
    ? currentShifts.filter(s => s.isLocked)
    : [];

  const preservedIds = new Set(preservedShifts.map(s => s.id));
  const resultShifts: Shift[] = [...preservedShifts];

  // Track hours accumulated by staff in the roster so far
  const staffHoursMap = new Map<string, number>();
  staffList.forEach(s => staffHoursMap.set(s.id, 0));
  preservedShifts.forEach(s => {
    if (s.staffId && staffHoursMap.has(s.staffId)) {
      staffHoursMap.set(s.staffId, (staffHoursMap.get(s.staffId) || 0) + s.hours);
    }
  });

  let generatedCount = 0;
  let contractAssignedCount = 0;
  let shortageCount = 0;

  // Define standard shift templates per day
  const dailyTemplates: { shiftType: ShiftType; startTime: string; endTime: string; hours: number; roles: RoleType[] }[] = [
    {
      shiftType: 'morning',
      startTime: '07:00',
      endTime: '15:30',
      hours: 8,
      roles: ['Store Supervisor', 'Senior Barista', 'Kitchen Prep'],
    },
    {
      shiftType: 'afternoon',
      startTime: '12:00',
      endTime: '20:00',
      hours: 7.5,
      roles: ['Floor Associate', 'Cashier & POS'],
    },
    {
      shiftType: 'evening',
      startTime: '15:00',
      endTime: '22:00',
      hours: 7,
      roles: ['Floor Associate', 'Cashier & POS'],
    },
  ];

  targetDates.forEach(day => {
    dailyTemplates.forEach(template => {
      template.roles.forEach(role => {
        // Check if there is already a preserved shift covering this role and shiftType on this date
        const alreadyCovered = resultShifts.some(
          s => s.date === day.dateStr && s.shiftType === template.shiftType && s.role === role && s.staffId !== null
        );

        if (alreadyCovered) {
          return; // Already satisfied by a locked/manual shift
        }

        // Find available regular staff candidate
        const candidates = staffList.filter(staff => {
          // Check role qualification
          const roleMatch = staff.role === role || staff.skills.some(skill => skill.toLowerCase().includes(role.toLowerCase()));
          if (!roleMatch) return false;

          // Check approved leave
          if (settings.respectTimeOff && isStaffOnApprovedLeave(staff.id, day.dateStr, timeOffRequests)) {
            return false;
          }

          // Check if already scheduled on this day
          const alreadyWorkingToday = resultShifts.some(s => s.date === day.dateStr && s.staffId === staff.id);
          if (alreadyWorkingToday) return false;

          // Check max hours if avoidOvertime is enabled
          const currentHours = staffHoursMap.get(staff.id) || 0;
          if (settings.avoidOvertime && currentHours + template.hours > staff.maxWeeklyHours) {
            return false;
          }

          return true;
        });

        // Sort candidates by lowest accumulated hours first for fair distribution
        candidates.sort((a, b) => {
          const hoursA = staffHoursMap.get(a.id) || 0;
          const hoursB = staffHoursMap.get(b.id) || 0;
          // Also give small preference if shiftType is preferred
          const prefA = a.preferredShifts.includes(template.shiftType) ? -2 : 0;
          const prefB = b.preferredShifts.includes(template.shiftType) ? -2 : 0;
          return (hoursA + prefA) - (hoursB + prefB);
        });

        const selectedStaff = candidates[0];

        if (selectedStaff) {
          // Assign regular staff
          const shiftId = `auto-${day.dateStr}-${template.shiftType}-${role.replace(/\s+/g, '-').toLowerCase()}-${Math.random().toString(36).substring(2, 6)}`;
          resultShifts.push({
            id: shiftId,
            staffId: selectedStaff.id,
            role: role,
            date: day.dateStr,
            startTime: template.startTime,
            endTime: template.endTime,
            shiftType: template.shiftType,
            hours: template.hours,
            isLocked: false,
            isAutoScheduled: true,
            isContract: false,
          });

          staffHoursMap.set(selectedStaff.id, (staffHoursMap.get(selectedStaff.id) || 0) + template.hours);
          generatedCount++;
        } else if (settings.autoAssignContractShortages) {
          // Try to dispatch an available contract worker from ready pool
          const contractCandidates = contractPool.filter(cw => {
            const roleMatch = cw.primaryRole === role || cw.secondaryRoles.includes(role);
            const dateMatch = cw.availableDates.includes(day.dateStr);
            const alreadyWorkingToday = resultShifts.some(s => s.date === day.dateStr && s.staffId === cw.id);
            return roleMatch && dateMatch && !alreadyWorkingToday;
          });

          if (contractCandidates.length > 0) {
            const chosenContract = contractCandidates[0];
            const shiftId = `contract-auto-${day.dateStr}-${template.shiftType}-${Math.random().toString(36).substring(2, 6)}`;
            resultShifts.push({
              id: shiftId,
              staffId: chosenContract.id,
              role: role,
              date: day.dateStr,
              startTime: template.startTime,
              endTime: template.endTime,
              shiftType: template.shiftType,
              hours: template.hours,
              isLocked: false,
              isAutoScheduled: true,
              isContract: true,
              notes: `Auto-dispatched on-call contract reliever: ${chosenContract.name}`,
            });
            contractAssignedCount++;
          } else {
            // Unfilled shortage
            const shiftId = `shortage-${day.dateStr}-${template.shiftType}-${Math.random().toString(36).substring(2, 6)}`;
            resultShifts.push({
              id: shiftId,
              staffId: null,
              role: role,
              date: day.dateStr,
              startTime: template.startTime,
              endTime: template.endTime,
              shiftType: template.shiftType,
              hours: template.hours,
              isLocked: false,
              isAutoScheduled: true,
              isContract: false,
              notes: 'Staff shortage: no regular staff available. Tap to assign contract worker.',
            });
            shortageCount++;
          }
        } else {
          // Unfilled shortage slot
          const shiftId = `shortage-${day.dateStr}-${template.shiftType}-${Math.random().toString(36).substring(2, 6)}`;
          resultShifts.push({
            id: shiftId,
            staffId: null,
            role: role,
            date: day.dateStr,
            startTime: template.startTime,
            endTime: template.endTime,
            shiftType: template.shiftType,
            hours: template.hours,
            isLocked: false,
            isAutoScheduled: true,
            isContract: false,
            notes: 'Unassigned shift: shortage. Tap contract pool to fill.',
          });
          shortageCount++;
        }
      });
    });
  });

  return {
    newShifts: resultShifts,
    stats: {
      preservedCount: preservedShifts.length,
      generatedCount,
      contractAssignedCount,
      shortageCount,
    },
  };
}
