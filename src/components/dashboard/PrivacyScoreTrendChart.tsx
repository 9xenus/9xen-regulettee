import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ShieldCheck, TrendingUp } from "lucide-react";

// Mock data for the last 90 days
const generateData = () => {
  const data = [];
  const now = new Date();
  let baseScore = 65; // Starting score 90 days ago

  for (let i = 90; i >= 0; i -= 7) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    
    // Add some random fluctuation but generally trending up
    baseScore = Math.min(100, baseScore + Math.random() * 5 - 1);
    
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score: Math.round(baseScore),
    });
  }
  return data;
};

const data = generateData();

export const PrivacyScoreTrendChart: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-sm p-4 sm:p-5 lg:p-6 mt-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            Privacy Score Trend (Last 90 Days)
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Historical progression of privacy control implementations and overall readiness.
          </p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4" />
          <span>+24% Improvement</span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              domain={[0, 100]} 
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: "#fff", 
                borderRadius: "8px", 
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
              }}
              itemStyle={{ color: "#0f172a", fontWeight: "bold" }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#4f46e5"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorScore)"
              activeDot={{ r: 6, fill: "#4f46e5", stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
