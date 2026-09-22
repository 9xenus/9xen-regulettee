
export interface B2gBillingConfig {
  b2gCommissionRate: number;
  b2gVatRate: number;
  b2gAdminSetupFee: number;
  b2gBillingPrefix: string;
  b2gPlatformIban: string;
  b2gPlatformBic: string;
  b2gBillingEmail: string;
  b2gAutoSendEmail: boolean;
  baseFineAmount?: number;
  dailyFineAmount?: number;
  countryCommissions?: Record<string, number>;
}

export interface B2gInvoiceDetails {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  baseAmount: number;
  commissionRate: number;
  commissionAmount: number;
  vatRate: number;
  vatAmount: number;
  totalDue: number;
  regulatorNet: number;
  textSummary: string;
}

// Load current configuration from localStorage or fallback to defaults
export function getB2gBillingConfig(): B2gBillingConfig {
  const DEFAULT_BILLING_CONFIG: B2gBillingConfig = {
    b2gCommissionRate: 4.5,
    b2gVatRate: 20,
    b2gAdminSetupFee: 2500,
    b2gBillingPrefix: "INV-B2G-",
    b2gPlatformIban: "DE89 3704 0044 0532 0130 00",
    b2gPlatformBic: "WELADED1MUC",
    b2gBillingEmail: "billing@nonaxen-sovereign.eu",
    b2gAutoSendEmail: true,
  };

  try {
    const saved = localStorage.getItem('b2g_advanced_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        b2gCommissionRate: parsed.b2gCommissionRate ?? DEFAULT_BILLING_CONFIG.b2gCommissionRate,
        b2gVatRate: parsed.b2gVatRate ?? DEFAULT_BILLING_CONFIG.b2gVatRate,
        b2gAdminSetupFee: parsed.b2gAdminSetupFee ?? DEFAULT_BILLING_CONFIG.b2gAdminSetupFee,
        b2gBillingPrefix: parsed.b2gBillingPrefix ?? DEFAULT_BILLING_CONFIG.b2gBillingPrefix,
        b2gPlatformIban: parsed.b2gPlatformIban ?? DEFAULT_BILLING_CONFIG.b2gPlatformIban,
        b2gPlatformBic: parsed.b2gPlatformBic ?? DEFAULT_BILLING_CONFIG.b2gPlatformBic,
        b2gBillingEmail: parsed.b2gBillingEmail ?? DEFAULT_BILLING_CONFIG.b2gBillingEmail,
        b2gAutoSendEmail: parsed.b2gAutoSendEmail ?? DEFAULT_BILLING_CONFIG.b2gAutoSendEmail,
        baseFineAmount: parsed.baseFineAmount,
        dailyFineAmount: parsed.dailyFineAmount,
        countryCommissions: parsed.countryCommissions || {
          "Germany": 5.0,
          "France": 4.8,
          "Ireland": 4.2,
          "Netherlands": 4.5,
          "Spain": 4.0,
          "Italy": 4.1
        }
      };
    }
  } catch (e) {
    console.error("Failed to load b2g advanced config for billing calculations:", e);
  }
  return DEFAULT_BILLING_CONFIG;
}

