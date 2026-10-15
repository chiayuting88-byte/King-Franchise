import React from 'react';
import { Calendar, Users, Briefcase, Clock, MessageSquareQuote, Plus, HelpCircle } from 'lucide-react';

export type ActiveTab = 'roster' | 'timeoff' | 'contract' | 'staff' | 'exchange';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewShift: () => void;
  onOpenSupport: () => void;
  shortagesCount: number;
  pendingLeavesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewShift,
  onOpenSupport,
  shortagesCount,
  pendingLeavesCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand Wordmark (Single text element) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('roster')}
              className="flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                SF
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                ShiftFlow
              </span>
            </button>
          </div>

          {/* Zone 2: 5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <button
              onClick={() => setActiveTab('roster')}
              className={`whitespace-nowrap pb-0.5 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'roster'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent text-neutral-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4 text-neutral-500" />
              <span>Weekly Roster</span>
              {shortagesCount > 0 && (
                <span className="ml-1 text-xs text-amber-600 font-mono font-medium">
                  ({shortagesCount})
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('timeoff')}
              className={`whitespace-nowrap pb-0.5 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'timeoff'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent text-neutral-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-4 h-4 text-neutral-500" />
              <span>Time Off & Leaves</span>
              {pendingLeavesCount > 0 && (
                <span className="ml-1 text-xs text-amber-600 font-mono font-medium">
                  ({pendingLeavesCount})
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('contract')}
              className={`whitespace-nowrap pb-0.5 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'contract'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent text-neutral-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-4 h-4 text-neutral-500" />
              <span>Contract Staff Pool</span>
            </button>

            <button
              onClick={() => setActiveTab('staff')}
              className={`whitespace-nowrap pb-0.5 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'staff'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent text-neutral-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4 text-neutral-500" />
              <span>Staff Directory</span>
            </button>

            <button
              onClick={() => setActiveTab('exchange')}
              className={`whitespace-nowrap pb-0.5 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'exchange'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent text-neutral-600 hover:text-slate-900'
              }`}
            >
              <MessageSquareQuote className="w-4 h-4 text-neutral-500" />
              <span>Manager Exchange</span>
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action + Support link */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenSupport}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-slate-900 transition-colors"
              title="Manager Email Support & Helpdesk"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Support</span>
            </button>
            <button
              onClick={onOpenNewShift}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Shift</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav bar row for smaller screens */}
      <div className="md:hidden border-t border-neutral-100 px-4 py-2 flex items-center justify-between gap-1 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('roster')}
          className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
            activeTab === 'roster' ? 'bg-neutral-100 font-semibold text-slate-900' : 'text-neutral-600'
          }`}
        >
          Roster {shortagesCount > 0 ? `(${shortagesCount})` : ''}
        </button>
        <button
          onClick={() => setActiveTab('timeoff')}
          className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
            activeTab === 'timeoff' ? 'bg-neutral-100 font-semibold text-slate-900' : 'text-neutral-600'
          }`}
        >
          Time Off {pendingLeavesCount > 0 ? `(${pendingLeavesCount})` : ''}
        </button>
        <button
          onClick={() => setActiveTab('contract')}
          className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
            activeTab === 'contract' ? 'bg-neutral-100 font-semibold text-slate-900' : 'text-neutral-600'
          }`}
        >
          Contract Pool
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
            activeTab === 'staff' ? 'bg-neutral-100 font-semibold text-slate-900' : 'text-neutral-600'
          }`}
        >
          Directory
        </button>
        <button
          onClick={() => setActiveTab('exchange')}
          className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
            activeTab === 'exchange' ? 'bg-neutral-100 font-semibold text-slate-900' : 'text-neutral-600'
          }`}
        >
          Exchange
        </button>
      </div>
    </header>
  );
};
