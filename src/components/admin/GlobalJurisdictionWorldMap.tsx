import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  BarChart, 
  Bar, 
  Cell,
  CartesianGrid
} from 'recharts';
import { 
  Globe, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Search, 
  Filter, 
  RefreshCw, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Activity, 
  Server, 
  FileText, 
  CheckCircle2, 
  ChevronRight, 
  X, 
  Download, 
  Lock, 
  Zap, 
  Layers, 
  BarChart2,
  Building2,
  UserCheck,
  Compass,
  Sliders,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../../context/NotificationContext';
import { CountryFlag } from '../ui/CountryFlag';

export interface JurisdictionData {
  id: string;
  countryName: string;
  countryCode?: string;
  isoCode: string;
  continent: 'Europe' | 'North America' | 'Asia-Pacific' | 'Latin America' | 'Middle East & Africa';
  status: 'OPTIMAL' | 'COMPLIANT' | 'WARNING' | 'CRITICAL' | 'PENDING';
  complianceScore: number; // 0 - 100
  primaryFrameworks: string[];
  activeTenants: number;
  processedRecords: string; // e.g., "4.2M"
  primaryDataCenter: string;
  enclaveShard: string;
  dpoName: string;
  lastAuditDate: string;
  dataResidencyLock: boolean;
  latitude: number;
  longitude: number;
  historicalTrend: { month: string; score: number; incidents: number }[];
  riskBreakdown: { category: string; count: number; severity: 'low' | 'medium' | 'high' | 'critical' }[];
  recentAudits: { title: string; status: 'PASSED' | 'PENDING' | 'ACTION_REQ'; date: string }[];
}

export const JURISDICTIONS: JurisdictionData[] = [
  {
    id: 'DE',
    countryName: 'Germany',
    isoCode: 'DEU',
    continent: 'Europe',
    status: 'OPTIMAL',
    complianceScore: 98.4,
    primaryFrameworks: ['GDPR (EU 2016/679)', 'EU AI Act', 'NIS2 Directive', 'BSI IT-Grundschutz'],
    activeTenants: 142,
    processedRecords: '18.4M',
    primaryDataCenter: 'AWS eu-central-1 (Frankfurt)',
    enclaveShard: 'DE_SOVEREIGN_ENCLAVE_01',
    dpoName: 'Dr. Klaus Weber',
    lastAuditDate: '2026-08-01',
    dataResidencyLock: true,
    latitude: 51.1657,
    longitude: 10.4515,
    historicalTrend: [
      { month: 'Mar', score: 94.2, incidents: 1 },
      { month: 'Apr', score: 95.8, incidents: 0 },
      { month: 'May', score: 96.5, incidents: 0 },
      { month: 'Jun', score: 97.1, incidents: 1 },
      { month: 'Jul', score: 98.0, incidents: 0 },
      { month: 'Aug', score: 98.4, incidents: 0 }
    ],
    riskBreakdown: [
      { category: 'Data Retention Expiry', count: 2, severity: 'low' },
      { category: 'Cross-Border Checks', count: 0, severity: 'medium' },
      { category: 'AI Act Conformity', count: 1, severity: 'low' }
    ],
    recentAudits: [
      { title: 'BaFin Financial Cloud Residency Inspection', status: 'PASSED', date: '2026-07-28' },
      { title: 'NIS2 Supply Chain Security Audit', status: 'PASSED', date: '2026-07-15' }
    ]
  },
  {
    id: 'FR',
    countryName: 'France',
    isoCode: 'FRA',
    continent: 'Europe',
    status: 'OPTIMAL',
    complianceScore: 96.8,
    primaryFrameworks: ['GDPR', 'CNIL Compliance Guidelines', 'EU AI Act', 'SecNumCloud'],
    activeTenants: 118,
    processedRecords: '14.2M',
    primaryDataCenter: 'GCP europe-west9 (Paris)',
    enclaveShard: 'FR_CNIL_ENCLAVE_02',
    dpoName: 'Claire Dubois',
    lastAuditDate: '2026-07-22',
    dataResidencyLock: true,
    latitude: 46.2276,
    longitude: 2.2137,
    historicalTrend: [
      { month: 'Mar', score: 92.0, incidents: 2 },
      { month: 'Apr', score: 94.1, incidents: 1 },
      { month: 'May', score: 95.0, incidents: 0 },
      { month: 'Jun', score: 95.8, incidents: 0 },
      { month: 'Jul', score: 96.2, incidents: 0 },
      { month: 'Aug', score: 96.8, incidents: 0 }
    ],
    riskBreakdown: [
      { category: 'Cookie Consent Telemetry', count: 3, severity: 'medium' },
      { category: 'Biometric Access Ledger', count: 1, severity: 'low' }
    ],
    recentAudits: [
      { title: 'CNIL Cookies & Analytics Verification', status: 'PASSED', date: '2026-07-20' },
      { title: 'EU AI Act High-Risk Model Register', status: 'PASSED', date: '2026-06-30' }
    ]
  },
  {
    id: 'US',
    countryName: 'United States',
    isoCode: 'USA',
    continent: 'North America',
    status: 'COMPLIANT',
    complianceScore: 94.2,
    primaryFrameworks: ['CCPA / CPRA (California)', 'HIPAA Security Rule', 'COPPA', 'Executive Order 14110'],
    activeTenants: 285,
    processedRecords: '42.8M',
    primaryDataCenter: 'AWS us-east-1 (N. Virginia)',
    enclaveShard: 'US_EAST_FED_ENCLAVE_04',
    dpoName: 'Marcus Vance',
    lastAuditDate: '2026-08-05',
    dataResidencyLock: false,
    latitude: 37.0902,
    longitude: -95.7129,
    historicalTrend: [
      { month: 'Mar', score: 91.5, incidents: 3 },
      { month: 'Apr', score: 92.2, incidents: 2 },
      { month: 'May', score: 93.0, incidents: 1 },
      { month: 'Jun', score: 93.5, incidents: 1 },
      { month: 'Jul', score: 93.9, incidents: 0 },
      { month: 'Aug', score: 94.2, incidents: 0 }
    ],
    riskBreakdown: [
      { category: 'Opt-Out Request Sinks', count: 5, severity: 'medium' },
      { category: 'Third-party Data Sharing', count: 2, severity: 'high' }
    ],
    recentAudits: [
      { title: 'HIPAA HITECH Business Associate Review', status: 'PASSED', date: '2026-08-02' },
      { title: 'CCPA Do-Not-Sell Enforcement Check', status: 'PASSED', date: '2026-07-12' }
    ]
  },
  {
    id: 'GB',
    countryName: 'United Kingdom',
    isoCode: 'GBR',
    continent: 'Europe',
    status: 'OPTIMAL',
    complianceScore: 97.5,
    primaryFrameworks: ['UK GDPR', 'Data Protection Act 2018', 'Online Safety Act', 'ICO AI Toolkit'],
    activeTenants: 98,
    processedRecords: '12.1M',
    primaryDataCenter: 'AWS eu-west-2 (London)',
    enclaveShard: 'UK_SOVEREIGN_ENCLAVE_03',
    dpoName: 'Alastair Montgomery',
    lastAuditDate: '2026-07-29',
    dataResidencyLock: true,
    latitude: 55.3781,
    longitude: -3.4360,
    historicalTrend: [
      { month: 'Mar', score: 94.0, incidents: 0 },
      { month: 'Apr', score: 95.2, incidents: 1 },
      { month: 'May', score: 96.0, incidents: 0 },
      { month: 'Jun', score: 96.8, incidents: 0 },
      { month: 'Jul', score: 97.1, incidents: 0 },
      { month: 'Aug', score: 97.5, incidents: 0 }
    ],
    riskBreakdown: [
      { category: 'Adequacy Bridge Sync', count: 1, severity: 'low' }
    ],
    recentAudits: [
      { title: 'ICO Regulatory Sandbox Certification', status: 'PASSED', date: '2026-07-25' }
    ]
  },
  {
    id: 'JP',
    countryName: 'Japan',
    isoCode: 'JPN',
    continent: 'Asia-Pacific',
    status: 'OPTIMAL',
    complianceScore: 95.6,
    primaryFrameworks: ['APPI (Act on Protection of Personal Information)', 'PPC Guidelines', 'METI AI Principles'],
    activeTenants: 76,
    processedRecords: '9.8M',
    primaryDataCenter: 'AWS ap-northeast-1 (Tokyo)',
    enclaveShard: 'JP_APPI_ENCLAVE_05',
    dpoName: 'Kenji Sato',
    lastAuditDate: '2026-07-18',
    dataResidencyLock: true,
    latitude: 36.2048,
    longitude: 138.2529,
    historicalTrend: [
      { month: 'Mar', score: 91.0, incidents: 1 },
      { month: 'Apr', score: 92.5, incidents: 1 },
      { month: 'May', score: 93.8, incidents: 0 },
      { month: 'Jun', score: 94.6, incidents: 0 },
      { month: 'Jul', score: 95.2, incidents: 0 },
      { month: 'Aug', score: 95.6, incidents: 0 }
    ],
    riskBreakdown: [
      { category: 'Kanji Masking Validation', count: 2, severity: 'low' }
    ],
    recentAudits: [
      { title: 'PPC International Transfer Adequacy Review', status: 'PASSED', date: '2026-07-10' }
    ]
  },
  {
    id: 'SG',
    countryName: 'Singapore',
    isoCode: 'SGP',
    continent: 'Asia-Pacific',
    status: 'OPTIMAL',
    complianceScore: 96.1,
    primaryFrameworks: ['Singapore PDPA', 'MAS TRM Guidelines', 'MAS FEAT AI Framework'],
    activeTenants: 84,
    processedRecords: '11.5M',
    primaryDataCenter: 'AWS ap-southeast-1 (Singapore)',
    enclaveShard: 'SG_MAS_ENCLAVE_06',
    dpoName: 'Lin Wei Chen',
    lastAuditDate: '2026-08-02',
    dataResidencyLock: true,
    latitude: 1.3521,
    longitude: 103.8519,
    historicalTrend: [
      { month: 'Mar', score: 92.4, incidents: 0 },
      { month: 'Apr', score: 93.8, incidents: 0 },
      { month: 'May', score: 94.5, incidents: 1 },
      { month: 'Jun', score: 95.2, incidents: 0 },
      { month: 'Jul', score: 95.8, incidents: 0 },
      { month: 'Aug', score: 96.1, incidents: 0 }
    ],
    riskBreakdown: [
      { category: 'Financial Data Masking', count: 1, severity: 'medium' }
    ],
    recentAudits: [
      { title: 'MAS Cyber Hygiene & Cloud Enclave Audit', status: 'PASSED', date: '2026-07-28' }
    ]
  },
  {
    id: 'AU',
    countryName: 'Australia',
    isoCode: 'AUS',
    continent: 'Asia-Pacific',
    status: 'COMPLIANT',
    complianceScore: 93.8,
    primaryFrameworks: ['Privacy Act 1988 (APPs)', 'APRA CPS 234', 'Consumer Data Right (CDR)'],
    activeTenants: 62,
    processedRecords: '7.3M',
    primaryDataCenter: 'AWS ap-southeast-2 (Sydney)',
    enclaveShard: 'AU_APRA_ENCLAVE_07',
    dpoName: 'Sarah Jenkins',
    lastAuditDate: '2026-07-15',
    dataResidencyLock: true,
    latitude: -25.2744,
    longitude: 133.7751,
    historicalTrend: [
      { month: 'Mar', score: 89.0, incidents: 2 },
      { month: 'Apr', score: 90.4, incidents: 1 },
      { month: 'May', score: 91.8, incidents: 1 },
      { month: 'Jun', score: 92.5, incidents: 0 },
      { month: 'Jul', score: 93.1, incidents: 0 },
      { month: 'Aug', score: 93.8, incidents: 0 }
    ],
    riskBreakdown: [
      { category: 'APRA Information Security CPS 234 Gap', count: 3, severity: 'medium' }
    ],
    recentAudits: [
      { title: 'OAIC Privacy Principles Review', status: 'PASSED', date: '2026-07-05' }
    ]
  },
  {
    id: 'BR',
    countryName: 'Brazil',
    isoCode: 'BRA',
    continent: 'Latin America',
    status: 'WARNING',
    complianceScore: 88.5,
    primaryFrameworks: ['LGPD (Lei Geral de Proteção de Dados)', 'ANPD Resolutions', 'Central Bank Circular 3909'],
    activeTenants: 54,
    processedRecords: '8.9M',
    primaryDataCenter: 'AWS sa-east-1 (São Paulo)',
    enclaveShard: 'BR_LGPD_ENCLAVE_08',
    dpoName: 'Rodrigo Fonseca',
    lastAuditDate: '2026-07-11',
    dataResidencyLock: false,
    latitude: -14.2350,
    longitude: -51.9253,
    historicalTrend: [
      { month: 'Mar', score: 82.1, incidents: 4 },
      { month: 'Apr', score: 84.0, incidents: 3 },
      { month: 'May', score: 85.8, incidents: 2 },
      { month: 'Jun', score: 87.0, incidents: 1 },
      { month: 'Jul', score: 87.9, incidents: 1 },
      { month: 'Aug', score: 88.5, incidents: 1 }
    ],
    riskBreakdown: [
      { category: 'ANPD DPO Registration Missing', count: 4, severity: 'high' },
      { category: 'Sensitive Biometric Storage', count: 2, severity: 'medium' }
    ],
    recentAudits: [
      { title: 'ANPD Data Protection Officer Compliance Audit', status: 'ACTION_REQ', date: '2026-07-10' }
    ]
  },
  {
    id: 'SA',
    countryName: 'Saudi Arabia',
    isoCode: 'SAU',
    continent: 'Middle East & Africa',
    status: 'COMPLIANT',
    complianceScore: 92.4,
    primaryFrameworks: ['KSA PDPL (Personal Data Protection Law)', 'NCA Essential Cybersecurity Controls (ECC)', 'SDAIA Guidelines'],
    activeTenants: 48,
    processedRecords: '6.4M',
    primaryDataCenter: 'Oracle Sovereign Cloud (Riyadh)',
    enclaveShard: 'KSA_SDAIA_SOVEREIGN_09',
    dpoName: 'Tariq Al-Mansoor',
    lastAuditDate: '2026-07-30',
    dataResidencyLock: true,
    latitude: 23.8859,
    longitude: 45.0792,
    historicalTrend: [
      { month: 'Mar', score: 86.0, incidents: 2 },
      { month: 'Apr', score: 88.2, incidents: 1 },
      { month: 'May', score: 89.5, incidents: 0 },
      { month: 'Jun', score: 90.8, incidents: 0 },
      { month: 'Jul', score: 91.9, incidents: 0 },
      { month: 'Aug', score: 92.4, incidents: 0 }
    ],
    riskBreakdown: [
      { category: 'SDAIA In-Country Local Storage Guard', count: 1, severity: 'low' }
    ],
    recentAudits: [
      { title: 'SDAIA In-Country Data Residency Inspection', status: 'PASSED', date: '2026-07-28' }
    ]
  },
  {
    id: 'AE',
    countryName: 'United Arab Emirates',
    isoCode: 'ARE',
    continent: 'Middle East & Africa',
    status: 'OPTIMAL',
    complianceScore: 95.1,
    primaryFrameworks: ['UAE Federal Data Protection Law', 'DIFC Data Protection Regulations', 'CEDB Banking Controls'],
    activeTenants: 67,
    processedRecords: '9.2M',
    primaryDataCenter: 'AWS me-central-1 (Dubai)',
    enclaveShard: 'UAE_DIFC_ENCLAVE_10',
    dpoName: 'Fatima Al-Hassan',
    lastAuditDate: '2026-08-03',
    dataResidencyLock: true,
    latitude: 23.4241,
    longitude: 53.8478,
    historicalTrend: [
      { month: 'Mar', score: 90.2, incidents: 1 },
      { month: 'Apr', score: 91.8, incidents: 0 },
      { month: 'May', score: 93.0, incidents: 0 },
      { month: 'Jun', score: 94.1, incidents: 0 },
      { month: 'Jul', score: 94.7, incidents: 0 },
      { month: 'Aug', score: 95.1, incidents: 0 }
    ],
    riskBreakdown: [
      { category: 'Cross-border Transfer Permit Sync', count: 1, severity: 'low' }
    ],
    recentAudits: [
      { title: 'DIFC Commissioner Audit', status: 'PASSED', date: '2026-08-01' }
    ]
  },
  {
    id: 'CA',
    countryName: 'Canada',
    isoCode: 'CAN',
    continent: 'North America',
    status: 'OPTIMAL',
    complianceScore: 96.4,
    primaryFrameworks: ['PIPEDA', 'Quebec Law 25', 'Digital Charter Implementation Act'],
    activeTenants: 89,
    processedRecords: '10.6M',
    primaryDataCenter: 'AWS ca-central-1 (Montreal)',
    enclaveShard: 'CA_QUEBEC_LAW25_ENCLAVE_11',
    dpoName: 'Jean-Luc Tremblay',
    lastAuditDate: '2026-07-27',
    dataResidencyLock: true,
    latitude: 56.1304,
    longitude: -106.3468,
    historicalTrend: [
      { month: 'Mar', score: 92.1, incidents: 0 },
      { month: 'Apr', score: 93.5, incidents: 0 },
      { month: 'May', score: 94.8, incidents: 0 },
      { month: 'Jun', score: 95.5, incidents: 0 },
      { month: 'Jul', score: 96.0, incidents: 0 },
      { month: 'Aug', score: 96.4, incidents: 0 }
    ],
    riskBreakdown: [
      { category: 'Quebec Language & Consent Opt-In', count: 2, severity: 'low' }
    ],
    recentAudits: [
      { title: 'Quebec CAI Law 25 Assessment', status: 'PASSED', date: '2026-07-22' }
    ]
  },
  {
    id: 'IN',
    countryName: 'India',
    isoCode: 'IND',
    continent: 'Asia-Pacific',
    status: 'WARNING',
    complianceScore: 87.2,
    primaryFrameworks: ['DPDP Act 2023 (Digital Personal Data Protection)', 'CERT-In Incident Directives', 'RBI Data Storage Guidelines'],
    activeTenants: 112,
    processedRecords: '21.5M',
    primaryDataCenter: 'AWS ap-south-1 (Mumbai)',
    enclaveShard: 'IN_DPDP_ENCLAVE_12',
    dpoName: 'Priya Sharma',
    lastAuditDate: '2026-07-14',
    dataResidencyLock: true,
    latitude: 20.5937,
    longitude: 78.9629,
    historicalTrend: [
      { month: 'Mar', score: 81.0, incidents: 5 },
      { month: 'Apr', score: 82.8, incidents: 4 },
      { month: 'May', score: 84.2, incidents: 3 },
      { month: 'Jun', score: 85.5, incidents: 2 },
      { month: 'Jul', score: 86.4, incidents: 1 },
      { month: 'Aug', score: 87.2, incidents: 1 }
    ],
    riskBreakdown: [
      { category: 'CERT-In 6-Hour Incident Reporting Sink', count: 3, severity: 'high' },
      { category: 'Consent Manager Integration', count: 2, severity: 'medium' }
    ],
    recentAudits: [
      { title: 'DPDP Board Readiness Review', status: 'ACTION_REQ', date: '2026-07-12' }
    ]
  },
  {
    id: 'CH',
    countryName: 'Switzerland',
    isoCode: 'CHE',
    continent: 'Europe',
    status: 'OPTIMAL',
    complianceScore: 99.1,
    primaryFrameworks: ['Swiss Revised Federal Act on Data Protection (FADP)', 'FINMA Cyber Circular'],
    activeTenants: 52,
    processedRecords: '8.1M',
    primaryDataCenter: 'Exoscale Swiss Sovereign Enclave (Zurich)',
    enclaveShard: 'CH_ZURICH_BANKING_ENCLAVE_13',
    dpoName: 'Dr. Beat Zimmermann',
    lastAuditDate: '2026-08-04',
    dataResidencyLock: true,
    latitude: 46.8182,
    longitude: 8.2275,
    historicalTrend: [
      { month: 'Mar', score: 97.0, incidents: 0 },
      { month: 'Apr', score: 98.0, incidents: 0 },
      { month: 'May', score: 98.5, incidents: 0 },
      { month: 'Jun', score: 98.8, incidents: 0 },
      { month: 'Jul', score: 99.0, incidents: 0 },
      { month: 'Aug', score: 99.1, incidents: 0 }
    ],
    riskBreakdown: [],
    recentAudits: [
      { title: 'FDPIC Swiss High Security Enclave Audit', status: 'PASSED', date: '2026-08-01' }
    ]
  }
];

export const GlobalJurisdictionWorldMap: React.FC = () => {
  const { showToast } = useNotification();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State management
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<JurisdictionData | null>(JURISDICTIONS[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string>('ALL');
  const [selectedFramework, setSelectedFramework] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [mapMode, setMapMode] = useState<'STATUS' | 'NODES' | 'RECORD_VOLUME'>('STATUS');
  const [projectionType, setProjectionType] = useState<'MERCATOR' | 'NATURAL_EARTH'>('MERCATOR');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Filter jurisdictions
  const filteredJurisdictions = useMemo(() => {
    return JURISDICTIONS.filter(j => {
      const matchesSearch = 
        j.countryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.isoCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.primaryFrameworks.some(f => f.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesContinent = selectedContinent === 'ALL' || j.continent === selectedContinent;
      const matchesFramework = selectedFramework === 'ALL' || j.primaryFrameworks.some(f => f.includes(selectedFramework));
      const matchesStatus = selectedStatus === 'ALL' || j.status === selectedStatus;

      return matchesSearch && matchesContinent && matchesFramework && matchesStatus;
    });
  }, [searchTerm, selectedContinent, selectedFramework, selectedStatus]);

  // Overall Global Statistics
  const globalStats = useMemo(() => {
    const totalCount = JURISDICTIONS.length;
    const avgScore = (JURISDICTIONS.reduce((acc, curr) => acc + curr.complianceScore, 0) / totalCount).toFixed(1);
    const optimalCount = JURISDICTIONS.filter(j => j.status === 'OPTIMAL').length;
    const warningCount = JURISDICTIONS.filter(j => j.status === 'WARNING' || j.status === 'CRITICAL').length;
    const totalTenants = JURISDICTIONS.reduce((acc, curr) => acc + curr.activeTenants, 0);

    return { totalCount, avgScore, optimalCount, warningCount, totalTenants };
  }, []);

  // Map D3 Renderer
  useEffect(() => {
    if (!svgRef.current) return;

    const width = 960;
    const height = 480;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous SVG contents

    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Create main zoomable group
    const mainGroup = svg.append('g').attr('class', 'map-main-group');

    // Setup projection
    const projection = projectionType === 'MERCATOR' 
      ? d3.geoMercator().scale(130).translate([width / 2.1, height / 1.45])
      : d3.geoNaturalEarth1().scale(150).translate([width / 2.1, height / 1.7]);

    const pathGenerator = d3.geoPath().projection(projection);

    // Setup Zoom Behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.8, 8])
      .on('zoom', (event) => {
        mainGroup.attr('transform', event.transform);
        setZoomLevel(Math.round(event.transform.k * 10) / 10);
      });

    svg.call(zoom as any);

    // Load TopoJSON World Map
    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then((topology: any) => {
      const countries = topojson.feature(topology, topology.objects.countries);

      // Render Country Graticule / Gridlines
      const graticule = d3.geoGraticule();
      mainGroup.append('path')
        .datum(graticule())
        .attr('class', 'graticule')
        .attr('d', pathGenerator as any)
        .attr('fill', 'none')
        .attr('stroke', '#334155')
        .attr('stroke-width', '0.4')
        .attr('stroke-dasharray', '2,2')
        .attr('opacity', '0.3');

      // Map Lookup Map
      const jurisdictionLookup = new Map<string, JurisdictionData>();
      JURISDICTIONS.forEach(j => {
        jurisdictionLookup.set(j.countryName, j);
        jurisdictionLookup.set(j.isoCode, j);
      });

      // Render Countries
      mainGroup.append('g')
        .selectAll('path')
        .data((countries as any).features)
        .enter()
        .append('path')
        .attr('d', pathGenerator as any)
        .attr('class', 'country-path transition-all duration-300 cursor-pointer')
        .attr('fill', (d: any) => {
          const name = d.properties.name;
          const match = JURISDICTIONS.find(j => 
            j.countryName === name || 
            (name === 'United States of America' && j.id === 'US') ||
            (name === 'United Kingdom' && j.id === 'GB')
          );

          if (!match) return '#1e293b'; // Unmanaged slate-800

          if (mapMode === 'STATUS') {
            if (match.status === 'OPTIMAL') return '#059669'; // Emerald-600
            if (match.status === 'COMPLIANT') return '#0284c7'; // Sky-600
            if (match.status === 'WARNING') return '#d97706'; // Amber-600
            if (match.status === 'CRITICAL') return '#e11d48'; // Rose-600
            return '#6366f1'; // Indigo-500
          } else if (mapMode === 'RECORD_VOLUME') {
            // Gradient fill based on record volume scale
            const records = parseFloat(match.processedRecords);
            if (records > 20) return '#7c3aed'; // Violet-600
            if (records > 10) return '#a855f7'; // Purple-500
            return '#c084fc'; // Purple-400
          } else {
            return '#334155'; // Node mode base fill
          }
        })
        .attr('stroke', '#0f172a') // Dark slate border
        .attr('stroke-width', 0.8)
        .attr('opacity', (d: any) => {
          const name = d.properties.name;
          const match = JURISDICTIONS.find(j => 
            j.countryName === name || 
            (name === 'United States of America' && j.id === 'US') ||
            (name === 'United Kingdom' && j.id === 'GB')
          );
          if (!match) return 0.5;
          const isFiltered = filteredJurisdictions.some(fj => fj.id === match.id);
          return isFiltered ? 0.9 : 0.2;
        })
        .on('click', (_event: any, d: any) => {
          const name = d.properties.name;
          const match = JURISDICTIONS.find(j => 
            j.countryName === name || 
            (name === 'United States of America' && j.id === 'US') ||
            (name === 'United Kingdom' && j.id === 'GB')
          );

          if (match) {
            setSelectedJurisdiction(match);
          }
        })
        .append('title')
        .text((d: any) => {
          const name = d.properties.name;
          const match = JURISDICTIONS.find(j => 
            j.countryName === name || 
            (name === 'United States of America' && j.id === 'US') ||
            (name === 'United Kingdom' && j.id === 'GB')
          );
          return match ? `${match.countryName} (${match.status}) - Score: ${match.complianceScore}%` : `${name} (Unmanaged)`;
        });

      // Render Regional Nodes & Pulsing Data Center Pins
      const nodeGroup = mainGroup.append('g').attr('class', 'jurisdiction-nodes');

      JURISDICTIONS.forEach(j => {
        const isFiltered = filteredJurisdictions.some(fj => fj.id === j.id);
        if (!isFiltered) return;

        const coords = projection([j.longitude, j.latitude]);
        if (!coords) return;

        const [x, y] = coords;
        const isSelected = selectedJurisdiction?.id === j.id;

        // Outer Glow Circle
        nodeGroup.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', isSelected ? 12 : 7)
          .attr('fill', j.status === 'OPTIMAL' ? '#10b981' : j.status === 'WARNING' ? '#f59e0b' : '#38bdf8')
          .attr('opacity', 0.25)
          .attr('class', 'animate-ping');

        // Core Pin Point
        nodeGroup.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', isSelected ? 6 : 4)
          .attr('fill', isSelected ? '#ffffff' : j.status === 'OPTIMAL' ? '#10b981' : j.status === 'WARNING' ? '#f59e0b' : '#0284c7')
          .attr('stroke', '#0f172a')
          .attr('stroke-width', 1.5)
          .attr('class', 'cursor-pointer hover:scale-125 transition-transform')
          .on('click', () => {
            setSelectedJurisdiction(j);
          });

        // Label on Zoom
        if (isSelected || zoomLevel > 2.5) {
          nodeGroup.append('text')
            .attr('x', x + 8)
            .attr('y', y + 3)
            .text(`${j.id} (${j.complianceScore}%)`)
            .attr('fill', '#f8fafc')
            .attr('font-size', '9px')
            .attr('font-weight', 'bold')
            .attr('pointer-events', 'none')
            .attr('class', 'drop-shadow-md');
        }
      });

      // Render Arc Lines connecting nodes to Primary HQ (Germany/Frankfurt)
      if (mapMode === 'NODES') {
        const hq = JURISDICTIONS.find(j => j.id === 'DE');
        if (hq) {
          const hqCoords = projection([hq.longitude, hq.latitude]);
          if (hqCoords) {
            const arcGroup = mainGroup.append('g').attr('class', 'node-arcs');

            JURISDICTIONS.filter(j => j.id !== 'DE').forEach(j => {
              const targetCoords = projection([j.longitude, j.latitude]);
              if (!targetCoords) return;

              const dx = targetCoords[0] - hqCoords[0];
              const dy = targetCoords[1] - hqCoords[1];
              const dr = Math.sqrt(dx * dx + dy * dy) * 0.8;

              const pathData = `M${hqCoords[0]},${hqCoords[1]}A${dr},${dr} 0 0,1 ${targetCoords[0]},${targetCoords[1]}`;

              arcGroup.append('path')
                .attr('d', pathData)
                .attr('fill', 'none')
                .attr('stroke', '#38bdf8')
                .attr('stroke-width', 1)
                .attr('stroke-dasharray', '4,4')
                .attr('opacity', 0.4);
            });
          }
        }
      }

    }).catch(err => {
      console.warn("World Map TopoJSON load failed, vector map active:", err);
    });

  }, [filteredJurisdictions, selectedJurisdiction, mapMode, projectionType]);

  const handleRefreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Global jurisdiction compliance telemetry re-synchronized across 13 sovereign nodes.', 'success', 'Jurisdiction World Map');
    }, 700);
  };

  const handleRunAudit = (jurisdiction: JurisdictionData) => {
    showToast(`Initiating automated compliance & data residency audit for ${jurisdiction.countryName}...`, 'info', 'Regional Audit');
    setTimeout(() => {
      showToast(`Audit complete for ${jurisdiction.countryName}. Zero cross-border violations detected. Compliance score updated to ${jurisdiction.complianceScore}%.`, 'success', 'Audit Finished');
    }, 1200);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col w-full">
      
      {/* Top Header Controls Bar */}
      <div className="p-5 border-b border-slate-800 bg-slate-900/80 backdrop-blur flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Globe className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-wide flex items-center gap-2">
                <span>Global Jurisdiction World Map</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  REAL-TIME REGIONAL DRILLDOWN
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Active sovereign compliance boundaries, data residency locks, and framework enforcement telemetry.
              </p>
            </div>
          </div>
        </div>

        {/* Global Summary Stats Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Managed Nodes</div>
              <div className="text-xs font-mono font-extrabold text-white">{globalStats.totalCount} Countries</div>
            </div>
          </div>

          <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Avg Health Index</div>
              <div className="text-xs font-mono font-extrabold text-emerald-400">{globalStats.avgScore}%</div>
            </div>
          </div>

          <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Active Tenants</div>
              <div className="text-xs font-mono font-extrabold text-amber-300">{globalStats.totalTenants} Enterprises</div>
            </div>
          </div>

          <button
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold"
            title="Re-synchronize telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">Sync Nodes</span>
          </button>
        </div>
      </div>

      {/* Filter & View Mode Controls Bar */}
      <div className="px-5 py-3 bg-slate-900/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search & Continent Filters */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search jurisdiction or framework..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Continent Select */}
          <select
            value={selectedContinent}
            onChange={(e) => setSelectedContinent(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Continents</option>
            <option value="Europe">Europe</option>
            <option value="North America">North America</option>
            <option value="Asia-Pacific">Asia-Pacific</option>
            <option value="Latin America">Latin America</option>
            <option value="Middle East & Africa">Middle East & Africa</option>
          </select>

          {/* Framework Select */}
          <select
            value={selectedFramework}
            onChange={(e) => setSelectedFramework(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Frameworks</option>
            <option value="GDPR">GDPR</option>
            <option value="AI Act">EU AI Act</option>
            <option value="CCPA">CCPA / CPRA</option>
            <option value="HIPAA">HIPAA</option>
            <option value="PDPA">PDPA</option>
            <option value="LGPD">LGPD</option>
          </select>

          {/* Status Select */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPTIMAL">Optimal (&gt;95%)</option>
            <option value="COMPLIANT">Compliant (90-95%)</option>
            <option value="WARNING">Action Required (&lt;90%)</option>
          </select>
        </div>

        {/* View Mode & Map Controls */}
        <div className="flex items-center gap-2">
          {/* Map Layer Mode Buttons */}
          <div className="bg-slate-900 p-0.5 border border-slate-800 rounded-xl flex items-center">
            <button
              onClick={() => setMapMode('STATUS')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                mapMode === 'STATUS' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Status</span>
            </button>

            <button
              onClick={() => setMapMode('NODES')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                mapMode === 'NODES' 
                  ? 'bg-sky-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Server className="w-3 h-3" />
              <span>Nodes & Arc</span>
            </button>

            <button
              onClick={() => setMapMode('RECORD_VOLUME')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                mapMode === 'RECORD_VOLUME' 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Data Volume</span>
            </button>
          </div>

          {/* Projection Toggle */}
          <button
            onClick={() => setProjectionType(prev => prev === 'MERCATOR' ? 'NATURAL_EARTH' : 'MERCATOR')}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 transition-all"
            title={`Switch projection to ${projectionType === 'MERCATOR' ? 'Natural Earth' : 'Mercator'}`}
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Map + Side Detail Panel Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
        
        {/* Left / Main World Map Section (7-8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 p-4 relative bg-slate-950 flex flex-col justify-between border-r border-slate-800/80">
          
          {/* Interactive D3 SVG Map Canvas */}
          <div ref={containerRef} className="w-full h-full min-h-[380px] flex items-center justify-center relative">
            <svg ref={svgRef} className="w-full h-auto max-h-[440px] drop-shadow-2xl"></svg>

            {/* Map Legend Floating Box */}
            <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur border border-slate-800 p-2.5 rounded-xl text-[10px] space-y-1.5 shadow-xl">
              <div className="font-extrabold uppercase text-slate-400 tracking-wider">Map Legend</div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></span>
                <span className="text-slate-300">Optimal Compliance (&ge;95%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-sm"></span>
                <span className="text-slate-300">Compliant (90-95%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm"></span>
                <span className="text-slate-300">Action Required (&lt;90%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
                <span className="text-slate-400">Unmanaged / Off-Grid</span>
              </div>
            </div>

            {/* Quick Quick Selector Floating Pill */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-1 max-w-md">
              {filteredJurisdictions.map(j => {
                const isSelected = selectedJurisdiction?.id === j.id;
                return (
                  <button
                    key={j.id}
                    onClick={() => setSelectedJurisdiction(j)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all border ${
                      isSelected 
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md' 
                        : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {j.id} ({j.complianceScore}%)
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Jurisdictions Ticker Strip */}
          <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span>Showing <strong>{filteredJurisdictions.length}</strong> of {JURISDICTIONS.length} active jurisdictions under management</span>
            </span>
            <span className="font-mono text-[10px] text-slate-500">
              Zoom: {zoomLevel}x | Mode: {mapMode}
            </span>
          </div>
        </div>

        {/* Right Regional Compliance Metrics Drilldown Side Panel (4-5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-slate-900/90 border-l border-slate-800 p-5 flex flex-col justify-between space-y-4">
          {selectedJurisdiction ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedJurisdiction.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4 flex-1 overflow-y-auto pr-1"
              >
                {/* Header Title & Status */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-white">{selectedJurisdiction.countryName}</span>
                      <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded text-xs font-mono font-bold">
                        {selectedJurisdiction.isoCode}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <span>Continent: <strong>{selectedJurisdiction.continent}</strong></span>
                      <span>•</span>
                      <span>DPO: <strong>{selectedJurisdiction.dpoName}</strong></span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-extrabold border ${
                    selectedJurisdiction.status === 'OPTIMAL'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : selectedJurisdiction.status === 'COMPLIANT'
                      ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {selectedJurisdiction.status}
                  </span>
                </div>

                {/* Main Compliance Health Score Gauge + Lock Indicator */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Compliance Health Index</span>
                    <span className="text-lg font-mono font-black text-emerald-400">
                      {selectedJurisdiction.complianceScore}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${selectedJurisdiction.complianceScore}%` }}
                    ></div>
                  </div>

                  {/* Lock & Residency Badge */}
                  <div className="pt-2 flex items-center justify-between text-[11px] border-t border-slate-800/80 text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Lock className={`w-3.5 h-3.5 ${selectedJurisdiction.dataResidencyLock ? 'text-emerald-400' : 'text-amber-400'}`} />
                      <span>Sovereign Enclave Lock:</span>
                    </span>
                    <span className="font-mono font-bold text-white">
                      {selectedJurisdiction.dataResidencyLock ? 'STRICT IN-COUNTRY' : 'FLEXIBLE CROSS-BORDER'}
                    </span>
                  </div>
                </div>

                {/* Historical 6-Month Recharts Trend Area Chart */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-indigo-400" />
                      <span>6-Month Score Telemetry</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">+2.4% vs Mar</span>
                  </div>

                  <div className="h-32 w-full pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={selectedJurisdiction.historicalTrend}>
                        <defs>
                          <linearGradient id="scoreGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                        <YAxis domain={[75, 100]} stroke="#64748b" fontSize={10} tickLine={false} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#scoreGlow)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Key Infrastructure & Active Enclaves */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <div className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-sky-400" />
                    <span>Regional Infrastructure & Enclave</span>
                  </div>

                  <div className="space-y-1.5 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Data Center Node:</span>
                      <span className="font-mono font-bold text-slate-100">{selectedJurisdiction.primaryDataCenter}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Enclave Shard ID:</span>
                      <span className="font-mono font-extrabold text-indigo-300">{selectedJurisdiction.enclaveShard}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Active Record Volume:</span>
                      <span className="font-mono font-bold text-emerald-400">{selectedJurisdiction.processedRecords} Data Subjects</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Client Tenants:</span>
                      <span className="font-mono font-bold text-amber-300">{selectedJurisdiction.activeTenants} Enterprise Tenants</span>
                    </div>
                  </div>
                </div>

                {/* Primary Regulatory Frameworks Chips */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Enforced Frameworks & Laws
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJurisdiction.primaryFrameworks.map((fw, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-1 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>{fw}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Controls */}
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => handleRunAudit(selectedJurisdiction)}
                    className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Run Jurisdiction Audit</span>
                  </button>

                  <button
                    onClick={() => showToast(`Exporting compliance snapshot for ${selectedJurisdiction.countryName}...`, 'info')}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-all flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>

              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 sm:p-5 lg:p-6 text-slate-500">
              <Globe className="w-10 h-10 stroke-1 mb-2 text-slate-600" />
              <p className="text-xs">Click any jurisdiction on the world map to inspect regional compliance metrics.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
