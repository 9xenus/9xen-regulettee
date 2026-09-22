export interface HardwareComplianceControl {
  framework: string;
  clause: string;
  requirement: string;
  status: 'PASSED' | 'WARNING' | 'FAILED' | 'EXEMPT';
  lastChecked: string;
  evidence: string;
}

export interface HardwarePhysicalAsset {
  id: string;
  qrCodePayload: string;
  assetTag: string;
  name: string;
  category: 'Physical Server' | 'HSM Cryptographic Appliance' | 'Edge Gateway / Firewall' | 'Biometric Access Terminal' | 'Confidential Compute Node' | 'Encrypted SAN Storage';
  model: string;
  serialNumber: string;
  macAddress: string;
  physicalLocation: {
    facility: string;
    room: string;
    rackId: string;
    rackUnit: string;
    geoCoordinates: string;
    jurisdiction: string;
  };
  sovereigntyEnclave: string;
  cryptographicStatus: {
    algorithm: 'PQC Kyber-768 Enforced' | 'AES-256-GCM Hardware' | 'Quantum-Resistant Dilithium' | 'Legacy RSA-2048 (Flagged)' | 'TPM 2.0 Root-of-Trust';
    hsmBound: boolean;
    tpmVersion: string;
    pcrHash: string;
    firmwareVersion: string;
    lastFirmwareAttestation: string;
    tamperDetection: 'Intact' | 'Triggered' | 'Bypassed';
  };
  complianceStatus: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT' | 'AUDIT_DUE';
  complianceScore: number;
  assignedCustodian: {
    name: string;
    role: string;
    email: string;
  };
  lastPhysicalAudit: string;
  nextAuditDue: string;
  auditAuditLog: {
    date: string;
    auditor: string;
    action: string;
    notes: string;
    verificationHash: string;
  }[];
  statutoryControls: HardwareComplianceControl[];
}

