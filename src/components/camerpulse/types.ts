/**
 * CamerPulse Component Types
 * 
 * Shared type definitions for all CamerPulse components
 */

export interface BaseUser {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  verified?: boolean;
}

export interface CivicUser extends BaseUser {
  role?: string;
  region?: string;
  party?: string;
  isDiaspora?: boolean;
  location?: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

export interface Poll {
  id: string;
  question: string;
  description?: string;
  options: PollOption[];
  totalVotes: number;
  endDate?: string;
  creator: BaseUser;
  category?: string;
  isVoted?: boolean;
  userVote?: string;
}

export interface Official {
  id: string;
  name: string;
  role: string;
  party?: string;
  region: string;
  avatar?: string;
  approvalRating: number;
  civicScore: number;
  termStatus: 'active' | 'expired' | 'deceased' | 'unknown';
  isCurrentlyInOffice?: boolean;
  promisesKept?: number;
  totalPromises?: number;
  aiVerificationStatus?: "verified" | "unverified" | "disputed" | "pending";
  aiVerificationScore?: number;
}

export interface Company {
  id: string;
  name: string;
  businessType: string;
  location: string;
  logo?: string;
  rating: number;
  totalReviews: number;
  verified: boolean;
  employees?: number;
  revenue?: string;
  founded?: string;
}

export interface Pulse {
  id: string;
  user: CivicUser;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  hashtags?: string[];
  isLiked?: boolean;
}

export interface AnalyticsData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    fill?: boolean;
  }[];
}

export type ComponentSize = 'sm' | 'default' | 'lg';
export type ComponentVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type SentimentType = 'positive' | 'negative' | 'neutral';
export type VerificationStatus = 'verified' | 'unverified' | 'pending' | 'disputed';