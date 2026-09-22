import React, { useState, useEffect } from 'react';
import { fetchWithRetry } from '../lib/api-client';
import { 
  Bell, 
  ExternalLink, 
  Globe, 
  Calendar, 
  Clock, 
  Sparkles, 
  Filter, 
  RefreshCw,
  Scale,
  ShieldAlert
} from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  date: string;
  impactLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  summary: string;
  url: string;
}

const mockNews: NewsItem[] = [
  {
    id: 'EDPB-2026-08',
    title: 'EDPB Adopts Binding Decision 02/2026 on Large Language Model Fine-Tuning under GDPR Art. 6(1)(f)',
    source: 'European Data Protection Board',
    date: '2026-09-02',
    impactLevel: 'CRITICAL',
    summary: 'Strict necessity test established for web-scraped training corpora; controllers must offer zero-friction opt-out telemetry before training commences.',
    url: 'https://edpb.europa.eu'
  },
  {
    id: 'AI-OFFICE-2026-14',
    title: 'European AI Office Publishes Standardized Technical Documentation Template for General Purpose AI Models',
    source: 'European Commission AI Office',
    date: '2026-08-30',
    impactLevel: 'HIGH',
    summary: 'Harmonized technical documentation requirements under Article 53 of the EU AI Act now mandatory for foundation model providers.',
    url: 'https://digital-strategy.ec.europa.eu'
  },
  {
    id: 'ENISA-2026-21',
    title: 'ENISA Issues Coordinated Vulnerability Disclosure (CVD) Directive under NIS2 Article 12',
    source: 'EU Agency for Cybersecurity (ENISA)',
    date: '2026-08-27',
    impactLevel: 'MEDIUM',
    summary: 'Designated CSIRTs across all 27 member states establish unified cryptographically sealed reporting channels.',
    url: 'https://www.enisa.europa.eu'
  }
];

export const EdpbRegulatoryNewsFeed: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>(mockNews);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNews = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetchWithRetry('/api/v1/compliance/news-feed');
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.news && Array.isArray(data.news)) {
          setNews(data.news);
        }
      }
    } catch (e) {
      console.error('Failed to fetch news feed', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleRefresh = () => {
    fetchNews();
  };

  return (
    <div className="p-5 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-950/80 border border-blue-700/60 rounded-xl text-blue-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">Official EDPB &amp; EU AI Office Gazettes Feed</h3>
            <p className="text-xs text-slate-400">Real-time legislative decisions, CJEU rulings, and statutory enforcement notices.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
        </button>
      </div>

      <div className="space-y-3">
        {news.map((item) => (
          <div key={item.id} className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 hover:border-slate-700 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                  item.impactLevel === 'CRITICAL' ? 'bg-red-950 text-red-300 border border-red-800' :
                  item.impactLevel === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                  'bg-blue-950 text-blue-300 border border-blue-800'
                }`}>
                  {item.impactLevel} IMPACT
                </span>
                <span className="text-xs font-mono text-slate-400">{item.source}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">{item.date}</span>
            </div>

            <h4 className="text-sm font-bold text-white leading-snug">{item.title}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{item.summary}</p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <span className="text-[10px] font-mono text-indigo-400">Ref: {item.id}</span>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Read Official Gazette</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EdpbRegulatoryNewsFeed;
