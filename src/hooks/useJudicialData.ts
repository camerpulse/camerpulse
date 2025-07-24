import { useQuery } from '@tanstack/react-query';

// Judicial data types
export interface Court {
  id: string;
  name: string;
  type: 'supreme' | 'appeal' | 'high' | 'magistrate';
  location: string;
  chiefJudge: string;
  performanceScore: number;
  caseResolutionRate: number;
  transparencyScore: number;
  publicAccessScore: number;
  avgCaseDuration: number;
  activeCases: number;
  established: string;
}

export interface JudicialCase {
  id: string;
  title: string;
  caseNumber: string;
  court: string;
  type: 'criminal' | 'civil' | 'commercial' | 'administrative';
  status: 'pending' | 'in_progress' | 'resolved' | 'appealed';
  filedDate: string;
  lastUpdated: string;
  judge: string;
  lawyer?: string;
  isPublic: boolean;
}

export interface Judge {
  id: string;
  name: string;
  rank: string;
  court: string;
  appointmentDate: string;
  overallRating: number;
  caseResolutionScore: number;
  punctualityScore: number;
  impartialityScore: number;
  casesHandled: number;
  lastReviewed: string;
  specialization: string[];
}

export interface LegalProcedure {
  id: string;
  title: string;
  category: string;
  accessibilityScore: number;
  documentationScore: number;
  publicAccessScore: number;
  description: string;
  estimatedDuration: string;
  requiredDocuments: string[];
}

export interface JudicialStats {
  transparencyScore: number;
  totalCases: number;
  casesResolved: number;
  resolutionRate: number;
  avgDuration: number;
  totalCourts: number;
  totalJudges: number;
}

// Mock data
const mockCourts: Court[] = [
  {
    id: 'supreme-court',
    name: 'Supreme Court of Cameroon',
    type: 'supreme',
    location: 'Yaoundé',
    chiefJudge: 'Justice Mathias Owona Nguini',
    performanceScore: 89,
    caseResolutionRate: 85,
    transparencyScore: 92,
    publicAccessScore: 78,
    avgCaseDuration: 95,
    activeCases: 234,
    established: '1972'
  },
  {
    id: 'appeal-court-centre',
    name: 'Court of Appeal - Centre Province',
    type: 'appeal',
    location: 'Yaoundé',
    chiefJudge: 'Justice Marie Claire Dibong',
    performanceScore: 82,
    caseResolutionRate: 78,
    transparencyScore: 85,
    publicAccessScore: 81,
    avgCaseDuration: 127,
    activeCases: 456,
    established: '1975'
  },
  {
    id: 'appeal-court-littoral',
    name: 'Court of Appeal - Littoral Province',
    type: 'appeal',
    location: 'Douala',
    chiefJudge: 'Justice Paul Biya Motto',
    performanceScore: 86,
    caseResolutionRate: 82,
    transparencyScore: 88,
    publicAccessScore: 84,
    avgCaseDuration: 115,
    activeCases: 398,
    established: '1976'
  },
  {
    id: 'high-court-yaounde',
    name: 'High Court of Yaoundé',
    type: 'high',
    location: 'Yaoundé',
    chiefJudge: 'Justice Amadou Bello',
    performanceScore: 79,
    caseResolutionRate: 75,
    transparencyScore: 82,
    publicAccessScore: 77,
    avgCaseDuration: 142,
    activeCases: 1247,
    established: '1961'
  },
  {
    id: 'high-court-douala',
    name: 'High Court of Douala',
    type: 'high',
    location: 'Douala',
    chiefJudge: 'Justice Francoise Mballa',
    performanceScore: 81,
    caseResolutionRate: 77,
    transparencyScore: 84,
    publicAccessScore: 79,
    avgCaseDuration: 138,
    activeCases: 1189,
    established: '1961'
  },
  {
    id: 'magistrate-court-yaounde-1',
    name: 'Magistrate Court Yaoundé I',
    type: 'magistrate',
    location: 'Yaoundé',
    chiefJudge: 'Justice Ibrahim Sali',
    performanceScore: 74,
    caseResolutionRate: 71,
    transparencyScore: 76,
    publicAccessScore: 72,
    avgCaseDuration: 156,
    activeCases: 2134,
    established: '1965'
  }
];

