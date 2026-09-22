import React, { useState } from 'react';
import { LandingHero } from '../components/landing/LandingHero';
import { LogoCloud } from '../components/landing/LogoCloud';
import { FeatureSection } from '../components/landing/FeatureSection';
import { PricingSection } from '../components/landing/PricingSection';
import { FAQSection } from '../components/landing/FAQSection';
import { LandingFooter } from '../components/landing/LandingFooter';
import { ComplianceScanner } from '../components/landing/ComplianceScanner';
import { IndustriesSection } from '../components/landing/IndustriesSection';
import { ExpandedSolutionsSection } from '../components/landing/ExpandedSolutionsSection';
import { OurServicesSection } from '../components/landing/OurServicesSection';
import { AboutUsSection } from '../components/landing/AboutUsSection';
import { ComplianceSuiteSection } from '../components/landing/ComplianceSuiteSection';
import { NonaxenLogo } from '../components/NonaxenLogo';
import { ArrowRight, Menu, X, Globe2, Shield, Layers, Building2, Briefcase, Info, Tag } from 'lucide-react';

interface LandingPageProps {
  onLogin?: () => void;
  onNavigate?: (path: string) => void;
  navigate?: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onNavigate, navigate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'solutions' | 'industries' | 'services' | 'about' | 'pricing'>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGatewayRedirect = () => {
    if (onNavigate) {
      onNavigate('gateway');
    } else if (navigate) {
      navigate('gateway');
    } else if (onLogin) {
      onLogin();
    } else {
      window.location.hash = '#gateway';
      window.dispatchEvent(new CustomEvent('navigate', { detail: 'gateway' }));
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'solutions', label: 'Solutions', icon: Layers },
    { id: 'industries', label: 'Industries', icon: Building2 },
    { id: 'services', label: 'Our Services', icon: Briefcase },
    { id: 'about', label: 'About Us', icon: Info },
    { id: 'pricing', label: 'Pricing', icon: Tag },
  ];

  const handleNavClick = (tabId: any) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 antialiased overflow-x-hidden">
      {/* Navigation Header */}
      <nav className="fixed w-full bg-white/95 backdrop-blur-md border-b border-slate-100 z-50 shadow-2xs">
        <div className="container mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <button 
            onClick={() => handleNavClick('overview')}
            className="flex items-center space-x-2 border-0 cursor-pointer bg-transparent text-left p-0"
          >
            <NonaxenLogo className="w-8 h-8" showText={true} textSize="md" />
          </button>

          {/* Desktop Navigation Tabs */}
          <div className="hidden lg:flex items-center space-x-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 border-0 cursor-pointer ${
                    isActive
                      ? 'bg-white text-indigo-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Action CTAs */}
          <div className="hidden lg:flex items-center space-x-2">
            <button 
              onClick={handleGatewayRedirect}
              className="text-xs font-bold text-slate-700 hover:text-indigo-600 px-3 py-1.5 transition-colors border-0 cursor-pointer bg-transparent"
            >
              Sign In
            </button>
            <button 
              onClick={handleGatewayRedirect}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm shadow-indigo-600/20 flex items-center space-x-1.5 border-0 cursor-pointer"
            >
              <span>Launch Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 border-0 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 sm:px-6 py-3 space-y-2">
            <div className="grid grid-cols-2 gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 border text-left ${
                      isActive
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
              <button
                onClick={handleGatewayRedirect}
                className="w-full py-2 bg-indigo-600 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer border-0"
              >
                Launch Portal
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Rendered View */}
      <main className="pt-14 sm:pt-16">
        {activeTab === 'overview' && (
          <>
            <LandingHero onLogin={handleGatewayRedirect} />
            <LogoCloud />
            <ComplianceSuiteSection onLogin={handleGatewayRedirect} />
            <FeatureSection />
            <ComplianceScanner onLogin={handleGatewayRedirect} />
            <ExpandedSolutionsSection onLogin={handleGatewayRedirect} />
            <IndustriesSection onLogin={handleGatewayRedirect} />
            <OurServicesSection onLogin={handleGatewayRedirect} />
            <PricingSection />
            <AboutUsSection onLogin={handleGatewayRedirect} />
            <FAQSection />
          </>
        )}

        {activeTab === 'solutions' && (
          <div className="py-8">
            <ExpandedSolutionsSection onLogin={handleGatewayRedirect} />
            <FeatureSection />
            <ComplianceScanner onLogin={handleGatewayRedirect} />
          </div>
        )}

        {activeTab === 'industries' && (
          <div className="py-8">
            <IndustriesSection onLogin={handleGatewayRedirect} />
            <ComplianceScanner onLogin={handleGatewayRedirect} />
          </div>
        )}

        {activeTab === 'services' && (
          <div className="py-8">
            <OurServicesSection onLogin={handleGatewayRedirect} />
            <ComplianceScanner onLogin={handleGatewayRedirect} />
          </div>
        )}

        {activeTab === 'about' && (
          <div className="py-8">
            <AboutUsSection onLogin={handleGatewayRedirect} />
            <LogoCloud />
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="py-8">
            <PricingSection />
            <FAQSection />
          </div>
        )}
      </main>

      <LandingFooter />
    </div>
  );
};

export default LandingPage;

