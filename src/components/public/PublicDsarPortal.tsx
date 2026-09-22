import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, FileText, User, Mail, Globe, MapPin, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';

export const PublicDsarPortal = () => {
  const [step, setStep] = useState(1);
  const [requestType, setRequestType] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    details: '',
    verificationMethod: 'email'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestTypes = [
    { id: 'access', title: 'Right to Access', desc: 'Request a copy of the personal data we hold about you.' },
    { id: 'delete', title: 'Right to Erasure', desc: 'Request the deletion of your personal data.' },
    { id: 'rectify', title: 'Right to Rectification', desc: 'Request correction of inaccurate or incomplete data.' },
    { id: 'restrict', title: 'Right to Restrict', desc: 'Request a limitation on how we process your data.' },
    { id: 'portability', title: 'Right to Data Portability', desc: 'Request your data in a structured, machine-readable format.' },
  ];

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(4);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 p-5 sm:p-6 lg:p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-5 sm:p-6 lg:p-8 opacity-10">
            <Shield className="w-48 h-48 text-white" />
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md border border-white/20">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Privacy Center</h1>
            <p className="text-indigo-200 text-sm max-w-md mx-auto">
              Exercise your data rights securely. We process Data Subject Access Requests (DSAR) within 30 days in accordance with GDPR regulations.
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6 lg:p-8">
          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-8 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full z-0"></div>
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 rounded-full z-0 transition-all duration-500"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            ></div>
            
            {[1, 2, 3, 4].map((s) => (
              <div 
                key={s} 
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                  step >= s ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'
                }`}
              >
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 sm:space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold text-slate-800 mb-1">Select Request Type</h2>
                  <p className="text-sm text-slate-500 mb-4">What action would you like us to take regarding your data?</p>
                </div>
                
                <div className="grid gap-3">
                  {requestTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setRequestType(type.id)}
                      className={`text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${
                        requestType === type.id 
                          ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`mt-0.5 ${requestType === type.id ? 'text-indigo-600' : 'text-slate-400'}`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className={`font-bold ${requestType === type.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                          {type.title}
                        </h3>
                        <p className={`text-sm ${requestType === type.id ? 'text-indigo-700/80' : 'text-slate-500'}`}>
                          {type.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    onClick={handleNext}
                    disabled={!requestType}
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold rounded-xl flex items-center gap-2 transition-colors"
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 sm:space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold text-slate-800 mb-1">Verify Your Identity</h2>
                  <p className="text-sm text-slate-500 mb-4">Please provide your details so we can locate your records securely.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase">First Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={formData.firstName}
                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                        className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="Jane"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase">Last Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={formData.lastName}
                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                        className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="email" 
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="jane.doe@example.com"
                      />
                    </div>
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase">Country of Residence</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select 
                        value={formData.country}
                        onChange={e => setFormData({...formData, country: e.target.value})}
                        className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 appearance-none"
                      >
                        <option value="">Select country...</option>
                        <option value="EU">European Union (EU)</option>
                        <option value="UK">United Kingdom</option>
                        <option value="US">United States</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed">
                    We will send a one-time verification link to this email address to confirm your identity before processing the request.
                  </p>
                </div>

                <div className="flex justify-between pt-4">
                  <button 
                    onClick={handleBack}
                    className="px-6 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-xl transition-colors"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleNext}
                    disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.country}
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold rounded-xl flex items-center gap-2 transition-colors"
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 sm:space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold text-slate-800 mb-1">Additional Details</h2>
                  <p className="text-sm text-slate-500 mb-4">Provide any specific context to help us process your request faster.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">Request Details (Optional)</label>
                  <textarea 
                    value={formData.details}
                    onChange={e => setFormData({...formData, details: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 min-h-[120px]"
                    placeholder="E.g., I would like a copy of all marketing emails sent to me in 2024..."
                  />
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-700 text-sm">Summary of your request:</h4>
                  <ul className="text-sm text-slate-600 space-y-2 font-medium">
                    <li className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-400">Type:</span>
                      <span className="text-indigo-600 font-bold">{requestTypes.find(t => t.id === requestType)?.title}</span>
                    </li>
                    <li className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-400">Name:</span>
                      <span>{formData.firstName} {formData.lastName}</span>
                    </li>
                    <li className="flex justify-between pb-1">
                      <span className="text-slate-400">Email:</span>
                      <span>{formData.email}</span>
                    </li>
                  </ul>
                </div>

                <div className="flex justify-between pt-4">
                  <button 
                    onClick={handleBack}
                    className="px-6 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-xl transition-colors"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-indigo-200"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        Processing...
                      </span>
                    ) : (
                      'Submit Request'
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4 py-5 sm:py-8"
              >
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Request Submitted</h2>
                <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
                  We've received your request. A secure verification link has been sent to <strong>{formData.email}</strong>. 
                </p>
                
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 max-w-sm mx-auto text-left mt-8">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Next Steps</h4>
                  <ul className="text-sm text-slate-600 space-y-3">
                    <li className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
                      <p>Click the link in your email to verify your identity.</p>
                    </li>
                    <li className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
                      <p>Track your request status via the secure portal.</p>
                    </li>
                    <li className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div>
                      <p>Receive fulfillment documentation within 30 days.</p>
                    </li>
                  </ul>
                </div>

                <div className="pt-8">
                  <button 
                    onClick={() => {
                      setStep(1);
                      setRequestType('');
                      setFormData({ firstName: '', lastName: '', email: '', country: '', details: '', verificationMethod: 'email' });
                    }}
                    className="text-indigo-600 hover:text-indigo-700 font-bold text-sm"
                  >
                    Submit another request
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Footer / Branding */}
      <div className="absolute bottom-6 left-0 w-full text-center text-xs text-slate-400">
        Powered by <strong className="text-slate-500 font-black">NonaXen Privacy Engine</strong>
      </div>
    </div>
  );
};
