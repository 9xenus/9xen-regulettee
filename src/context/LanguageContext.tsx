import { fetchWithRetry } from '../lib/api-client';
import React, { createContext, useContext, useState, useEffect } from "react";

export type LanguageCode = "en" | "bn" | "de" | "fr" | "es" | "it" | "ar";

export interface GeoDetails {
  countryCode: string;
  countryName: string;
  regionName: string;
  cityName: string;
  timezone: string;
  isp: string;
}

export interface DetectionLog {
  id: string;
  time: string;
  msg: string;
  type: "info" | "success" | "warning";
}

interface LanguageContextProps {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  locale: 'bn' | 'en';
  setLocale: (loc: 'bn' | 'en' | ((prev: 'bn' | 'en') => 'bn' | 'en')) => void;
  toggleLocale: () => void;
  isRTL: boolean;
  t: (key: string, defaultValue?: string) => string;
  translateDocument: (text: string, targetLangCode: string) => Promise<{ success: boolean; translatedText?: string; error?: string }>;
  // New IP Auto-Detection and translation features:
  detectedIP: string;
  detectedGeo: GeoDetails | null;
  isAutoDetecting: boolean;
  isAutoTranslationLocked: boolean;
  toggleAutoTranslationLock: () => void;
  runIPDetection: () => Promise<void>;
  simulateIPLogin: (ip: string, mockGeo?: GeoDetails) => Promise<void>;
  detectionLogs: DetectionLog[];
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

const mapCountryToLanguage = (countryCode: string): LanguageCode => {
  const code = countryCode.toUpperCase();
  if (code === "BD") return "bn";
  if (["DE", "AT", "CH"].includes(code)) return "de";
  if (["FR", "BE", "LU"].includes(code)) return "fr";
  if (["ES", "MX", "CO", "AR", "PE", "VE", "CL", "EC", "GT", "CU", "BO", "DOM", "HN", "PY", "SV", "CR", "UY", "PA"].includes(code)) return "es";
  if (["IT"].includes(code)) return "it";
  if (["SA", "AE", "EG", "JO", "LB", "QA", "KW", "OM", "BH", "IQ", "YE", "SY", "PS", "SD", "LY", "MA", "TN", "DZ"].includes(code)) return "ar";
  return "en";
};

const translations: Record<LanguageCode, Record<string, string>> = {
  bn: {
    "dashboard": "ড্যাশবোর্ড (Dashboard)",
    "settings": "সেটিংস (Settings)",
    "integrations": "ইন্টিগ্রেশন ও সংযোগ (Integrations)",
    "cyber-security": "সাইবার নিরাপত্তা (Cyber Security)",
    "reports": "অফিসিয়াল রিপোর্ট (Official Reports)",
    "vault": "এভিডেন্স ভল্ট (Evidence Vault)",
    "tasks": "করণীয় টাস্ক (Actionable Tasks)",
    "compliance": "কমপ্লায়েন্স পোর্টাল (Compliance)",
    "audits": "অডিট লেজার (Audit Ledger)",
    "finance": "ট্রেজারি ও ফাইন্যান্স (Finance)",
    "members": "টিম অ্যাক্সেস (Team Access)",
    "notifications": "বিজ্ঞপ্তি ও নোটিফিকেশন (Notifications)",
    "save_changes": "পরিবর্তন সংরক্ষণ করুন",
    "language": "ভাষা (Language)",
    "select_language": "ভাষা নির্বাচন করুন (Select Language)",
    "language_desc": "অ্যাপ্লিকেশনের ইন্টারফেসের জন্য আপনার পছন্দের ভাষা নির্বাচন করুন।",
    "org_settings": "প্রতিষ্ঠান সেটিংস",
    "security_keys": "নিরাপত্তা ও এপিআই কি",
    "active_compliance": "সক্রিয় কমপ্লায়েন্স অবস্থা",
    "recent_activities": "সাম্প্রতিক কার্যক্রম",
    "logged_in_as": "লগইন করা আছে",
    "logout": "লগআউট",
    "back": "ফিরে যান",
    "search": "অনুসন্ধান করুন...",
    "audit_logs": "অডিট লগ",
    "status": "অবস্থা",
    "actions": "পদক্ষেপ",
    "severity": "ঝুঁকির মাত্রা",
    "description": "বিবরণ",
    "remediation": "প্রতিকার ব্যবস্থা",
    "compliance_score": "কমপ্লায়েন্স স্কোর",
    "violations": "লঙ্ঘনসমূহ",
    "active_scans": "চলমান স্ক্যান",
    "system_health": "সিস্টেম স্বাস্থ্য",
    "add_integration": "ইন্টিগ্রেশন যুক্ত করুন",
    "connected_services": "সংযুক্ত সার্ভিসসমূহ",
    "developer_tokens": "ডেভেলপার টোকেন",
    "scan_history": "স্ক্যান ইতিহাস",
    "cookie_notice": "কুকি ও গোপনীয়তা বিজ্ঞপ্তি",
    "accept_all": "সব গ্রহণ করুন",
    "reject_non_essential": "অপ্রয়োজনীয় প্রত্যাখ্যান করুন",
    "do_not_sell": "ব্যক্তিগত তথ্য বিক্রি করবেন না",
    "customize_cookies": "পছন্দ কাস্টমাইজ করুন",
    "essential_cookies": "অত্যাবশ্যকীয় কুকিজ",
    "analytics_cookies": "অ্যানালিটিক্স ও কার্যক্ষমতা",
    "marketing_cookies": "মার্কেটিং ও টার্গেটিং",
    "preferences_saved": "গোপনীয়তার পছন্দসমূহ সফলভাবে সংরক্ষিত হয়েছে",
    "trust-check": "যাচাই ও ট্রাস্ট চেক (Trust Check)",
    "registration": "প্রতিষ্ঠান নিবন্ধন (Registration)",
    "directory": "ডিরেক্টরি ও যাচাইকারী (Directory)",
    "consumer": "নাগরিক ও গ্রাহক পোর্টাল (Consumer Portal)"
  },
  en: {
    "dashboard": "Dashboard",
    "settings": "Settings",
    "integrations": "Integrations",
    "cyber-security": "Cyber Security",
    "reports": "Official Reports",
    "vault": "Evidence Vault",
    "tasks": "Actionable Tasks",
    "compliance": "Compliance Portal",
    "audits": "Audit Ledger",
    "finance": "Treasury Finance",
    "members": "Team Access",
    "notifications": "Notifications",
    "save_changes": "Save Changes",
    "language": "Language",
    "select_language": "Select Language",
    "language_desc": "Choose your preferred language for the application UI labels.",
    "org_settings": "Organization Settings",
    "security_keys": "Security & Keys",
    "active_compliance": "Active Compliance",
    "recent_activities": "Recent Activities",
    "logged_in_as": "Logged in as",
    "logout": "Logout",
    "back": "Back",
    "search": "Search",
    "audit_logs": "Audit Logs",
    "status": "Status",
    "actions": "Actions",
    "severity": "Severity",
    "description": "Description",
    "remediation": "Remediation",
    "compliance_score": "Compliance Score",
    "violations": "Violations",
    "active_scans": "Active Scans",
    "system_health": "System Health",
    "add_integration": "Add Integration",
    "connected_services": "Connected Services",
    "developer_tokens": "Developer Tokens",
    "scan_history": "Scan History",
    "cookie_notice": "Cookie & Privacy Notice",
    "accept_all": "Accept All",
    "reject_non_essential": "Reject Non-Essential",
    "do_not_sell": "Do Not Sell / Share My Info",
    "customize_cookies": "Customize Preferences",
    "essential_cookies": "Essential Cookies",
    "analytics_cookies": "Analytics & Performance",
    "marketing_cookies": "Marketing & Targeting",
    "preferences_saved": "Privacy preferences recorded on sovereign ledger"
  },
  de: {
    "dashboard": "Dashboard",
    "settings": "Einstellungen",
    "integrations": "Integrationen",
    "cyber-security": "Cybersicherheit",
    "reports": "Offizielle Berichte",
    "vault": "Beweistresor",
    "tasks": "Aufgaben",
    "compliance": "Compliance-Portal",
    "audits": "Audit-Hauptbuch",
    "finance": "Schatzkammer-Finanzen",
    "members": "Teamzugriff",
    "notifications": "Benachrichtigungen",
    "save_changes": "Änderungen speichern",
    "language": "Sprache",
    "select_language": "Sprache auswählen",
    "language_desc": "Wählen Sie Ihre bevorzugte Sprache für die Anwendungsoberfläche.",
    "org_settings": "Organisationseinstellungen",
    "security_keys": "Sicherheit & Schlüssel",
    "active_compliance": "Aktive Compliance",
    "recent_activities": "Kürzliche Aktivitäten",
    "logged_in_as": "Angemeldet als",
    "logout": "Abmelden",
    "back": "Zurück",
    "search": "Suchen",
    "audit_logs": "Audit-Protokolle",
    "status": "Status",
    "actions": "Aktionen",
    "severity": "Schweregrad",
    "description": "Beschreibung",
    "remediation": "Behebung",
    "compliance_score": "Compliance-Score",
    "violations": "Verstöße",
    "active_scans": "Aktive Scans",
    "system_health": "Systemgesundheit",
    "add_integration": "Integration hinzufügen",
    "connected_services": "Verbundene Dienste",
    "developer_tokens": "Entwickler-Token",
    "scan_history": "Scan-Verlauf",
    "cookie_notice": "Cookie- und Datenschutzhinweis",
    "accept_all": "Alle akzeptieren",
    "reject_non_essential": "Nicht notwendige ablehnen",
    "do_not_sell": "Meine Daten nicht verkaufen",
    "customize_cookies": "Einstellungen anpassen",
    "essential_cookies": "Notwendige Cookies",
    "analytics_cookies": "Analyse & Leistung",
    "marketing_cookies": "Marketing & Werbung",
    "preferences_saved": "Datenschutzeinstellungen im Ledger gespeichert"
  },
  fr: {
    "dashboard": "Tableau de bord",
    "settings": "Paramètres",
    "integrations": "Intégrations",
    "cyber-security": "Cybersécurité",
    "reports": "Rapports Officiels",
    "vault": "Coffre de Preuves",
    "tasks": "Tâches",
    "compliance": "Portail de Conformité",
    "audits": "Registre d'Audit",
    "finance": "Trésorerie et Finance",
    "members": "Accès d'Équipe",
    "notifications": "Notifications",
    "save_changes": "Sauvegarder",
    "language": "Langue",
    "select_language": "Choisir la langue",
    "language_desc": "Choisissez votre langue préférée pour l'interface utilisateur de l'application.",
    "org_settings": "Paramètres de l'Organisation",
    "security_keys": "Sécurité et Clés",
    "active_compliance": "Conformité Active",
    "recent_activities": "Activités Récentes",
    "logged_in_as": "Connecté en tant que",
    "logout": "Se déconnecter",
    "back": "Retour",
    "search": "Rechercher",
    "audit_logs": "Journaux d'Audit",
    "status": "Statut",
    "actions": "Actions",
    "severity": "Gravité",
    "description": "Description",
    "remediation": "Remédiation",
    "compliance_score": "Score de Conformité",
    "violations": "Violations",
    "active_scans": "Analyses Actives",
    "system_health": "Santé du Système",
    "add_integration": "Ajouter une Intégration",
    "connected_services": "Services Connectés",
    "developer_tokens": "Jetons Développeur",
    "scan_history": "Historique des Analyses",
    "cookie_notice": "Avis sur les cookies et la confidentialité",
    "accept_all": "Tout accepter",
    "reject_non_essential": "Refuser les non essentiels",
    "do_not_sell": "Ne pas vendre mes données",
    "customize_cookies": "Personnaliser les choix",
    "essential_cookies": "Cookies essentiels",
    "analytics_cookies": "Analytique et performance",
    "marketing_cookies": "Marketing et ciblage",
    "preferences_saved": "Préférences enregistrées sur le registre souverain"
  },
  es: {
    "dashboard": "Panel de Control",
    "settings": "Configuración",
    "integrations": "Integraciones",
    "cyber-security": "Ciberseguridad",
    "reports": "Informes Oficiales",
    "vault": "Bóveda de Evidencias",
    "tasks": "Tareas Pendientes",
    "compliance": "Portal de Cumplimiento",
    "audits": "Libro de Auditoría",
    "finance": "Finanzas y Tesorería",
    "members": "Acceso de Equipo",
    "notifications": "Notificaciones",
    "save_changes": "Guardar cambios",
    "language": "Idioma",
    "select_language": "Seleccionar idioma",
    "language_desc": "Seleccione su idioma preferido para la interfaz de usuario de la aplicación.",
    "org_settings": "Configuración de Organización",
    "security_keys": "Seguridad y Claves",
    "active_compliance": "Cumplimiento Activo",
    "recent_activities": "Actividades Recientes",
    "logged_in_as": "Conectado como",
    "logout": "Cerrar sesión",
    "back": "Volver",
    "search": "Buscar",
    "audit_logs": "Registros de Auditoría",
    "status": "Estado",
    "actions": "Acciones",
    "severity": "Gravedad",
    "description": "Descripción",
    "remediation": "Remediación",
    "compliance_score": "Puntuación de Cumplimiento",
    "violations": "Infracciones",
    "active_scans": "Escaneos Activos",
    "system_health": "Salud del Sistema",
    "add_integration": "Agregar Integración",
    "connected_services": "Servicios Conectados",
    "developer_tokens": "Tokens de Desarrollador",
    "scan_history": "Historial de Escaneos",
    "cookie_notice": "Aviso de cookies y privacidad",
    "accept_all": "Aceptar todo",
    "reject_non_essential": "Rechazar no esenciales",
    "do_not_sell": "No vender mi información",
    "customize_cookies": "Personalizar opciones",
    "essential_cookies": "Cookies esenciales",
    "analytics_cookies": "Análisis y rendimiento",
    "marketing_cookies": "Marketing y publicidad",
    "preferences_saved": "Preferencias guardadas en el libro mayor soberano"
  },
  it: {
    "dashboard": "Cruscotto",
    "settings": "Impostazioni",
    "integrations": "Integrazioni",
    "cyber-security": "Sicurezza Informatica",
    "reports": "Rapporti Ufficiali",
    "vault": "Forziere delle Prove",
    "tasks": "Attività Operative",
    "compliance": "Portale di Conformità",
    "audits": "Registro di Audit",
    "finance": "Tesoreria e Finanza",
    "members": "Accesso del Team",
    "notifications": "Notifiche",
    "save_changes": "Salva modifiche",
    "language": "Lingua",
    "select_language": "Seleziona lingua",
    "language_desc": "Scegli la tua lingua preferita per l'interfaccia utente dell'applicazione.",
    "org_settings": "Impostazioni dell'Organizzazione",
    "security_keys": "Sicurezza e Chiavi",
    "active_compliance": "Conformità Attiva",
    "recent_activities": "Attività Recenti",
    "logged_in_as": "Connesso come",
    "logout": "Disconnetti",
    "back": "Indietro",
    "search": "Cerca",
    "audit_logs": "Registri di Audit",
    "status": "Stato",
    "actions": "Azioni",
    "severity": "Gravità",
    "description": "Descrizione",
    "remediation": "Rimedio",
    "compliance_score": "Punteggio di Conformità",
    "violations": "Violazioni",
    "active_scans": "Scansioni Attive",
    "system_health": "Salute del Sistema",
    "add_integration": "Aggiungi Integrazione",
    "connected_services": "Servizi Connessi",
    "developer_tokens": "Token di Sviluppo",
    "scan_history": "Cronologia Scansioni",
    "cookie_notice": "Informativa su cookie e privacy",
    "accept_all": "Accetta tutti",
    "reject_non_essential": "Rifiuta non essenziali",
    "do_not_sell": "Non vendere le mie informazioni",
    "customize_cookies": "Personalizza preferenze",
    "essential_cookies": "Cookie essenziali",
    "analytics_cookies": "Analisi e prestazioni",
    "marketing_cookies": "Marketing e profilazione",
    "preferences_saved": "Preferenze registrate sul ledger sovrano"
  },
  ar: {
    "dashboard": "لوحة التحكم",
    "settings": "الإعدادات",
    "integrations": "التكاملات والربط",
    "cyber-security": "الأمن السيبراني",
    "reports": "التقارير الرسمية",
    "vault": "خزينة الأدلة والوثائق",
    "tasks": "المهام التنفيذية",
    "compliance": "بوابة الامتثال والحوكمة",
    "audits": "سجل التدقيق السيادي",
    "finance": "المالية والخزينة",
    "members": "صلاحيات الفريق",
    "notifications": "الإشعارات والتنبيهات",
    "save_changes": "حفظ التغييرات",
    "language": "اللغة",
    "select_language": "اختيار اللغة",
    "language_desc": "اختر لغتك المفضلة لعرض واجهات المنظومة وعناصر التحكم.",
    "org_settings": "إعدادات المنظمة والفرع",
    "security_keys": "الأمان والمفاتيح الرقمية",
    "active_compliance": "حالة الامتثال النشطة",
    "recent_activities": "الأنشطة والعمليات الأخيرة",
    "logged_in_as": "تم تسجيل الدخول بصفتك",
    "logout": "تسجيل الخروج الآمن",
    "back": "رجوع",
    "search": "بحث شامل...",
    "audit_logs": "سجلات التدقيق الرقابي",
    "status": "الحالة التشغيلية",
    "actions": "الإجراءات المتاحة",
    "severity": "مستوى الخطورة",
    "description": "الوصف والتفاصيل",
    "remediation": "إجراءات التصحيح والمعالجة",
    "compliance_score": "مؤشر الامتثال السيادي",
    "violations": "المخالفات المرصودة",
    "active_scans": "عمليات الفحص النشطة",
    "system_health": "سلامة النظام والشبكة",
    "add_integration": "إضافة تكامل جديد",
    "connected_services": "الخدمات والأنظمة المتصلة",
    "developer_tokens": "رموز واجهة المطورين",
    "scan_history": "سجل عمليات المسح السابقة",
    "cookie_notice": "إشعار الخصوصية وملفات تعريف الارتباط السيادية",
    "accept_all": "قبول جميع الملفات",
    "reject_non_essential": "رفض الملفات غير الضرورية",
    "do_not_sell": "عدم بيع أو مشاركة بياناتي الشخصية",
    "customize_cookies": "تخصيص خيارات الخصوصية",
    "essential_cookies": "ملفات تعريف الارتباط الأساسية",
    "analytics_cookies": "ملفات التحليل والأداء التشغيلي",
    "marketing_cookies": "ملفات التسويق وتخصيص الخدمات",
    "preferences_saved": "تم توثيق وحفظ تفضيلات الخصوصية في سجل التدقيق السيادي"
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem("app_ui_language");
    return (saved as LanguageCode) || "en";
  });

