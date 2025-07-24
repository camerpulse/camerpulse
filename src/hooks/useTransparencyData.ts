import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  TransparencyScore, 
  TransparencyCategory, 
  TransparencyUpdate, 
  RegionalTransparency,
  TransparencyMetric,
  DataSource
} from '@/types/transparency';

// Mock data for demonstration - replace with real Supabase queries
const mockTransparencyScore: TransparencyScore = {
  overall: 94,
  government: 91,
  judicial: 78,
  electoral: 95,
  budget: 87,
  procurement: 84,
  lastUpdated: new Date().toISOString()
};

const mockCategories: TransparencyCategory[] = [
  {
    id: 'government',
    title: 'Government Operations',
    description: 'Track government efficiency, spending, and service delivery',
    score: 91,
    totalMetrics: 847,
    verifiedMetrics: 771,
    pendingMetrics: 76,
    lastUpdated: new Date().toISOString(),
    trend: 'up',
    features: ['Budget tracking', 'Ministry performance', 'Public contracts'],
    href: '/transparency/government',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'judicial',
    title: 'Judicial System',
    description: 'Monitor court proceedings, case resolutions, and judicial accountability',
    score: 78,
    totalMetrics: 234,
    verifiedMetrics: 183,
    pendingMetrics: 51,
    lastUpdated: new Date().toISOString(),
    trend: 'stable',
    features: ['Court case tracking', 'Judge ratings', 'Legal transparency'],
    href: '/judiciary',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'electoral',
    title: 'Electoral Process',
    description: 'Ensure transparent elections, campaign finance, and voting integrity',
    score: 95,
    totalMetrics: 156,
    verifiedMetrics: 148,
    pendingMetrics: 8,
    lastUpdated: new Date().toISOString(),
    trend: 'up',
    features: ['Campaign finance', 'Election results', 'Voting security'],
    href: '/transparency/elections',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'workforce',
    title: 'Public Workforce',
    description: 'Monitor hiring practices, workforce analytics, and employment policies',
    score: 89,
    totalMetrics: 423,
    verifiedMetrics: 376,
    pendingMetrics: 47,
    lastUpdated: new Date().toISOString(),
    trend: 'up',
    features: ['Hiring transparency', 'Workforce data', 'Policy impact'],
    href: '/transparency/workforce',
    color: 'from-orange-500 to-orange-600'
  }
];

const mockUpdates: TransparencyUpdate[] = [
  {
    id: '1',
    title: 'Ministry of Health Budget Report',
    description: 'Q3 2024 financial transparency report published',
    type: 'budget',
    impact: 'high',
    verified: true,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    source: 'Ministry of Health'
  },
  {
    id: '2',
    title: 'Supreme Court Case Database Updated',
    description: '847 new case records added with full documentation',
    type: 'judicial',
    impact: 'medium',
    verified: true,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    source: 'Supreme Court Registry'
  },
  {
    id: '3',
    title: 'Regional Election Results Verified',
    description: 'Complete transparency audit for recent regional elections',
    type: 'electoral',
    impact: 'high',
    verified: true,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    source: 'Elections Cameroon'
  },
  {
    id: '4',
    title: 'Public Procurement Alert',
    description: 'New contracts worth 2.4B FCFA require transparency review',
    type: 'procurement',
    impact: 'critical',
    verified: false,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    source: 'Public Procurement Agency'
  }
];

const mockRegionalData: RegionalTransparency[] = [
  {
    region: 'Centre',
    score: 94,
    trend: 'up',
    lastUpdated: new Date().toISOString(),
    categoryScores: { government: 95, judicial: 89, electoral: 97, budget: 92 }
  },
  {
    region: 'Littoral',
    score: 91,
    trend: 'up',
    lastUpdated: new Date().toISOString(),
    categoryScores: { government: 92, judicial: 85, electoral: 94, budget: 89 }
  },
  {
    region: 'South',
    score: 87,
    trend: 'stable',
    lastUpdated: new Date().toISOString(),
    categoryScores: { government: 89, judicial: 81, electoral: 91, budget: 87 }
  },
  {
    region: 'West',
    score: 85,
    trend: 'up',
    lastUpdated: new Date().toISOString(),
    categoryScores: { government: 87, judicial: 79, electoral: 89, budget: 85 }
  },
  {
    region: 'East',
    score: 82,
    trend: 'down',
    lastUpdated: new Date().toISOString(),
    categoryScores: { government: 84, judicial: 76, electoral: 86, budget: 82 }
  },
  {
    region: 'Northwest',
    score: 79,
    trend: 'up',
    lastUpdated: new Date().toISOString(),
    categoryScores: { government: 81, judicial: 72, electoral: 83, budget: 79 }
  }
];

