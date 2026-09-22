import React from 'react';
import { lazyWithRetry } from './lib/lazy-utils';
import { AiModelGovernance as AiModelGovernancePage } from './pages/AiModelGovernance';
import { PlatformDashboard as PlatformDashboardPage } from './pages/PlatformDashboard';
import { LandingPage as LandingPageComp } from './pages/LandingPage';
import { Gateway as GatewayComp } from './pages/Gateway';
import { ClientDashboard as ClientDashboardComp } from './pages/ClientDashboard';


// Dynamic component imports
export const EnergyGridSustainabilityDashboard = lazyWithRetry(() => import('./pages/EnergyGridSustainabilityDashboard').then(m => ({ default: m.default })), 'EnergyGridSustainabilityDashboard');
export const HealthcareLifeSciencesDashboard = lazyWithRetry(() => import('./pages/HealthcareLifeSciencesDashboard').then(m => ({ default: m.default })), 'HealthcareLifeSciencesDashboard');
export const EnterpriseMarketplaceVisualization = lazyWithRetry(() => import('./pages/ComplianceMarketplace').then(m => ({ default: m.ComplianceMarketplace })), 'EnterpriseMarketplaceVisualization');
export const EnterprisePrivacySuite = lazyWithRetry(() => import('./pages/EnterprisePrivacySuite').then(m => ({ default: m.EnterprisePrivacySuite })), 'EnterprisePrivacySuite');
export const EnterpriseCompanyNetwork = lazyWithRetry(() => import('./pages/EnterpriseCompanyNetwork').then(m => ({ default: m.EnterpriseCompanyNetwork || m.default })), 'EnterpriseCompanyNetwork');
export const EnterpriseVerificationHub = lazyWithRetry(() => import('./pages/EnterpriseVerificationHub').then(m => ({ default: m.EnterpriseVerificationHub || m.default })), 'EnterpriseVerificationHub');
export const PredictiveTradingIntelligence = lazyWithRetry(() => import('./pages/PredictiveTradingIntelligence').then(m => ({ default: m.PredictiveTradingIntelligence || m.default })), 'PredictiveTradingIntelligence');
export const EnterpriseServicesGateway = lazyWithRetry(() => import('./pages/EnterpriseServicesGateway').then(m => ({ default: m.EnterpriseServicesGateway || m.default })), 'EnterpriseServicesGateway');
export const SsoLandingPage = lazyWithRetry(() => import('./pages/SsoLandingPage').then(m => ({ default: m.SsoLandingPage || m.default })), 'SsoLandingPage');
export const ActionableTasks = lazyWithRetry(() => import('./pages/ActionableTasks').then(m => ({ default: m.ActionableTasks })), 'ActionableTasks');
export const AutomatedRemediationEngine = lazyWithRetry(() => import('./pages/AutomatedRemediationEngine').then(m => ({ default: m.AutomatedRemediationEngine })), 'AutomatedRemediationEngine');
export const SovereigntyRoleSecurity = lazyWithRetry(() => import('./pages/SovereigntyRoleSecurity').then(m => ({ default: m.SovereigntyRoleSecurity })), 'SovereigntyRoleSecurity');
export const AutomatedScannerInspection = lazyWithRetry(() => import('./pages/AutomatedScannerInspection').then(m => ({ default: m.AutomatedScannerInspection })), 'AutomatedScannerInspection');
export const AdminAuditLedger = lazyWithRetry(() => import('./pages/AdminAuditLedger').then(m => ({ default: m.AdminAuditLedger })), 'AdminAuditLedger');
export const AdminB2GOversight = lazyWithRetry(() => import('./pages/AdminB2GOversight').then(m => ({ default: m.AdminB2GOversight })), 'AdminB2GOversight');
export const DSARPortal = lazyWithRetry(() => import('./pages/DSARPortal').then(m => ({ default: m.DSARPortal })), 'DSARPortal');
export const PrivacyPolicyGenerator = lazyWithRetry(() => import('./pages/PrivacyPolicyGenerator').then(m => ({ default: m.PrivacyPolicyGenerator })), 'PrivacyPolicyGenerator');
export const LLMProviderConfig = lazyWithRetry(() => import('./pages/LLMProviderConfig').then(m => ({ default: m.LLMProviderConfig })), 'LLMProviderConfig');
export const VerificationFeatureToggles = lazyWithRetry(() => import('./pages/VerificationFeatureToggles').then(m => ({ default: m.VerificationFeatureToggles })), 'VerificationFeatureToggles');
export const AdminEntitlements = lazyWithRetry(() => import('./pages/AdminEntitlements').then(m => ({ default: m.AdminEntitlements })), 'AdminEntitlements');
export const ClientBillingRouterPage = lazyWithRetry(() => import('./pages/ClientBillingRouterPage').then(m => ({ default: m.ClientBillingRouterPage })), 'ClientBillingRouterPage');
export const InvoicesPage = lazyWithRetry(() => import('./pages/ClientBillingRouterPage').then(m => ({ default: m.InvoicesPage })), 'InvoicesPage');
export const PaymentMethodsPage = lazyWithRetry(() => import('./pages/ClientBillingRouterPage').then(m => ({ default: m.PaymentMethodsPage })), 'PaymentMethodsPage');
export const SubscriptionsPage = lazyWithRetry(() => import('./pages/ClientBillingRouterPage').then(m => ({ default: m.SubscriptionsPage })), 'SubscriptionsPage');
export const CaasSubscriptionMgmtPage = lazyWithRetry(() => import('./pages/ClientBillingRouterPage').then(m => ({ default: m.CaasSubscriptionMgmtPage })), 'CaasSubscriptionMgmtPage');
export const AdminFinance = lazyWithRetry(() => import('./pages/AdminFinance').then(m => ({ default: m.AdminFinance })), 'AdminFinance');
export const AdminOnboardingFlows = lazyWithRetry(() => import('./pages/AdminOnboardingFlows').then(m => ({ default: m.AdminOnboardingFlows })), 'AdminOnboardingFlows');
export const AdminTenants = lazyWithRetry(() => import('./pages/AdminTenants').then(m => ({ default: m.AdminTenants })), 'AdminTenants');
export const AdminRuleEngine = lazyWithRetry(() => import('./pages/AdminRuleEngine').then(m => ({ default: m.AdminRuleEngine })), 'AdminRuleEngine');
export const AiLineageForensics = lazyWithRetry(() => import('./pages/AiLineageForensics').then(m => ({ default: m.AiLineageForensics })), 'AiLineageForensics');
export const AiModelGovernance = AiModelGovernancePage;
export const AiRiskHedge = lazyWithRetry(() => import('./pages/AiRiskHedge').then(m => ({ default: m.AiRiskHedge })), 'AiRiskHedge');
export const AlaeArbitrationEngine = lazyWithRetry(() => import('./pages/AlaeArbitrationEngine').then(m => ({ default: m.AlaeArbitrationEngine })), 'AlaeArbitrationEngine');
export const AmlKycModule = lazyWithRetry(() => import('./pages/AmlKycModule').then(m => ({ default: m.AmlKycModule })), 'AmlKycModule');
export const AnalyticalIntelligence = lazyWithRetry(() => import('./pages/AnalyticalIntelligence').then(m => ({ default: m.AnalyticalIntelligence })), 'AnalyticalIntelligence');
export const AuditLedger = lazyWithRetry(() => import('./pages/AuditLedger').then(m => ({ default: m.AuditLedger })), 'AuditLedger');
export const B2gOperations = lazyWithRetry(() => import('./pages/B2gOperations').then(m => ({ default: m.B2gOperations })), 'B2gOperations');
export const B2gRegulatorPortal = lazyWithRetry(() => import('./pages/B2gRegulatorPortal').then(m => ({ default: m.B2gRegulatorPortal })), 'B2gRegulatorPortal');
export const BreachSimulationTool = lazyWithRetry(() => import('./pages/BreachSimulationTool').then(m => ({ default: m.BreachSimulationTool })), 'BreachSimulationTool');
export const CaasOperationCenter = lazyWithRetry(() => import('./pages/CaasOperationCenter').then(m => ({ default: m.CaasOperationCenter })), 'CaasOperationCenter');
export const CaasServiceDashboard = lazyWithRetry(() => import('./pages/CaasServiceDashboard').then(m => ({ default: m.CaasServiceDashboard })), 'CaasServiceDashboard');
export const ClientDashboard = ClientDashboardComp;
export const ClientVault = lazyWithRetry(() => import('./pages/ClientVault').then(m => ({ default: m.ClientVault })), 'ClientVault');
export const Companies = lazyWithRetry(() => import('./pages/Companies').then(m => ({ default: m.Companies })), 'Companies');
export const CompanyProfile = lazyWithRetry(() => import('./pages/CompanyProfile').then(m => ({ default: m.CompanyProfile })), 'CompanyProfile');
export const ComplianceOpsIntegrator = lazyWithRetry(() => import('./pages/CaasOperationCenter').then(m => ({ default: m.CaasOperationCenter })), 'ComplianceOpsIntegrator');
export const ComplianceAuditDashboard = lazyWithRetry(() => import('./pages/ComplianceAuditPlatformPage').then(m => ({ default: m.ComplianceAuditPlatformPage })), 'ComplianceAuditDashboard');
export const TbmlDetectionDashboard = lazyWithRetry(() => import('./components/TbmlDetectionDashboard').then(m => ({ default: m.default })), 'TbmlDetectionDashboard');
export const ContractIntelligenceDashboard = lazyWithRetry(() => import('./components/ContractIntelligenceDashboard').then(m => ({ default: m.default })), 'ContractIntelligenceDashboard');
export const MultilingualNlpDashboard = lazyWithRetry(() => import('./components/MultilingualNlpDashboard').then(m => ({ default: m.default })), 'MultilingualNlpDashboard');
export const GovtProcurementDashboard = lazyWithRetry(() => import('./components/GovtProcurementDashboard').then(m => ({ default: m.default })), 'GovtProcurementDashboard');
export const TaxAnomalyDashboard = lazyWithRetry(() => import('./components/TaxAnomalyDashboard').then(m => ({ default: m.default })), 'TaxAnomalyDashboard');
export const EduCredentialDashboard = lazyWithRetry(() => import('./components/EduCredentialDashboard').then(m => ({ default: m.default })), 'EduCredentialDashboard');
export const AgriSubsidiesDashboard = lazyWithRetry(() => import('./components/AgriSubsidiesDashboard').then(m => ({ default: m.default })), 'AgriSubsidiesDashboard');
export const ComplianceDeltaAuditor = lazyWithRetry(() => import('./pages/AdminB2GOversight').then(m => ({ default: m.AdminB2GOversight })), 'ComplianceDeltaAuditor');
export const ComplianceAutomationPortal = lazyWithRetry(() => import('./pages/ComplianceAutomationPortal').then(m => ({ default: m.ComplianceAutomationPortal })), 'ComplianceAutomationPortal');
export const ComplianceHubAdminPage = lazyWithRetry(() => import('./pages/ComplianceHubAdmin').then(m => ({ default: m.ComplianceHubAdminPage })), 'ComplianceHubAdminPage');
export const ComplianceScraper = lazyWithRetry(() => import('./pages/ComplianceScraper').then(m => ({ default: m.ComplianceScraper })), 'ComplianceScraper');
export const ComplianceScraperDashboard = lazyWithRetry(() => import('./pages/ComplianceScraperDashboard').then(m => ({ default: m.ComplianceScraperDashboard })), 'ComplianceScraperDashboard');
export const CrossBorderEnforcement = lazyWithRetry(() => import('./pages/CrossBorderEnforcement').then(m => ({ default: m.CrossBorderEnforcement })), 'CrossBorderEnforcement');
export const CyberInsurancePlatform = lazyWithRetry(() => import('./pages/CyberInsurancePlatform').then(m => ({ default: m.CyberInsurancePlatform })), 'CyberInsurancePlatform');
export const CyberSecurityHub = lazyWithRetry(() => import('./pages/CyberSecurityHub').then(m => ({ default: m.CyberSecurityHub })), 'CyberSecurityHub');
export const NIS2DashboardPage = lazyWithRetry(() => import('./components/nis2/NIS2Dashboard').then(m => ({ default: m.NIS2Dashboard })), 'NIS2Dashboard');
export const PenaltyCalculatorPage = lazyWithRetry(() => import('./components/PenaltyCalculatorModule').then(m => ({ default: m.PenaltyCalculatorModule })), 'PenaltyCalculator');
export const PenaltyAppealPage = lazyWithRetry(() => import('./components/PenaltyAppealCourtroom').then(m => ({ default: m.PenaltyAppealCourtroom })), 'PenaltyAppeal');
export const DataBreachNotificationSystem = lazyWithRetry(() => import('./pages/DataBreachNotificationSystem').then(m => ({ default: m.DataBreachNotificationSystem })), 'DataBreachNotificationSystem');
export const DataFlowAdequacy = lazyWithRetry(() => import('./pages/DataFlowAdequacy').then(m => ({ default: m.DataFlowAdequacy })), 'DataFlowAdequacy');
export const DataLineage = lazyWithRetry(() => import('./pages/DataLineage').then(m => ({ default: m.DataLineage })), 'DataLineage');
export const DeveloperApiHub = lazyWithRetry(() => import('./pages/DeveloperApiHub').then(m => ({ default: m.DeveloperApiHub })), 'DeveloperApiHub');
export const GlobalEventWebhooks = lazyWithRetry(() => import('./pages/GlobalEventWebhooks').then(m => ({ default: m.GlobalEventWebhooks || m.default })), 'GlobalEventWebhooks');
export const DigitalIdentityCompliance = lazyWithRetry(() => import('./pages/DigitalIdentityCompliance').then(m => ({ default: m.DigitalIdentityCompliance })), 'DigitalIdentityCompliance');
export const DoraResiliencePlanner = lazyWithRetry(() => import('./pages/DoraResiliencePlanner').then(m => ({ default: m.DoraResiliencePlanner })), 'DoraResiliencePlanner');
export const DpoCertificationDashboard = lazyWithRetry(() => import('./pages/DpoCertificationDashboard').then(m => ({ default: m.DpoCertificationDashboard })), 'DpoCertificationDashboard');
export const DynamicConsentNetwork = lazyWithRetry(() => import('./pages/DynamicConsentNetwork').then(m => ({ default: m.DynamicConsentNetwork })), 'DynamicConsentNetwork');
export const MCPManager = lazyWithRetry(() => import('./pages/LLMProviderConfig').then(m => ({ default: m.LLMProviderConfig })), 'MCPManager');
export const RegTechSaaSOverview = lazyWithRetry(() => import('./pages/RegTechSaaSOverview').then(m => ({ default: m.RegTechSaaSOverview })), 'RegTechSaaSOverview');
export const GuardrailConsole = lazyWithRetry(() => import('./pages/GuardrailConsole').then(m => ({ default: m.GuardrailConsole })), 'GuardrailConsole');
export const SovereignDataGatewayPage = lazyWithRetry(() => import('./pages/SovereignDataGatewayPage'), 'SovereignDataGatewayPage');
export const PartnerPlatformDashboard = lazyWithRetry(() => import('./pages/PartnerPlatformDashboard').then(m => ({ default: m.PartnerPlatformDashboard })), 'PartnerPlatformDashboard');
export const ComplianceAuditPlatformPage = lazyWithRetry(() => import('./pages/ComplianceAuditPlatformPage').then(m => ({ default: m.ComplianceAuditPlatformPage })), 'ComplianceAuditPlatformPage');
export const EntityEnforcementPortal = lazyWithRetry(() => import('./pages/EntityEnforcementPortal').then(m => ({ default: m.EntityEnforcementPortal || m.default })), 'EntityEnforcementPortal');
export const EdtechShieldAddon = lazyWithRetry(() => import('./pages/EdtechShieldAddon').then(m => ({ default: m.EdtechShieldAddon })), 'EdtechShieldAddon');
export const EmergencySecurityAudit = lazyWithRetry(() => import('./pages/EmergencySecurityAudit').then(m => ({ default: m.EmergencySecurityAudit })), 'EmergencySecurityAudit');
export const EsgGreenData = lazyWithRetry(() => import('./pages/EsgGreenData').then(m => ({ default: m.EsgGreenData })), 'EsgGreenData');
export const EuClientAccountPortal = lazyWithRetry(() => import('./pages/EuClientAccountPortal').then(m => ({ default: m.EuClientAccountPortal })), 'EuClientAccountPortal');
export const EuEcommerceAddon = lazyWithRetry(() => import('./pages/EuEcommerceAddon').then(m => ({ default: m.EuEcommerceAddon })), 'EuEcommerceAddon');
export const EvidenceVault = lazyWithRetry(() => import('./pages/EvidenceVault').then(m => ({ default: m.EvidenceVault })), 'EvidenceVault');
export const ForceTenantLogout = lazyWithRetry(() => import('./pages/ForceTenantLogout').then(m => ({ default: m.ForceTenantLogout })), 'ForceTenantLogout');
export const GamingEntertainmentAddon = lazyWithRetry(() => import('./pages/GamingEntertainmentAddon').then(m => ({ default: m.GamingEntertainmentAddon })), 'GamingEntertainmentAddon');
export const Gateway = GatewayComp;
export const GdprComplianceAddon = lazyWithRetry(() => import('./pages/GdprComplianceAddon').then(m => ({ default: m.GdprComplianceAddon })), 'GdprComplianceAddon');
export const GlobalMaintenanceToggle = lazyWithRetry(() => import('./pages/GlobalMaintenanceToggle').then(m => ({ default: m.GlobalMaintenanceToggle })), 'GlobalMaintenanceToggle');
export const GlobalSecurity = lazyWithRetry(() => import('./pages/GlobalSecurity').then(m => ({ default: m.GlobalSecurity })), 'GlobalSecurity');
export const GovtechAddon = lazyWithRetry(() => import('./pages/GovtechAddon').then(m => ({ default: m.GovtechAddon })), 'GovtechAddon');
export const RegTechOrchestratorConsole = lazyWithRetry(() => import('./pages/FuturisticRegEngineSuite').then(m => ({ default: m.FuturisticRegEngineSuite })), 'RegTechOrchestratorConsole');
export const GraphIntelligence = lazyWithRetry(() => import('./pages/GraphIntelligence').then(m => ({ default: m.GraphIntelligence })), 'GraphIntelligence');
export const HealthtechAddon = lazyWithRetry(() => import('./pages/HealthtechAddon').then(m => ({ default: m.HealthtechAddon })), 'HealthtechAddon');
export const IdentityManagement = lazyWithRetry(() => import('./pages/IdentityManagement').then(m => ({ default: m.IdentityManagement })), 'IdentityManagement');
export const IncidentResponse = lazyWithRetry(() => import('./pages/IncidentResponse').then(m => ({ default: m.IncidentResponse })), 'IncidentResponse');
export const IncidentResponseCopilot = lazyWithRetry(() => import('./pages/IncidentResponseCopilot').then(m => ({ default: m.IncidentResponseCopilot })), 'IncidentResponseCopilot');
export const LandingPage = LandingPageComp;
export const LawViolationScanner = lazyWithRetry(() => import('./pages/LawViolationScanner').then(m => ({ default: m.LawViolationScanner })), 'LawViolationScanner');
export const LawyerPartnerPortal = lazyWithRetry(() => import('./pages/LawyerPartnerPortal').then(m => ({ default: m.LawyerPartnerPortal || m.default })), 'LawyerPartnerPortal');
export const LiveComplianceDashboard = lazyWithRetry(() => import('./pages/LiveComplianceDashboard').then(m => ({ default: m.LiveComplianceDashboard })), 'LiveComplianceDashboard');
export const LogisticSupplyChainAddon = lazyWithRetry(() => import('./pages/LogisticSupplyChainAddon').then(m => ({ default: m.LogisticSupplyChainAddon })), 'LogisticSupplyChainAddon');
export const MaCompliancePlatform = lazyWithRetry(() => import('./pages/MaCompliancePlatform').then(m => ({ default: m.MaCompliancePlatform })), 'MaCompliancePlatform');
export const MicaForensics = lazyWithRetry(() => import('./pages/MicaForensics').then(m => ({ default: m.MicaForensics })), 'MicaForensics');
export const OfficialReports = lazyWithRetry(() => import('./pages/OfficialReports').then(m => ({ default: m.OfficialReports })), 'OfficialReports');
export const PlatformDashboard = PlatformDashboardPage;
export const PlatformPolicyEngine = lazyWithRetry(() => import('./pages/PlatformPolicyEngine').then(m => ({ default: m.PlatformPolicyEngine })), 'PlatformPolicyEngine');
export const PolicyEngine = lazyWithRetry(() => import('./pages/PolicyEngine').then(m => ({ default: m.PolicyEngine })), 'PolicyEngine');
export const PqcMigrationPlanner = lazyWithRetry(() => import('./pages/PqcMigrationPlanner').then(m => ({ default: m.PqcMigrationPlanner })), 'PqcMigrationPlanner');
export const QuantumDashboard = lazyWithRetry(() => import('./pages/QuantumDashboard').then(m => ({ default: m.QuantumDashboard })), 'QuantumDashboard');
export const QuantumProtectionEngine = lazyWithRetry(() => import('./pages/QuantumProtectionEngine').then(m => ({ default: m.QuantumProtectionEngine })), 'QuantumProtectionEngine');
export const RegionAwareDashboard = lazyWithRetry(() => import('./pages/RegionAwareDashboard').then(m => ({ default: m.RegionAwareDashboard })), 'RegionAwareDashboard');
export const RegulatoryRadarPage = lazyWithRetry(() => import('./pages/RegulatoryRadarPage').then(m => ({ default: m.RegulatoryRadarPage })), 'RegulatoryRadarPage');
export const TransferImpactAssessmentPage = lazyWithRetry(() => import('./pages/TransferImpactAssessmentPage').then(m => ({ default: m.TransferImpactAssessmentPage || m.default })), 'TransferImpactAssessmentPage');
export const StatutoryGazetteWatchdogPage = lazyWithRetry(() => import('./pages/StatutoryGazetteWatchdogPage').then(m => ({ default: m.StatutoryGazetteWatchdogPage || m.default })), 'StatutoryGazetteWatchdogPage');
export const RegulatorDashboard = lazyWithRetry(() => import('./pages/RegulatorDashboard').then(m => ({ default: m.RegulatorDashboard || m.default })), 'RegulatorDashboard');
export const EnterpriseCapabilityExtensionHub = lazyWithRetry(() => import('./pages/DeveloperApiHub').then(m => ({ default: m.DeveloperApiHub })), 'EnterpriseCapabilityExtensionHub');
export const EnterpriseNextGenIntegrationHub = lazyWithRetry(() => import('./pages/ZeroDowntimeIntegrationHub').then(m => ({ default: m.ZeroDowntimeIntegrationHub })), 'EnterpriseNextGenIntegrationHub');
export const RegulatoryChangeSimulator = lazyWithRetry(() => import('./pages/BreachSimulationTool').then(m => ({ default: m.BreachSimulationTool })), 'RegulatoryChangeSimulator');
export const RegulatoryNarrativeGenerator = lazyWithRetry(() => import('./pages/RegulatoryNarrativeGenerator').then(m => ({ default: m.RegulatoryNarrativeGenerator })), 'RegulatoryNarrativeGenerator');
export const MultiRegionPolicyEngine = lazyWithRetry(() => import('./pages/MultiRegionPolicyEngine').then(m => ({ default: m.MultiRegionPolicyEngine })), 'MultiRegionPolicyEngine');
export const RegulatoryPolicyEngine = lazyWithRetry(() => import('./pages/RegulatoryPolicyEngine').then(m => ({ default: m.RegulatoryPolicyEngine })), 'RegulatoryPolicyEngine');
export const RuntimeSecurity = lazyWithRetry(() => import('./pages/RuntimeSecurity').then(m => ({ default: m.RuntimeSecurity })), 'RuntimeSecurity');
export const SecretScanner = lazyWithRetry(() => import('./pages/SecretScanner').then(m => ({ default: m.SecretScanner })), 'SecretScanner');
export const SecurityLogViewer = lazyWithRetry(() => import('./pages/SecurityLogViewer').then(m => ({ default: m.SecurityLogViewer })), 'SecurityLogViewer');
export const SecuritySettings = lazyWithRetry(() => import('./pages/SecuritySettings').then(m => ({ default: m.SecuritySettings })), 'SecuritySettings');
export const Settings = lazyWithRetry(() => import('./pages/Settings').then(m => ({ default: m.Settings })), 'Settings');
export const MoatEnterpriseConsole = lazyWithRetry(() => import('./pages/MoatEnterpriseConsole').then(m => ({ default: m.MoatEnterpriseConsole })), 'MoatEnterpriseConsole');
export const EnterpriseExpansionConsole = lazyWithRetry(() => import('./pages/EnterpriseExpansionConsole').then(m => ({ default: m.EnterpriseExpansionConsole })), 'EnterpriseExpansionConsole');
export const ZkProofConsole = lazyWithRetry(() => import('./pages/ZkProofConsole').then(m => ({ default: m.ZkProofConsole })), 'ZkProofConsole');
export const SovereignCloudVault = lazyWithRetry(() => import('./pages/SovereignCloudVault').then(m => ({ default: m.SovereignCloudVault })), 'SovereignCloudVault');
export const Soc2ComplianceHub = lazyWithRetry(() => import('./pages/Soc2ComplianceHub').then(m => ({ default: m.Soc2ComplianceHub })), 'Soc2ComplianceHub');
export const SovereigntyArbitrage = lazyWithRetry(() => import('./pages/SovereigntyArbitrage').then(m => ({ default: m.SovereigntyArbitrage })), 'SovereigntyArbitrage');
export const SovereigntyDashboard = lazyWithRetry(() => import('./pages/SovereigntyDashboard').then(m => ({ default: m.SovereigntyDashboard })), 'SovereigntyDashboard');
export const SupplyChainAuditor = lazyWithRetry(() => import('./pages/SupplyChainAuditor').then(m => ({ default: m.SupplyChainAuditor })), 'SupplyChainAuditor');
export const SystemManagement = lazyWithRetry(() => import('./pages/SystemManagement').then(m => ({ default: m.SystemManagement })), 'SystemManagement');
export const Tasks = lazyWithRetry(() => import('./pages/Tasks').then(m => ({ default: m.Tasks })), 'Tasks');
export const TeamAccess = lazyWithRetry(() => import('./pages/TeamAccess').then(m => ({ default: m.TeamAccess })), 'TeamAccess');
export const TenantOnboardingWizard = lazyWithRetry(() => import('./pages/TenantOnboardingWizard').then(m => ({ default: m.TenantOnboardingWizard })), 'TenantOnboardingWizard');
export const TrustPrivacyDashboard = lazyWithRetry(() => import('./pages/TrustPrivacyDashboard').then(m => ({ default: m.TrustPrivacyDashboard })), 'TrustPrivacyDashboard');
export const GdprPrivacyManagementSystem = lazyWithRetry(() => import('./pages/GdprPrivacyManagementSystem').then(m => ({ default: m.GdprPrivacyManagementSystem })), 'GdprPrivacyManagementSystem');
export const Vault = lazyWithRetry(() => import('./pages/Vault').then(m => ({ default: m.Vault })), 'Vault');
export const VectorKnowledgeBase = lazyWithRetry(() => import('./pages/VectorKnowledgeBase').then(m => ({ default: m.VectorKnowledgeBase })), 'VectorKnowledgeBase');
export const ViolationSurveillance = lazyWithRetry(() => import('./pages/ViolationSurveillance').then(m => ({ default: m.ViolationSurveillance })), 'ViolationSurveillance');
export const VulnerabilityScanner = lazyWithRetry(() => import('./pages/VulnerabilityScanner').then(m => ({ default: m.VulnerabilityScanner })), 'VulnerabilityScanner');
export const WarRoomScenarioEngine = lazyWithRetry(() => import('./pages/WarRoomScenarioEngine').then(m => ({ default: m.WarRoomScenarioEngine })), 'WarRoomScenarioEngine');
export const RiskMatrixDashboard = lazyWithRetry(() => import('./pages/RiskMatrixDashboard').then(m => ({ default: m.RiskMatrixDashboard })), 'RiskMatrixDashboard');
export const ZeroTrustNetwork = lazyWithRetry(() => import('./pages/ZeroTrustNetwork').then(m => ({ default: m.ZeroTrustNetwork })), 'ZeroTrustNetwork');
export const ZeroDowntimeIntegrationHub = lazyWithRetry(() => import('./pages/ZeroDowntimeIntegrationHub').then(m => ({ default: m.ZeroDowntimeIntegrationHub })), 'ZeroDowntimeIntegrationHub');
export const SubscriptionRevenueHub = lazyWithRetry(() => import('./pages/SubscriptionRevenueHub').then((m: any) => ({ default: m.SubscriptionRevenueHub || m.default })), 'SubscriptionRevenueHub');
export const RegistrationPage = lazyWithRetry(() => import('./pages/RegistrationPage').then((m: any) => ({ default: m.RegistrationPage || m.default })), 'RegistrationPage');
export const LoginPage = lazyWithRetry(() => import('./pages/Login').then(m => ({ default: m.LoginPage })), 'LoginPage');
export const RiskImpactCalculator = lazyWithRetry(() => import('./pages/RiskImpactCalculator').then(m => ({ default: m.RiskImpactCalculator })), 'RiskImpactCalculator');
export const SystemSetup = lazyWithRetry(() => import('./pages/SystemSetup').then(m => ({ default: m.SystemSetup })), 'SystemSetup');
export const SystemAuditLedger = lazyWithRetry(() => import('./pages/SystemAuditLedger').then(m => ({ default: m.SystemAuditLedger })), 'SystemAuditLedger');
export const QuantumSecureVault = lazyWithRetry(() => import('./pages/QuantumDashboard').then(m => ({ default: m.QuantumDashboard })), 'QuantumSecureVault');
export const ComplianceMarketplace = lazyWithRetry(() => import('./pages/ComplianceMarketplace').then(m => ({ default: m.ComplianceMarketplace })), 'ComplianceMarketplace');
export const CaasSubscriptionManager = lazyWithRetry(() => import('./pages/SubscriptionRevenueHub').then((m: any) => ({ default: m.CaasSubscriptionManager || m.SubscriptionRevenueHub || m.default })), 'CaasSubscriptionManager');
export const ClientAssetScannerHub = lazyWithRetry(() => import('./pages/ClientAssetScannerHub').then(m => ({ default: m.ClientAssetScannerHub })), 'ClientAssetScannerHub');
export const ComplianceScanner = lazyWithRetry(() => import('./pages/ComplianceScanner').then(m => ({ default: m.ComplianceScanner })), 'ComplianceScanner');
export const ContractCompliance = lazyWithRetry(() => import('./pages/ContractCompliance').then(m => ({ default: m.ContractCompliance })), 'ContractCompliance');
export const ProcurementCompliance = lazyWithRetry(() => import('./pages/ProcurementCompliance').then(m => ({ default: m.ProcurementCompliance })), 'ProcurementCompliance');
export const AssetCompliance = lazyWithRetry(() => import('./pages/AssetCompliance').then(m => ({ default: m.AssetCompliance })), 'AssetCompliance');
export const FleetCompliance = lazyWithRetry(() => import('./pages/FleetCompliance').then(m => ({ default: m.FleetCompliance })), 'FleetCompliance');
export const VendorCompliance = lazyWithRetry(() => import('./pages/VendorCompliance').then(m => ({ default: m.VendorCompliance })), 'VendorCompliance');
export const CapaManagement = lazyWithRetry(() => import('./pages/CapaManagement').then(m => ({ default: m.CapaManagement })), 'CapaManagement');
export const BcpTracking = lazyWithRetry(() => import('./pages/BcpTracking').then(m => ({ default: m.BcpTracking })), 'BcpTracking');
export const DrTracking = lazyWithRetry(() => import('./pages/DrTracking').then(m => ({ default: m.DrTracking })), 'DrTracking');
export const InternalAuditManagement = lazyWithRetry(() => import('./pages/InternalAuditManagement').then(m => ({ default: m.InternalAuditManagement })), 'InternalAuditManagement');
export const PermissionReconciliationDashboard = lazyWithRetry(() => import('./pages/PermissionReconciliationDashboard').then(m => ({ default: m.PermissionReconciliationDashboard })), 'PermissionReconciliationDashboard');
export const ComplianceCacheDashboard = lazyWithRetry(() => import('./pages/ComplianceCacheDashboard').then(m => ({ default: m.ComplianceCacheDashboard })), 'ComplianceCacheDashboard');
export const LawyerConsultantAdminPage = lazyWithRetry(() => import('./pages/LawyerConsultantAdminPage').then(m => ({ default: m.LawyerConsultantAdminPage })), 'LawyerConsultantAdminPage');
export const EnterpriseCompetitiveMoatSuite = lazyWithRetry(() => import('./pages/RegTechSaaSOverview').then(m => ({ default: m.RegTechSaaSOverview })), 'EnterpriseCompetitiveMoatSuite');
export const RegulatorySearchModal = lazyWithRetry(() => import('./components/RegulatorySearchModal').then(m => ({ default: m.RegulatorySearchModal })), 'RegulatorySearchModal');
export const ComplianceDocumentation = lazyWithRetry(() => import('./pages/ComplianceDocumentation').then(m => ({ default: m.default })), 'ComplianceDocumentation');
export const ComplianceAuditLedgerPage = lazyWithRetry(() => import('./pages/ComplianceAuditLedgerPage').then(m => ({ default: m.ComplianceAuditLedgerPage })), 'ComplianceAuditLedgerPage');
export const RealtimeTransactionMonitoringPage = lazyWithRetry(() => import('./pages/RealtimeTransactionMonitoringPage').then(m => ({ default: m.RealtimeTransactionMonitoringPage })), 'RealtimeTransactionMonitoringPage');
export const ProactiveRegTechEngine = lazyWithRetry(() => import('./pages/AutomatedRemediationEngine').then(m => ({ default: m.AutomatedRemediationEngine })), 'ProactiveRegTechEngine');
export const AutonomousPlatformControlCenter = lazyWithRetry(() => import('./pages/AutonomousGovernance').then(m => ({ default: m.default })), 'AutonomousPlatformControlCenter');
export const FuturisticRegEngineSuite = lazyWithRetry(() => import('./pages/FuturisticRegEngineSuite').then(m => ({ default: m.FuturisticRegEngineSuite })), 'FuturisticRegEngineSuite');
export const AutonomousGovernance = lazyWithRetry(() => import('./pages/AutonomousGovernance'), 'AutonomousGovernance');
export const RegulatoryIntelligenceHubPage = lazyWithRetry(() => import('./components/regulatory/RegulatoryIntelligenceHub').then(m => ({ default: m.RegulatoryIntelligenceHub })), 'RegulatoryIntelligenceHubPage');
export const AuditTrailViewerPage = lazyWithRetry(() => import('./components/AuditTrailViewer').then(m => ({ default: m.AuditTrailViewer })), 'AuditTrailViewerPage');
export const RoleBasedComplianceAlertsPage = lazyWithRetry(() => import('./pages/RoleBasedComplianceAlertsPage').then(m => ({ default: m.RoleBasedComplianceAlertsPage })), 'RoleBasedComplianceAlertsPage');
export const RegtechLaunchTracker = lazyWithRetry(() => import('./pages/RegtechLaunchTracker').then(m => ({ default: m.RegtechLaunchTracker })), 'RegtechLaunchTracker');
export const AdminSystemAuditLog = lazyWithRetry(() => import('./pages/AdminSystemAuditLog').then(m => ({ default: m.AdminSystemAuditLog })), 'AdminSystemAuditLog');
export const AdminQueueDashboard = lazyWithRetry(() => import('./pages/AdminQueueDashboard').then(m => ({ default: m.default })), 'AdminQueueDashboard');

