import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";
import { AlertTriangle, Shield, Target } from "lucide-react";
import { RiskMitigationTracker } from "../components/dashboard/RiskMitigationTracker";
import { Threat } from "../types";

const data: Threat[] = [
  { id: "1", name: "Data Breach", likelihood: 4, impact: 5, category: "Critical" },
  { id: "2", name: "System Failure", likelihood: 3, impact: 4, category: "High" },
  { id: "3", name: "Phishing", likelihood: 5, impact: 3, category: "High" },
  { id: "4", name: "Unauthorized Access", likelihood: 2, impact: 4, category: "Medium" },
  { id: "5", name: "Misconfiguration", likelihood: 3, impact: 2, category: "Medium" },
  { id: "6", name: "Physical Theft", likelihood: 1, impact: 2, category: "Low" },
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Critical": return "#ef4444"; // red-500
    case "High": return "#f97316"; // orange-500
    case "Medium": return "#eab308"; // yellow-500
    case "Low": return "#22c55e"; // green-500
    default: return "#64748b"; // slate-500
  }
};

export function RiskMatrixDashboard() {
  return (
    <div className="p-4 sm:p-5 lg:p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-slate-900">Risk Matrix Dashboard</h1>
      
      <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold mb-4 text-slate-800">Likelihood vs. Impact Grid</h2>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="likelihood" name="Likelihood" domain={[0, 6]} label={{ value: 'Likelihood', position: 'bottom', offset: 0 }} />
              <YAxis type="number" dataKey="impact" name="Impact" domain={[0, 6]} label={{ value: 'Impact', angle: -90, position: 'insideLeft' }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name="Threats" data={data} fill="#8884d8">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getCategoryColor(entry.category)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 bg-white p-4 sm:p-5 lg:p-6 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold mb-4 text-slate-800">Internal Threats</h2>
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Likelihood</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Impact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {data.map((threat) => (
              <tr key={threat.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{threat.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{threat.likelihood}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{threat.impact}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full`} style={{ backgroundColor: `${getCategoryColor(threat.category)}33`, color: getCategoryColor(threat.category) }}>
                    {threat.category}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <RiskMitigationTracker threats={data} />
    </div>
  );
}