  const [detectedIP, setDetectedIP] = useState<string>("");
  const [detectedGeo, setDetectedGeo] = useState<GeoDetails | null>(null);
  const [isAutoDetecting, setIsAutoDetecting] = useState<boolean>(false);
  const [isAutoTranslationLocked, setIsAutoTranslationLocked] = useState<boolean>(() => {
    const saved = localStorage.getItem("auto_translation_locked");
    // Default locked to true so English remains the primary default UI language
    if (saved === null) return true;
    return saved === "true";
  });
  const [detectionLogs, setDetectionLogs] = useState<DetectionLog[]>([]);

  const isRTL = language === 'ar';

  const addLog = (msg: string, type: "info" | "success" | "warning" = "info") => {
    const newLog: DetectionLog = {
      id: `LOG-${Math.floor(100000 + Math.random() * 900000)}`,
      time: new Date().toLocaleTimeString(),
      msg,
      type
    };
    setDetectionLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  const toggleAutoTranslationLock = () => {
    setIsAutoTranslationLocked(prev => {
      const next = !prev;
      localStorage.setItem("auto_translation_locked", next ? "true" : "false");
      addLog(`Auto-translation ${next ? "LOCKED to manual mode" : "UNLOCKED (Auto-detect active)"}`, next ? "warning" : "info");
      return next;
    });
  };

  const runIPDetection = async () => {
    setIsAutoDetecting(true);
    addLog("Initiating sovereign client IP and geo-residency scan...", "info");
    try {
      const res = await fetch("/api/v1/compliance/detect-ip-region");
      if (!res.ok) throw new Error("Backend geo-service returned non-OK status");
      const data = await res.json();
      if (data.success) {
        setDetectedIP(data.ip);
        setDetectedGeo(data.geo);
        addLog(`Client IP detected: ${data.ip}. Geolocation: ${data.geo.cityName}, ${data.geo.countryName} (${data.geo.countryCode}) via ${data.geo.isp}.`, "success");
        
        if (!isAutoTranslationLocked) {
          const mappedLang = mapCountryToLanguage(data.geo.countryCode);
          addLog(`Country code '${data.geo.countryCode}' mapped to language '${mappedLang.toUpperCase()}'. Translating platform...`, "info");
          setLanguage(mappedLang);
        } else {
          addLog(`Platform translation locked. Staying in manual language: ${language.toUpperCase()}.`, "warning");
        }
      } else {
        throw new Error(data.error || "Sovereign lookup failed");
      }
    } catch (err: any) {
      addLog(`Failed local IP detection. Querying secondary public provider...`, "warning");
      try {
        const fallbackRes = await fetch("https://ipapi.co/json/");
        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          const geo = {
            countryCode: data.country_code || "US",
            countryName: data.country_name || "United States",
            regionName: data.region || "California",
            cityName: data.city || "Mountain View",
            timezone: data.timezone || "America/Los_Angeles",
            isp: data.org || "Global Public Network"
          };
          setDetectedIP(data.ip || "127.0.0.1");
          setDetectedGeo(geo);
          addLog(`Fallback IP detected: ${data.ip}. Geolocation: ${geo.cityName}, ${geo.countryName} (${geo.countryCode}).`, "success");
          
          if (!isAutoTranslationLocked) {
            const mappedLang = mapCountryToLanguage(geo.countryCode);
            addLog(`Translating system to ${mappedLang.toUpperCase()}`, "info");
            setLanguage(mappedLang);
          }
        } else {
          throw new Error("Fallback failed");
        }
      } catch (fallbackErr) {
        addLog("All external and internal IP mapping services unreachable. Defaulting to safe standard system locale.", "warning");
      }
    } finally {
      setIsAutoDetecting(false);
    }
  };

