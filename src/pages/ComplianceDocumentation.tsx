import React, { useState } from 'react';
import { CookiePreferencesManager } from '../components/CookieConsent';

const documents = {
  privacy: {
    title: "Privacy Policy",
    content: "Our Privacy Policy outlines how we collect, use, and protect your personal data in compliance with GDPR and other regulations..."
  },
  terms: {
    title: "Terms of Service",
    content: "These Terms of Service govern your use of the platform. By accessing our services, you agree to these terms..."
  },
  cookies: {
    title: "Cookie Policy",
    content: "We use cookies to enhance your experience. This policy explains what cookies are and how we use them..."
  },
  preferences: {
    title: "Manage Cookies",
    content: "Configure your cookie preferences here."
  },
  guidelines: {
    title: "Internal Privacy Guidelines",
    content: "These internal guidelines ensure all employees handle data with the highest standards of privacy and security..."
  }
};

export default function ComplianceDocumentation() {
  const [activeTab, setActiveTab] = useState('privacy');

  return (
    <div className="container mx-auto p-4 sm:p-5 lg:p-6">
      <h1 className="text-3xl font-bold mb-6">Compliance Documentation</h1>
      <div className="w-full">
        <div className="flex border-b mb-4">
          {Object.keys(documents).map((key) => (
            <button 
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 ${activeTab === key ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`}
            >
              {documents[key as keyof typeof documents].title}
            </button>
          ))}
        </div>
        
        <div className="border rounded-lg p-4 sm:p-5 lg:p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">{documents[activeTab as keyof typeof documents].title}</h2>
          {activeTab === 'preferences' ? (
            <CookiePreferencesManager />
          ) : (
            <div className="h-[400px] w-full rounded-md border p-4 overflow-y-auto">
              <p>{documents[activeTab as keyof typeof documents].content}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