const mockCases: JudicialCase[] = [
  {
    id: 'case-001',
    title: 'Commercial Dispute - Construction Contract',
    caseNumber: 'HCY/COM/2024/0847',
    court: 'High Court of Yaoundé',
    type: 'commercial',
    status: 'in_progress',
    filedDate: '2024-01-15',
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    judge: 'Justice Amadou Bello',
    lawyer: 'Maitre Jean-Paul Akame',
    isPublic: true
  },
  {
    id: 'case-002',
    title: 'Criminal Case - Financial Fraud',
    caseNumber: 'HCD/CRIM/2024/0234',
    court: 'High Court of Douala',
    type: 'criminal',
    status: 'resolved',
    filedDate: '2023-11-08',
    lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    judge: 'Justice Francoise Mballa',
    isPublic: true
  },
  {
    id: 'case-003',
    title: 'Civil Case - Property Dispute',
    caseNumber: 'MCY1/CIV/2024/1456',
    court: 'Magistrate Court Yaoundé I',
    type: 'civil',
    status: 'pending',
    filedDate: '2024-03-22',
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    judge: 'Justice Ibrahim Sali',
    lawyer: 'Maitre Catherine Ndongo',
    isPublic: true
  },
  {
    id: 'case-004',
    title: 'Appeal - Tax Assessment Challenge',
    caseNumber: 'CAC/ADM/2024/0089',
    court: 'Court of Appeal - Centre Province',
    type: 'administrative',
    status: 'in_progress',
    filedDate: '2024-02-10',
    lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    judge: 'Justice Marie Claire Dibong',
    isPublic: false
  },
  {
    id: 'case-005',
    title: 'Commercial Arbitration - Partnership Dissolution',
    caseNumber: 'CAL/COM/2024/0167',
    court: 'Court of Appeal - Littoral Province',
    type: 'commercial',
    status: 'resolved',
    filedDate: '2023-12-05',
    lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    judge: 'Justice Paul Biya Motto',
    isPublic: true
  }
];

const mockJudges: Judge[] = [
  {
    id: 'judge-001',
    name: 'Justice Mathias Owona Nguini',
    rank: 'Chief Justice',
    court: 'Supreme Court of Cameroon',
    appointmentDate: '2018-05-15',
    overallRating: 94,
    caseResolutionScore: 92,
    punctualityScore: 96,
    impartialityScore: 95,
    casesHandled: 156,
    lastReviewed: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    specialization: ['Constitutional Law', 'Administrative Law']
  },
  {
    id: 'judge-002',
    name: 'Justice Marie Claire Dibong',
    rank: 'President of Court',
    court: 'Court of Appeal - Centre Province',
    appointmentDate: '2019-08-22',
    overallRating: 87,
    caseResolutionScore: 85,
    punctualityScore: 89,
    impartialityScore: 88,
    casesHandled: 234,
    lastReviewed: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    specialization: ['Civil Law', 'Family Law']
  },
  {
    id: 'judge-003',
    name: 'Justice Paul Biya Motto',
    rank: 'President of Court',
    court: 'Court of Appeal - Littoral Province',
    appointmentDate: '2017-12-10',
    overallRating: 91,
    caseResolutionScore: 89,
    punctualityScore: 93,
    impartialityScore: 92,
    casesHandled: 198,
    lastReviewed: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    specialization: ['Commercial Law', 'Corporate Law']
  },
  {
    id: 'judge-004',
    name: 'Justice Amadou Bello',
    rank: 'Chief Judge',
    court: 'High Court of Yaoundé',
    appointmentDate: '2020-03-18',
    overallRating: 83,
    caseResolutionScore: 81,
    punctualityScore: 85,
    impartialityScore: 84,
    casesHandled: 289,
    lastReviewed: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    specialization: ['Criminal Law', 'Commercial Law']
  },
  {
    id: 'judge-005',
    name: 'Justice Francoise Mballa',
    rank: 'Chief Judge',
    court: 'High Court of Douala',
    appointmentDate: '2019-11-25',
    overallRating: 85,
    caseResolutionScore: 83,
    punctualityScore: 87,
    impartialityScore: 86,
    casesHandled: 267,
    lastReviewed: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    specialization: ['Criminal Law', 'Civil Law']
  },
  {
    id: 'judge-006',
    name: 'Justice Ibrahim Sali',
    rank: 'Magistrate',
    court: 'Magistrate Court Yaoundé I',
    appointmentDate: '2021-06-12',
    overallRating: 79,
    caseResolutionScore: 77,
    punctualityScore: 81,
    impartialityScore: 80,
    casesHandled: 456,
    lastReviewed: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    specialization: ['Civil Law', 'Minor Criminal Cases']
  }
];