  const simulateIPLogin = async (ip: string, mockGeo?: GeoDetails) => {
    setIsAutoDetecting(true);
    addLog(`Simulating client login from mock IP: ${ip}...`, "info");
    
    // Simulate lookup latency
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let geo = mockGeo;
    if (!geo) {
      if (ip === "185.120.44.10") {
        geo = {
          countryCode: "SA",
          countryName: "Saudi Arabia",
          regionName: "Ar Riyad",
          cityName: "Riyadh",
          timezone: "Asia/Riyadh",
          isp: "Saudi Telecom Company (STC)"
        };
      } else if (ip === "203.0.113.195") {
        geo = {
          countryCode: "DE",
          countryName: "Germany",
          regionName: "Hesse",
          cityName: "Frankfurt",
          timezone: "Europe/Berlin",
          isp: "Deutsche Telekom AG"
        };
      } else if (ip === "194.254.12.5") {
        geo = {
          countryCode: "FR",
          countryName: "France",
          regionName: "Île-de-France",
          cityName: "Paris",
          timezone: "Europe/Paris",
          isp: "Orange S.A."
        };
      } else if (ip === "82.158.42.100") {
        geo = {
          countryCode: "ES",
          countryName: "Spain",
          regionName: "Madrid",
          cityName: "Madrid",
          timezone: "Europe/Madrid",
          isp: "Telefonica de Espana"
        };
      } else if (ip === "2.234.19.44") {
        geo = {
          countryCode: "IT",
          countryName: "Italy",
          regionName: "Lombardy",
          cityName: "Milan",
          timezone: "Europe/Rome",
          isp: "Telecom Italia"
        };
      } else {
        geo = {
          countryCode: "US",
          countryName: "United States",
          regionName: "California",
          cityName: "San Francisco",
          timezone: "America/Los_Angeles",
          isp: "Comcast Cable"
        };
      }
    }

    setDetectedIP(ip);
    setDetectedGeo(geo);
    addLog(`Mock login SUCCESS. IP Resolved: ${ip}. Geolocation: ${geo.cityName}, ${geo.countryName}.`, "success");
    
    const mappedLang = mapCountryToLanguage(geo.countryCode);
    addLog(`Sovereign auto-mapping triggered: Setting platform interface language to ${mappedLang.toUpperCase()} (${geo.countryCode}).`, "info");
    setLanguage(mappedLang);
    setIsAutoDetecting(false);
  };

