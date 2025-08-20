import React from 'react';
import { useAdminCore } from '../core/AdminCoreProvider';

// Import all feature modules
import { AdminDashboard } from '../modules/AdminDashboard';
import { UsersRolesManager } from '../modules/UsersRolesManager';
import { PollsSystemManager } from '../modules/PollsSystemManager';
import { CompanyDirectoryManager } from '../modules/CompanyDirectoryManager';
import { BillionaireTrackerManager } from '../modules/BillionaireTrackerManager';
import { DebtMonitorManager } from '../modules/DebtMonitorManager';
import { CivicOfficialManager } from '../modules/CivicOfficialManager';
import { MessengerManager } from '../modules/MessengerManager';
import { SentimentSystemManager } from '../modules/SentimentSystemManager';
import { AnalyticsLogsManager } from '../modules/AnalyticsLogsManager';
import { SettingsSyncManager } from '../modules/SettingsSyncManager';
import { IntelligencePanel } from '../modules/IntelligencePanel';
import { PoliticalPartiesManager } from '../modules/PoliticalPartiesManager';
import { PoliticalManagement } from '../../PoliticalManagement';
import { NewsSystemManager } from '../modules/NewsSystemManager';
import { MarketplaceManager } from '../modules/MarketplaceManager';
import { ElectionManager } from '../modules/ElectionManager';
import { LegalDocumentsManager } from '../modules/LegalDocumentsManager';
import { DonationsManager } from '../modules/DonationsManager';
import { NokashConfigPanel } from '../../PaymentConfig/NokashConfigPanel';
import { PromisesManager } from '../modules/PromisesManager';
import { RegionalAnalyticsManager } from '../modules/RegionalAnalyticsManager';
import RoleAccessTestSuite from '../tests/RoleAccessTestSuite';
import SecurityAuditSuite from '../security/SecurityAuditSuite';
import { PollTemplatesManager } from '../PollTemplatesManager';
import PriorityAssessmentDashboard from '@/pages/admin/PriorityAssessmentDashboard';
import { CleanupReviewManager } from '../modules/CleanupReviewManager';
import { SystemHealthManager } from '../modules/SystemHealthManager';
import { SecurityAuditManager } from '../modules/SecurityAuditManager';
import { BackupRecoveryManager } from '../modules/BackupRecoveryManager';
import { ErrorMonitoringManager } from '../modules/ErrorMonitoringManager';
import { PerformanceAnalyticsManager } from '../modules/PerformanceAnalyticsManager';
import { ApiRateLimitManager } from '../modules/ApiRateLimitManager';
import { UserActivityAuditManager } from '../modules/UserActivityAuditManager';
import { ApiConfigPanel } from '../../ApiConfiguration/ApiConfigPanel';

interface ModuleRendererProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
}

export const ModuleRenderer: React.FC<ModuleRendererProps> = ({ activeModule }) => {
  const { hasPermission, logActivity, stats, adminRole } = useAdminCore();
  
  const moduleProps = { hasPermission, logActivity, stats };

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <AdminDashboard {...moduleProps} />;
      case 'users-roles':
        return <UsersRolesManager {...moduleProps} />;
      case 'polls-system':
        return <PollsSystemManager {...moduleProps} />;
      case 'company-directory':
        return <CompanyDirectoryManager {...moduleProps} />;
      case 'billionaire-tracker':
        return <BillionaireTrackerManager {...moduleProps} />;
      case 'debt-monitor':
        return <DebtMonitorManager {...moduleProps} />;
      case 'civic-officials':
        return <CivicOfficialManager {...moduleProps} />;
      case 'messenger':
        return <MessengerManager {...moduleProps} />;
      case 'sentiment-system':
        return <SentimentSystemManager {...moduleProps} />;
      case 'analytics-logs':
        return <AnalyticsLogsManager {...moduleProps} />;
      case 'cleanup-review':
        return <CleanupReviewManager />;
      case 'intelligence':
        return <IntelligencePanel {...moduleProps} />;
      case 'political-parties':
        return <PoliticalPartiesManager {...moduleProps} />;
      case 'political-management':
        return <PoliticalManagement />;
      case 'news-system':
        return <NewsSystemManager {...moduleProps} />;
      case 'marketplace':
        return <MarketplaceManager {...moduleProps} />;
      case 'elections':
        return <ElectionManager {...moduleProps} />;
      case 'legal-documents':
        return <LegalDocumentsManager {...moduleProps} />;
      case 'donations':
        return <DonationsManager {...moduleProps} />;
      case 'nokash-payments':
        return <NokashConfigPanel />;
      case 'promises':
        return <PromisesManager {...moduleProps} />;
      case 'regional-analytics':
        return <RegionalAnalyticsManager {...moduleProps} />;
      case 'role-access-test':
        return <RoleAccessTestSuite hasPermission={hasPermission} adminRole={adminRole} currentUser={null} />;
      case 'security-audit':
        return <SecurityAuditSuite hasPermission={hasPermission} adminRole={adminRole} currentUser={null} />;
      case 'poll-templates':
        return <PollTemplatesManager {...moduleProps} />;
      case 'priority-assessment':
        return <PriorityAssessmentDashboard />;
      case 'settings-sync':
        return <SettingsSyncManager {...moduleProps} />;
      case 'system-health':
        return <SystemHealthManager {...moduleProps} />;
      case 'security-audit-manager':
        return <SecurityAuditManager {...moduleProps} />;
      case 'backup-recovery':
        return <BackupRecoveryManager {...moduleProps} />;
      case 'error-monitoring':
        return <ErrorMonitoringManager {...moduleProps} />;
      case 'performance-analytics':
        return <PerformanceAnalyticsManager {...moduleProps} />;
      case 'api-rate-limit':
        return <ApiRateLimitManager {...moduleProps} />;
      case 'user-activity-audit':
        return <UserActivityAuditManager {...moduleProps} />;
      case 'api-configuration':
        return <ApiConfigPanel />;
      default:
        return <AdminDashboard {...moduleProps} />;
    }
  };

  return <div className="admin-module-content">{renderModule()}</div>;
};