const mockProcedures: LegalProcedure[] = [
  {
    id: 'proc-001',
    title: 'Filing a Civil Lawsuit',
    category: 'Civil Procedures',
    accessibilityScore: 85,
    documentationScore: 89,
    publicAccessScore: 82,
    description: 'Complete guide for filing civil lawsuits in Cameroon courts',
    estimatedDuration: '2-4 weeks',
    requiredDocuments: ['Statement of Claim', 'Identity Documents', 'Supporting Evidence', 'Court Fees Receipt']
  },
  {
    id: 'proc-002',
    title: 'Criminal Case Procedures',
    category: 'Criminal Procedures',
    accessibilityScore: 78,
    documentationScore: 82,
    publicAccessScore: 75,
    description: 'Step-by-step guide for criminal case proceedings',
    estimatedDuration: '3-8 months',
    requiredDocuments: ['Police Report', 'Witness Statements', 'Medical Reports (if applicable)', 'Legal Representation']
  },
  {
    id: 'proc-003',
    title: 'Commercial Dispute Resolution',
    category: 'Commercial Procedures',
    accessibilityScore: 91,
    documentationScore: 94,
    publicAccessScore: 88,
    description: 'Guide for resolving commercial disputes and arbitration',
    estimatedDuration: '1-6 months',
    requiredDocuments: ['Commercial Agreement', 'Breach Documentation', 'Financial Records', 'Expert Testimonies']
  },
  {
    id: 'proc-004',
    title: 'Appeal Process',
    category: 'Appeal Procedures',
    accessibilityScore: 73,
    documentationScore: 76,
    publicAccessScore: 71,
    description: 'How to file appeals in higher courts',
    estimatedDuration: '6-12 months',
    requiredDocuments: ['Original Judgment', 'Appeal Notice', 'Appeal Brief', 'Additional Evidence']
  },
  {
    id: 'proc-005',
    title: 'Legal Aid Application',
    category: 'Support Services',
    accessibilityScore: 92,
    documentationScore: 88,
    publicAccessScore: 95,
    description: 'Applying for legal aid and pro bono representation',
    estimatedDuration: '2-3 weeks',
    requiredDocuments: ['Income Declaration', 'Identity Documents', 'Case Summary', 'Financial Hardship Proof']
  }
];

const mockOverallStats: JudicialStats = {
  transparencyScore: 78,
  totalCases: 12247,
  casesResolved: 8934,
  resolutionRate: 73,
  avgDuration: 127,
  totalCourts: 156,
  totalJudges: 847
};

export const useJudicialData = () => {
  const courtsQuery = useQuery({
    queryKey: ['judicial-courts'],
    queryFn: async (): Promise<Court[]> => {
      // In real implementation, fetch from Supabase
      // const { data, error } = await supabase
      //   .from('courts')
      //   .select('*')
      //   .order('performance_score', { ascending: false });
      
      // if (error) throw error;
      // return data;
      
      return mockCourts;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  const casesQuery = useQuery({
    queryKey: ['judicial-cases'],
    queryFn: async (): Promise<JudicialCase[]> => {
      // In real implementation, fetch from Supabase
      return mockCases;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const judgesQuery = useQuery({
    queryKey: ['judicial-judges'],
    queryFn: async (): Promise<Judge[]> => {
      // In real implementation, fetch from Supabase
      return mockJudges;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  const proceduresQuery = useQuery({
    queryKey: ['judicial-procedures'],
    queryFn: async (): Promise<LegalProcedure[]> => {
      // In real implementation, fetch from Supabase
      return mockProcedures;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const overallStatsQuery = useQuery({
    queryKey: ['judicial-overall-stats'],
    queryFn: async (): Promise<JudicialStats> => {
      // In real implementation, calculate from actual data
      return mockOverallStats;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  return {
    courts: courtsQuery.data,
    cases: casesQuery.data,
    judges: judgesQuery.data,
    procedures: proceduresQuery.data,
    overallStats: overallStatsQuery.data,
    isLoading: courtsQuery.isLoading || casesQuery.isLoading || 
               judgesQuery.isLoading || proceduresQuery.isLoading ||
               overallStatsQuery.isLoading,
    error: courtsQuery.error || casesQuery.error || 
           judgesQuery.error || proceduresQuery.error ||
           overallStatsQuery.error
  };
};