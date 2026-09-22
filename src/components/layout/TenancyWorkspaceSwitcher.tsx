import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Building2, 
  ChevronDown, 
  Search, 
  Check, 
  ShieldAlert, 
  Server, 
  Plus, 
  ExternalLink, 
  Lock, 
  Sparkles, 
  Globe, 
  CheckCircle2,
  X,
  Layers,
  ArrowRight,
  Filter
} from 'lucide-react';
import { useTenant, TenantWorkspaceItem } from '../../context/TenantContext';
import { useNotification } from '../../context/NotificationContext';

interface TenancyWorkspaceSwitcherProps {
  activePath?: string;
  onNavigate?: (path: string) => void;
  compactMobile?: boolean;
}

export const TenancyWorkspaceSwitcher: React.FC<TenancyWorkspaceSwitcherProps> = ({
  activePath = '',
  onNavigate,
  compactMobile = false
}) => {
  const { tenants, activeTenant, switchTenant, isLoading } = useTenant();
  const { showToast } = useNotification();
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'ACTIVE' | 'ENTERPRISE' | 'SUSPENDED'>('ALL');

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery('');
      setFilterCategory('ALL');
    }
  }, [isOpen]);

  // Filtered tenants list
  const filteredTenants = useMemo(() => {
    return tenants.filter(t => {
      // Search query match
      const queryLower = searchQuery.toLowerCase().trim();
      const matchesSearch = !queryLower || (
        t.name.toLowerCase().includes(queryLower) ||
        t.id.toLowerCase().includes(queryLower) ||
        t.region.toLowerCase().includes(queryLower) ||
        t.tier.toLowerCase().includes(queryLower) ||
        (t.activeActs && t.activeActs.some(act => act.toLowerCase().includes(queryLower)))
      );

      // Category filter match
      let matchesCategory = true;
      if (filterCategory === 'ACTIVE') {
        matchesCategory = t.status === 'ACTIVE';
      } else if (filterCategory === 'ENTERPRISE') {
        matchesCategory = t.tier.toLowerCase().includes('enterprise') || t.tier.toLowerCase().includes('sovereign');
      } else if (filterCategory === 'SUSPENDED') {
        matchesCategory = t.status === 'SUSPENDED' || t.status === 'ONBOARDING';
      }

      return matchesSearch && matchesCategory;
    });
  }, [tenants, searchQuery, filterCategory]);

  const handleSelectTenant = (tenant: TenantWorkspaceItem) => {
    if (tenant.id === activeTenant.id) {
      setIsOpen(false);
      return;
    }

    const switched = switchTenant(tenant.id);
    setIsOpen(false);

    if (switched) {
      const currentRouteDisplay = activePath ? `/${activePath.replace(/^\//, '')}` : 'Current Dashboard';
      showToast(
        `Switched workspace to "${switched.name}" (${switched.region}). View maintained: ${currentRouteDisplay}`,
        'success',
        'Tenancy Workspace Switch'
      );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ACTIVE
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            SUSPENDED
          </span>
        );
      case 'ONBOARDING':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            ONBOARDING
          </span>
        );
      case 'GLOBAL':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            GLOBAL HQ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="relative inline-block text-left shrink-0" ref={containerRef} id="tenancy-workspace-switcher">
      {/* Switcher Button Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`group flex items-center justify-between gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 h-8 sm:h-8.5 bg-slate-100/90 hover:bg-slate-200/80 dark:bg-slate-800/90 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer shrink-0 max-w-[125px] xs:max-w-[160px] sm:max-w-[240px] ${
          isOpen ? 'ring-2 ring-emerald-500/40 border-emerald-500/60 dark:border-emerald-500/60' : ''
        }`}
        title="Switch Client Tenancy Workspace (Preserving Active View)"
      >
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className="relative shrink-0 flex items-center justify-center w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 dark:from-emerald-950 dark:to-slate-900 border border-slate-700 dark:border-emerald-800/60 text-emerald-400 shadow-inner">
            <Building2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span 
              className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-white dark:border-slate-900 ${
                activeTenant.status === 'ACTIVE' ? 'bg-emerald-500' :
                activeTenant.status === 'SUSPENDED' ? 'bg-rose-500' :
                activeTenant.status === 'ONBOARDING' ? 'bg-amber-500' : 'bg-indigo-500'
              }`}
            />
          </div>

          <div className="flex flex-col items-start min-w-0 text-left leading-none">
            <div className="flex items-center gap-1 max-w-[65px] xs:max-w-[95px] sm:max-w-[150px] md:max-w-[190px]">
              <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {activeTenant.name}
              </span>
            </div>
            
            <div className="hidden sm:flex items-center gap-1 text-[9px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              <span className="truncate max-w-[80px]">{activeTenant.region}</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{activeTenant.tier}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 ml-0.5">
          <span className="hidden xl:inline-block px-1 py-0.2 text-[8px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-700/60 rounded">
            Switch
          </span>
          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Tenancy Workspace Switcher Dropdown */}
      {isOpen && (
        <>
          {/* Mobile backdrop overlay */}
          <div 
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 sm:hidden animate-in fade-in"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto top-15 sm:top-full left-3 sm:left-0 mt-1 sm:mt-2 w-[calc(100vw-24px)] sm:w-96 md:w-[420px] max-w-[420px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          {/* Header Bar */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <span>Tenancy Workspace Switcher</span>
                    <span className="px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[9px] font-mono uppercase font-black">
                      State Locked
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Switch client tenant environment while maintaining active view
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Bar Input */}
            <div className="relative mt-2">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tenant by name, region, tier or framework..."
                className="w-full pl-8 pr-8 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 mt-2.5 overflow-x-auto pb-0.5 scrollbar-none">
              {(['ALL', 'ACTIVE', 'ENTERPRISE', 'SUSPENDED'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    filterCategory === cat
                      ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {cat === 'ALL' ? `All (${tenants.length})` : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tenants List */}
          <div className="p-1.5 max-h-[280px] sm:max-h-[320px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredTenants.length === 0 ? (
              <div className="py-8 text-center px-4">
                <Building2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No matching client environments</p>
                <p className="text-[10px] text-slate-400 mt-1">Try refining your search query or category filter</p>
              </div>
            ) : (
              filteredTenants.map((t) => {
                const isSelected = t.id === activeTenant.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTenant(t)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start justify-between gap-3 group cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 shadow-2xs'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <div className={`mt-0.5 p-2 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected 
                          ? 'bg-emerald-500 text-slate-950 font-bold' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                      }`}>
                        <Building2 className="w-4 h-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`text-xs font-bold truncate ${
                            isSelected ? 'text-emerald-900 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                          }`}>
                            {t.name}
                          </p>
                          {getStatusBadge(t.status)}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                            <Globe className="w-3 h-3 text-slate-400" />
                            {t.region}
                          </span>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span>Tier: <strong className="text-slate-700 dark:text-slate-200">{t.tier}</strong></span>
                          {t.complianceHealth !== undefined && (
                            <>
                              <span className="text-slate-300 dark:text-slate-600">•</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                {t.complianceHealth}% Health
                              </span>
                            </>
                          )}
                        </div>

                        {/* Active Compliance Acts Pills */}
                        {t.activeActs && t.activeActs.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {t.activeActs.slice(0, 4).map((act, idx) => (
                              <span 
                                key={idx}
                                className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-mono border border-slate-200 dark:border-slate-700"
                              >
                                {act}
                              </span>
                            ))}
                            {t.activeActs.length > 4 && (
                              <span className="text-[9px] text-slate-400 font-mono">
                                +{t.activeActs.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                      {isSelected ? (
                        <div className="p-1 bg-emerald-500 text-slate-950 rounded-full shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                          Switch <ArrowRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Actions & State View Banner */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              <Lock className="w-3 h-3 text-emerald-500 shrink-0" />
              <span className="truncate">View Locked: <strong className="text-slate-700 dark:text-slate-200">{activePath ? `/${activePath.replace(/^\//, '')}` : 'Dashboard'}</strong></span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onNavigate('tenants');
                  }}
                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Building2 className="w-3 h-3 text-indigo-500" />
                  <span>Manage All</span>
                </button>
              )}

              {onNavigate && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onNavigate('onboarding');
                  }}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>Onboard Tenant</span>
                </button>
              )}
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
};
