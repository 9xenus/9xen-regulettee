import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Scale, 
  Building2, 
  User, 
  FileCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Settings,
  Power
} from 'lucide-react';
import { motion } from 'motion/react';

interface Message {
  id: string;
  sender: 'client' | 'regulator' | 'legal';
  text: string;
  timestamp: string;
  attachments?: string[];
}

export const LiaisonModule: React.FC<{ view: 'client' | 'regulator' }> = ({ view }) => {
  const [activeThread, setActiveThread] = useState<string>('t-1');
  const [messageInput, setMessageInput] = useState('');
  const [isOofActive, setIsOofActive] = useState(false);
  const [oofMessage, setOofMessage] = useState('I am currently out of the office and will respond upon my return.');
  const [showOofSettings, setShowOofSettings] = useState(false);

  const [localMessages, setLocalMessages] = useState<Message[]>([
    {
       id: 'm1',
       sender: 'regulator',
       text: 'We are requesting clarification regarding the recent data transfer flow mapping provided in your last DPIA. Specifically, detailing the sub-processors based in non-adequate jurisdictions.',
       timestamp: '2026-06-16T14:30:00Z',
       attachments: ['NoticeOfInquiry.pdf']
    },
    {
       id: 'm2',
       sender: 'legal',
       text: 'I recommend we provide them with the updated SCCs (Standard Contractual Clauses) we signed with our US provider last week. I can draft the response.',
       timestamp: '2026-06-16T15:05:00Z'
    }
  ]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    const newMsg: Message = {
      id: `m${Date.now()}`,
      sender: view,
      text: messageInput.trim(),
      timestamp: new Date().toISOString()
    };
    
    const updatedMessages = [...localMessages, newMsg];
    
    // Simulate OOF Auto-reply from the other party if OOF is active on their end
    // For demo purposes, we trigger it if the current user sends a message and OOF is enabled
    if (isOofActive) {
      setTimeout(() => {
        setLocalMessages(prev => [
          ...prev, 
          {
            id: `m${Date.now() + 1}`,
            sender: view === 'client' ? 'regulator' : 'client',
            text: `[Auto-Reply: Out of Office] ${oofMessage}`,
            timestamp: new Date().toISOString()
          }
        ]);
      }, 1000);
    }
    
    setLocalMessages(updatedMessages);
    setMessageInput('');
  };

  const threads = [
    {
      id: 't-1',
      title: 'DPA Request: Cross-Border DPIA Review (German DPA)',
      status: 'Awaiting Client Response',
      type: 'Regulator Inquiry',
      urgency: 'High',
      lastUpdate: '2 Hours Ago'
    },
    {
      id: 't-2',
      title: 'Legal Counsel: GDPR Article 28 DPA Addendum Review',
      status: 'In Review',
      type: 'Legal Advisory',
      urgency: 'Normal',
      lastUpdate: '1 Day Ago'
    },
    {
      id: 't-3',
      title: 'Supervisory Authority Notification: Outage',
      status: 'Resolved',
      type: 'Incident Report',
      urgency: 'Resolved',
      lastUpdate: '2 Weeks Ago'
    }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch(urgency) {
      case 'High': return 'text-rose-600 bg-rose-50 border-rose-200';
      case 'Normal': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Resolved': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    if (status.includes('Resolved')) return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (status.includes('Awaiting')) return <Clock className="w-4 h-4 text-amber-500" />;
    return <FileCheck className="w-4 h-4 text-blue-500" />;
  };

  const currentThread = threads.find(t => t.id === activeThread);

  return (
    <div className="flex bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm h-[600px]">
      
      {/* Threads Sidebar */}
      <div className="w-1/3 border-r border-slate-200 bg-slate-50 flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-white shadow-sm z-10">
          <h3 className="text-md font-bold text-slate-800 flex items-center">
            <MessageSquare className="w-4 h-4 mr-2 text-indigo-500" /> Secure Communications
          </h3>
          <p className="text-xs text-slate-500 mt-1">Liaise with DPAs and Legal Counsel</p>
        </div>
        
        <div className="overflow-y-auto flex-1 p-2 space-y-2">
          {threads.map((thread) => (
             <button
               key={thread.id}
               onClick={() => setActiveThread(thread.id)}
               className={`w-full text-left p-3 rounded-lg border transition-all ${activeThread === thread.id ? 'bg-white border-indigo-200 shadow-sm ring-1 ring-indigo-500' : 'bg-transparent border-transparent hover:bg-slate-100'}`}
             >
               <div className="flex justify-between items-start mb-1">
                 <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full border ${getUrgencyColor(thread.urgency)}`}>{thread.urgency}</span>
                 <span className="text-[10px] text-slate-400 font-medium">{thread.lastUpdate}</span>
               </div>
               <h4 className="text-sm font-bold text-slate-800 line-clamp-2 leading-tight mb-2">{thread.title}</h4>
               <div className="flex items-center text-xs text-slate-500 font-medium">
                 {getStatusIcon(thread.status)}
                 <span className="ml-1.5 line-clamp-1">{thread.status}</span>
               </div>
             </button>
          ))}
        </div>
        
        <div className="p-4 border-t border-slate-200 bg-white">
          <button className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-sm transition-colors flex justify-center items-center">
            <Send className="w-4 h-4 mr-2" /> New Request
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="w-2/3 flex flex-col bg-slate-50/50">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-white flex justify-between items-center shadow-sm z-10 relative">
          <div>
             <h2 className="text-lg font-bold text-slate-800">{currentThread?.title}</h2>
             <span className="text-xs font-medium text-slate-500 flex items-center mt-1">
               <Building2 className="w-3 h-3 mr-1" /> Regulatory Inquiry ID: DPA-2026-908
             </span>
          </div>
          <div className="flex space-x-2">
             <button 
               onClick={() => setShowOofSettings(!showOofSettings)}
               className={`p-2 rounded-md transition-colors text-xs font-medium border flex items-center ${isOofActive ? 'bg-amber-50 border-amber-200 text-amber-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 border-slate-200'}`}
               title="Out of Office Auto-Reply"
             >
               <Clock className="w-4 h-4 mr-1.5" /> 
               {isOofActive ? 'OOF Active' : 'OOF Settings'}
             </button>
             <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors text-xs font-medium border border-slate-200">
               Escalate
             </button>
             <button className="px-3 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-md transition-colors text-xs font-medium">
               Resolve Case
             </button>
          </div>
          
          {/* OOF Settings Dropdown */}
          {showOofSettings && (
            <div className="absolute top-full right-6 mt-2 w-80 bg-white border border-slate-200 shadow-xl rounded-xl p-4 z-50">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center">
                  <Settings className="w-4 h-4 mr-2 text-slate-500" /> Auto-Responder
                </h3>
                <button 
                  onClick={() => setIsOofActive(!isOofActive)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isOofActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isOofActive ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
              <textarea 
                value={oofMessage}
                onChange={(e) => setOofMessage(e.target.value)}
                disabled={!isOofActive}
                className="w-full h-24 p-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none disabled:opacity-50"
                placeholder="Enter your out-of-office message here..."
              />
              <p className="text-xs text-slate-500 mt-2">
                This message will be sent automatically to new messages while OOF is active.
              </p>
            </div>
          )}
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
           <div className="flex justify-center">
             <span className="px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-xs font-medium tracking-wide">June 16, 2026</span>
           </div>

           {localMessages.map(msg => (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               key={msg.id} 
               className={`flex ${view === 'regulator' && msg.sender === 'regulator' ? 'justify-end' : (view === 'client' && msg.sender === 'client' ? 'justify-end' : 'justify-start')}`}
             >
                <div className={`max-w-[70%] rounded-xl p-4 shadow-sm border ${msg.sender === 'regulator' ? 'bg-white border-slate-200' : msg.sender === 'legal' ? 'bg-amber-50 border-amber-200' : 'bg-indigo-600 border-indigo-700 text-white'}`}>
                  <div className="flex items-center mb-2">
                     {msg.sender === 'regulator' && <Scale className="w-4 h-4 text-slate-400 mr-2" />}
                     {msg.sender === 'legal' && <User className="w-4 h-4 text-amber-600 mr-2" />}
                     {msg.sender === 'client' && <Building2 className="w-4 h-4 text-indigo-300 mr-2" />}
                     <span className={`text-xs font-bold uppercase tracking-wider ${msg.sender === 'client' ? 'text-indigo-200' : 'text-slate-500'}`}>
                       {msg.sender}
                     </span>
                     <span className={`text-xs ml-auto ${msg.sender === 'client' ? 'text-indigo-300' : 'text-slate-400'}`}>
                       {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </span>
                  </div>
                  <p className={`text-sm leading-relaxed ${msg.sender === 'client' ? 'text-white' : 'text-slate-700'}`}>{msg.text}</p>
                  
                  {msg.attachments && (
                    <div className="mt-3 space-y-2">
                      {msg.attachments.map(att => (
                        <div key={att} className={`flex items-center p-2 rounded border text-xs font-medium ${msg.sender === 'client' ? 'bg-indigo-700 border-indigo-500 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                          <Paperclip className="w-3 h-3 mr-2 opacity-70" />
                          {att}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
             </motion.div>
           ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
           <div className="relative">
             <textarea 
               rows={3}
               value={messageInput}
               onChange={(e) => setMessageInput(e.target.value)}
               onKeyDown={(e) => {
                 if(e.key === 'Enter' && !e.shiftKey) {
                   e.preventDefault();
                   handleSendMessage();
                 }
               }}
               placeholder={`Reply securely as ${view === 'client' ? 'Tenant Organization' : 'Regulatory Authority'}...`}
               className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none resize-none"
             ></textarea>
             <button 
               onClick={handleSendMessage}
               disabled={!messageInput.trim()}
               className="absolute right-3 bottom-3 p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition-colors shadow-sm"
             >
               <Send className="w-4 h-4" />
             </button>
           </div>
           <div className="mt-2 flex justify-between items-center text-xs text-slate-500">
             <button className="flex items-center hover:text-slate-800 transition-colors">
               <Paperclip className="w-4 h-4 mr-1" /> Attach Evidence/Docs
             </button>
             <span>End-to-End Encrypted communications based on eIDAS 2.0 signatures.</span>
           </div>
        </div>
      </div>

    </div>
  );
};