// Generate beautiful structured invoice details
export function generateB2gBillingInvoice(
  tenantName: string,
  regulatorName: string,
  law: string,
  actionType: string,
  customAmount?: number,
  regionName?: string
): B2gInvoiceDetails {
  const config = getB2gBillingConfig();
  
  // Decide base invoice amount
  let baseAmount = customAmount ?? config.b2gAdminSetupFee;
  if (actionType === 'AUTO_FINE' && !customAmount) {
    baseAmount = config.baseFineAmount ?? 250000;
  }

  // Use country-specific commission if available
  const commissionRate = (regionName && config.countryCommissions?.[regionName]) 
    ? config.countryCommissions[regionName] 
    : config.b2gCommissionRate;

  const commissionAmount = baseAmount * (commissionRate / 100);
  const vatAmount = baseAmount * (config.b2gVatRate / 100);
  const totalDue = baseAmount + vatAmount;
  const regulatorNet = baseAmount - commissionAmount;

  const randId = Math.floor(100000 + Math.random() * 900000);
  const invoiceNumber = `${config.b2gBillingPrefix}${new Date().getFullYear()}-${randId}`;
  
  const issueDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const due = new Date();
  due.setDate(due.getDate() + 14); // Net 14 days
  const dueDate = due.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const cleanTenantDomain = tenantName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'tenant';
  const region = regionName || 'EU Central / Schengen Enclave';

  const textSummary = `========================================================================
            NONAXEN B2G SOVEREIGN SYSTEM COMPLIANCE INVOICE             
========================================================================
Invoice Number : ${invoiceNumber}
Date of Issue  : ${issueDate}
Due Date       : ${dueDate} (Net 14 Days)
Payment Method : TARGET2 SEPA Escrow Ledger Smart-Contract

BILLING COUNTERPARTY (TENANT):
------------------------------------------------------------------------
Organization   : ${tenantName}
Designated DPO : compliance-officer@${cleanTenantDomain}.eu
Jurisdiction   : ${region}

RECLAIM REGULATOR DISBURSEMENT:
------------------------------------------------------------------------
Authority      : ${regulatorName}
Standard       : ${law}
Infraction Type: ${actionType} Penalty Levy
Penalty Level  : Level 3 Administrative Infraction Directive

FINANCIAL LEDGER DISCLOSURE:
------------------------------------------------------------------------
Base Penalty Assessment Amount  : EUR ${baseAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
SaaS Platform Commission (${commissionRate}%): EUR ${commissionAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
SaaS Regulatory Service VAT (${config.b2gVatRate}%): EUR ${vatAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
------------------------------------------------------------------------
TOTAL OUTSTANDING AMOUNT DUE   : EUR ${totalDue.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
------------------------------------------------------------------------
Regulator Net Treasury Share    : EUR ${regulatorNet.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
SaaS Admin Platform Cut         : EUR ${commissionAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}

SECURE SETTLEMENT INSTRUCTIONS:
------------------------------------------------------------------------
SaaS Platform IBAN : ${config.b2gPlatformIban}
SaaS Platform BIC  : ${config.b2gPlatformBic}
Official Contact   : ${config.b2gBillingEmail}

This invoice has been compiled autonomously by the 9Xen Regulettee CaaS 
B2G Ledger Engine in coordination with TARGET2 smart routing protocols.
All transactions are logged to the Sovereign Cryptographic Blockchain Ledger.
========================================================================`;

  return {
    invoiceNumber,
    issueDate,
    dueDate,
    baseAmount,
    commissionRate,
    commissionAmount,
    vatRate: config.b2gVatRate,
    vatAmount,
    totalDue,
    regulatorNet,
    textSummary
  };
}

// Inject automated invoice email directly to B2G email logs
export function dispatchB2gInvoiceEmail(
  tenantName: string,
  regulatorName: string,
  law: string,
  actionType: string,
  customAmount?: number,
  regionName?: string
): B2gInvoiceDetails | null {
  const config = getB2gBillingConfig();
  if (!config.b2gAutoSendEmail) {
    console.log("Auto-email send is disabled in B2G config");
    return null;
  }

  const invoice = generateB2gBillingInvoice(tenantName, regulatorName, law, actionType, customAmount, regionName);
  const cleanTenantDomain = tenantName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'tenant';
  const recipientEmail = `compliance-officer@${cleanTenantDomain}.eu`;

  const newMailLog = {
    id: `mail-inv-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    to: recipientEmail,
    subject: `🧾 AUTOMATED BILLING INVOICE: Sovereign B2G Enforcement Settlement (${invoice.invoiceNumber})`,
    body: `Dear Compliance Officer,\n\nFollowing a verified regulatory enforcement task completion under the Sovereign B2G Compliance Framework, an administrative penalty/setup fee invoice has been automatically compiled and posted to your account.\n\nBelow is the official breakdown of the outstanding amounts, including platform commission calculations and regulatory central treasury routing coordinates.\n\n${invoice.textSummary}\n\nPlease settle this invoice within 14 business days to avoid additional compound interest penalties or further subscription service limitations.\n\nBest regards,\nB2G Automated Governance Console Billing Dept.`,
    tenantName,
    violationType: `B2G Invoicing: ${actionType}`,
    timestamp: new Date().toISOString(),
    status: 'DELIVERED' as const
  };

  try {
    const saved = localStorage.getItem('b2g_email_logs');
    const logs = saved ? JSON.parse(saved) : [];
    localStorage.setItem('b2g_email_logs', JSON.stringify([newMailLog, ...logs]));
    
    // Also dispatch a storage event to synchronize panels immediately
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error("Failed to inject invoice email to logs:", e);
  }

  return invoice;
}
