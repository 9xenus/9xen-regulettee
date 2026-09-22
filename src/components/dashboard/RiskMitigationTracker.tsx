import React, { useState, useEffect } from "react";
import { PlusCircle, Trash2, Calendar, User } from "lucide-react";
import { Threat } from "../../types";

interface MitigationItem {
  id: string;
  riskName: string;
  owner: string;
  deadline: string;
  status: "Pending" | "In Progress" | "Completed";
}

export function RiskMitigationTracker({ threats }: { threats: Threat[] }) {
  const [items, setItems] = useState<MitigationItem[]>([]);
  const [newRisk, setNewRisk] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [newDeadline, setNewDeadline] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("risk-mitigation-items");
    if (saved) setItems(JSON.parse(saved));
  }, []);

  const getImpact = (riskName: string) => {
    const threat = threats.find(t => t.name === riskName);
    return threat ? threat.impact : 0;
  };

  const sortedItems = [...items].sort((a, b) => {
    // Sort by deadline (sooner is better)
    const deadlineA = new Date(a.deadline).getTime();
    const deadlineB = new Date(b.deadline).getTime();
    if (deadlineA !== deadlineB) return deadlineA - deadlineB;

    // Sort by impact (higher is better)
    const impactA = getImpact(a.riskName);
    const impactB = getImpact(b.riskName);
    return impactB - impactA;
  });

  const addItem = () => {
    if (!newRisk || !newOwner || !newDeadline) return;
    const newItem: MitigationItem = {
      id: Date.now().toString(),
      riskName: newRisk,
      owner: newOwner,
      deadline: newDeadline,
      status: "Pending",
    };
    const updated = [...items, newItem];
    setItems(updated);
    localStorage.setItem("risk-mitigation-items", JSON.stringify(updated));
    setNewRisk("");
    setNewOwner("");
    setNewDeadline("");
  };

  const removeItem = (id: string) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    localStorage.setItem("risk-mitigation-items", JSON.stringify(updated));
  };

  return (
    <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg shadow-sm border border-slate-200 mt-6">
      <h2 className="text-lg font-semibold mb-4 text-slate-800">Risk Mitigation Tracker</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <input type="text" placeholder="Risk Name" value={newRisk} onChange={(e) => setNewRisk(e.target.value)} className="p-2 border rounded" />
        <input type="text" placeholder="Owner" value={newOwner} onChange={(e) => setNewOwner(e.target.value)} className="p-2 border rounded" />
        <input type="date" value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)} className="p-2 border rounded" />
        <button onClick={addItem} className="bg-indigo-600 text-white p-2 rounded flex items-center justify-center gap-2">
          <PlusCircle size={16} /> Add
        </button>
      </div>

      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Risk</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Owner</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Deadline</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {sortedItems.map((item) => (
            <tr key={item.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.riskName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.owner}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.deadline}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.status}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                <button onClick={() => removeItem(item.id)} className="text-red-500"><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
