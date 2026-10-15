import React, { useState } from 'react';
import { Users, Plus, Mail, Phone, Clock, AlertTriangle, ShieldCheck, Search, Edit2 } from 'lucide-react';
import { StaffMember, Shift, RoleType, EmploymentType, ShiftType } from '../types';
import { calculateStaffScheduledHours } from '../utils/scheduler';

interface StaffDirectoryViewProps {
  staffList: StaffMember[];
  shifts: Shift[];
  onAddStaff: (newStaff: StaffMember) => void;
  onUpdateStaff: (updatedStaff: StaffMember) => void;
}

const ROLES: RoleType[] = [
  'Store Supervisor',
  'Senior Barista',
  'Floor Associate',
  'Cashier & POS',
  'Inventory Specialist',
  'Kitchen Prep',
];

export const StaffDirectoryView: React.FC<StaffDirectoryViewProps> = ({
  staffList,
  shifts,
  onAddStaff,
  onUpdateStaff,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Form states for adding/editing
  const [name, setName] = useState('');
  const [role, setRole] = useState<RoleType>('Floor Associate');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('full-time');
  const [hourlyRate, setHourlyRate] = useState<number>(20);
  const [maxWeeklyHours, setMaxWeeklyHours] = useState<number>(40);
  const [skillsStr, setSkillsStr] = useState('');

  const openAddModal = () => {
    setName('');
    setRole('Floor Associate');
    setEmail('');
    setPhone('');
    setEmploymentType('full-time');
    setHourlyRate(20);
    setMaxWeeklyHours(40);
    setSkillsStr('Customer Care, POS System');
    setIsAddModalOpen(true);
  };

  const openEditModal = (staff: StaffMember) => {
    setEditingStaff(staff);
    setName(staff.name);
    setRole(staff.role);
    setEmail(staff.email);
    setPhone(staff.phone);
    setEmploymentType(staff.employmentType);
    setHourlyRate(staff.hourlyRate);
    setMaxWeeklyHours(staff.maxWeeklyHours);
    setSkillsStr(staff.skills.join(', '));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const skills = skillsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingStaff) {
      onUpdateStaff({
        ...editingStaff,
        name,
        role,
        email,
        phone,
        employmentType,
        hourlyRate: Number(hourlyRate),
        maxWeeklyHours: Number(maxWeeklyHours),
        skills,
      });
      setEditingStaff(null);
    } else {
      const newMember: StaffMember = {
        id: `staff-${Date.now()}`,
        name,
        role,
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@shiftflow.internal`,
        phone: phone || '(555) 000-0000',
        avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + (staffList.length * 1234567) % 500000000}?auto=format&fit=crop&w=256&h=256&q=80`,
        employmentType,
        hourlyRate: Number(hourlyRate),
        maxWeeklyHours: Number(maxWeeklyHours),
        preferredShifts: ['morning', 'afternoon'],
        skills,
      };
      onAddStaff(newMember);
      setIsAddModalOpen(false);
    }
  };

  const filteredStaff = staffList.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.skills.some((sk) => sk.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
              <span>Workforce Roster Roster</span>
              <span aria-hidden="true">·</span>
              <span>Capacity & Overtime Tracking</span>
              <span aria-hidden="true">·</span>
              <span>Internal Team</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Staff Directory & Capacity
            </h1>
            <p className="text-sm text-neutral-600 mt-1 max-w-2xl">
              Track regular employee weekly hour loads against contractual limits. ShiftFlow warns you before staff cross overtime thresholds.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shadow-sm self-start md:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Team Member</span>
          </button>
        </div>

        {/* Aggregate team metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-neutral-100">
          <div>
            <span className="text-xs text-neutral-500 block">Total Roster Staff</span>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
              {staffList.length} members
            </span>
          </div>
          <div>
            <span className="text-xs text-neutral-500 block">Full-Time / Part-Time</span>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
              {staffList.filter((s) => s.employmentType === 'full-time').length} /{' '}
              {staffList.filter((s) => s.employmentType === 'part-time').length}
            </span>
          </div>
          <div>
            <span className="text-xs text-neutral-500 block">Weekly Max Capacity</span>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
              {staffList.reduce((acc, s) => acc + s.maxWeeklyHours, 0)}h
            </span>
          </div>
          <div>
            <span className="text-xs text-neutral-500 block">Avg Base Wage</span>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
              $
              {(
                staffList.reduce((acc, s) => acc + s.hourlyRate, 0) /
                (staffList.length || 1)
              ).toFixed(2)}
              /hr
            </span>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter staff by name, role, or skill..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
        />
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStaff.map((staff) => {
          const scheduledHours = calculateStaffScheduledHours(staff.id, shifts);
          const isOvertime = scheduledHours > staff.maxWeeklyHours;
          const isNearCap =
            scheduledHours >= staff.maxWeeklyHours - 4 && !isOvertime;

          return (
            <div
              key={staff.id}
              className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-neutral-300 transition-colors flex flex-col justify-between"
            >
              <div>
                {/* Header Profile */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={staff.avatarUrl}
                      alt={staff.name}
                      className="w-12 h-12 rounded-lg object-cover border border-neutral-200"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm">
                        {staff.name}
                      </h3>
                      <div className="text-xs text-neutral-500 font-medium capitalize">
                        {staff.role} · {staff.employmentType}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => openEditModal(staff)}
                    className="p-1.5 text-neutral-400 hover:text-slate-700 hover:bg-neutral-100 rounded-md transition-colors"
                    title="Edit Staff Member"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Capacity Progress Bar */}
                <div className="mt-4 p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-neutral-600 font-medium">Scheduled This Week</span>
                    <span
                      className={`font-mono font-semibold tabular-nums ${
                        isOvertime
                          ? 'text-rose-600'
                          : isNearCap
                          ? 'text-amber-600'
                          : 'text-slate-900'
                      }`}
                    >
                      {scheduledHours}h / {staff.maxWeeklyHours}h
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isOvertime
                          ? 'bg-rose-500'
                          : isNearCap
                          ? 'bg-amber-500'
                          : 'bg-slate-900'
                      }`}
                      style={{
                        width: `${Math.min(
                          (scheduledHours / staff.maxWeeklyHours) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>

                  {isOvertime && (
                    <div className="flex items-center gap-1.5 text-xs text-rose-600 mt-2 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Overtime limit exceeded (+{scheduledHours - staff.maxWeeklyHours}h)</span>
                    </div>
                  )}
                </div>

                {/* Unboxed Metadata: Rate & Contact */}
                <div className="mt-3 space-y-1.5 text-xs text-neutral-600">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Hourly Rate:</span>
                    <span className="font-mono font-semibold tabular-nums text-slate-900">
                      ${staff.hourlyRate.toFixed(2)}/hr
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Contact:</span>
                    <span className="truncate max-w-[180px]">{staff.email}</span>
                  </div>
                </div>

                {/* Skills tags (clean unboxed text with separators) */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500 mt-3 pt-3 border-t border-neutral-100">
                  <span className="font-semibold text-neutral-700">Skills:</span>
                  {staff.skills.map((skill, idx) => (
                    <React.Fragment key={skill}>
                      <span>{skill}</span>
                      {idx < staff.skills.length - 1 && <span aria-hidden="true">·</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Staff Modal */}
      {(isAddModalOpen || editingStaff) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
              <h3 className="text-base font-semibold text-slate-900">
                {editingStaff ? 'Edit Staff Profile' : 'Add New Staff Member'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingStaff(null);
                }}
                className="p-1 rounded-md text-neutral-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Samuel Green"
                  className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Primary Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as RoleType)}
                    className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Employment Type
                  </label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                    className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="full-time">Full-Time</option>
                    <option value="part-time">Part-Time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Hourly Wage ($)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="10"
                    required
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-mono tabular-nums px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Max Weekly Hours
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    required
                    value={maxWeeklyHours}
                    onChange={(e) => setMaxWeeklyHours(parseInt(e.target.value) || 40)}
                    className="w-full text-xs font-mono tabular-nums px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="samuel.g@shiftflow.internal"
                  className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Skills & Certifications (comma separated)
                </label>
                <input
                  type="text"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  placeholder="e.g. Latte Art, Keyholder, Food Safety"
                  className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingStaff(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
                >
                  {editingStaff ? 'Save Changes' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
