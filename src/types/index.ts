export type RoleType = 
  | 'Store Supervisor'
  | 'Senior Barista'
  | 'Floor Associate'
  | 'Cashier & POS'
  | 'Inventory Specialist'
  | 'Kitchen Prep';

export type ShiftType = 'morning' | 'afternoon' | 'evening' | 'night';

export type EmploymentType = 'full-time' | 'part-time' | 'contract';

export interface StaffMember {
  id: string;
  name: string;
  role: RoleType;
  email: string;
  phone: string;
  avatarUrl: string;
  employmentType: EmploymentType;
  hourlyRate: number;
  maxWeeklyHours: number;
  preferredShifts: ShiftType[];
  skills: string[];
}

export interface Shift {
  id: string;
  staffId: string | null; // null if unassigned / shortage
  role: RoleType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  shiftType: ShiftType;
  hours: number;
  isLocked: boolean; // Locked shifts are preserved during auto-scheduling tweaks
  isAutoScheduled: boolean;
  isContract: boolean;
  notes?: string;
}

export type TimeOffType = 'Vacation' | 'Sick Leave' | 'Personal' | 'Bereavement' | 'Unpaid';
export type TimeOffStatus = 'pending' | 'approved' | 'rejected';

export interface TimeOffRequest {
  id: string;
  staffId: string;
  staffName: string;
  staffRole: RoleType;
  avatarUrl: string;
  type: TimeOffType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
  status: TimeOffStatus;
  submittedAt: string;
  managerNotes?: string;
}

export interface ContractWorker {
  id: string;
  name: string;
  primaryRole: RoleType;
  secondaryRoles: RoleType[];
  avatarUrl: string;
  rating: number; // e.g. 4.9
  completedShiftsCount: number;
  hourlyRate: number;
  reliabilityScore: number; // e.g. 99%
  availableDates: string[]; // YYYY-MM-DD
  phone: string;
  email: string;
  bio: string;
  skills: string[];
  isVerified: boolean;
}

export interface ForumPost {
  id: string;
  authorName: string;
  authorRole: string;
  authorCompany: string;
  avatarUrl: string;
  title: string;
  content: string;
  category: 'Rostering Tips' | 'Contract Staffing' | 'Labor Laws' | 'Emergency Relievers';
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  pinned?: boolean;
}

export interface AutoScheduleSettings {
  targetStaffPerMorning: number;
  targetStaffPerAfternoon: number;
  targetStaffPerEvening: number;
  preserveLockedShifts: boolean;
  avoidOvertime: boolean;
  respectTimeOff: boolean;
  autoAssignContractShortages: boolean;
}