export const useTransparencyScore = () => {
  return useQuery({
    queryKey: ['transparency-score'],
    queryFn: async (): Promise<TransparencyScore> => {
      // In real implementation, fetch from Supabase
      // const { data, error } = await supabase
      //   .from('transparency_scores')
      //   .select('*')
      //   .order('created_at', { ascending: false })
      //   .limit(1)
      //   .single();
      
      // if (error) throw error;
      // return data;
      
      return mockTransparencyScore;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTransparencyCategories = () => {
  return useQuery({
    queryKey: ['transparency-categories'],
    queryFn: async (): Promise<TransparencyCategory[]> => {
      // In real implementation, fetch from Supabase
      return mockCategories;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useTransparencyUpdates = (limit = 10) => {
  return useQuery({
    queryKey: ['transparency-updates', limit],
    queryFn: async (): Promise<TransparencyUpdate[]> => {
      // In real implementation, fetch from Supabase
      return mockUpdates.slice(0, limit);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useRegionalTransparency = () => {
  return useQuery({
    queryKey: ['regional-transparency'],
    queryFn: async (): Promise<RegionalTransparency[]> => {
      // In real implementation, fetch from Supabase
      return mockRegionalData;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useTransparencyMetrics = (category?: string) => {
  return useQuery({
    queryKey: ['transparency-metrics', category],
    queryFn: async (): Promise<TransparencyMetric[]> => {
      // Mock data for scoring breakdown
      const metrics: TransparencyMetric[] = [
        {
          category: 'Budget & Finance',
          metric: 'Budget Publication',
          score: 96,
          weight: 25,
          description: 'How easily public can access budget information',
          dataSource: 'Ministry of Finance',
          lastVerified: new Date().toISOString()
        },
        {
          category: 'Budget & Finance',
          metric: 'Expenditure Tracking',
          score: 94,
          weight: 25,
          description: 'Real-time monitoring of government spending',
          dataSource: 'Treasury Department',
          lastVerified: new Date().toISOString()
        },
        {
          category: 'Judicial Proceedings',
          metric: 'Court Case Access',
          score: 78,
          weight: 30,
          description: 'Public access to court proceedings and decisions',
          dataSource: 'Supreme Court Registry',
          lastVerified: new Date().toISOString()
        },
        {
          category: 'Electoral Process',
          metric: 'Campaign Finance Disclosure',
          score: 95,
          weight: 40,
          description: 'Transparency in political campaign funding',
          dataSource: 'Elections Cameroon',
          lastVerified: new Date().toISOString()
        },
        {
          category: 'Public Procurement',
          metric: 'Contract Publication',
          score: 84,
          weight: 35,
          description: 'Public access to government contracts and tenders',
          dataSource: 'Public Procurement Agency',
          lastVerified: new Date().toISOString()
        }
      ];
      
      return category ? metrics.filter(m => m.category.toLowerCase().includes(category.toLowerCase())) : metrics;
    },
    staleTime: 10 * 60 * 1000,
  });
};

export const useDataSources = () => {
  return useQuery({
    queryKey: ['data-sources'],
    queryFn: async (): Promise<DataSource[]> => {
      const sources: DataSource[] = [
        {
          id: '1',
          name: 'Government Websites',
          type: 'government_website',
          status: 'active',
          lastUpdated: new Date().toISOString(),
          recordCount: 247,
          reliabilityScore: 95
        },
        {
          id: '2',
          name: 'Official Documents',
          type: 'official_document',
          status: 'verified',
          lastUpdated: new Date().toISOString(),
          recordCount: 12847,
          reliabilityScore: 98
        },
        {
          id: '3',
          name: 'Budget Reports',
          type: 'budget_report',
          status: 'active',
          lastUpdated: new Date().toISOString(),
          recordCount: 156,
          reliabilityScore: 97
        },
        {
          id: '4',
          name: 'Court Records',
          type: 'court_record',
          status: 'verified',
          lastUpdated: new Date().toISOString(),
          recordCount: 8934,
          reliabilityScore: 92
        },
        {
          id: '5',
          name: 'Citizen Reports',
          type: 'citizen_report',
          status: 'pending',
          lastUpdated: new Date().toISOString(),
          recordCount: 2156,
          reliabilityScore: 78
        }
      ];
      
      return sources;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Mutation for submitting transparency reports
export const useSubmitTransparencyReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (report: {
      title: string;
      description: string;
      category: string;
      evidence?: string[];
      anonymous?: boolean;
    }) => {
      // For now, simulate submission - replace with real Supabase call when table exists
      const mockResponse = {
        id: Math.random().toString(36),
        title: report.title,
        description: report.description,
        category: report.category,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return mockResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transparency-updates'] });
    }
  });
};

// Helper function to format timestamps
export const formatTimestamp = (timestamp: string): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diff = now.getTime() - time.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 60) {
    return `${minutes} minutes ago`;
  } else if (hours < 24) {
    return `${hours} hours ago`;
  } else {
    return `${days} days ago`;
  }
};

// Helper function to get trend indicator
export const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
  switch (trend) {
    case 'up': return '↗️';
    case 'down': return '↘️';
    case 'stable': return '➡️';
    default: return '➡️';
  }
};