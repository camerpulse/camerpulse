import { useQuery } from '@tanstack/react-query';

// Electoral data types
export interface Election {
  id: string;
  title: string;
  type: 'presidential' | 'parliamentary' | 'municipal' | 'regional';
  region: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  electionDate: string;
  eligibleVoters: number;
  voterTurnout: number;
  transparencyScore: number;
  processIntegrity: number;
  resultsPublished: number;
  observerReports: number;
}

export interface Campaign {
  id: string;
  candidateName: string;
  party: string;
  electionId: string;
  totalSpending: number;
  transparencyScore: number;
  financialDisclosure: number;
  donationTransparency: number;
  expenditureTracking: number;
  complianceStatus: 'compliant' | 'pending' | 'non_compliant';
}

export interface VoterRegistration {
  region: string;
  eligibleVoters: number;
  registeredVoters: number;
  registrationRate: number;
  newRegistrations: number;
  accessibilityScore: number;
  digitalAccess: number;
}

export interface PoliticalParty {
  id: string;
  name: string;
  abbreviation: string;
  leader: string;
  founded: string;
  memberCount: number;
  status: 'active' | 'inactive' | 'suspended';
  transparencyScore: number;
  financialDisclosure: number;
  governanceScore: number;
  publicReporting: number;
  complianceScore: number;
  lastAudit: string;
}

export interface ElectoralStats {
  transparencyScore: number;
  registeredVoters: number;
  registrationRate: number;
  totalCampaignSpending: number;
  financeTransparencyRate: number;
  activeElections: number;
  upcomingElections: number;
}

// Mock data
const mockElections: Election[] = [
  {
    id: 'pres-2025',
    title: 'Presidential Election 2025',
    type: 'presidential',
    region: 'National',
    status: 'upcoming',
    electionDate: '2025-10-07',
    eligibleVoters: 7200000,
    voterTurnout: 0, // Not yet held
    transparencyScore: 94,
    processIntegrity: 92,
    resultsPublished: 0,
    observerReports: 0
  },
  {
    id: 'mun-yaounde-2024',
    title: 'Yaoundé Municipal Elections',
    type: 'municipal',
    region: 'Centre',
    status: 'completed',
    electionDate: '2024-02-11',
    eligibleVoters: 890000,
    voterTurnout: 67,
    transparencyScore: 89,
    processIntegrity: 91,
    resultsPublished: 100,
    observerReports: 12
  },
  {
    id: 'reg-northwest-2024',
    title: 'Northwest Regional Council',
    type: 'regional',
    region: 'Northwest',
    status: 'ongoing',
    electionDate: '2024-12-15',
    eligibleVoters: 456000,
    voterTurnout: 72,
    transparencyScore: 85,
    processIntegrity: 88,
    resultsPublished: 45,
    observerReports: 8
  },
  {
    id: 'parl-littoral-2024',
    title: 'Littoral Parliamentary By-Election',
    type: 'parliamentary',
    region: 'Littoral',
    status: 'completed',
    electionDate: '2024-09-22',
    eligibleVoters: 234000,
    voterTurnout: 58,
    transparencyScore: 92,
    processIntegrity: 94,
    resultsPublished: 100,
    observerReports: 15
  },
  {
    id: 'mun-douala-2024',
    title: 'Douala Municipal Elections',
    type: 'municipal',
    region: 'Littoral',
    status: 'upcoming',
    electionDate: '2025-01-20',
    eligibleVoters: 1200000,
    voterTurnout: 0,
    transparencyScore: 87,
    processIntegrity: 89,
    resultsPublished: 0,
    observerReports: 0
  }
];

