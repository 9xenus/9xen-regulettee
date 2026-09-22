import React, { useState, useRef, useEffect } from 'react';
import { 
  Scale, MessageSquare, Send, Sparkles, X, Minimize2, Maximize2, 
  BookOpen, ShieldCheck, ChevronRight, Copy, Check, RefreshCw, Layers, FileText
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citations?: string[];
  groundedArticles?: string[];
  timestamp: string;
}

const QUICK_QUESTIONS = [
  'What are the mandatory DORA Art. 30 cloud audit requirements?',
  'How do we structure EU SCCs Module 2 under Schrems II?',
  'What is required for High-Risk AI Act Annex IV conformity?',
  'Does Swiss FADP require ZKP for high-risk profiling?'
];

export const FloatingAiLegalAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFramework, setActiveFramework] = useState<'ALL' | 'GDPR' | 'DORA' | 'AI_ACT' | 'FADP'>('ALL');
  const [userRole, setUserRole] = useState<'Lawyer / Legal Counsel' | 'Regulatory Consultant' | 'DPO / Compliance Officer'>('Lawyer / Legal Counsel');
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `### Sovereign AI Legal & Regulatory Counsel

Welcome. I am your specialized regulatory co-counsel grounded in the active legal frameworks:
- **EU GDPR (2016/679)** & **Schrems II / SCC (2021/914)**
- **EU DORA (2022/2554)**: ICT Third-Party Supply Chain & Art. 28 Register
- **EU AI Act (2024/1689)**: High-Risk Conformity & Annex IV Dossiers
- **Swiss FADP / nDSG (SR 235.1)**: Profiling & Cross-Border Sovereign Enclaves

Select a quick question or enter your statutory inquiry below.`,
      citations: ['GDPR 2016/679', 'DORA 2022/2554', 'EU AI Act 2024/1689', 'Swiss FADP'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!queryText) setInputQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/v1/ai-legal-assistant/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          activeFramework,
          role: userRole
        })
      });

      const data = await res.json();
      if (data.success) {
        const assistantMessage: Message = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: data.answer,
          citations: data.citations,
          groundedArticles: data.groundedArticles,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Failed to generate legal response');
      }
    } catch (err: any) {
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `**Advisory Notice**: An error occurred during regulatory retrieval (${err.message}). The sovereign enclave knowledge cache is currently serving in offline validation mode.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-indigo-900 hover:to-slate-800 text-white rounded-full shadow-2xl border border-indigo-500/40 transition-all transform hover:scale-105 group cursor-pointer"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-inner">
              <Scale className="w-4 h-4" />
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 animate-pulse border-2 border-slate-900"></span>
          </div>
          <div className="text-left pr-1">
            <span className="text-[10px] uppercase font-black tracking-widest text-indigo-300 block">Lawyer / Consultant</span>
            <span className="text-xs font-bold text-white flex items-center gap-1">
              AI Legal Assistant <Sparkles className="w-3 h-3 text-amber-300" />
            </span>
          </div>
        </button>
      )}

      {/* Slide-over Side Panel */}
      {isOpen && (
        <div 
          className={`fixed bottom-4 right-4 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ${
            isExpanded ? 'w-[92vw] md:w-[720px] h-[85vh]' : 'w-[92vw] sm:w-[480px] h-[640px]'
          }`}
        >
          {/* Panel Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-t-2xl flex items-center justify-between border-b border-indigo-900/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/80 border border-indigo-400/40 flex items-center justify-center text-white">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-white">AI Legal & Regulatory Counsel</h3>
                  <span className="px-1.5 py-0.5 bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 rounded text-[9px] font-mono font-bold">RAG v2.4</span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">Grounded on GDPR • DORA • AI Act • Swiss FADP</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Control Bar: Framework & Persona Selectors */}
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1 overflow-x-auto py-0.5">
              {(['ALL', 'GDPR', 'DORA', 'AI_ACT', 'FADP'] as const).map((fw) => (
                <button
                  key={fw}
                  onClick={() => setActiveFramework(fw)}
                  className={`px-2 py-1 rounded text-[10px] font-bold font-mono transition ${
                    activeFramework === fw 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                  }`}
                >
                  {fw.replace('_', ' ')}
                </button>
              ))}
            </div>

            <select
              value={userRole}
              onChange={(e: any) => setUserRole(e.target.value)}
              className="text-[10px] font-bold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded px-2 py-1"
            >
              <option value="Lawyer / Legal Counsel">Role: Counsel</option>
              <option value="Regulatory Consultant">Role: Consultant</option>
              <option value="DPO / Compliance Officer">Role: DPO</option>
            </select>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400 font-mono">
                  <span>{msg.sender === 'user' ? 'Counsel Query' : 'Legal Memo'}</span>
                  <span>• {msg.timestamp}</span>
                </div>

                <div
                  className={`p-3.5 rounded-2xl max-w-[92%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-xs'
                  }`}
                >
                  {msg.sender === 'assistant' ? (
                    <div className="space-y-2">
                      <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>

                      {msg.citations && msg.citations.length > 0 && (
                        <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-1">
                          <span className="text-[9px] font-bold uppercase text-slate-400 mr-1 flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-indigo-500" /> Citations:
                          </span>
                          {msg.citations.map((c, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded text-[9px] font-mono">
                              {c}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => handleCopy(msg.text, msg.id)}
                          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-500">Copied to Brief</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Opinion</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="font-medium text-xs whitespace-pre-wrap">{msg.text}</p>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-2 text-slate-500 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                <span className="text-xs font-mono">Synthesizing statutory citations and Transfer Impact Assessment...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts (if fewer than 4 messages) */}
          {messages.length < 5 && (
            <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Suggested Legal Briefs:
              </span>
              <div className="flex flex-wrap gap-1">
                {QUICK_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="text-[10px] text-left px-2 py-1 bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-md transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-b-2xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask legal counsel about GDPR, DORA Art. 28, SCCs, or AI Act..."
                className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono mt-1.5 px-1">
              <span>Cryptographically attested RAG pipeline</span>
              <span>Zero client data retained</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
