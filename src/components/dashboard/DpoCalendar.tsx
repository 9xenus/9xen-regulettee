import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Search, 
  Filter, 
  BookOpen, 
  ShieldCheck, 
  FileText, 
  ClipboardList, 
  User, 
  Check, 
  X,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface DpoCalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  category: 'Audits' | 'Training' | 'Regulatory Filing' | 'Compliance';
  description?: string;
  assignedTo?: string;
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE';
}

interface DpoCalendarProps {
  onEventCountChange?: (count: number) => void;
}

export const DpoCalendar: React.FC<DpoCalendarProps> = ({ onEventCountChange }) => {
  // Simulated today's date
  const simulatedToday = '2026-07-05';
  const [todayYear, todayMonth, todayDay] = simulatedToday.split('-').map(Number);

  // Default events
  const [events, setEvents] = useState<DpoCalendarEvent[]>([
    {
      id: 'evt-1',
      title: 'GDPR Article 30 RPA Audit',
      date: '2026-07-10',
      category: 'Audits',
      description: 'Comprehensive review of all records of processing activities across technical stacks.',
      assignedTo: 'Dr. Helena Vandelay',
      status: 'PENDING'
    },
    {
      id: 'evt-2',
      title: 'Annual Privacy Awareness Training',
      date: '2026-07-15',
      category: 'Training',
      description: 'Mandatory company-wide training session on GDPR rights and incident response procedures.',
      assignedTo: 'Marcus Brody',
      status: 'PENDING'
    },
    {
      id: 'evt-3',
      title: 'DPA Annual Report Filing',
      date: '2026-07-28',
      category: 'Regulatory Filing',
      description: 'Submission of formal data protection compliance posture report to European DPAs.',
      assignedTo: 'Dr. Helena Vandelay',
      status: 'PENDING'
    },
    {
      id: 'evt-4',
      title: 'Sovereign Cloud Data Sovereignty Audit',
      date: '2026-07-04',
      category: 'Audits',
      description: 'Physical and logical auditing of regional cloud containment systems to verify geo-fencing compliance.',
      assignedTo: 'Elena Rostova',
      status: 'COMPLETED'
    },
    {
      id: 'evt-5',
      title: 'AI Act High-Risk Model Registration',
      date: '2026-08-01',
      category: 'Compliance',
      description: 'Submitting documentation for the high-risk underwriting LLM to the EU AI Database.',
      assignedTo: 'Dr. Helena Vandelay',
      status: 'PENDING'
    },
    {
      id: 'evt-6',
      title: 'DORA Incident Testing Seminar',
      date: '2026-06-25',
      category: 'Training',
      description: 'Operational resilience scenario testing and preparation with IT Security teams.',
      assignedTo: 'Marcus Brody',
      status: 'COMPLETED'
    },
    {
      id: 'evt-7',
      title: 'NIS2 Baseline Gap Analysis',
      date: '2026-07-18',
      category: 'Compliance',
      description: 'Pre-assessment and control mapping for critical supplier risk policies.',
      assignedTo: 'Sven Lindqvist',
      status: 'PENDING'
    },
    {
      id: 'evt-8',
      title: 'Vendor DPIA Sign-off',
      date: '2026-07-02',
      category: 'Compliance',
      description: 'Sign-off on the Data Protection Impact Assessment for the new HR portal.',
      assignedTo: 'Dr. Helena Vandelay',
      status: 'OVERDUE'
    },
  ]);

  // Calendar Year & Month State (defaults to July 2026)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // 6 = July (0-indexed)
  
  // Selection states
  const [selectedCellDate, setSelectedCellDate] = useState<{ day: number, month: number, year: number } | null>({
    day: 5,
    month: 6,
    year: 2026
  });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter settings: Toggle category visibility
  const [activeFilters, setActiveFilters] = useState<Record<DpoCalendarEvent['category'], boolean>>({
    Audits: true,
    Training: true,
    'Regulatory Filing': true,
    Compliance: true,
  });

  // Modal form states for adding new events
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '2026-07-10',
    category: 'Audits' as DpoCalendarEvent['category'],
    description: '',
    assignedTo: '',
  });

  // Category Configuration
  const categoryConfig: Record<DpoCalendarEvent['category'], {
    color: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
    dotColor: string;
    icon: any;
  }> = {
    Audits: {
      color: 'indigo',
      bgColor: 'bg-indigo-50 border-indigo-100',
      borderColor: 'border-indigo-400',
      textColor: 'text-indigo-700',
      dotColor: 'bg-indigo-500',
      icon: ClipboardList,
    },
    Training: {
      color: 'amber',
      bgColor: 'bg-amber-50 border-amber-100',
      borderColor: 'border-amber-400',
      textColor: 'text-amber-700',
      dotColor: 'bg-amber-500',
      icon: BookOpen,
    },
    'Regulatory Filing': {
      color: 'rose',
      bgColor: 'bg-rose-50 border-rose-100',
      borderColor: 'border-rose-400',
      textColor: 'text-rose-700',
      dotColor: 'bg-rose-500',
      icon: FileText,
    },
    Compliance: {
      color: 'emerald',
      bgColor: 'bg-emerald-50 border-emerald-100',
      borderColor: 'border-emerald-400',
      textColor: 'text-emerald-700',
      dotColor: 'bg-emerald-500',
      icon: ShieldCheck,
    },
  };

  // Helper: check if category is selected
  const toggleFilter = (category: DpoCalendarEvent['category']) => {
    setActiveFilters(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const selectAllFilters = () => {
    setActiveFilters({
      Audits: true,
      Training: true,
      'Regulatory Filing': true,
      Compliance: true,
    });
  };

  const deselectAllFilters = () => {
    setActiveFilters({
      Audits: false,
      Training: false,
      'Regulatory Filing': false,
      Compliance: false,
    });
  };

  // Filtered Events based on toggled filters and search query
  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      const isCategoryVisible = activeFilters[evt.category];
      const matchesSearch = searchQuery === '' || 
        evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (evt.description && evt.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (evt.assignedTo && evt.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()));
      return isCategoryVisible && matchesSearch;
    });
  }, [events, activeFilters, searchQuery]);

  // Calendar math
  const getDaysInMonth = (year: number, month: number) => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const numDays = new Date(year, month + 1, 0).getDate();
    
    const prevMonthNumDays = new Date(year, month, 0).getDate();
    const prevDays = [];
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      prevDays.push({
        day: prevMonthNumDays - i,
        month: month === 0 ? 11 : month - 1,
        year: month === 0 ? year - 1 : year,
        isCurrentMonth: false,
      });
    }
    
    const currentDays = [];
    for (let i = 1; i <= numDays; i++) {
      currentDays.push({
        day: i,
        month: month,
        year: year,
        isCurrentMonth: true,
      });
    }
    
    const totalCells = 42;
    const remainingCells = totalCells - (prevDays.length + currentDays.length);
    const nextDays = [];
    for (let i = 1; i <= remainingCells; i++) {
      nextDays.push({
        day: i,
        month: month === 11 ? 0 : month + 1,
        year: month === 11 ? year + 1 : year,
        isCurrentMonth: false,
      });
    }
    
    return [...prevDays, ...currentDays, ...nextDays];
  };

  const calendarDays = useMemo(() => {
    return getDaysInMonth(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  // Find events on a specific date
  const getEventsForDate = (day: number, month: number, year: number) => {
    return filteredEvents.filter(event => {
      const [evtYear, evtMonth, evtDay] = event.date.split("-").map(Number);
      return evtYear === year && (evtMonth - 1) === month && evtDay === day;
    });
  };

  // Get status class
  const getStatusBadge = (event: DpoCalendarEvent) => {
    if (event.status === 'COMPLETED') {
      return { label: 'Completed', class: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    }
    // Calculate urgency for pending items
    const [evtYear, evtMonth, evtDay] = event.date.split("-").map(Number);
    const eventTime = new Date(evtYear, evtMonth - 1, evtDay).getTime();
    const todayTime = new Date(todayYear, todayMonth - 1, todayDay).getTime();
    
    if (eventTime < todayTime) {
      return { label: 'Overdue', class: 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse' };
    } else if (eventTime - todayTime <= 7 * 24 * 60 * 60 * 1000) {
      return { label: 'Due Soon', class: 'bg-amber-100 text-amber-800 border-amber-200' };
    }
    return { label: 'Scheduled', class: 'bg-slate-100 text-slate-700 border-slate-200' };
  };

  // Get current events on the selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedCellDate) return [];
    return getEventsForDate(selectedCellDate.day, selectedCellDate.month, selectedCellDate.year);
  }, [selectedCellDate, filteredEvents]);

  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
    setSelectedCellDate(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
    setSelectedCellDate(null);
  };

  const handleResetToToday = () => {
    setCurrentYear(todayYear);
    setCurrentMonth(todayMonth - 1);
    setSelectedCellDate({ day: todayDay, month: todayMonth - 1, year: todayYear });
  };

  // Mark task complete / pending
  const toggleEventStatus = (id: string) => {
    setEvents(prev => prev.map(evt => {
      if (evt.id === id) {
        return {
          ...evt,
          status: evt.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
        };
      }
      return evt;
    }));
  };

  // Create new calendar milestone
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim()) return;

    const created: DpoCalendarEvent = {
      id: `evt-${Date.now()}`,
      title: newEvent.title,
      date: newEvent.date,
      category: newEvent.category,
      description: newEvent.description,
      assignedTo: newEvent.assignedTo || 'Unassigned',
      status: 'PENDING'
    };

    setEvents(prev => [...prev, created]);
    
    // Set view to the month of the added event
    const [ny, nm, nd] = newEvent.date.split('-').map(Number);
    setCurrentYear(ny);
    setCurrentMonth(nm - 1);
    setSelectedCellDate({ day: nd, month: nm - 1, year: ny });

    setIsAddOpen(false);
    setNewEvent({
      title: '',
      date: simulatedToday,
      category: 'Audits',
      description: '',
      assignedTo: '',
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Search & Category Filter Section */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-indigo-500" />
              Interactive DPO Calendar Filters
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Toggle categories to filter milestones and track strategic GDPR operations.</p>
          </div>
          
          <div className="relative max-w-md w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search milestones, assignees..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-between gap-y-3 pt-1">
          <div className="flex flex-wrap gap-2 items-center">
            {Object.entries(categoryConfig).map(([cat, conf]) => {
              const category = cat as DpoCalendarEvent['category'];
              const isSelected = activeFilters[category];
              const CatIcon = conf.icon;
              // Count total items in this category
              const count = events.filter(e => e.category === category).length;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleFilter(category)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
                    isSelected 
                      ? `${conf.bgColor} border-indigo-200 text-slate-800 shadow-sm ring-1 ring-indigo-500/10` 
                      : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? conf.dotColor : 'bg-slate-300'}`} />
                  <CatIcon className={`w-3.5 h-3.5 ${isSelected ? conf.textColor : 'text-slate-400'}`} />
                  <span>{category}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-slate-200 text-slate-800 font-bold' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={selectAllFilters}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline transition-all"
            >
              Select All
            </button>
            <span className="text-slate-300 text-[10px]">|</span>
            <button
              onClick={deselectAllFilters}
              className="text-[11px] text-slate-500 hover:text-slate-700 font-bold hover:underline transition-all"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Main Calendar Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Calendar Grid Sheet */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
            
            {/* Year / Month navigation */}
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-600 transition-all cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-bold text-slate-800 min-w-[130px] text-center flex items-center justify-center bg-slate-50 px-3 py-1.5 border border-slate-100 rounded-lg">
                <CalendarIcon className="w-4 h-4 mr-1.5 text-indigo-600" />
                {MONTH_NAMES[currentMonth]} {currentYear}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-600 transition-all cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated indicators */}
            <div className="flex items-center justify-between sm:justify-end gap-3 text-right">
              <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 font-bold font-mono">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                DPO Today: {simulatedToday}
              </span>
              <button
                type="button"
                onClick={handleResetToToday}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-100/50 transition-all cursor-pointer"
              >
                Jump to Today
              </button>
            </div>
          </div>

          {/* 7-Day Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {WEEK_DAYS.map(day => (
              <div key={day} className="py-1 bg-slate-50 rounded-md border border-slate-100/80">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Day Matrix */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((cell, idx) => {
              const cellEvents = getEventsForDate(cell.day, cell.month, cell.year);
              const isToday = cell.day === todayDay && cell.month === (todayMonth - 1) && cell.year === todayYear;
              const isSelected = selectedCellDate && selectedCellDate.day === cell.day && selectedCellDate.month === cell.month && selectedCellDate.year === cell.year;
              
              return (
                <button
                  key={`${cell.year}-${cell.month}-${cell.day}-${idx}`}
                  type="button"
                  onClick={() => setSelectedCellDate({ day: cell.day, month: cell.month, year: cell.year })}
                  className={`aspect-square p-1.5 rounded-xl border flex flex-col justify-between transition-all relative group text-left ${
                    cell.isCurrentMonth
                      ? isToday
                        ? 'bg-indigo-50/60 border-indigo-300 ring-1 ring-indigo-500 ring-offset-1'
                        : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50/50'
                      : 'bg-slate-50/20 border-slate-100/30 opacity-45 hover:opacity-75'
                  } ${
                    isSelected ? 'ring-2 ring-slate-800 border-transparent shadow-md bg-slate-50/30' : ''
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-[10px] font-bold ${
                      cell.isCurrentMonth
                        ? isToday
                          ? 'text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded-md font-black'
                          : 'text-slate-800'
                        : 'text-slate-400'
                    }`}>
                      {cell.day}
                    </span>
                    {isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping absolute top-1.5 right-1.5" />
                    )}
                  </div>

                  {/* Cell events indicator */}
                  <div className="space-y-1 w-full mt-1 overflow-hidden pr-0.5 max-h-[75%] flex flex-col justify-end">
                    {cellEvents.slice(0, 3).map((evt, i) => {
                      const conf = categoryConfig[evt.category];
                      const isComplete = evt.status === 'COMPLETED';
                      return (
                        <div 
                          key={`${evt.id}-${i}`} 
                          className={`truncate text-[9px] font-extrabold px-1 py-0.5 rounded border leading-tight ${conf.bgColor} ${isComplete ? 'opacity-50 line-through' : ''}`}
                          title={evt.title}
                        >
                          {evt.title}
                        </div>
                      );
                    })}
                    {cellEvents.length > 3 && (
                      <div className="text-[8px] font-bold text-slate-400 text-center">
                        +{cellEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Stats Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-500 bg-slate-50/30 p-2.5 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-slate-400 uppercase text-[9px] tracking-wider">Status Indicators:</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-md bg-emerald-500" />
                Completed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-md bg-rose-500" />
                Overdue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-md bg-indigo-500" />
                Pending
              </span>
            </div>

            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              Add Milestone / Task
            </button>
          </div>
        </div>

        {/* Selected Date Activity Details */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <div className="bg-slate-900 text-white border border-slate-800 rounded-xl p-5 shadow-xl flex-grow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-300">
                    {selectedCellDate 
                      ? `${MONTH_NAMES[selectedCellDate.month]} ${selectedCellDate.day}, ${selectedCellDate.year}`
                      : 'No Date Selected'
                    }
                  </h4>
                </div>
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  {selectedDateEvents.length} {selectedDateEvents.length === 1 ? 'Task' : 'Tasks'}
                </span>
              </div>

              {selectedDateEvents.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs flex flex-col items-center justify-center">
                  <div className="bg-slate-800 p-3 rounded-full mb-3">
                    <Info className="w-6 h-6 text-indigo-400" />
                  </div>
                  <p className="font-bold text-slate-300">Clear Compliance Day</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-xs leading-relaxed">
                    No active audits, milestones, filings or scheduled training modules for this date.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                  {selectedDateEvents.map(evt => {
                    const conf = categoryConfig[evt.category];
                    const CatIcon = conf.icon;
                    const statusInfo = getStatusBadge(evt);
                    const isCompleted = evt.status === 'COMPLETED';

                    return (
                      <div 
                        key={evt.id} 
                        className={`p-3.5 rounded-xl border transition-all ${
                          isCompleted 
                            ? 'bg-slate-800/40 border-slate-800 opacity-60' 
                            : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <div className={`p-1.5 rounded-lg bg-slate-700/50 border border-slate-600/50 ${conf.textColor} mt-0.5`}>
                              <CatIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className={`text-xs font-bold text-slate-100 ${isCompleted ? 'line-through text-slate-500' : ''}`}>
                                {evt.title}
                              </h5>
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md mt-1.5 inline-block ${conf.bgColor} ${conf.textColor}`}>
                                {evt.category}
                              </span>
                            </div>
                          </div>
                          
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border whitespace-nowrap ${statusInfo.class}`}>
                            {statusInfo.label}
                          </span>
                        </div>

                        {evt.description && (
                          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                            {evt.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2.5 mt-3 border-t border-slate-800/80 text-[10px] text-slate-400 font-bold">
                          <div className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-500" />
                            <span className="truncate max-w-[120px]">{evt.assignedTo}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleEventStatus(evt.id)}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors text-[9px] font-extrabold tracking-wider border cursor-pointer ${
                              isCompleted 
                                ? 'bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600' 
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent'
                            }`}
                          >
                            {isCompleted ? (
                              <>
                                <X className="w-3 h-3" />
                                Undo Done
                              </>
                            ) : (
                              <>
                                <Check className="w-3 h-3" />
                                Mark Done
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-slate-800/80 pt-3.5 mt-4 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>GDPR System Time</span>
              <span className="text-slate-400 font-bold">{simulatedToday}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE EVENT MODAL DIALOG */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-indigo-600" />
                  Add DPO Compliance Milestone
                </h4>
                <button 
                  onClick={() => setIsAddOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Milestone/Task Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Q3 DPO Review of AI Underwriting Systems"
                    value={newEvent.title}
                    onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Target Date</label>
                    <input
                      type="date"
                      required
                      value={newEvent.date}
                      onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Operation Category</label>
                    <select
                      value={newEvent.category}
                      onChange={e => setNewEvent({ ...newEvent, category: e.target.value as DpoCalendarEvent['category'] })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="Audits">Audits</option>
                      <option value="Training">Training</option>
                      <option value="Regulatory Filing">Regulatory Filing</option>
                      <option value="Compliance">Compliance Deadlines</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned DPO Officer</label>
                  <input
                    type="text"
                    placeholder="e.g., Dr. Helena Vandelay"
                    value={newEvent.assignedTo}
                    onChange={e => setNewEvent({ ...newEvent, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Operational Description</label>
                  <textarea
                    rows={3}
                    placeholder="Provide details on statutory scope, proof requirements, or key stakeholder alignment."
                    value={newEvent.description}
                    onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-4 py-2 hover:bg-slate-100 text-slate-600 font-bold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    Schedule Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