export const HARDWARE_PHYSICAL_ASSETS: HardwarePhysicalAsset[] = [
  {
    id: 'AST-HW-901',
    qrCodePayload: '9XEN_REGULETTEE://ASSET/AST-HW-901/FRA-AM2-RACK-04',
    assetTag: 'LEX-FRA-SRV-001',
    name: 'Frankfurt-AM2 Sovereign Enclave Host 01',
    category: 'Confidential Compute Node',
    model: 'Dell PowerEdge R760 AMD EPYC 9654 SEV-SNP',
    serialNumber: 'SN-FRA-8839210-DELL',
    macAddress: '00:1A:2B:3C:4D:5E',
    physicalLocation: {
      facility: 'Equinix FR2 Sovereign Data Center',
      room: 'Secure Cage B-4',
      rackId: 'RACK-EU-04',
      rackUnit: 'U14 - U16',
      geoCoordinates: '50.1109° N, 8.6821° E',
      jurisdiction: 'European Union (Germany - BDSG & GDPR)'
    },
    sovereigntyEnclave: 'EU Frankfurt Enclave 01',
    cryptographicStatus: {
      algorithm: 'PQC Kyber-768 Enforced',
      hsmBound: true,
      tpmVersion: 'TPM 2.0 (Infineon SLB9670)',
      pcrHash: '0x9a8f23c7b12d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f',
      firmwareVersion: 'v2.14.0-PQC-SECURE',
      lastFirmwareAttestation: '2026-08-20 14:32 UTC',
      tamperDetection: 'Intact'
    },
    complianceStatus: 'COMPLIANT',
    complianceScore: 99.4,
    assignedCustodian: {
      name: 'Klaus Lindemann',
      role: 'Principal Infrastructure Security Officer',
      email: 'k.lindemann@euro-enclave.eu'
    },
    lastPhysicalAudit: '2026-08-15',
    nextAuditDue: '2026-11-15',
    auditAuditLog: [
      {
        date: '2026-08-15 11:20:00',
        auditor: 'Dr. Elena Rostova (Lead ISO Auditor)',
        action: 'Physical Seal & Cable Tamper Verification',
        notes: 'Enclosure seals verified untouched; biometric lock logs reconciled with CCTV records.',
        verificationHash: '0x7c4b9a1e3f8d2b6a5e4c3d2b1a0f9e8d'
      },
      {
        date: '2026-05-12 09:45:00',
        auditor: 'Marcus Vance (CISA)',
        action: 'TPM Hardware PCR Remote Attestation',
        notes: 'PCR values match expected golden image hash.',
        verificationHash: '0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e'
      }
    ],
    statutoryControls: [
      {
        framework: 'EU NIS2 Directive',
        clause: 'Article 21 (Supply Chain & Physical Hardware Security)',
        requirement: 'Hardware security mechanisms and tamper-resistant storage for sovereign telemetry.',
        status: 'PASSED',
        lastChecked: '2026-08-20',
        evidence: 'Hardware TPM 2.0 attestation certificate verified.'
      },
      {
        framework: 'ISO/IEC 27001:2022',
        clause: 'Annex A.7.4 (Physical Security Monitoring)',
        requirement: 'Physical access restricted via biometric dual-custody and 24/7 logging.',
        status: 'PASSED',
        lastChecked: '2026-08-15',
        evidence: 'Cage entry badge records synced.'
      },
      {
        framework: 'GDPR (EU 2016/679)',
        clause: 'Article 32(1)(a) (Pseudonymisation and Encryption of Data)',
        requirement: 'Hardware-accelerated post-quantum data-at-rest encryption.',
        status: 'PASSED',
        lastChecked: '2026-08-22',
        evidence: 'Kyber-768 SED drives active.'
      }
    ]
  },
  {
    id: 'AST-HW-902',
    qrCodePayload: '9XEN_REGULETTEE://ASSET/AST-HW-902/DUB-HSM-VAULT-02',
    assetTag: 'LEX-DUB-HSM-002',
    name: 'Dublin HSM Sovereign Cryptographic Module',
    category: 'HSM Cryptographic Appliance',
    model: 'Thales Luna PCIe HSM 7000 FIPS 140-3 Level 3',
    serialNumber: 'SN-THAL-992014-FIPS',
    macAddress: '00:50:56:A1:B2:C3',
    physicalLocation: {
      facility: 'Interxion DUB2 Vault Facility',
      room: 'Crypto-Vault Safe Room #1',
      rackId: 'RACK-HSM-01',
      rackUnit: 'U22 - U23',
      geoCoordinates: '53.3498° N, 6.2603° W',
      jurisdiction: 'European Union (Ireland - Data Protection Act)'
    },
    sovereigntyEnclave: 'EU West Master KMS Vault',
    cryptographicStatus: {
      algorithm: 'PQC Kyber-768 Enforced',
      hsmBound: true,
      tpmVersion: 'FIPS 140-3 Hardware Co-Processor',
      pcrHash: '0x4f5e6d7c8b9a0f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e',
      firmwareVersion: 'v7.8.2-FIPS-APPROVED',
      lastFirmwareAttestation: '2026-08-19 18:00 UTC',
      tamperDetection: 'Intact'
    },
    complianceStatus: 'WARNING',
    complianceScore: 88.2,
    assignedCustodian: {
      name: 'Liam O’Connor',
      role: 'Senior Cryptographic Security Architect',
      email: 'l.oconnor@cryptovault.eu'
    },
    lastPhysicalAudit: '2026-07-10',
    nextAuditDue: '2026-08-30',
    auditAuditLog: [
      {
        date: '2026-07-10 16:30:00',
        auditor: 'Dr. Elena Rostova',
        action: 'Dual-Custody Key Shard Physical Inspection',
        notes: 'Master M-of-N smart cards verified in safe; key rotation cycle flagged as due in 30 days.',
        verificationHash: '0x99281aabcf44321100eef'
      }
    ],
    statutoryControls: [
      {
        framework: 'DORA Regulation',
        clause: 'Article 11 (ICT Systems Cryptographic Key Lifecycle)',
        requirement: 'Automated 180-day master cryptographic key rollover.',
        status: 'WARNING',
        lastChecked: '2026-08-21',
        evidence: 'Key lifetime at 165 days; rotation recommended within 15 days.'
      },
      {
        framework: 'ISO/IEC 27001:2022',
        clause: 'Annex A.8.24 (Use of Cryptography)',
        requirement: 'Cryptographic algorithms must follow post-quantum transition roadmaps.',
        status: 'PASSED',
        lastChecked: '2026-08-19',
        evidence: 'FIPS 140-3 Level 3 certificate valid through 2029.'
      }
    ]
  },
  {
    id: 'AST-HW-903',
    qrCodePayload: '9XEN_REGULETTEE://ASSET/AST-HW-903/PARIS-GW-EDGE-01',
    assetTag: 'LEX-CDG-GW-003',
    name: 'Paris Sovereign Edge Inspection Gateway',
    category: 'Edge Gateway / Firewall',
    model: 'Fortinet FortiGate 3700F Sovereign Firmware',
    serialNumber: 'SN-FTNT-3382910-PAR',
    macAddress: '70:4C:A5:11:22:33',
    physicalLocation: {
      facility: 'Telehouse Paris Voltaire',
      room: 'Network POP Cage North',
      rackId: 'RACK-NET-07',
      rackUnit: 'U04 - U06',
      geoCoordinates: '48.8566° N, 2.3522° E',
      jurisdiction: 'European Union (France - CNIL & ANSSI SecNumCloud)'
    },
    sovereigntyEnclave: 'EU West Sovereign Data Boundary',
    cryptographicStatus: {
      algorithm: 'AES-256-GCM Hardware',
      hsmBound: false,
      tpmVersion: 'TPM 2.0',
      pcrHash: '0x33445566778899aabbccddeeff00112233445566778899aabbccddeeff001122',
      firmwareVersion: 'v7.4.4-ANSSI-QUALIFIED',
      lastFirmwareAttestation: '2026-08-18 09:12 UTC',
      tamperDetection: 'Intact'
    },
    complianceStatus: 'COMPLIANT',
    complianceScore: 96.0,
    assignedCustodian: {
      name: 'Camille Dubois',
      role: 'Edge Network Security Lead',
      email: 'c.dubois@anssi-secure.fr'
    },
    lastPhysicalAudit: '2026-08-01',
    nextAuditDue: '2026-11-01',
    auditAuditLog: [
      {
        date: '2026-08-01 10:00:00',
        auditor: 'Jean-Luc Picard',
        action: 'Physical Port Lockout & SFP+ Fiber Inspection',
        notes: 'Unused Ethernet & SFP ports sealed with serialized tamper-evident locks.',
        verificationHash: '0xfa8839210bc9382109'
      }
    ],
    statutoryControls: [
      {
        framework: 'ANSSI SecNumCloud 3.2',
        clause: 'Section 4.3 (Boundary Hardware Segregation)',
        requirement: 'Strict hardware segregation between public transit and sovereign tenant traffic.',
        status: 'PASSED',
        lastChecked: '2026-08-18',
        evidence: 'VLAN and physical fiber patch bay map signed off.'
      }
    ]
  },
  {
    id: 'AST-HW-904',
    qrCodePayload: '9XEN_REGULETTEE://ASSET/AST-HW-904/MILAN-IOT-EDGE-05',
    assetTag: 'LEX-MXP-IOT-004',
    name: 'Milan Factory Floor IoT Telemetry Gateway #14',
    category: 'Biometric Access Terminal',
    model: 'Advantech UNO-2484G Embedded Industrial PC',
    serialNumber: 'SN-ADVN-1029481-MIL',
    macAddress: 'AC:87:A3:89:12:34',
    physicalLocation: {
      facility: 'Milan Industrial Enclave Hub',
      room: 'Warehouse Terminal Entrance',
      rackId: 'WALL-MOUNT-CABINET-02',
      rackUnit: 'Wall Mounted',
      geoCoordinates: '45.4642° N, 9.1900° E',
      jurisdiction: 'European Union (Italy - Garante Privacy)'
    },
    sovereigntyEnclave: 'EU South Operational Zone',
    cryptographicStatus: {
      algorithm: 'Legacy RSA-2048 (Flagged)',
      hsmBound: false,
      tpmVersion: 'TPM 1.2 (Outdated)',
      pcrHash: '0xdeadbeef112233445566778899aabbccddeeff00112233445566778899aabbcc',
      firmwareVersion: 'v1.0.8-LEGACY',
      lastFirmwareAttestation: '2025-11-10 12:00 UTC',
      tamperDetection: 'Triggered'
    },
    complianceStatus: 'NON_COMPLIANT',
    complianceScore: 42.5,
    assignedCustodian: {
      name: 'Matteo Rossi',
      role: 'Field Operations Specialist',
      email: 'm.rossi@fieldops-it.eu'
    },
    lastPhysicalAudit: '2025-11-10',
    nextAuditDue: 'OVERDUE (285 Days)',
    auditAuditLog: [
      {
        date: '2025-11-10 14:15:00',
        auditor: 'Matteo Rossi',
        action: 'Routine Inspection',
        notes: 'Cabinet lock key missing; physical tamper sensor reported open circuit.',
        verificationHash: '0x129381902830918230'
      }
    ],
    statutoryControls: [
      {
        framework: 'EU Cyber Resilience Act (CRA)',
        clause: 'Article 10 (Essential Hardware Security Requirements)',
        requirement: 'Hardware devices must have hardware root of trust and automatic security updates.',
        status: 'FAILED',
        lastChecked: '2026-08-21',
        evidence: 'Device running legacy firmware without active CVE patches.'
      },
      {
        framework: 'ISO/IEC 27001:2022',
        clause: 'Annex A.7.10 (Storage Media)',
        requirement: 'Storage media containing sensitive logs must be encrypted at rest.',
        status: 'FAILED',
        lastChecked: '2026-08-21',
        evidence: 'Local eMMC storage is unencrypted.'
      }
    ]
  },
  {
    id: 'AST-HW-905',
    qrCodePayload: '9XEN_REGULETTEE://ASSET/AST-HW-905/RIYADH-SAN-VAULT-01',
    assetTag: 'LEX-RUH-SAN-005',
    name: 'Riyadh In-Country Sovereign Storage Array',
    category: 'Encrypted SAN Storage',
    model: 'NetApp AFF A900 All-Flash SAN Storage',
    serialNumber: 'SN-NTAP-8849102-KSA',
    macAddress: 'E4:43:4B:99:88:77',
    physicalLocation: {
      facility: 'STC Data Center 3 (Al-Malaz, Riyadh)',
      room: 'National Sovereignty Tier-4 Suite',
      rackId: 'RACK-KSA-01',
      rackUnit: 'U10 - U18',
      geoCoordinates: '24.7136° N, 46.6753° E',
      jurisdiction: 'Kingdom of Saudi Arabia (SDAIA / PDPL Decree M/19)'
    },
    sovereigntyEnclave: 'KSA Riyadh In-Country Data Enclave',
    cryptographicStatus: {
      algorithm: 'PQC Kyber-768 Enforced',
      hsmBound: true,
      tpmVersion: 'TPM 2.0 with SDAIA In-Country Root Certificate',
      pcrHash: '0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
      firmwareVersion: 'v9.13.1P4-SOVEREIGN',
      lastFirmwareAttestation: '2026-08-22 08:00 UTC',
      tamperDetection: 'Intact'
    },
    complianceStatus: 'COMPLIANT',
    complianceScore: 99.8,
    assignedCustodian: {
      name: 'Tariq Al-Ghamdi',
      role: 'National Sovereign Infrastructure Director',
      email: 't.ghamdi@sdaia-residency.sa'
    },
    lastPhysicalAudit: '2026-08-14',
    nextAuditDue: '2026-11-14',
    auditAuditLog: [
      {
        date: '2026-08-14 11:30:00',
        auditor: 'Sophia Al-Mansoor (Lead Auditor)',
        action: 'SDAIA In-Country Physical Data Residency Audit',
        notes: '100% of non-volatile storage verified isolated within Saudi border boundaries.',
        verificationHash: '0x998877665544332211'
      }
    ],
    statutoryControls: [
      {
        framework: 'KSA PDPL (Royal Decree M/19)',
        clause: 'Article 29 (Cross-Border Transfer Restrictions & In-Country Storage)',
        requirement: 'Personal and sensitive financial telemetry must reside physically on in-kingdom infrastructure.',
        status: 'PASSED',
        lastChecked: '2026-08-22',
        evidence: 'GPS-locked hardware enclosure with certified in-country cryptographic keys.'
      },
      {
        framework: 'NCA ECC-1:2018 (Essential Cybersecurity Controls)',
        clause: 'Sub-domain 2.3 (Cryptographic Key Management)',
        requirement: 'Keys must be generated inside physical FIPS 140-2 Level 3 HSM.',
        status: 'PASSED',
        lastChecked: '2026-08-14',
        evidence: 'HSM attestation certificate issued by certified KSA authority.'
      }
    ]
  }
];

