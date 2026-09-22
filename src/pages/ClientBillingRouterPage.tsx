import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ClientBillingDashboard } from '../components/billing/ClientBillingDashboard';
import { AdminFinance } from './AdminFinance';
import { useNotification } from '../context/NotificationContext';
import { useTenant } from '../context/TenantContext';

interface ClientBillingRouterPageProps {
  onNavigate?: (path: string) => void;
  subTab?: 'overview' | 'invoices' | 'payment_methods' | 'addons' | 'tax_profile' | 'gateway';
}

export const ClientBillingRouterPage: React.FC<ClientBillingRouterPageProps> = ({ onNavigate, subTab = 'overview' }) => {
  const { role } = useAuth();
  const { showToast } = useNotification();
  const { activeTenant } = useTenant();

  const effectiveRole = (role || localStorage.getItem('user_role') || 'CLIENT').toUpperCase();

  if (effectiveRole === 'ADMIN' || effectiveRole === 'SUPER_ADMIN') {
    return <AdminFinance />;
  }

  return (
    <div className="space-y-6">
      <ClientBillingDashboard
        tenantId={activeTenant?.id || 'DEFAULT_TENANT'}
        showToast={showToast}
        onNavigateTab={onNavigate}
        initialSubTab={subTab}
      />
    </div>
  );
};

export const InvoicesPage: React.FC<{ onNavigate?: (path: string) => void }> = (props) => (
  <ClientBillingRouterPage {...props} subTab="invoices" />
);

export const PaymentMethodsPage: React.FC<{ onNavigate?: (path: string) => void }> = (props) => (
  <ClientBillingRouterPage {...props} subTab="payment_methods" />
);

export const SubscriptionsPage: React.FC<{ onNavigate?: (path: string) => void }> = (props) => (
  <ClientBillingRouterPage {...props} subTab="overview" />
);

export const CaasSubscriptionMgmtPage: React.FC<{ onNavigate?: (path: string) => void }> = (props) => (
  <ClientBillingRouterPage {...props} subTab="overview" />
);

export default ClientBillingRouterPage;