// Global Platform Upgrade Modules
export const SuperAdminControlTower = lazyWithRetry(() => import('./pages/SuperAdminControlTower').then(m => ({ default: m.SuperAdminControlTower })), 'SuperAdminControlTower');
export const GlobalNreCountryPackPortal = lazyWithRetry(() => import('./pages/GlobalNreCountryPackPortal').then(m => ({ default: m.GlobalNreCountryPackPortal })), 'GlobalNreCountryPackPortal');
export const ConsumerGrievancePublicPortal = lazyWithRetry(() => import('./pages/ConsumerGrievancePublicPortal').then(m => ({ default: m.ConsumerGrievancePublicPortal })), 'ConsumerGrievancePublicPortal');
export const ComplianceMarketplaceHub = lazyWithRetry(() => import('./pages/ComplianceMarketplaceHub').then(m => ({ default: m.ComplianceMarketplaceHub })), 'ComplianceMarketplaceHub');
export const EntityNetworkExplorerPage = lazyWithRetry(() => import('./pages/EntityNetworkExplorerPage').then(m => ({ default: m.EntityNetworkExplorerPage })), 'EntityNetworkExplorerPage');
export const TrustCheckConsumerApp = lazyWithRetry(() => import('./pages/TrustCheckConsumerApp').then(m => ({ default: m.TrustCheckConsumerApp })), 'TrustCheckConsumerApp');
export const EntityProfilePage = lazyWithRetry(() => import('./pages/EntityProfilePage').then((m: any) => ({ default: m.EntityProfilePage || m.default })), 'EntityProfilePage');
export const RegistrationFlow = lazyWithRetry(() => import('./pages/RegistrationFlow').then((m: any) => ({ default: m.RegistrationFlow || m.default })), 'RegistrationFlow');
export const RegulatoryOntologyManager = lazyWithRetry(() => import('./pages/RegulatoryOntologyManager').then(m => ({ default: m.RegulatoryOntologyManager })), 'RegulatoryOntologyManager');
export const SlaMonitoringDashboard = lazyWithRetry(() => import('./components/admin/SlaMonitoringDashboard').then(m => ({ default: m.SlaMonitoringDashboard })), 'SlaMonitoringDashboard');
export const SlaMonitoringPage = lazyWithRetry(() => import('./pages/SlaMonitoringPage').then(m => ({ default: m.SlaMonitoringPage })), 'SlaMonitoringPage');

