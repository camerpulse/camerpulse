import { useQuery } from '@tanstack/react-query';
import { 
  GovernmentTransparencyData,
  MinistryTransparency,
  BudgetTransparency,
  ProcurementTransparency,
  ServiceTransparency
} from '@/types/transparency';

// Mock data for government transparency
const mockMinistries: MinistryTransparency[] = [
  {
    id: 'min-health',
    name: 'Ministry of Public Health',
    minister: 'Dr. Manaouda Malachie',
    transparencyScore: 94,
    budgetTransparency: 96,
    publicReporting: 92,
    citizenEngagement: 89,
    dataAccessibility: 98,
    lastAssessment: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'min-education',
    name: 'Ministry of Basic Education',
    minister: 'Prof. Laurent Serge Etoundi Ngoa',
    transparencyScore: 89,
    budgetTransparency: 91,
    publicReporting: 87,
    citizenEngagement: 92,
    dataAccessibility: 86,
    lastAssessment: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'min-finance',
    name: 'Ministry of Finance',
    minister: 'Louis Paul Motaze',
    transparencyScore: 91,
    budgetTransparency: 95,
    publicReporting: 89,
    citizenEngagement: 84,
    dataAccessibility: 96,
    lastAssessment: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'min-infrastructure',
    name: 'Ministry of Public Works',
    minister: 'Emmanuel Nganou Djoumessi',
    transparencyScore: 76,
    budgetTransparency: 72,
    publicReporting: 78,
    citizenEngagement: 81,
    dataAccessibility: 74,
    lastAssessment: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'min-agriculture',
    name: 'Ministry of Agriculture and Rural Development',
    minister: 'Gabriel Mbairobe',
    transparencyScore: 83,
    budgetTransparency: 85,
    publicReporting: 81,
    citizenEngagement: 86,
    dataAccessibility: 80,
    lastAssessment: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'min-transport',
    name: 'Ministry of Transport',
    minister: 'Jean Ernest Ngalle Bibehe',
    transparencyScore: 78,
    budgetTransparency: 76,
    publicReporting: 82,
    citizenEngagement: 75,
    dataAccessibility: 79,
    lastAssessment: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'min-justice',
    name: 'Ministry of Justice',
    minister: 'Laurent Esso',
    transparencyScore: 85,
    budgetTransparency: 88,
    publicReporting: 83,
    citizenEngagement: 82,
    dataAccessibility: 87,
    lastAssessment: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'min-defense',
    name: 'Ministry of Defence',
    minister: 'Joseph Beti Assomo',
    transparencyScore: 68,
    budgetTransparency: 65,
    publicReporting: 70,
    citizenEngagement: 67,
    dataAccessibility: 71,
    lastAssessment: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const mockBudgetData: BudgetTransparency = {
  overall: 87,
  allocation: 96,
  execution: 94,
  reporting: 89,
  publicAccess: 87,
  auditCompliance: 92,
  totalBudget: 5400000000000, // 5.4 trillion FCFA
  transparentAmount: 4698000000000, // 4.698 trillion FCFA
  lastUpdated: new Date().toISOString()
};

const mockProcurementData: ProcurementTransparency = {
  overall: 84,
  processTransparency: 89,
  contractPublication: 92,
  bidderInformation: 78,
  awardCriteria: 85,
  totalContracts: 1247,
  transparentContracts: 847,
  totalValue: 2400000000000, // 2.4 trillion FCFA
  lastUpdated: new Date().toISOString()
};

const mockServiceData: ServiceTransparency[] = [
  {
    id: 'svc-civil-registry',
    name: 'Civil Registry Services',
    department: 'Ministry of Territorial Administration',
    transparencyScore: 92,
    serviceDelivery: 94,
    costTransparency: 89,
    processClarity: 95,
    citizenFeedback: 88,
    lastAssessment: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'svc-passport',
    name: 'Passport Services',
    department: 'Ministry of External Relations',
    transparencyScore: 87,
    serviceDelivery: 89,
    costTransparency: 85,
    processClarity: 91,
    citizenFeedback: 83,
    lastAssessment: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'svc-business-registration',
    name: 'Business Registration',
    department: 'Ministry of Small and Medium Enterprises',
    transparencyScore: 85,
    serviceDelivery: 87,
    costTransparency: 82,
    processClarity: 88,
    citizenFeedback: 83,
    lastAssessment: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'svc-tax-services',
    name: 'Tax Collection Services',
    department: 'General Directorate of Taxation',
    transparencyScore: 81,
    serviceDelivery: 83,
    costTransparency: 79,
    processClarity: 84,
    citizenFeedback: 78,
    lastAssessment: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'svc-healthcare',
    name: 'Public Healthcare Services',
    department: 'Ministry of Public Health',
    transparencyScore: 89,
    serviceDelivery: 91,
    costTransparency: 87,
    processClarity: 92,
    citizenFeedback: 86,
    lastAssessment: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'svc-education',
    name: 'Public Education Services',
    department: 'Ministry of Basic Education',
    transparencyScore: 88,
    serviceDelivery: 90,
    costTransparency: 86,
    processClarity: 89,
    citizenFeedback: 87,
    lastAssessment: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const mockOverallStats = {
  overallScore: 91,
  totalMinistries: mockMinistries.length,
  performingWell: mockMinistries.filter(m => m.transparencyScore >= 80).length,
  budgetTransparency: mockBudgetData.overall,
  procurementTransparency: mockProcurementData.overall
};

export const useGovernmentTransparencyData = () => {
  const ministriesQuery = useQuery({
    queryKey: ['government-ministries'],
    queryFn: async (): Promise<MinistryTransparency[]> => {
      // In real implementation, fetch from Supabase
      // const { data, error } = await supabase
      //   .from('ministry_transparency')
      //   .select('*')
      //   .order('transparency_score', { ascending: false });
      
      // if (error) throw error;
      // return data;
      
      return mockMinistries;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const budgetQuery = useQuery({
    queryKey: ['government-budget'],
    queryFn: async (): Promise<BudgetTransparency> => {
      // In real implementation, fetch from Supabase
      return mockBudgetData;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  const procurementQuery = useQuery({
    queryKey: ['government-procurement'],
    queryFn: async (): Promise<ProcurementTransparency> => {
      // In real implementation, fetch from Supabase
      return mockProcurementData;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const serviceQuery = useQuery({
    queryKey: ['government-services'],
    queryFn: async (): Promise<ServiceTransparency[]> => {
      // In real implementation, fetch from Supabase
      return mockServiceData;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const overallStatsQuery = useQuery({
    queryKey: ['government-overall-stats'],
    queryFn: async () => {
      // In real implementation, calculate from actual data
      return mockOverallStats;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  return {
    ministries: ministriesQuery.data,
    budgetData: budgetQuery.data,
    procurementData: procurementQuery.data,
    serviceData: serviceQuery.data,
    overallStats: overallStatsQuery.data,
    isLoading: ministriesQuery.isLoading || budgetQuery.isLoading || 
               procurementQuery.isLoading || serviceQuery.isLoading ||
               overallStatsQuery.isLoading,
    error: ministriesQuery.error || budgetQuery.error || 
           procurementQuery.error || serviceQuery.error ||
           overallStatsQuery.error
  };
};