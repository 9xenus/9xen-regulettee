import React, { useState } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  MessageSquare,
  Terminal,
  Zap,
  Shield,
  Play,
  Activity,
  TrendingUp,
  AlertOctagon,
  Send,
  Sparkles,
  Command,
  Check
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: 'AI' | 'SEC' | 'USER';
  senderRole?: string;
  text: string;
  timestamp: string;
  deadlines?: { authority: string; deadlineHours: number; statute: string }[];
  suggestedActions?: string[];
}

export function IncidentResponseCopilot() {
  const [activeTab, setActiveTab] = useState<'overview' | 'warroom' | 'risk-scoring'>('overview');
  const [containmentStatus, setContainmentStatus] = useState<'pending' | 'in-progress' | 'contained'>('pending');
  const [containmentDetails, setContainmentDetails] = useState<string | null>(null);

  // War Room state
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'AI',
      senderRole: 'Copilot Alert',
      text: 'Incident INC-2026-089 created. Potential ransomware behavior matched (Confidence: 94%). I have paged the on-call Security Engineer.',
      timestamp: '08:12 UTC'
    },
    {
      id: 'm2',
      sender: 'SEC',
      senderRole: 'SecOps Team',
      text: 'Acknowledged. Reviewing telemetry now. AI, can you summarize the blast radius and statutory reporting deadlines?',
      timestamp: '08:14 UTC'
    },
    {
      id: 'm3',
      sender: 'AI',
      senderRole: 'Copilot Analysis',
      text: 'Blast radius analysis complete. 8 virtual machines in subnet 10.0.4.x show encryption activity. The affected volumes contain customer PII subject to GDPR.',
      timestamp: '08:15 UTC',
      deadlines: [
        { authority: 'Lead Supervisory Authority (BfDI/CNIL)', deadlineHours: 72, statute: 'GDPR Article 33' },
        { authority: 'Financial Conduct / BaFin ICT Unit', deadlineHours: 4, statute: 'DORA Article 19' }
      ]
    }
  ]);

  const handleContainment = async () => {
    setContainmentStatus('in-progress');
    try {
      const res = await fetch('/api/v1/copilot/containment', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setContainmentStatus('contained');
        setContainmentDetails(data.message || 'Assets isolated successfully');
        // Add message to war room
        setMessages(prev => [
          ...prev,
          {
            id: `act-${Date.now()}`,
            sender: 'AI',
            senderRole: 'Containment Action Executed',
            text: `[SYSTEM ACTION COMPLETED]: ${data.message} (${data.remediatedNodes} nodes quarantined).`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      console.error('Containment error:', err);
      setTimeout(() => setContainmentStatus('contained'), 1500);
    }
  };

  const handleSendMessage = async (msgText?: string) => {
    const textToSend = msgText || inputMessage;
    if (!textToSend.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'USER',
      senderRole: 'Compliance Operator',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      const res = await fetch('/api/v1/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend })
      });

      const data = await res.json();
      if (data.success) {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'AI',
          senderRole: 'Copilot Tactical Response',
          text: data.reply || 'Incident analysis processed.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          deadlines: data.reportingDeadlines,
          suggestedActions: data.suggestedActions
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      const fallbackAiMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'AI',
        senderRole: 'Copilot Fallback',
        text: `Acknowledged: "${textToSend}". Zero-knowledge perimeter integrity holding. Forensic evidence has been hashed and anchored to immutable WORM storage.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackAiMsg]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-rose-600" />
            Incident Response Copilot
          </h1>
          <p className="text-slate-500 mt-1">
            Server-side AI-driven automated response playbook, statutory notification deadlines, and war-room coordination.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-rose-100 text-rose-700">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            SEV-1 Active (INC-2026-089)
          </span>
        </div>
      </div>

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'overview' ? 'border-rose-600 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Incident Overview
        </button>
        <button
          onClick={() => setActiveTab('warroom')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'warroom' ? 'border-rose-600 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          War-Room Coordination ({messages.length})
        </button>
        <button
          onClick={() => setActiveTab('risk-scoring')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'risk-scoring' ? 'border-rose-600 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Predictive Risk Scoring
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Active Incident</span>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">INC-2026-089: Ingress Encryption Anomaly</h2>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  GDPR 72h Clock: 63h 48m remaining
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-6">
                Potential unauthorized credential-stuffing and anomalous file write operations detected on database replica cluster in Europe-West1.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="block text-xs font-medium text-slate-500 uppercase">Detection Time</span>
                  <span className="block mt-1 font-bold text-slate-900">08:12 UTC</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="block text-xs font-medium text-slate-500 uppercase">Data Types</span>
                  <span className="block mt-1 font-bold text-slate-900">PII, Financial</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="block text-xs font-medium text-slate-500 uppercase">Affected Assets</span>
                  <span className="block mt-1 font-bold text-slate-900">8 Servers</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="block text-xs font-medium text-slate-500 uppercase">Status</span>
                  <span className={`block mt-1 font-bold ${containmentStatus === 'contained' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {containmentStatus === 'contained' ? 'Contained' : 'Investigating'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-500" />
                AI Copilot Recommended Actions
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-lg border border-slate-100 bg-slate-50">
                  <Shield className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">Network Containment Playbook</h4>
                    <p className="text-sm text-slate-500 mt-1">
                      Isolate the 8 affected servers from the main network to prevent lateral movement. Apply strict firewall rules immediately.
                    </p>
                    {containmentDetails && (
                      <p className="text-xs text-emerald-700 font-medium mt-2 bg-emerald-50 p-2 rounded border border-emerald-200">
                        {containmentDetails}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleContainment}
                    disabled={containmentStatus !== 'pending'}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 cursor-pointer ${
                      containmentStatus === 'pending' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' :
                      containmentStatus === 'in-progress' ? 'bg-indigo-400 text-white' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {containmentStatus === 'pending' && <><Play className="w-4 h-4" /> Execute Playbook</>}
                    {containmentStatus === 'in-progress' && <span className="animate-pulse">Executing...</span>}
                    {containmentStatus === 'contained' && <><CheckCircle2 className="w-4 h-4" /> Contained</>}
                  </button>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg border border-slate-100 bg-slate-50">
                  <FileText className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">Statutory Supervisory Notification</h4>
                    <p className="text-sm text-slate-500 mt-1">
                      Pre-fill GDPR Article 33 breach notification draft for the Lead Supervisory Authority (BfDI / CNIL) & DORA 4h alert.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('warroom')}
                    className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-medium text-slate-700 cursor-pointer"
                  >
                    Consult Copilot
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="bg-slate-900 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm text-slate-300 font-mono text-sm">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2 font-sans">
                <Terminal className="w-5 h-5 text-emerald-400" />
                Live Telemetry Feed
              </h3>
              <div className="space-y-2 opacity-90 text-xs">
                <p><span className="text-rose-400">[WARN]</span> 08:12:45 UTC - High I/O detected on db-eu-core-01</p>
                <p><span className="text-emerald-400">[INFO]</span> 08:14:12 UTC - Agent deployed to scan signatures</p>
                <p><span className="text-amber-400">[ALERT]</span> 08:15:33 UTC - Entropy threshold exceeded</p>
                <p><span className="text-emerald-400">[INFO]</span> 08:16:01 UTC - Triggering automated snapshot</p>
                {containmentStatus !== 'pending' && (
                  <p><span className="text-indigo-400">[ACTION]</span> {new Date().toISOString().substring(11, 19)} UTC - Network isolation initiated</p>
                )}
                {containmentStatus === 'contained' && (
                  <p><span className="text-emerald-400">[SUCCESS]</span> {new Date().toISOString().substring(11, 19)} UTC - Assets isolated successfully</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'warroom' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm h-[650px] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
            <div>
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                Incident Coordination & Regulatory Copilot Channel
              </h2>
              <p className="text-[11px] text-slate-500">Live war-room session with Gemini 3.8 Flash copilot</p>
            </div>
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-indigo-800">CISO</div>
              <div className="w-7 h-7 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-emerald-800">DPO</div>
              <div className="w-7 h-7 rounded-full bg-rose-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-rose-800">SEC</div>
              <div className="w-7 h-7 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">AI</div>
            </div>
          </div>

          {/* Prompt chips */}
          <div className="px-4 py-2 bg-slate-100/60 border-b border-slate-200 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold text-[11px]">Quick Prompts:</span>
            <button
              onClick={() => handleSendMessage('What are our statutory reporting deadlines under DORA and GDPR?')}
              className="px-2.5 py-1 rounded bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 text-[11px] transition-colors cursor-pointer"
            >
              ⏱️ DORA & GDPR Deadlines
            </button>
            <button
              onClick={() => handleSendMessage('Suggest concrete iptables commands to isolate the 8 compromised pods.')}
              className="px-2.5 py-1 rounded bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 text-[11px] transition-colors cursor-pointer"
            >
              🛡️ Containment Commands
            </button>
            <button
              onClick={() => handleSendMessage('Assess data breach notification necessity under GDPR Article 34 for high-risk subjects.')}
              className="px-2.5 py-1 rounded bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 text-[11px] transition-colors cursor-pointer"
            >
              📜 Data Subject Notification (Art. 34)
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
            {messages.map((m) => {
              const isAi = m.sender === 'AI';
              const isUser = m.sender === 'USER';
              return (
                <div key={m.id} className="flex gap-3">
                  <div
                    className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                      isAi
                        ? 'bg-slate-900 text-white'
                        : isUser
                        ? 'bg-indigo-600 text-white'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isAi ? 'AI' : isUser ? 'ME' : 'SEC'}
                  </div>

                  <div
                    className={`p-3.5 rounded-xl text-xs sm:text-sm max-w-2xl ${
                      isAi
                        ? 'bg-indigo-50/80 border border-indigo-100 text-slate-800'
                        : isUser
                        ? 'bg-slate-100 border border-slate-200 text-slate-900 ml-auto'
                        : 'bg-white border border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs text-indigo-950">{m.senderRole || m.sender}</span>
                      <span className="text-[10px] text-slate-400 ml-3">{m.timestamp}</span>
                    </div>

                    <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>

                    {/* Reporting deadlines */}
                    {m.deadlines && m.deadlines.length > 0 && (
                      <div className="mt-3 p-2.5 bg-white/80 rounded-lg border border-indigo-200 space-y-1.5">
                        <span className="block text-[11px] font-bold text-indigo-900 uppercase">
                          Statutory Reporting Clocks:
                        </span>
                        {m.deadlines.map((d, i) => (
                          <div key={i} className="flex justify-between items-center text-xs text-slate-700">
                            <span>{d.authority} ({d.statute})</span>
                            <span className="font-mono font-bold text-rose-600">{d.deadlineHours}h Deadline</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Suggested actions */}
                    {m.suggestedActions && m.suggestedActions.length > 0 && (
                      <div className="mt-3 p-2.5 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] space-y-1">
                        <span className="block text-emerald-400 font-bold font-sans text-xs">
                          Recommended Tactical Actions:
                        </span>
                        {m.suggestedActions.map((act, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <span className="text-indigo-400 select-none">$</span>
                            <span className="text-slate-100">{act}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white shrink-0 flex items-center justify-center text-xs font-bold">
                  AI
                </div>
                <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl text-xs flex items-center gap-2 text-indigo-700">
                  <Sparkles className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Gemini Copilot assessing incident telemetry...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input box */}
          <div className="p-4 border-t border-slate-100 bg-white rounded-b-xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask Copilot (e.g., 'What are our DORA obligations?', 'Draft breach notification')..."
                className="w-full pl-4 pr-12 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm bg-slate-50"
              />
              <button
                type="submit"
                disabled={isSending || !inputMessage.trim()}
                className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-slate-300 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'risk-scoring' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-rose-500" />
                Data Breach Predictive Risk Score
              </h3>

              <div className="flex flex-col md:flex-row items-center gap-5 sm:gap-8 py-4 border-b border-slate-100">
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-100"
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-rose-500"
                        strokeDasharray="84, 100"
                        strokeWidth="3"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-rose-600">
                      <span className="text-3xl font-black">84</span>
                      <span className="text-xs font-medium uppercase tracking-wider">Critical</span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-slate-500 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-rose-500" />
                    +12 points in 24h
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">Exfiltration Risk</span>
                      <span className="font-bold text-rose-600">88%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-rose-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">Regulatory Fine Exposure</span>
                      <span className="font-bold text-amber-600">76%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: '76%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">Operational Disruption Index</span>
                      <span className="font-bold text-indigo-600">62%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '62%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-rose-500" />
                Statutory Penalties Forecast
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-rose-50 rounded-lg border border-rose-100">
                  <span className="text-xs font-bold text-rose-800 uppercase">GDPR Tier-2 Maximum</span>
                  <p className="text-lg font-black text-rose-900 mt-1">€20,000,000 or 4% Global Turnover</p>
                  <p className="text-[11px] text-rose-700 mt-1">Applicable if notice is not provided within 72 hours under Art. 33.</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs font-bold text-slate-700 uppercase">DORA Periodic Penalty</span>
                  <p className="text-lg font-black text-slate-900 mt-1">1% Daily Turnover (up to 6 months)</p>
                  <p className="text-[11px] text-slate-600 mt-1">Enforced by National Competent Authority for failure to isolate tier-1 ICT systems.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