export const pageMap: Record<string, React.ComponentType<any>> = {
  // Enterprise-Grade KYC/KYB & LinkedIn-Style Company Profile
  'profile': EntityProfilePage,
  'entity-profile': EntityProfilePage,
  'company-profile': EntityProfilePage,
  'kyb-profile': EntityProfilePage,
  'kyc-profile': EntityProfilePage,
  'company': EntityProfilePage,
  'linkedin-profile': EntityProfilePage,
  'EntityProfile': EntityProfilePage,
  'EntityProfilePage': EntityProfilePage,

  // Registration & Onboarding
  'kyb-registration': RegistrationFlow,
  'kyb-register': RegistrationFlow,
  'kyb-signup': RegistrationFlow,
  'kyb-onboarding': RegistrationFlow,
  
  // Regulatory Ontology Manager
  'regulatory-ontology': RegulatoryOntologyManager,
  'ontology-manager': RegulatoryOntologyManager,
  'regulatory-moat': RegulatoryOntologyManager,

  // Consumer Shield & Mobile Trust Check App
  'trust-check': TrustCheckConsumerApp,
  'trustcheck': TrustCheckConsumerApp,
  'mobile-app': TrustCheckConsumerApp,
  'consumer-app': TrustCheckConsumerApp,
  'citizen-shield': TrustCheckConsumerApp,
  'scam-check': TrustCheckConsumerApp,
  'scam-school': TrustCheckConsumerApp,
  'TrustCheckConsumerApp': TrustCheckConsumerApp,

  // Global Platform Upgrade Routes
  'energy-grid': EnergyGridSustainabilityDashboard,
  'healthcare-life-sciences': HealthcareLifeSciencesDashboard,
  'global-nlp-gateway': MultilingualNlpDashboard,
  'govt-procurement': GovtProcurementDashboard,
  'tax-anomaly': TaxAnomalyDashboard,
  'edu-credentials': EduCredentialDashboard,
  'agri-subsidies': AgriSubsidiesDashboard,
  'tbml-dashboard': TbmlDetectionDashboard,
  'contract-intelligence': ContractIntelligenceDashboard,
  'super-admin-tower': SuperAdminControlTower,
  'super-admin': SuperAdminControlTower,
  'saas-admin': SuperAdminControlTower,
  'saas-governance': SuperAdminControlTower,
  'saas-control-center': SuperAdminControlTower,
  'saas-entitlements': SuperAdminControlTower,
  'nre-country-packs': GlobalNreCountryPackPortal,
  'global-nre': GlobalNreCountryPackPortal,
  'country-packs': GlobalNreCountryPackPortal,
  'consumer-grievance': ConsumerGrievancePublicPortal,
  'grievance-portal': ConsumerGrievancePublicPortal,
  'sla-monitoring': SlaMonitoringPage,
  'grievance-sla': SlaMonitoringPage,
  'sla-dashboard': SlaMonitoringPage,
  'admin-sla': SlaMonitoringPage,
  'compliance-marketplace-hub': ComplianceMarketplaceHub,
  'verified-pros': ComplianceMarketplaceHub,

  // Graph Intelligence & Entity Network Explorer (Phase 1 Deliverable 5/38)
  'entity-network-explorer': EntityNetworkExplorerPage,
  'network-explorer': EntityNetworkExplorerPage,
  'graph-intel': EntityNetworkExplorerPage,
  'entity-graph': EntityNetworkExplorerPage,
  'intel-graph': EntityNetworkExplorerPage,

  // Regulatory Dossier & Launch Tracker Platform
  'launch-tracker': RegtechLaunchTracker,
  'admin-queue-dashboard': AdminQueueDashboard,
  'queue-control': AdminQueueDashboard,
  'worker-oversight': AdminQueueDashboard,
  'dossier-prompts': RegtechLaunchTracker,
  'regulatory-dossier': RegtechLaunchTracker,
  'readiness-tracker': RegtechLaunchTracker,
  'prompts-dossier': RegtechLaunchTracker,
  'RegtechLaunchTracker': RegtechLaunchTracker,
  // Direct Addon & Industry Solutions
  'gdpr-compliance': GdprComplianceAddon,
  'gdpr-compliance-suite': GdprComplianceAddon,
  'cyber-security': CyberSecurityHub,
  'cybersecurity-nis2': CyberSecurityHub,
  'nis2-dashboard': NIS2DashboardPage,
  'aml-kyc': AmlKycModule,
  'fintech-aml-kyc': AmlKycModule,
  'ecommerce-eu': EuEcommerceAddon,
  'eu-ecommerce': EuEcommerceAddon,
  'healthtech': HealthcareLifeSciencesDashboard,
  'healthtech-ehds': HealthcareLifeSciencesDashboard,
  'gaming': GamingEntertainmentAddon,
  'gaming-entertainment': GamingEntertainmentAddon,
  'govtech': GovtechAddon,
  'public-sector-govtech': GovtechAddon,
  'edtech': EdtechShieldAddon,
  'edtech-shield': EdtechShieldAddon,
  'logistic': LogisticSupplyChainAddon,
  'logistic-supply-chain': LogisticSupplyChainAddon,
  'marketplace-solutions': ComplianceMarketplace,

  // Admin & Operations
  'tenants': AdminTenants,
  'multi-tenant-registry': AdminTenants,
  'onboarding': AdminOnboardingFlows,
  'tenant-onboarding-flows': AdminOnboardingFlows,
  'tenant-wizard': TenantOnboardingWizard,
  'companies': Companies,
  'company-legacy-profile': CompanyProfile,
  'ai-model-governance': AiModelGovernance,
  'incident-center': IncidentResponse,
  'forensic-audit': AiLineageForensics,
  'ai-lineage': AiLineageForensics,
  'governance-forensics': AiLineageForensics,
  'caas-operation-center': CaasOperationCenter,
  'caas-hub': CaasOperationCenter,
  'caas-service-center': CaasOperationCenter,
  'b2g-operations': B2gOperations,
  'country-regulators': B2gRegulatorPortal,
  'b2g-regulator-portal': B2gRegulatorPortal,
  'admin-b2g-scanner': ComplianceScraperDashboard,
  'b2g_scraper_hub': ComplianceScraperDashboard,
  'compliance-scraper': ComplianceScraperDashboard,
  'admin-b2g-stakeholders': AdminB2GOversight,
  'admin-b2g-delta': AdminB2GOversight,
  'admin-b2g-advanced': AdminB2GOversight,
  'b2g-sovereign-suite': AdminB2GOversight,
  'breach-notification': DataBreachNotificationSystem,
  'admin-finance-mgmt': AdminFinance,
  'billing': ClientBillingRouterPage,
  'payment-gateways': AdminFinance,
  'treasury-sync': AdminFinance,
  'invoices': InvoicesPage,
  'payment-methods': PaymentMethodsPage,
  'entitlements': AdminEntitlements,
  'developer-api': DeveloperApiHub,
  'event-webhooks': GlobalEventWebhooks,
  'admin-security-mgmt': GlobalSecurity,
  'data-security': SovereigntyRoleSecurity,
  'blockchain-mgmt': MicaForensics,
  'mica-forensics': MicaForensics,
  'mica-crypto': MicaForensics,
  'mica-surveillance': MicaForensics,
  'incident-copilot': IncidentResponseCopilot,
  'incident-response-copilot': IncidentResponseCopilot,
  'regulatory-narrative': RegulatoryNarrativeGenerator,
  'regulatory-narrative-generator': RegulatoryNarrativeGenerator,
  'admin-infrastructure': SystemManagement,
  'fs-database': SystemManagement,
  'devops': ZeroDowntimeIntegrationHub,
  'backup-restore': SystemManagement,
  'regional-features': RegionAwareDashboard,
  'compliance-integrity': ComplianceAuditPlatformPage,
  'system-settings': Settings,
  'admin-settings': Settings,
  'lawyer-ops': LawyerPartnerPortal,
  'tasks': ActionableTasks,
  'legal-intelligence': RegulatoryIntelligenceHubPage,
  'gdpr-management': GdprPrivacyManagementSystem,
  'lawyer-vaults': EvidenceVault,
  'vault': Vault,
  'records-vault': Vault,
  'evidence-vault': EvidenceVault,
  'security-settings': SecuritySettings,
  'settings': Settings,
  'proactive-regtech': ProactiveRegTechEngine,
  'supply-chain': SupplyChainAuditor,
  'digital-identity': DigitalIdentityCompliance,
  'esg-data': EnergyGridSustainabilityDashboard,
  'esg-sustainability': EnergyGridSustainabilityDashboard,
  'privacy-trust': TrustPrivacyDashboard,
  'cookie-consent': DynamicConsentNetwork,
  'data-mapping': DataLineage,
  'dsar-management': DSARPortal,
  'dpia-assessments': EnterprisePrivacySuite,
  'vendor-risk': VendorCompliance,
  'whistleblower': AdminB2GOversight,
  'regulator-ops': RegulatorDashboard,
  'violations': ViolationSurveillance,
  'enforcement': EntityEnforcementPortal,
  'ai-transparency': EntityEnforcementPortal,
  'enforcement-action-center': EntityEnforcementPortal,
  'alae-dashboard': AlaeArbitrationEngine,
  'penalty-calculator': PenaltyCalculatorPage,
  'penalty-appeal': PenaltyAppealPage,
  'ledger': AuditTrailViewerPage,
  'reports': OfficialReports,
  'ecosystem-mgmt': ComplianceMarketplace,
  'automation-portal': ComplianceAutomationPortal,
  'dpo-certification': DpoCertificationDashboard,
  'reg-mgmt': RegulatoryPolicyEngine,
  'integrations': ZeroDowntimeIntegrationHub,
  'team': TeamAccess,
  'eu-client-portal': EuClientAccountPortal,
  'subscriptions': SubscriptionRevenueHub,
  'ai-risk-audit': AiRiskHedge,
  'compliance-hub': ComplianceAutomationPortal,

  // Enterprise Services (phase 3): AI company network, verification hub, predictive intelligence, gateway, SSO landing
  'company-network': EnterpriseCompanyNetwork,
  'enterprise-company-network': EnterpriseCompanyNetwork,
  'verification-hub': EnterpriseVerificationHub,
  'enterprise-verification': EnterpriseVerificationHub,
  'predictive-intelligence': PredictiveTradingIntelligence,
  'predictive-trading': PredictiveTradingIntelligence,
  'enterprise-services': EnterpriseServicesGateway,
  'enterprise-gateway': EnterpriseServicesGateway,
  'sso': SsoLandingPage,
  'sso-landing': SsoLandingPage,

  // Compliance Hub Admin — modular registry, rule engine, score, changes, reports
  'compliance-hub-admin': ComplianceHubAdminPage,
  'compliance-admin': ComplianceHubAdminPage,
  'modular-compliance': ComplianceHubAdminPage,

  // Standard Pages
  'RoleBasedComplianceAlertsPage': RoleBasedComplianceAlertsPage,
  'compliance-alerts': RoleBasedComplianceAlertsPage,
  'notification-panel': RoleBasedComplianceAlertsPage,
  'role-alerts': RoleBasedComplianceAlertsPage,
  'role-notifications': RoleBasedComplianceAlertsPage,
  'RegulatoryIntelligenceHub': RegulatoryIntelligenceHubPage,
  'regulatory-intelligence': RegulatoryIntelligenceHubPage,
  'regulatory-intelligence-hub': RegulatoryIntelligenceHubPage,
  'regulatory-radar-live': RegulatoryIntelligenceHubPage,
  'AuditTrailViewer': AuditTrailViewerPage,
  'audit-trail': AuditTrailViewerPage,
  'audit-trail-viewer': AuditTrailViewerPage,
  'audit-logs': AuditTrailViewerPage,
  'audit-log': AuditTrailViewerPage,
  'audit-ledger': AuditTrailViewerPage,
  'audit-logs-view': AuditTrailViewerPage,
  'AutonomousGovernance': AutonomousGovernance,
  'autonomous-governance': AutonomousGovernance,
  'autonomous-compliance': AutonomousGovernance,
  'RealtimeTransactionMonitoringPage': RealtimeTransactionMonitoringPage,
  'realtime-transaction-monitoring': RealtimeTransactionMonitoringPage,
  'transaction-monitoring-live': RealtimeTransactionMonitoringPage,
  'aml-monitoring-stream': RealtimeTransactionMonitoringPage,
  'ProactiveRegTechEngine': ProactiveRegTechEngine,
  'proactive-regtech-engine': ProactiveRegTechEngine,
  'FuturisticRegEngineSuite': FuturisticRegEngineSuite,
  'futuristic-suite': FuturisticRegEngineSuite,
  'futuristic-engine': FuturisticRegEngineSuite,
  'AutonomousPlatformControlCenter': AutonomousPlatformControlCenter,
  'autonomous-platform-control': AutonomousPlatformControlCenter,
  'autonomous-control': AutonomousPlatformControlCenter,
  'platform-control': AutonomousPlatformControlCenter,
  'LawyerConsultantAdminPage': LawyerConsultantAdminPage,
  'lawyer-manager': LawyerConsultantAdminPage,
  'lawyer-consultant-manager': LawyerConsultantAdminPage,
  'legal-crm': LawyerConsultantAdminPage,
  'alsp-studio': LawyerConsultantAdminPage,
  'RegistrationPage': RegistrationPage,
  'registration': RegistrationPage,
  'register': RegistrationPage,
  'LoginPage': LoginPage,
  'login': LoginPage,
  'EnterpriseCompetitiveMoatSuite': EnterpriseCompetitiveMoatSuite,
  'competitive-moat': EnterpriseCompetitiveMoatSuite,
  'RegulatorySearchModal': RegulatorySearchModal,
  'regulatory-search': RegulatorySearchModal,
  'ComplianceDocumentation': ComplianceDocumentation,
  'compliance-docs': ComplianceDocumentation,
  'ComplianceAuditLedgerPage': ComplianceAuditLedgerPage,
  'ComplianceCacheDashboard': ComplianceCacheDashboard,
  'compliance-cache': ComplianceCacheDashboard,
  'compliance-query-cache': ComplianceCacheDashboard,
  'ContractCompliance': ContractCompliance,
  'contract-compliance': ContractCompliance,
  'contract-compliance-hub': ContractCompliance,
  'ProcurementCompliance': ProcurementCompliance,
  'procurement-compliance': ProcurementCompliance,
  'AssetCompliance': AssetCompliance,
  'asset-compliance': AssetCompliance,
  'FleetCompliance': FleetCompliance,
  'fleet-compliance': FleetCompliance,
  'VendorCompliance': VendorCompliance,
  'vendor-compliance': VendorCompliance,
  'CapaManagement': CapaManagement,
  'capa-management': CapaManagement,
  'BcpTracking': BcpTracking,
  'bcp-tracking': BcpTracking,
  'DrTracking': DrTracking,
  'dr-tracking': DrTracking,
  'InternalAuditManagement': InternalAuditManagement,
  'internal-audit': InternalAuditManagement,
  'internal-audit-management': InternalAuditManagement,
  'ComplianceScanner': ComplianceScanner,
  'ActionableTasks': ActionableTasks,
  'AutomatedScannerInspection': AutomatedScannerInspection,
  'automated-scanning': AutomatedScannerInspection,
  'AutomatedRemediationEngine': AutomatedRemediationEngine,
  'automated-remediation': AutomatedRemediationEngine,
  'SovereigntyRoleSecurity': SovereigntyRoleSecurity,
  'sovereignty-security': SovereigntyRoleSecurity,
  'rbac': SovereigntyRoleSecurity,
  'AdminAuditLedger': AdminAuditLedger,
  'AdminB2GOversight': AdminB2GOversight,
  'admin-b2g-center': AdminB2GOversight,
  'admin-b2g-dashboard': AdminB2GOversight,
  'admin-b2g-sandbox': AdminB2GOversight,
  'admin-b2g-filings': AdminB2GOversight,
  'admin-b2g-inquiries': AdminB2GOversight,
  'admin-b2g-whistleblower': AdminB2GOversight,
  'admin-b2g-agencies': AdminB2GOversight,
  'DSARPortal': DSARPortal,
  'dsar-portal': DSARPortal,
  'PrivacyPolicyGenerator': PrivacyPolicyGenerator,
  'privacy-policy-gen': PrivacyPolicyGenerator,
  'LLMProviderConfig': LLMProviderConfig,
  'llm-config': LLMProviderConfig,
  'VerificationFeatureToggles': VerificationFeatureToggles,
  'verification-toggles': VerificationFeatureToggles,
  'system-audit-log': AdminSystemAuditLog,
  'AdminSystemAuditLog': AdminSystemAuditLog,
  'admin-audit-log': AdminSystemAuditLog,
  'AdminEntitlements': AdminEntitlements,
  'AdminFinance': AdminFinance,
  'AdminOnboardingFlows': AdminOnboardingFlows,
  'AdminTenants': AdminTenants,
  'AdminRuleEngine': AdminRuleEngine,
  'rule-engine': AdminRuleEngine,
  'admin-rule-engine': AdminRuleEngine,
  'rule-engine-builder': AdminRuleEngine,
  'AiLineageForensics': AiLineageForensics,
  'AiModelGovernance': AiModelGovernance,
  'AiRiskHedge': AiRiskHedge,
  'AlaeArbitrationEngine': AlaeArbitrationEngine,
  'AmlKycModule': AmlKycModule,
  'AnalyticalIntelligence': AnalyticalIntelligence,
  'AuditLedger': AuditLedger,
  'B2gOperations': B2gOperations,
  'B2gRegulatorPortal': B2gRegulatorPortal,
  'BreachSimulationTool': BreachSimulationTool,
  'CaasOperationCenter': CaasOperationCenter,
  'CaasServiceDashboard': CaasServiceDashboard,
  'ClientDashboard': ClientDashboard,
  'ClientVault': ClientVault,
  'Companies': Companies,
  'CompanyProfile': CompanyProfile,
  'ComplianceOpsIntegrator': ComplianceOpsIntegrator,
  'ComplianceAuditDashboard': ComplianceAuditDashboard,
  'ComplianceDeltaAuditor': ComplianceDeltaAuditor,
  'compliance-delta-auditor': ComplianceDeltaAuditor,
  'delta-auditor': ComplianceDeltaAuditor,
  'admin-b2g-delta-auditor': ComplianceDeltaAuditor,
  'ComplianceAutomationPortal': ComplianceAutomationPortal,
  'ComplianceScraper': ComplianceScraper,
  'ComplianceScraperDashboard': ComplianceScraperDashboard,
  'CrossBorderEnforcement': CrossBorderEnforcement,
  'CyberInsurancePlatform': CyberInsurancePlatform,
  'CyberSecurityHub': CyberSecurityHub,
  'DataBreachNotificationSystem': DataBreachNotificationSystem,
  'DataFlowAdequacy': DataFlowAdequacy,
  'DataLineage': DataLineage,
  'DeveloperApiHub': DeveloperApiHub,
  'GlobalEventWebhooks': GlobalEventWebhooks,
  'DigitalIdentityCompliance': DigitalIdentityCompliance,
  'DoraResiliencePlanner': DoraResiliencePlanner,
  'DpoCertificationDashboard': DpoCertificationDashboard,
  'DynamicConsentNetwork': DynamicConsentNetwork,
  'MCPManager': MCPManager,
  'mcp-manager': MCPManager,
  'EntityEnforcementPortal': EntityEnforcementPortal,
  'entity-portal': EntityEnforcementPortal,
  'EnterpriseCompanyNetwork': EnterpriseCompanyNetwork,
  'EnterpriseVerificationHub': EnterpriseVerificationHub,
  'PredictiveTradingIntelligence': PredictiveTradingIntelligence,
  'EnterpriseServicesGateway': EnterpriseServicesGateway,
  'SsoLandingPage': SsoLandingPage,
  'EdtechShieldAddon': EdtechShieldAddon,
  'EmergencySecurityAudit': EmergencySecurityAudit,
  'EsgGreenData': EsgGreenData,
  'EuClientAccountPortal': EuClientAccountPortal,
  'EuEcommerceAddon': EuEcommerceAddon,
  'EvidenceVault': EvidenceVault,
  'ForceTenantLogout': ForceTenantLogout,
  'GamingEntertainmentAddon': GamingEntertainmentAddon,
  'Gateway': Gateway,
  'gateway': Gateway,
  'auth': Gateway,
  'auth-gateway': Gateway,
  'login-gateway': Gateway,
  'client': ClientDashboard,
  'client-dashboard': ClientDashboard,
  'regulator': RegulatorDashboard,
  'regulator-dashboard': RegulatorDashboard,
  'regulator-portal': RegulatorDashboard,
  'lawyer': LawyerPartnerPortal,
  'lawyer-portal': LawyerPartnerPortal,
  'lawyer-partner-portal': LawyerPartnerPortal,
  'sudou': PlatformDashboard,
  'admin': PlatformDashboard,
  'admin-hq': PlatformDashboard,
  'admin-dashboard': PlatformDashboard,
  'AdminDashboard': PlatformDashboard,
  'GdprComplianceAddon': GdprComplianceAddon,
  'gdpr-compliance-addon': GdprComplianceAddon,
  'gdpr-privacy-addon': GdprComplianceAddon,
  'gdpr-privacy-compliance': GdprComplianceAddon,
  'gdpr-privacy-compliance-addon': GdprComplianceAddon,
  'GlobalMaintenanceToggle': GlobalMaintenanceToggle,
  'GlobalSecurity': GlobalSecurity,
  'GovtechAddon': GovtechAddon,
  'RegTechOrchestratorConsole': RegTechOrchestratorConsole,
  'regtech-orchestrator': RegTechOrchestratorConsole,
  'regtech-engine': RegTechOrchestratorConsole,
  'GraphIntelligence': GraphIntelligence,
  'HealthtechAddon': HealthtechAddon,
  'IdentityManagement': IdentityManagement,
  'user-management': IdentityManagement,
  'PermissionReconciliationDashboard': PermissionReconciliationDashboard,
  'permission-reconciliation': PermissionReconciliationDashboard,
  'permission-reconciliation-dashboard': PermissionReconciliationDashboard,
  'IncidentResponse': IncidentResponse,
  'IncidentResponseCopilot': IncidentResponseCopilot,
  'LandingPage': LandingPage,
  'landing': LandingPage,
  'landing-page': LandingPage,
  'home': LandingPage,
  'landingpage': LandingPage,
  'LawViolationScanner': LawViolationScanner,
  'LawViolationScanners': LawViolationScanner,
  'LawyerPartnerPortal': LawyerPartnerPortal,
  'LiveComplianceDashboard': LiveComplianceDashboard,
  'LogisticSupplyChainAddon': LogisticSupplyChainAddon,
  'MaCompliancePlatform': MaCompliancePlatform,
  'MicaForensics': MicaForensics,
  'OfficialReports': OfficialReports,
  'PlatformDashboard': PlatformDashboard,
  'platform-dashboard': PlatformDashboard,
  'dashboard': PlatformDashboard,
  'PlatformPolicyEngine': PlatformPolicyEngine,
  'PolicyEngine': PolicyEngine,
  'PqcMigrationPlanner': PqcMigrationPlanner,
  'QuantumDashboard': QuantumDashboard,
  'QuantumProtectionEngine': QuantumProtectionEngine,
  'RegionAwareDashboard': RegionAwareDashboard,
  'regional-compliance': RegionAwareDashboard,
  'regional-dashboard': RegionAwareDashboard,
  'region-aware-dashboard': RegionAwareDashboard,
  'RegulatoryRadar': RegulatoryRadarPage,
  'RegulatoryRadarPage': RegulatoryRadarPage,
  'regulatory-radar': RegulatoryRadarPage,
  'compliance-radar': RegulatoryRadarPage,
  'radar-widget': RegulatoryRadarPage,
  'TransferImpactAssessmentPage': TransferImpactAssessmentPage,
  'transfer-impact-assessment': TransferImpactAssessmentPage,
  'tia-engine': TransferImpactAssessmentPage,
  'scc-generator': TransferImpactAssessmentPage,
  'transfer-impact': TransferImpactAssessmentPage,
  'tia-simulator': TransferImpactAssessmentPage,
  'StatutoryGazetteWatchdogPage': StatutoryGazetteWatchdogPage,
  'statutory-gazette-watchdog': StatutoryGazetteWatchdogPage,
  'gazette-watchdog': StatutoryGazetteWatchdogPage,
  'legal-diff-viewer': StatutoryGazetteWatchdogPage,
  'statutory-watchdog': StatutoryGazetteWatchdogPage,
  'RegulatorDashboard': RegulatorDashboard,
  'RegulatoryChangeSimulator': RegulatoryChangeSimulator,
  'RegulatoryNarrativeGenerator': RegulatoryNarrativeGenerator,
  'MultiRegionPolicyEngine': MultiRegionPolicyEngine,
  'multi-region-policy': MultiRegionPolicyEngine,
  'multi-region-engine': MultiRegionPolicyEngine,
  'policy-act-sync': MultiRegionPolicyEngine,
  'engine': MultiRegionPolicyEngine,
  'moat-console': MoatEnterpriseConsole,
  'MoatEnterpriseConsole': MoatEnterpriseConsole,
  'moat-architecture': MoatEnterpriseConsole,
  'defensibility-console': MoatEnterpriseConsole,
  'enterprise-expansion': EnterpriseExpansionConsole,
  'EnterpriseExpansionConsole': EnterpriseExpansionConsole,
  'legal-contracts': EnterpriseExpansionConsole,
  'cloud-webhooks': EnterpriseExpansionConsole,
  'jurisdiction-expansion': EnterpriseExpansionConsole,
  'zk-proofs': ZkProofConsole,
  'zk-console': ZkProofConsole,
  'zkf-console': ZkProofConsole,
  'ZkProofConsole': ZkProofConsole,
  'zk-snark-engine': ZkProofConsole,
  'RegulatoryPolicyEngine': RegulatoryPolicyEngine,
  'regulatory-mapping': RegulatoryPolicyEngine,
  'RuntimeSecurity': RuntimeSecurity,
  'SecretScanner': SecretScanner,
  'SecurityLogViewer': SecurityLogViewer,
  'SecuritySettings': SecuritySettings,
  'Settings': Settings,
  'SovereignCloudVault': SovereignCloudVault,
  'Soc2ComplianceHub': Soc2ComplianceHub,
  'SovereigntyArbitrage': SovereigntyArbitrage,
  'SovereigntyDashboard': SovereigntyDashboard,
  'SupplyChainAuditor': SupplyChainAuditor,
  'SystemManagement': SystemManagement,
  'Tasks': Tasks,
  'TeamAccess': TeamAccess,
  'TenantOnboardingWizard': TenantOnboardingWizard,
  'TrustPrivacyDashboard': TrustPrivacyDashboard,
  'GdprPrivacyManagementSystem': GdprPrivacyManagementSystem,
  'Vault': Vault,
  'VectorKnowledgeBase': VectorKnowledgeBase,
  'ViolationSurveillance': ViolationSurveillance,
  'VulnerabilityScanner': VulnerabilityScanner,
  'WarRoomScenarioEngine': WarRoomScenarioEngine,
  'RiskMatrixDashboard': RiskMatrixDashboard,
  'RiskImpactCalculator': RiskImpactCalculator,
  'ZeroTrustNetwork': ZeroTrustNetwork,
  'ZeroDowntimeIntegrationHub': ZeroDowntimeIntegrationHub,
  'zero-downtime-integration-hub': ZeroDowntimeIntegrationHub,
  'zero-downtime-hub': ZeroDowntimeIntegrationHub,
  'zero-downtime': ZeroDowntimeIntegrationHub,
  'smart-ekyc-aml-privacy': ZeroDowntimeIntegrationHub,
  'ekyc-aml-privacy-hub': ZeroDowntimeIntegrationHub,
  'SubscriptionRevenueHub': SubscriptionRevenueHub,
  'subscription-revenue-hub': SubscriptionRevenueHub,
  'subscription-engine': SubscriptionRevenueHub,
  'revenue-hub': SubscriptionRevenueHub,
  'SystemSetup': SystemSetup,
  'SystemAuditLedger': SystemAuditLedger,
  'QuantumSecureVault': QuantumSecureVault,
  'ComplianceMarketplace': ComplianceMarketplace,
  'compliance-marketplace': ComplianceMarketplace,
  'caas-marketplace': ComplianceMarketplace,
  'caas-enterprise-marketplace': ComplianceMarketplace,
  'CaasSubscriptionManager': CaasSubscriptionMgmtPage,
  'caas-subscription-mgmt': CaasSubscriptionMgmtPage,
  'ClientAssetScannerHub': ClientAssetScannerHub,
  'EnterpriseMarketplaceVisualization': EnterpriseMarketplaceVisualization,
  'enterprise-marketplace-visualization': EnterpriseMarketplaceVisualization,
  'ma-marketplace': EnterpriseMarketplaceVisualization,
  'EnterprisePrivacySuite': EnterprisePrivacySuite,
  'enterprise-privacy-suite': EnterprisePrivacySuite,
  'privacy-suite': EnterprisePrivacySuite,
  'ropa-tom-privacy': EnterprisePrivacySuite,
  'RegTechSaaSOverview': RegTechSaaSOverview,
  'regtech-saas-overview': RegTechSaaSOverview,
  'regtech_overview': RegTechSaaSOverview,
  'regtech-overview': RegTechSaaSOverview,
  'regtech-saas': RegTechSaaSOverview,
  'GuardrailConsole': GuardrailConsole,
  'guardrail-console': GuardrailConsole,
  'guardrails': GuardrailConsole,
  'guardrail': GuardrailConsole,
  'SovereignDataGatewayPage': SovereignDataGatewayPage,
  'sovereign-data-gateway': SovereignDataGatewayPage,
  'sovereign_gateway': SovereignDataGatewayPage,
  'sovereign-gateway': SovereignDataGatewayPage,
  'ComplianceAuditPlatformPage': ComplianceAuditPlatformPage,
  'compliance-audit-platform': ComplianceAuditPlatformPage,
  'compliance_audit': ComplianceAuditPlatformPage,
  'compliance-audit': ComplianceAuditPlatformPage,
  'EnterpriseCapabilityExtensionHub': EnterpriseCapabilityExtensionHub,
  'capability-extension': EnterpriseCapabilityExtensionHub,
  'extension-hub': EnterpriseCapabilityExtensionHub,
  'enterprise-extension': EnterpriseCapabilityExtensionHub,
  'EnterpriseNextGenIntegrationHub': EnterpriseNextGenIntegrationHub,
  'nextgen-integration': EnterpriseNextGenIntegrationHub,
  'integration-hub': EnterpriseNextGenIntegrationHub,
  'enterprise-integration': EnterpriseNextGenIntegrationHub,
  'PartnerPlatformDashboard': PartnerPlatformDashboard,
  'partner-platform': PartnerPlatformDashboard,
  'partner-platform-dashboard': PartnerPlatformDashboard,
  'prt-portal': PartnerPlatformDashboard,
  'partner-hub': PartnerPlatformDashboard,
};
