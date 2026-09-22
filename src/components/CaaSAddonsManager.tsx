import React, { useState, useEffect, useMemo } from 'react';
import { z } from 'zod';
import { 
  Package, 
  ShieldCheck, 
  Plus, 
  Settings, 
  Power, 
  CheckCircle2, 
  Search, 
  Sliders, 
  Filter, 
  CheckSquare, 
  X, 
  ShoppingCart, 
  Trash2, 
  Edit2, 
  Download, 
  Activity, 
  DollarSign, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../context/NotificationContext';

// Zod Validation Schema for strict input integrity
const caasAddonSchema = z.object({
  id: z.string()
    .min(3, { message: "Addon ID must be at least 3 characters" })
    .max(50, { message: "Addon ID must not exceed 50 characters" })
    .regex(/^[a-z0-9-_]+$/, { message: "ID must contain only lowercase letters, numbers, hyphens, or underscores" }),
  name: z.string()
    .min(3, { message: "Addon Name must be at least 3 characters" })
    .max(100, { message: "Addon Name must not exceed 100 characters" }),
  category: z.string()
    .min(2, { message: "Category name must be specified" })
    .max(50, { message: "Category must not exceed 50 characters" }),
  description: z.string()
    .min(5, { message: "Description must be at least 5 characters" })
    .max(500, { message: "Description must not exceed 500 characters" }),
  price: z.string()
    .min(2, { message: "Price label is required (e.g. €499/mo)" })
    .max(30, { message: "Price label must not exceed 30 characters" }),
  act_id: z.string()
    .min(2, { message: "Associated Act ID is required (e.g. gdpr)" })
    .max(20, { message: "Act ID must not exceed 20 characters" }),
});

const DEFAULT_ADDONS = [
  {
    id: 'addon-gdpr-consent',
    name: 'Advanced Consent Banner & Tracking Enabler',
    category: 'Privacy & Consent',
    description: 'Dynamic opt-in consent network with real-time zero-copy logging for compliance under GDPR Art. 7.',
    price: '€199/mo',
    act_id: 'gdpr',
    isActiveGlobally: true,
    color_class: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    packageDetails: { tracking: true, audit: 'zero-copy' }
  },
  {
    id: 'addon-ai-act-eval',
    name: 'EU AI Act Risk Class Evaluation Engine',
    category: 'AI Governance',
    description: 'Continuous bias and drift evaluation framework for high-risk AI models (Annex III & IV).',
    price: '€499/mo',
    act_id: 'ai_act',
    isActiveGlobally: true,
    color_class: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    packageDetails: { bias_check: true, drift_telemetry: true }
  },
  {
    id: 'addon-nis2-incident',
    name: 'NIS2 Automated Incident Reporter',
    category: 'Cybersecurity',
    description: 'Automated notification drafting with SLA countdown timer (<24h early warning under NIS2 Art. 21).',
    price: '€299/mo',
    act_id: 'nis2',
    isActiveGlobally: false,
    color_class: 'bg-rose-50 text-rose-600 border-rose-200',
    packageDetails: { sla: '24h', auto_draft: true }
  },
  {
    id: 'addon-dora-drill',
    name: 'Dora Operational Resilience Stress Tester',
    category: 'Resiliency & Continuity',
    description: 'ICT infrastructure vulnerability scanners and simulated cloud enclaves failover scenarios.',
    price: '€399/mo',
    act_id: 'dora',
    isActiveGlobally: true,
    color_class: 'bg-amber-50 text-amber-600 border-amber-200',
    packageDetails: { stress_tests: 12, auto_failover: true }
  }
];

export const CaaSAddonsManager: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { showToast } = useNotification();
  const [addons, setAddons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  
  // Selection and Modals
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<any | null>(null);
  
  // Form input states
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formActId, setFormActId] = useState('');
  const [formPackageRaw, setFormPackageRaw] = useState('{\n  "enabled": true\n}');
  
  // Field errors validation
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const fetchAddons = () => {
    setLoading(true);
    // Fetch from caas-marketplace first
    fetch("/api/v1/admin/caas-marketplace/addons", {
      headers: { 'x-user-role': 'ADMIN' }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Admin fetch failed");
        return res.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.addons)) {
          setAddons(data.addons);
        } else {
          throw new Error("No addons returned");
        }
      })
      .catch(() => {
        // Fallback to /api/v1/caas/addons
        fetch("/api/v1/caas/addons")
          .then((res) => res.json())
          .then((data) => {
            if (data.addons && Array.isArray(data.addons)) {
              setAddons(data.addons);
            } else {
              setAddons(DEFAULT_ADDONS);
            }
          })
          .catch(() => {
            setAddons(DEFAULT_ADDONS);
          });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAddons();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    addons.forEach((a) => {
      if (a.category) {
        cats.add(a.category);
      }
    });
    return Array.from(cats);
  }, [addons]);

  const filteredAddons = useMemo(() => {
    return addons.filter((addon) => {
      const matchesSearch = 
        addon.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        addon.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        addon.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === "ALL" || addon.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [addons, searchTerm, categoryFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = addons.length;
    const active = addons.filter(a => a.isActiveGlobally).length;
    const inactive = total - active;
    const uniqueCats = categories.length;
    return { total, active, inactive, uniqueCats };
  }, [addons, categories]);

  const toggleAddon = async (id: string, currentlyEnabled: boolean) => {
    const nextState = !currentlyEnabled;
    try {
      // Optimistic state update
      setAddons((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isActiveGlobally: nextState } : a))
      );

      const res = await fetch(`/api/v1/admin/caas-marketplace/addons/${id}/toggle`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': 'ADMIN'
        },
        body: JSON.stringify({ enabled: nextState })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error("Failed to sync toggle");
      }
      showToast(`Add-on '${id}' successfully ${nextState ? 'enabled' : 'disabled'} globally.`, 'success');
    } catch (err) {
      // Revert state on failure
      setAddons((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isActiveGlobally: currentlyEnabled } : a))
      );
      showToast(`Could not toggle status on server, updated locally.`, 'warning');
    }
  };

  const handleSelection = (id: string) => {
    setSelectedAddonIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const filteredIds = filteredAddons.map(a => a.id);
    const allFilteredSelected = filteredIds.length > 0 && filteredIds.every(id => selectedAddonIds.includes(id));
    if (allFilteredSelected) {
      setSelectedAddonIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedAddonIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleBatchToggle = async (enabled: boolean) => {
    if (selectedAddonIds.length === 0) return;

    try {
      setAddons((prev) =>
        prev.map((a) =>
          selectedAddonIds.includes(a.id) ? { ...a, isActiveGlobally: enabled } : a
        )
      );

      const res = await fetch('/api/v1/admin/caas-marketplace/addons/batch-toggle', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': 'ADMIN'
        },
        body: JSON.stringify({ ids: selectedAddonIds, enabled })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Successfully ${enabled ? 'enabled' : 'disabled'} ${selectedAddonIds.length} add-ons in batch.`, 'success');
        setSelectedAddonIds([]);
      } else {
        throw new Error();
      }
    } catch (err) {
      showToast(`Batch update failed on server, state persisted locally.`, 'warning');
      setSelectedAddonIds([]);
    }
  };

  const handleOpenAddModal = () => {
    setEditingAddon(null);
    setFormId('addon-' + Math.random().toString(36).substring(2, 8));
    setFormName('');
    setFormCategory('General Governance');
    setFormDescription('');
    setFormPrice('€299/mo');
    setFormActId('gdpr');
    setFormPackageRaw('{\n  "version": "1.0.0",\n  "sandbox": true\n}');
    setFieldErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (addon: any) => {
    setEditingAddon(addon);
    setFormId(addon.id);
    setFormName(addon.name);
    setFormCategory(addon.category);
    setFormDescription(addon.description);
    setFormPrice(addon.price);
    setFormActId(addon.act_id || addon.actId || 'gdpr');
    setFormPackageRaw(JSON.stringify(addon.packageDetails || addon.package_details || { version: "1.0.0" }, null, 2));
    setFieldErrors({});
    setIsFormModalOpen(true);
  };

  const handleDeleteAddon = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete the '${name}' regulatory add-on?`)) {
      try {
        const response = await fetch(`/api/v1/admin/caas-marketplace/addons/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': 'ADMIN'
          }
        });
        const data = await response.json();
        if (data.success) {
          setAddons(prev => prev.filter(a => a.id !== id));
          setSelectedAddonIds(prev => prev.filter(i => i !== id));
          showToast(`Add-on '${name}' removed successfully.`, 'success');
        } else {
          showToast(`Failed to delete add-on: ${data.error || 'Server error'}`, 'error');
        }
      } catch (err: any) {
        showToast(`Network error: ${err.message}`, 'error');
      }
    }
  };

  const handleBatchDelete = async () => {
    if (confirm(`Are you sure you want to delete ${selectedAddonIds.length} selected add-ons?`)) {
      try {
        const response = await fetch('/api/v1/admin/caas-marketplace/addons/batch-delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': 'ADMIN'
          },
          body: JSON.stringify({ ids: selectedAddonIds })
        });
        const data = await response.json();
        if (data.success) {
          setAddons(prev => prev.filter(a => !selectedAddonIds.includes(a.id)));
          showToast(`Bulk deleted ${selectedAddonIds.length} add-ons.`, 'success');
          setSelectedAddonIds([]);
        } else {
          showToast(`Failed to bulk delete: ${data.error || 'Server error'}`, 'error');
        }
      } catch (err: any) {
        showToast(`Network error: ${err.message}`, 'error');
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Parse package details safely
    let parsedPackage = {};
    try {
      parsedPackage = JSON.parse(formPackageRaw);
    } catch (err) {
      setFieldErrors({ package_details: "Invalid JSON format for Package Details" });
      showToast("Please enter valid JSON for package configuration.", "warning");
      return;
    }

    // Zod validation
    const validationResult = caasAddonSchema.safeParse({
      id: formId,
      name: formName,
      category: formCategory,
      description: formDescription,
      price: formPrice,
      act_id: formActId,
    });

    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        errors[path] = issue.message;
      });
      setFieldErrors(errors);
      showToast("Validation failed. Please correct form fields.", "warning");
      return;
    }

    setFieldErrors({});

    const newOrUpdatedAddon = {
      id: formId,
      name: formName,
      category: formCategory,
      description: formDescription,
      price: formPrice,
      act_id: formActId,
      actId: formActId,
      packageDetails: parsedPackage,
      package_details: parsedPackage,
      isActiveGlobally: editingAddon ? editingAddon.isActiveGlobally : false,
      color_class: editingAddon ? editingAddon.color_class : 'bg-slate-100 text-slate-700 border-slate-200'
    };

    if (editingAddon) {
      // Update
      setAddons(prev => prev.map(a => a.id === editingAddon.id ? newOrUpdatedAddon : a));
      showToast(`Add-on '${formName}' updated successfully.`, 'success');
    } else {
      // Create
      setAddons(prev => [newOrUpdatedAddon, ...prev]);
      showToast(`Add-on '${formName}' registered successfully.`, 'success');
    }

    setIsFormModalOpen(false);

    // Save to server
    try {
      await fetch('/api/v1/admin/caas-marketplace/addons', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': 'ADMIN'
        },
        body: JSON.stringify(newOrUpdatedAddon)
      });
    } catch (err) {
      console.warn("Could not save to endpoint, kept local state", err);
    }
  };

  const handleExportCSV = () => {
    if (!filteredAddons.length) {
      showToast("No CaaS add-on data to export.", "warning");
      return;
    }
    const headers = ["Addon ID", "Name", "Category", "Act ID", "Price Label", "Global Status"];
    const rows = filteredAddons.map(a => [
      a.id,
      `"${a.name.replace(/"/g, '""')}"`,
      a.category,
      a.act_id || a.actId || '',
      a.price,
      a.isActiveGlobally ? "ENABLED" : "DISABLED"
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `CaaS_Sovereign_Addons_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showToast("CSV report exported successfully.", "success");
  };

  return (
    <div className={`p-4 sm:p-5 lg:p-6 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-xl space-y-6 text-left ${className}`}>
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Package className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">CaaS Sovereign Add-On Engine Manager</h3>
            <p className="text-xs text-slate-400">Sovereign super-admin control plane for advanced GRC regulatory plugins</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Export CSV report"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-500/15 transition-all cursor-pointer hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            Register New Add-on
          </button>
        </div>
      </div>

      {/* Telemetry Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/60">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Total Modules</span>
          <div className="text-xl font-black text-white mt-0.5">{stats.total}</div>
          <span className="text-[9px] text-indigo-400 font-medium">Sovereign Plugins</span>
        </div>
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/60">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Enabled Globally</span>
          <div className="text-xl font-black text-emerald-400 mt-0.5">{stats.active}</div>
          <span className="text-[9px] text-slate-400 font-medium">Running on active enclaves</span>
        </div>
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/60">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Disabled Globally</span>
          <div className="text-xl font-black text-slate-400 mt-0.5">{stats.inactive}</div>
          <span className="text-[9px] text-slate-500 font-medium">Available in sandbox</span>
        </div>
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/60">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Framework Categories</span>
          <div className="text-xl font-black text-indigo-400 mt-0.5">{stats.uniqueCats}</div>
          <span className="text-[9px] text-slate-400 font-medium">Segmented sectors</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search plugins by name, ID description, act framework..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setCategoryFilter("ALL")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              categoryFilter === "ALL" ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                categoryFilter === cat ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Select All & Multi Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950 px-4 py-3 rounded-2xl border border-slate-800 text-xs">
        <label className="flex items-center gap-2.5 cursor-pointer font-bold text-slate-300">
          <input
            type="checkbox"
            checked={filteredAddons.length > 0 && filteredAddons.every(addon => selectedAddonIds.includes(addon.id))}
            onChange={handleSelectAll}
            className="w-4 h-4 text-indigo-600 rounded border-slate-700 bg-slate-900 focus:ring-indigo-500 cursor-pointer"
          />
          Select All Filtered ({selectedAddonIds.length} of {filteredAddons.length} selected)
        </label>

        {selectedAddonIds.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBatchToggle(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer"
            >
              Enable Selected
            </button>
            <button
              onClick={() => handleBatchToggle(false)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg font-bold text-[11px] border border-slate-700 transition-all cursor-pointer"
            >
              Disable Selected
            </button>
            <button
              onClick={handleBatchDelete}
              className="bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 px-3 py-1.5 rounded-lg font-bold text-[11px] border border-rose-900/50 transition-all cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Delete Bulk
            </button>
          </div>
        )}
      </div>

      {/* Addons Grid */}
      {loading ? (
        <div className="py-12 text-center flex flex-col items-center justify-center gap-3">
          <Activity className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-xs font-mono text-slate-500">Retrieving secure GRC plugins...</p>
        </div>
      ) : filteredAddons.length === 0 ? (
        <div className="bg-slate-950 border border-dashed border-slate-800 rounded-2xl p-12 text-center">
          <AlertTriangle className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-300">No regulatory add-ons match the search</h4>
          <p className="text-xs text-slate-500 mt-1">Try resetting the filter category or input search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredAddons.map((addon) => {
              const isSelected = selectedAddonIds.includes(addon.id);
              return (
                <motion.div
                  key={addon.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className={`p-4 rounded-2xl bg-slate-950 border shadow-xs flex flex-col justify-between gap-4 hover:border-slate-700 transition-all ${
                    isSelected ? 'border-indigo-500/80 ring-1 ring-indigo-500/20' : 'border-slate-850'
                  }`}
                >
                  <div>
                    {/* Upper Line Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelection(addon.id)}
                          className="w-4 h-4 text-indigo-600 rounded border-slate-700 bg-slate-900 focus:ring-indigo-500 cursor-pointer"
                        />
                        <div className={`p-2 rounded-xl ${addon.color_class || 'bg-slate-900 text-slate-400 border border-slate-800'}`}>
                          <ShoppingCart className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            {addon.name}
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 uppercase block mt-0.5">{addon.id}</span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-900 text-indigo-400 border border-indigo-950 uppercase">
                        {addon.act_id || addon.actId || 'gdpr'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed mt-3.5">{addon.description}</p>
                  </div>

                  {/* Actions line */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-900 mt-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-400">{addon.price}</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wide bg-slate-900 px-2 py-0.5 rounded border border-slate-850">
                        {addon.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Edit button */}
                      <button
                        onClick={() => handleOpenEditModal(addon)}
                        className="p-1.5 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg border border-slate-850 transition-colors cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteAddon(addon.id, addon.name)}
                        className="p-1.5 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-lg border border-slate-850 transition-colors cursor-pointer"
                        title="Remove Addon"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Status switch power button */}
                      <button
                        onClick={() => toggleAddon(addon.id, addon.isActiveGlobally)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          addon.isActiveGlobally
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-slate-900 border-slate-850 text-slate-500"
                        }`}
                        title={addon.isActiveGlobally ? "Disable Globally" : "Enable Globally"}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* CREATE & EDIT FORM MODAL */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-100 flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                <div className="flex items-center gap-2 text-white">
                  <Settings className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-md font-bold uppercase tracking-wide">
                    {editingAddon ? 'Edit CaaS Add-on Details' : 'Register New CaaS Add-on'}
                  </h3>
                </div>
                <button 
                  onClick={() => setIsFormModalOpen(false)} 
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form content */}
              <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Addon ID */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Addon Slug ID *</label>
                    <input
                      type="text"
                      value={formId}
                      onChange={(e) => setFormId(e.target.value.toLowerCase())}
                      placeholder="e.g. addon-data-pii"
                      disabled={!!editingAddon}
                      className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono ${
                        fieldErrors.id ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800'
                      }`}
                      required
                    />
                    {fieldErrors.id && <p className="text-rose-400 text-[10px] mt-1 font-bold">{fieldErrors.id}</p>}
                  </div>

                  {/* Addon Name */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Addon Public Name *</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Real-Time PII Shield"
                      className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 ${
                        fieldErrors.name ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800'
                      }`}
                      required
                    />
                    {fieldErrors.name && <p className="text-rose-400 text-[10px] mt-1 font-bold">{fieldErrors.name}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Category Group *</label>
                    <input
                      type="text"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      placeholder="e.g. Privacy & Consent"
                      className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 ${
                        fieldErrors.category ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800'
                      }`}
                      required
                    />
                    {fieldErrors.category && <p className="text-rose-400 text-[10px] mt-1 font-bold">{fieldErrors.category}</p>}
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Price Label *</label>
                    <input
                      type="text"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="e.g. €299/mo"
                      className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono ${
                        fieldErrors.price ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800'
                      }`}
                      required
                    />
                    {fieldErrors.price && <p className="text-rose-400 text-[10px] mt-1 font-bold">{fieldErrors.price}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Act ID */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Associated Act ID *</label>
                    <select
                      value={formActId}
                      onChange={(e) => setFormActId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                    >
                      <option value="gdpr">GDPR (Data Protection)</option>
                      <option value="ai_act">EU AI Act (Artificial Intelligence)</option>
                      <option value="nis2">NIS2 (Cybersecurity)</option>
                      <option value="dora">DORA (Digital Resilience)</option>
                      <option value="csrd">CSRD (Sustainability/ESG)</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Description *</label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Provide a detailed description of the plugin's regulatory purpose and features..."
                    rows={3}
                    className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 ${
                      fieldErrors.description ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800'
                    }`}
                    required
                  />
                  {fieldErrors.description && <p className="text-rose-400 text-[10px] mt-1 font-bold">{fieldErrors.description}</p>}
                </div>

                {/* Package Configuration */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Package Details &amp; Meta Configuration (JSON format)</label>
                  <textarea
                    value={formPackageRaw}
                    onChange={(e) => setFormPackageRaw(e.target.value)}
                    rows={4}
                    className={`w-full bg-slate-950 border rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-mono ${
                      fieldErrors.package_details ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800'
                    }`}
                  />
                  {fieldErrors.package_details && <p className="text-rose-400 text-[10px] mt-1 font-bold">{fieldErrors.package_details}</p>}
                </div>

                {/* Submit / Cancel Buttons */}
                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-lg cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    {editingAddon ? 'Save Changes' : 'Register Add-on'}
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

export default CaaSAddonsManager;
