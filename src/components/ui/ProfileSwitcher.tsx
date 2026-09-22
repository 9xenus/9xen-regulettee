import React, { useState } from 'react';
import { Check, ChevronDown, Building2, Shield, User, LogOut, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Service {
  id: string;
  name: string;
  module: 'GDPR_AUDIT' | 'AI_ACT_SCREENER' | 'DORA_FRAMEWORK';
}

interface Organization {
  id: string;
  name: string;
  type: 'CLIENT' | 'REGULATOR' | 'INTERNAL';
  services: Service[];
}

interface ProfileSwitcherProps {
  userFullName: string;
  userEmail: string;
  organizations: Organization[];
  activeOrgId: string;
  activeServiceId: string;
  onOrgSwitch: (orgId: string) => void;
  onServiceSwitch: (serviceId: string) => void;
  onLogout: () => void;
}

export function ProfileSwitcher({
  userFullName,
  userEmail,
  organizations,
  activeOrgId,
  activeServiceId,
  onOrgSwitch,
  onServiceSwitch,
  onLogout
}: ProfileSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeOrg = organizations.find(o => o.id === activeOrgId);
  const activeService = activeOrg?.services.find(s => s.id === activeServiceId);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-enterprise-emerald"
      >
        <div className="h-8 w-8 rounded-full bg-enterprise-navy text-white flex items-center justify-center font-semibold text-sm">
          {userFullName.charAt(0)}
        </div>
        <div className="text-left hidden md:block">
          <p className="text-sm font-semibold text-enterprise-navy">{activeOrg?.name || 'Select Organization'}</p>
          <p className="text-xs text-slate-500">{activeService?.name || 'No active service'}</p>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden text-sm"
          >
            {/* User Profile Hook */}
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-enterprise-emerald text-white flex items-center justify-center font-bold text-lg">
                  {userFullName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-enterprise-navy">{userFullName}</p>
                  <p className="text-slate-500 text-xs">{userEmail}</p>
                </div>
              </div>
            </div>

            {/* Organizations and Services Tree */}
            <div className="max-h-64 overflow-y-auto">
              {organizations.map(org => (
                <div key={org.id} className="border-b border-slate-100 last:border-0">
                  <button
                    onClick={() => onOrgSwitch(org.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-2 hover:bg-slate-50 transition-colors",
                      activeOrgId === org.id ? "bg-slate-50" : ""
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className={cn(
                        "font-medium",
                        activeOrgId === org.id ? "text-enterprise-navy" : "text-slate-600"
                      )}>{org.name}</span>
                    </div>
                    {activeOrgId === org.id && <Check className="w-4 h-4 text-enterprise-emerald" />}
                  </button>
                  
                  {/* Services subset for the active organization */}
                  {activeOrgId === org.id && org.services.length > 0 && (
                    <div className="bg-slate-50 py-1 pl-10 pr-4">
                      {org.services.map(service => (
                        <button
                          key={service.id}
                          onClick={() => {
                            onServiceSwitch(service.id);
                            setIsOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-slate-200 transition-colors text-xs",
                            activeServiceId === service.id ? "bg-slate-200 font-semibold text-enterprise-navy" : "text-slate-500"
                          )}
                        >
                          <div className="flex items-center space-x-2">
                            <Shield className="w-3 h-3" />
                            <span>{service.name}</span>
                          </div>
                          {activeServiceId === service.id && <Check className="w-3 h-3 text-enterprise-emerald" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Account Utilities */}
            <div className="p-2 border-t border-slate-100 bg-white">
              <button className="w-full flex items-center space-x-2 px-2 py-2 rounded text-slate-600 hover:bg-slate-50 transition-colors">
                <Settings className="w-4 h-4" />
                <span>Account Settings</span>
              </button>
              <button 
                onClick={onLogout}
                className="w-full flex items-center space-x-2 px-2 py-2 rounded text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