export function findHardwareAssetByQr(payload: string): HardwarePhysicalAsset | undefined {
  const cleanPayload = payload.trim();
  
  // Match direct ID
  const byId = HARDWARE_PHYSICAL_ASSETS.find(a => 
    a.id.toLowerCase() === cleanPayload.toLowerCase() ||
    a.assetTag.toLowerCase() === cleanPayload.toLowerCase() ||
    a.qrCodePayload.toLowerCase() === cleanPayload.toLowerCase()
  );
  if (byId) return byId;

  // Match JSON payload if any
  try {
    const parsed = JSON.parse(cleanPayload);
    if (parsed.id || parsed.assetId || parsed.assetTag) {
      const targetId = parsed.id || parsed.assetId || parsed.assetTag;
      return HARDWARE_PHYSICAL_ASSETS.find(a => 
        a.id.toLowerCase() === targetId.toLowerCase() ||
        a.assetTag.toLowerCase() === targetId.toLowerCase()
      );
    }
  } catch (e) {
    // not JSON
  }

  // Match URL payload
  if (cleanPayload.includes('AST-HW-') || cleanPayload.includes('LEX-')) {
    return HARDWARE_PHYSICAL_ASSETS.find(a => 
      cleanPayload.includes(a.id) || cleanPayload.includes(a.assetTag)
    );
  }

  // Return first as closest match if contains asset query or fallback
  return undefined;
}
