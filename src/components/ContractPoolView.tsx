import React, { useState } from 'react';
import { Briefcase, Star, CheckCircle, Search, Calendar, Phone, Mail, Zap, UserPlus } from 'lucide-react';
import { ContractWorker, Shift, RoleType } from '../types';

interface ContractPoolViewProps {
  contractPool: ContractWorker[];
  openShortages: Shift[];
  onAssignToShortage: (shortageShiftId: string, contractWorkerId: string) => void;
  onDirectBook: (contractWorker: ContractWorker) => void;
}

export const ContractPoolView: React.FC<ContractPoolViewProps> = ({
  contractPool,
  openShortages,
  onAssignToShortage,
  onDirectBook,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [bookingWorker, setBookingWorker] = useState<ContractWorker | null>(null);
  const [contactModalWorker, setContactModalWorker] = useState<ContractWorker | null>(null);

  // Filter contractors
  const filteredWorkers = contractPool.filter((cw) => {
    const matchesSearch =
      cw.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cw.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      cw.primaryRole.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      selectedRole === 'all' ||
      cw.primaryRole === selectedRole ||
      cw.secondaryRoles.includes(selectedRole as RoleType);

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Page Header & Canvas Proposition Spotlight */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
              <span>On-Demand Roster Contingency</span>
              <span aria-hidden="true">·</span>
              <span>Vetted Contractor Network</span>
              <span aria-hidden="true">·</span>
              <span>Instant Shift Dispatch</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Ready Contract Staff Pool
            </h1>
            <p className="text-sm text-neutral-600 mt-1 max-w-2xl">
              Tap into pre-screened on-call specialists to instantly cover last-minute sick leave, holiday surges, or staffing shortfalls without overtime penalties.
            </p>
          </div>

          {openShortages.length > 0 && (
            <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg shrink-0">
              <Zap className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-amber-900">
                  {openShortages.length} Uncovered Shift{openShortages.length > 1 ? 's' : ''} This Week
                </div>
                <div className="text-xs text-amber-700">
                  Select any contractor below to backfill immediately.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Operational Performance Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-neutral-100">
          <div>
            <span className="text-xs text-neutral-500 block">Available Now</span>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
              {contractPool.length} specialists
            </span>
          </div>
          <div>
            <span className="text-xs text-neutral-500 block">Average Reliability</span>
            <span className="text-xl font-bold font-mono tabular-nums text-emerald-600">
              99.3%
            </span>
          </div>
          <div>
            <span className="text-xs text-neutral-500 block">Shortage Fill Rate</span>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
              100%
            </span>
          </div>
          <div>
            <span className="text-xs text-neutral-500 block">Avg Hourly Rate</span>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
              $25.85/hr
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, skill (e.g., Espresso, POS, Keyholder)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        {/* Segmented Role Filter */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-neutral-100 rounded-lg text-xs">
          {['all', 'Store Supervisor', 'Senior Barista', 'Floor Associate', 'Cashier & POS', 'Kitchen Prep'].map(
            (role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                  selectedRole === role
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-neutral-600 hover:text-slate-900'
                }`}
              >
                {role === 'all' ? 'All Roles' : role}
              </button>
            )
          )}
        </div>
      </div>

      {/* Contract Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
        {filteredWorkers.map((cw) => {
          // Check if contractor matches any current open shortage
          const matchingShortages = openShortages.filter(
            (s) =>
              (s.role === cw.primaryRole || cw.secondaryRoles.includes(s.role)) &&
              cw.availableDates.includes(s.date)
          );

          return (
            <div
              key={cw.id}
              className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-neutral-300 transition-colors flex flex-col justify-between"
            >
              <div>
                {/* Header Profile */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={cw.avatarUrl}
                      alt={cw.name}
                      className="w-12 h-12 rounded-lg object-cover border border-neutral-200"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-slate-900 text-sm">{cw.name}</h3>
                        {cw.isVerified && (
                          <span title="Identity & Background Verified">
                            <CheckCircle className="w-3.5 h-3.5 text-sky-600" />
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-500 font-medium">
                        {cw.primaryRole}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold font-mono tabular-nums text-slate-900">
                      ${cw.hourlyRate}
                      <span className="text-xs font-normal text-neutral-500">/hr</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-amber-600 font-mono mt-0.5 justify-end">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{cw.rating}</span>
                      <span className="text-neutral-400 font-sans">
                        ({cw.completedShiftsCount} shifts)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-xs text-neutral-600 mt-3 line-clamp-2">
                  {cw.bio}
                </p>

                {/* Skills Unboxed metadata */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500 mt-3 pt-3 border-t border-neutral-100">
                  <span className="font-semibold text-neutral-700">Skills:</span>
                  {cw.skills.map((skill, idx) => (
                    <React.Fragment key={skill}>
                      <span>{skill}</span>
                      {idx < cw.skills.length - 1 && <span aria-hidden="true">·</span>}
                    </React.Fragment>
                  ))}
                </div>

                {/* Secondary Qualified Roles */}
                {cw.secondaryRoles.length > 0 && (
                  <div className="text-xs text-neutral-500 mt-1">
                    <span className="text-neutral-700 font-semibold">Also covers:</span>{' '}
                    {cw.secondaryRoles.join(', ')}
                  </div>
                )}

                {/* Availability status */}
                <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-neutral-100">
                  <span className="text-neutral-500">Reliability Record:</span>
                  <span className="font-mono font-semibold text-emerald-600">
                    {cw.reliabilityScore}% On-Time Arrival
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center gap-2">
                {matchingShortages.length > 0 ? (
                  <button
                    onClick={() => setBookingWorker(cw)}
                    className="flex-1 py-2 px-3 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Fill Open Shortage ({matchingShortages.length})</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onDirectBook(cw)}
                    className="flex-1 py-2 px-3 text-xs font-medium text-slate-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Schedule Shift</span>
                  </button>
                )}

                <button
                  onClick={() => setContactModalWorker(cw)}
                  className="py-2 px-3 text-xs font-medium text-neutral-600 hover:text-slate-900 bg-white border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors"
                  title="Contact Details & Call"
                >
                  <Phone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredWorkers.length === 0 && (
        <div className="p-12 text-center bg-white border border-neutral-200 rounded-xl">
          <Briefcase className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-900">No contract specialists found</h3>
          <p className="text-xs text-neutral-500 mt-1">
            Try adjusting your role filter or search keyword.
          </p>
        </div>
      )}

      {/* Booking Modal to assign directly to open shortage */}
      {bookingWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Assign {bookingWorker.name} to Shortage
                </h3>
                <p className="text-xs text-neutral-500">
                  Rate: ${bookingWorker.hourlyRate}/hr · Ready for immediate dispatch
                </p>
              </div>
              <button
                onClick={() => setBookingWorker(null)}
                className="p-1 rounded-md text-neutral-400 hover:text-slate-700 hover:bg-neutral-100"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-3">
              <span className="text-xs font-semibold text-slate-900 block">
                Select Open Shift to Fill:
              </span>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {openShortages.map((shortage) => (
                  <div
                    key={shortage.id}
                    className="p-3 border border-neutral-200 rounded-lg hover:border-slate-900 flex items-center justify-between gap-3 text-xs transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">
                        {shortage.role}
                      </div>
                      <div className="text-neutral-500 font-mono mt-0.5">
                        {shortage.date} · {shortage.startTime} - {shortage.endTime} ({shortage.hours}h)
                      </div>
                      {shortage.notes && (
                        <div className="text-amber-800 text-xs mt-1">
                          {shortage.notes}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        onAssignToShortage(shortage.id, bookingWorker.id);
                        setBookingWorker(null);
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md whitespace-nowrap transition-colors"
                    >
                      Confirm Dispatch
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Details Modal */}
      {contactModalWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
              <h3 className="text-sm font-semibold text-slate-900">
                Contact Specialist
              </h3>
              <button
                onClick={() => setContactModalWorker(null)}
                className="p-1 rounded-md text-neutral-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={contactModalWorker.avatarUrl}
                  alt={contactModalWorker.name}
                  className="w-12 h-12 rounded-lg object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">
                    {contactModalWorker.name}
                  </h4>
                  <p className="text-neutral-500">{contactModalWorker.primaryRole}</p>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <div className="flex items-center gap-2 text-neutral-700">
                  <Phone className="w-4 h-4 text-neutral-400" />
                  <span className="font-mono">{contactModalWorker.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-700">
                  <Mail className="w-4 h-4 text-neutral-400" />
                  <span>{contactModalWorker.email}</span>
                </div>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg text-neutral-600 text-xs">
                Emergency dispatch SMS alerts are automatically routed to the contractor once assigned to a shift.
              </div>
              <button
                onClick={() => setContactModalWorker(null)}
                className="w-full py-2 bg-slate-900 text-white rounded-lg font-medium text-xs hover:bg-slate-800 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