const mockCampaigns: Campaign[] = [
  {
    id: 'camp-001',
    candidateName: 'Paul Biya',
    party: 'CPDM',
    electionId: 'pres-2025',
    totalSpending: 4500000000, // 4.5B FCFA
    transparencyScore: 87,
    financialDisclosure: 89,
    donationTransparency: 85,
    expenditureTracking: 91,
    complianceStatus: 'compliant'
  },
  {
    id: 'camp-002',
    candidateName: 'Maurice Kamto',
    party: 'MRC',
    electionId: 'pres-2025',
    totalSpending: 2800000000, // 2.8B FCFA
    transparencyScore: 94,
    financialDisclosure: 96,
    donationTransparency: 92,
    expenditureTracking: 95,
    complianceStatus: 'compliant'
  },
  {
    id: 'camp-003',
    candidateName: 'Cabral Libii',
    party: 'PCRN',
    electionId: 'pres-2025',
    totalSpending: 1200000000, // 1.2B FCFA
    transparencyScore: 91,
    financialDisclosure: 88,
    donationTransparency: 94,
    expenditureTracking: 89,
    complianceStatus: 'compliant'
  },
  {
    id: 'camp-004',
    candidateName: 'Serge Espoir Matomba',
    party: 'UPC',
    electionId: 'pres-2025',
    totalSpending: 890000000, // 890M FCFA
    transparencyScore: 78,
    financialDisclosure: 76,
    donationTransparency: 82,
    expenditureTracking: 75,
    complianceStatus: 'pending'
  },
  {
    id: 'camp-005',
    candidateName: 'Akere Muna',
    party: 'NOW',
    electionId: 'pres-2025',
    totalSpending: 670000000, // 670M FCFA
    transparencyScore: 89,
    financialDisclosure: 91,
    donationTransparency: 87,
    expenditureTracking: 92,
    complianceStatus: 'compliant'
  },
  {
    id: 'camp-006',
    candidateName: 'Edith Kah Walla',
    party: 'CPP',
    electionId: 'pres-2025',
    totalSpending: 540000000, // 540M FCFA
    transparencyScore: 93,
    financialDisclosure: 95,
    donationTransparency: 91,
    expenditureTracking: 94,
    complianceStatus: 'compliant'
  }
];

const mockVoterRegistration: VoterRegistration[] = [
  {
    region: 'Centre',
    eligibleVoters: 1450000,
    registeredVoters: 1276000,
    registrationRate: 88,
    newRegistrations: 23000,
    accessibilityScore: 92,
    digitalAccess: 85
  },
  {
    region: 'Littoral',
    eligibleVoters: 1890000,
    registeredVoters: 1663000,
    registrationRate: 88,
    newRegistrations: 31000,
    accessibilityScore: 94,
    digitalAccess: 89
  },
  {
    region: 'West',
    eligibleVoters: 980000,
    registeredVoters: 862000,
    registrationRate: 88,
    newRegistrations: 18000,
    accessibilityScore: 87,
    digitalAccess: 76
  },
  {
    region: 'Northwest',
    eligibleVoters: 890000,
    registeredVoters: 756000,
    registrationRate: 85,
    newRegistrations: 12000,
    accessibilityScore: 81,
    digitalAccess: 68
  },
  {
    region: 'Southwest',
    eligibleVoters: 670000,
    registeredVoters: 569000,
    registrationRate: 85,
    newRegistrations: 9000,
    accessibilityScore: 79,
    digitalAccess: 65
  },
  {
    region: 'South',
    eligibleVoters: 450000,
    registeredVoters: 396000,
    registrationRate: 88,
    newRegistrations: 7000,
    accessibilityScore: 86,
    digitalAccess: 72
  }
];

