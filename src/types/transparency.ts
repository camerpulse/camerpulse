// Transparency Portal Type Definitions

export interface TransparencyScore {
  overall: number;
  government: number;
  judicial: number;
  electoral: number;
  budget: number;
  procurement: number;
  lastUpdated: string;
}

export interface TransparencyCategory {
  id: string;
  title: string;
  description: string;
  score: number;
  totalMetrics: number;
  verifiedMetrics: number;
  pendingMetrics: number;
  lastUpdated: string;
  trend: 'up' | 'down' | 'stable';
  features: string[];
  href: string;
  color: string;
}

export interface TransparencyUpdate {
  id: string;
  title: string;
  description: string;
  type: 'budget' | 'judicial' | 'electoral' | 'procurement' | 'ministry' | 'general';
  impact: 'critical' | 'high' | 'medium' | 'low';
  verified: boolean;
  timestamp: string;
  source: string;
  metadata?: Record<string, any>;
}

export interface RegionalTransparency {
  region: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
  categoryScores: {
    government: number;
    judicial: number;
    electoral: number;
    budget: number;
  };
}

export interface TransparencyMetric {
  category: string;
  metric: string;
  score: number;
  weight: number;
  description: string;
  dataSource: string;
  lastVerified: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'government_website' | 'official_document' | 'court_record' | 'budget_report' | 'citizen_report';
  status: 'active' | 'verified' | 'pending' | 'inactive';
  lastUpdated: string;
  recordCount: number;
  reliabilityScore: number;
}

export interface TransparencyMethodology {
  step: number;
  title: string;
  description: string;
  weight: number;
  criteria: string[];
}

export interface GovernmentTransparencyData {
  ministries: MinistryTransparency[];
  budgetTransparency: BudgetTransparency;
  procurement: ProcurementTransparency;
  publicServices: ServiceTransparency[];
}

export interface MinistryTransparency {
  id: string;
  name: string;
  minister: string;
  transparencyScore: number;
  budgetTransparency: number;
  publicReporting: number;
  citizenEngagement: number;
  dataAccessibility: number;
  lastAssessment: string;
}

export interface BudgetTransparency {
  overall: number;
  allocation: number;
  execution: number;
  reporting: number;
  publicAccess: number;
  auditCompliance: number;
  totalBudget: number;
  transparentAmount: number;
  lastUpdated: string;
}

export interface ProcurementTransparency {
  overall: number;
  processTransparency: number;
  contractPublication: number;
  bidderInformation: number;
  awardCriteria: number;
  totalContracts: number;
  transparentContracts: number;
  totalValue: number;
  lastUpdated: string;
}

export interface ServiceTransparency {
  id: string;
  name: string;
  department: string;
  transparencyScore: number;
  serviceDelivery: number;
  costTransparency: number;
  processClarity: number;
  citizenFeedback: number;
  lastAssessment: string;
}