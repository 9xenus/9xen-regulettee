import React, { useState, useMemo } from 'react';
import { Database, Plus, Search, Filter, Edit2, Trash2 } from 'lucide-react';

interface Activity {
  name: string;
  basis: string;
  data: string;
  storage: string;
  risk: string;
}

interface DataMappingManagerProps {
  activities: Activity[];
  onAdd: () => void;
  onEdit?: (activity: Activity, index: number) => void;
  onDelete?: (index: number) => void;
}

export const DataMappingManager: React.FC<DataMappingManagerProps> = ({ 
  activities, 
  onAdd,
  onEdit,
  onDelete
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [basisFilter, setBasisFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchQuery = activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.data.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.storage.toLowerCase().includes(searchQuery.toLowerCase());
      const matchBasis = basisFilter === 'ALL' || activity.basis === basisFilter;
      const matchRisk = riskFilter === 'ALL' || activity.risk === riskFilter;
      return matchQuery && matchBasis && matchRisk;
    });
  }, [activities, searchQuery, basisFilter, riskFilter]);

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Processing Activities & Inventories</h3>
          <p className="text-xs text-slate-500 mt-1">View personal data processing workflows, mapping records, legal bases, and localized hosting scopes.</p>
        </div>
        <button 
          onClick={onAdd}
          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Activity
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input 
            type="text"
            placeholder="Search activities, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700"
          />
        </div>

        <div>
          <select 
            value={basisFilter}
            onChange={(e) => setBasisFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none text-slate-700"
          >
            <option value="ALL">All Legal Bases</option>
            <option value="Consent">Consent</option>
            <option value="Contract">Contract</option>
            <option value="Legal Obligation">Legal Obligation</option>
            <option value="Legitimate Interest">Legitimate Interest</option>
          </select>
        </div>

        <div>
          <select 
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none text-slate-700"
          >
            <option value="ALL">All Risks</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
          </select>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white shadow-xs">
        <table className="w-full text-left text-xs md:text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-4 py-3">Processing Activity</th>
              <th className="px-4 py-3">Legal Basis</th>
              <th className="px-4 py-3">Data Categories Included</th>
              <th className="px-4 py-3">Hosting Storage Host</th>
              <th className="px-4 py-3">Baseline Risk</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredActivities.map((row, i) => {
              // Find the original index of this row in the main activities array
              const originalIndex = activities.indexOf(row);
              return (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900">{row.name}</td>
                  <td className="px-4 py-3">
                    <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold text-slate-700 text-[11px]">
                      {row.basis}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{row.data}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-indigo-500 font-bold" />
                    {row.storage}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      row.risk === "High" ? "bg-rose-100 text-rose-700" :
                      row.risk === "Medium" ? "bg-amber-100 text-amber-700" :
                      "bg-emerald-100 text-emerald-700"
                    }`}>
                      {row.risk}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {onEdit && (
                        <button 
                          onClick={() => onEdit(row, originalIndex)}
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded"
                          title="Edit activity"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDelete && (
                        <button 
                          onClick={() => onDelete(originalIndex)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded"
                          title="Delete activity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredActivities.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">No activities found matching criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