const mockPoliticalParties: PoliticalParty[] = [
  {
    id: 'party-cpdm',
    name: 'Cameroon People\'s Democratic Movement',
    abbreviation: 'CPDM',
    leader: 'Paul Biya',
    founded: '1985',
    memberCount: 3200000,
    status: 'active',
    transparencyScore: 76,
    financialDisclosure: 78,
    governanceScore: 74,
    publicReporting: 72,
    complianceScore: 81,
    lastAudit: '2024-06-15'
  },
  {
    id: 'party-mrc',
    name: 'Cameroon Renaissance Movement',
    abbreviation: 'MRC',
    leader: 'Maurice Kamto',
    founded: '2012',
    memberCount: 890000,
    status: 'active',
    transparencyScore: 94,
    financialDisclosure: 96,
    governanceScore: 92,
    publicReporting: 95,
    complianceScore: 93,
    lastAudit: '2024-08-22'
  },
  {
    id: 'party-sdf',
    name: 'Social Democratic Front',
    abbreviation: 'SDF',
    leader: 'John Fru Ndi',
    founded: '1990',
    memberCount: 1200000,
    status: 'active',
    transparencyScore: 82,
    financialDisclosure: 84,
    governanceScore: 81,
    publicReporting: 79,
    complianceScore: 85,
    lastAudit: '2024-05-10'
  },
  {
    id: 'party-upc',
    name: 'Union of the Peoples of Cameroon',
    abbreviation: 'UPC',
    leader: 'Serge Espoir Matomba',
    founded: '1948',
    memberCount: 450000,
    status: 'active',
    transparencyScore: 71,
    financialDisclosure: 69,
    governanceScore: 73,
    publicReporting: 68,
    complianceScore: 75,
    lastAudit: '2024-03-18'
  },
  {
    id: 'party-pcrn',
    name: 'Cameroon Party for National Reconciliation',
    abbreviation: 'PCRN',
    leader: 'Cabral Libii',
    founded: '2017',
    memberCount: 340000,
    status: 'active',
    transparencyScore: 89,
    financialDisclosure: 91,
    governanceScore: 87,
    publicReporting: 92,
    complianceScore: 86,
    lastAudit: '2024-07-08'
  },
  {
    id: 'party-cpp',
    name: 'Cameroon People\'s Party',
    abbreviation: 'CPP',
    leader: 'Edith Kah Walla',
    founded: '2007',
    memberCount: 230000,
    status: 'active',
    transparencyScore: 93,
    financialDisclosure: 95,
    governanceScore: 91,
    publicReporting: 94,
    complianceScore: 92,
    lastAudit: '2024-09-12'
  }
];

const mockOverallStats: ElectoralStats = {
  transparencyScore: 95,
  registeredVoters: 7200000,
  registrationRate: 87,
  totalCampaignSpending: 12850000000, // 12.85B FCFA
  financeTransparencyRate: 82,
  activeElections: 3,
  upcomingElections: 7
};

export const useElectoralData = () => {
  const electionsQuery = useQuery({
    queryKey: ['electoral-elections'],
    queryFn: async (): Promise<Election[]> => {
      // In real implementation, fetch from Supabase
      // const { data, error } = await supabase
      //   .from('elections')
      //   .select('*')
      //   .order('election_date', { ascending: false });
      
      // if (error) throw error;
      // return data;
      
      return mockElections;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const campaignsQuery = useQuery({
    queryKey: ['electoral-campaigns'],
    queryFn: async (): Promise<Campaign[]> => {
      // In real implementation, fetch from Supabase
      return mockCampaigns;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const voterRegistrationQuery = useQuery({
    queryKey: ['voter-registration'],
    queryFn: async (): Promise<VoterRegistration[]> => {
      // In real implementation, fetch from Supabase
      return mockVoterRegistration;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  const partiesQuery = useQuery({
    queryKey: ['political-parties'],
    queryFn: async (): Promise<PoliticalParty[]> => {
      // In real implementation, fetch from Supabase
      return mockPoliticalParties;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const overallStatsQuery = useQuery({
    queryKey: ['electoral-overall-stats'],
    queryFn: async (): Promise<ElectoralStats> => {
      // In real implementation, calculate from actual data
      return mockOverallStats;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  return {
    elections: electionsQuery.data,
    campaigns: campaignsQuery.data,
    voterRegistration: voterRegistrationQuery.data,
    parties: partiesQuery.data,
    overallStats: overallStatsQuery.data,
    isLoading: electionsQuery.isLoading || campaignsQuery.isLoading || 
               voterRegistrationQuery.isLoading || partiesQuery.isLoading ||
               overallStatsQuery.isLoading,
    error: electionsQuery.error || campaignsQuery.error || 
           voterRegistrationQuery.error || partiesQuery.error ||
           overallStatsQuery.error
  };
};