  useEffect(() => {
    if (language === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', language);
    }
  }, [language]);

  useEffect(() => {
    runIPDetection();
  }, []);

  // Cross-tab synchronization via BroadcastChannel and storage event
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        channel = new BroadcastChannel("sovereign_locale_sync");
        channel.onmessage = (event) => {
          if (event.data?.type === "LOCALE_CHANGE" && event.data.language) {
            const nextLang = event.data.language as LanguageCode;
            setLanguageState(nextLang);
            if (nextLang === 'ar') {
              document.documentElement.setAttribute('dir', 'rtl');
              document.documentElement.setAttribute('lang', 'ar');
            } else {
              document.documentElement.setAttribute('dir', 'ltr');
              document.documentElement.setAttribute('lang', nextLang);
            }
          }
        };
      }
    } catch {
      // BroadcastChannel fallback if blocked
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "app_ui_language" && e.newValue) {
        const nextLang = e.newValue as LanguageCode;
        setLanguageState(nextLang);
        if (nextLang === 'ar') {
          document.documentElement.setAttribute('dir', 'rtl');
          document.documentElement.setAttribute('lang', 'ar');
        } else {
          document.documentElement.setAttribute('dir', 'ltr');
          document.documentElement.setAttribute('lang', nextLang);
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      if (channel) {
        try {
          channel.close();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("app_ui_language", lang);
    } catch {
      // storage error fallback
    }

    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const channel = new BroadcastChannel("sovereign_locale_sync");
        channel.postMessage({ type: "LOCALE_CHANGE", language: lang });
        channel.close();
      }
    } catch {
      // ignore
    }

    if (lang === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', lang);
    }
    window.dispatchEvent(new CustomEvent("languagechange", { detail: lang }));
  };

  const locale: 'bn' | 'en' = language === 'bn' ? 'bn' : 'en';

  const setLocale = (locOrFn: 'bn' | 'en' | ((prev: 'bn' | 'en') => 'bn' | 'en')) => {
    if (typeof locOrFn === 'function') {
      const next = locOrFn(locale);
      setLanguage(next);
    } else {
      setLanguage(locOrFn);
    }
  };

  const toggleLocale = () => {
    setLanguage(locale === 'bn' ? 'en' : 'bn');
  };

  const t = (key: string, defaultValue?: string): string => {
    const section = translations[language];
    if (section && section[key]) {
      return section[key];
    }
    const enSection = translations["en"];
    if (enSection && enSection[key]) {
      return enSection[key];
    }
    return defaultValue !== undefined ? defaultValue : key;
  };

  const translateDocument = async (text: string, targetLangCode: string) => {
    try {
      const res = await fetchWithRetry("/api/v1/compliance/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, targetLanguageCode: targetLangCode }),
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to connect to translation service" };
    }
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      locale,
      setLocale,
      toggleLocale,
      isRTL, 
      t, 
      translateDocument,
      detectedIP,
      detectedGeo,
      isAutoDetecting,
      isAutoTranslationLocked,
      toggleAutoTranslationLock,
      runIPDetection,
      simulateIPLogin,
      detectionLogs
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
