import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { AppLayout } from '@/components/Layout/AppLayout';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { PullToRefreshIndicator } from '@/components/ui/pull-to-refresh';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Send, 
  TrendingUp,
  Globe,
  MapPin,
  Clock,
  Filter,
  RefreshCw,
  Users,
  Star,
  Building,
  School,
  Hospital,
  Vote,
  Plus,
  Bell,
  Search,
  ChevronDown,
  Eye,
  Bookmark,
  Flag,
  MoreHorizontal,
  UserPlus,
  Radio,
  Camera,
  Video,
  Link as LinkIcon,
  Hash,
  AtSign,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Crown,
  Briefcase,
  GraduationCap,
  Building2,
  Landmark,
  Users2,
  Calendar,
  AlertTriangle,
  DollarSign,
  Handshake,
  Megaphone,
  Activity,
  Menu,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Enhanced interfaces for the new feed structure
interface FeedPost {
  id: string;
  content: string;
  type: 'text' | 'poll' | 'media' | 'event' | 'debate';
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
    type: 'user' | 'politician' | 'company' | 'institution' | 'minister' | 'mp' | 'artist' | 'school' | 'hospital' | 'ngo' | 'billionaire';
    title?: string;
    followers?: number;
  };
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  engagement: {
    user_liked: boolean;
    user_shared: boolean;
    user_saved: boolean;
  };
  location?: {
    region: string;
    city?: string;
  };
  media?: {
    type: 'image' | 'video' | 'link';
    url: string;
    thumbnail?: string;
    title?: string;
  }[];
  hashtags?: string[];
  mentions?: string[];
  created_at: string;
  priority?: 'normal' | 'trending' | 'urgent' | 'promoted';
  sentiment?: 'positive' | 'negative' | 'neutral';
  poll_data?: {
    question: string;
    options: Array<{ text: string; votes: number; percentage: number }>;
    total_votes: number;
    user_voted?: number;
    ends_at: string;
  };
}

interface TrendingItem {
  id: string;
  title: string;
  type: 'topic' | 'poll' | 'politician' | 'company' | 'institution' | 'event' | 'campaign';
  count: number;
  change: number;
  icon?: string;
  category?: string;
}

interface FollowSuggestion {
  id: string;
  name: string;
  username: string;
  avatar: string;
  type: 'user' | 'politician' | 'company' | 'institution' | 'minister' | 'mp' | 'artist' | 'school' | 'hospital' | 'ngo' | 'billionaire' | 'political_party';
  title?: string;
  followers: number;
  verified: boolean;
  mutual_followers?: number;
  category?: string;
  rating?: number;
}

interface SliderItem {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  type: 'poll' | 'event' | 'campaign' | 'notice' | 'project';
  action_url?: string;
  priority?: 'high' | 'medium' | 'low';
  data?: any;
}

const CivicFeed = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  // Feed state
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Enhanced data states
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [followSuggestions, setFollowSuggestions] = useState<FollowSuggestion[]>([]);
  const [sliderPolls, setSliderPolls] = useState<SliderItem[]>([]);
  const [sliderEvents, setSliderEvents] = useState<SliderItem[]>([]);
  const [sliderCampaigns, setSliderCampaigns] = useState<SliderItem[]>([]);
  const [sliderNotices, setSliderNotices] = useState<SliderItem[]>([]);
  
  // Mobile & UI state
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [activeSlider, setActiveSlider] = useState(0);
  const [pollIndex, setPollIndex] = useState(0);
  const [eventIndex, setEventIndex] = useState(0);
  const [campaignIndex, setCampaignIndex] = useState(0);
  
  // Filter state
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Refs
  const feedRef = useRef<HTMLDivElement>(null);
  const autoRefreshRef = useRef<NodeJS.Timeout>();
  const lastPostIdRef = useRef<string>('');
  const sliderRefs = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Forward declare the functions to avoid dependency issues
  const loadFeedData = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      }

      // Enhanced mock data with more diverse content including polls
      const pollTemplates = [
        {
          question: "What should be the government's top priority for 2024?",
          options: [
            { text: "Infrastructure Development", votes: 1247, percentage: 35 },
            { text: "Education Reform", votes: 987, percentage: 28 },
            { text: "Healthcare Improvement", votes: 856, percentage: 24 },
            { text: "Economic Growth", votes: 456, percentage: 13 }
          ],
          total_votes: 3546,
          ends_at: new Date(Date.now() + 86400000 * 7).toISOString()
        },
        {
          question: "Should the government increase investment in renewable energy?",
          options: [
            { text: "Yes, significantly", votes: 2134, percentage: 62 },
            { text: "Yes, moderately", votes: 856, percentage: 25 },
            { text: "No, focus on current infrastructure", votes: 445, percentage: 13 }
          ],
          total_votes: 3435,
          ends_at: new Date(Date.now() + 86400000 * 5).toISOString()
        }
      ];

      const contentTemplates = [
        "New infrastructure project launched in {city}! 🚧 This will improve connectivity and boost economic growth. What are your thoughts? #Infrastructure #Development",
        "Education sector reforms announced by Minister of Education. Key changes include improved teacher training and digital classrooms. #Education #Reform",
        "Healthcare improvements in {region} region showing positive results. Hospital capacity increased by 30% this quarter. #Health #Progress",
        "Breaking: New university campus opens in {city}, providing 5000+ new student places. A milestone for higher education! 🎓 #University #Education",
        "Community development project in {region} receives international funding. Focus on clean water and renewable energy. 🌱 #Community #Sustainability",
        "Minister of Health visits {city} hospital, announces new medical equipment procurement. Healthcare modernization continues. 🏥 #Healthcare",
        "Road construction project connecting {city} to neighboring regions 85% complete. Expected completion: March 2024. 🛣️ #Infrastructure",
        "Youth empowerment program launches in {region}. 1000+ young people to receive vocational training and startup funding. 💪 #Youth #Empowerment",
        "Digital transformation initiative: Government services going online to improve citizen access and reduce bureaucracy. 💻 #DigitalGov"
      ];

      const enhancedAuthors = [
        { name: 'Paul Biya', username: 'paulbiya_cm', type: 'politician', title: 'President of Cameroon', verified: true, followers: 890000 },
        { name: 'Maurice Kamto', username: 'mauricekamto', type: 'politician', title: 'Opposition Leader', verified: true, followers: 456000 },
        { name: 'Dr. Manaouda Malachie', username: 'min_sante', type: 'minister', title: 'Minister of Health', verified: true, followers: 67000 },
        { name: 'Prof. Laurent Serge Etoundi Ngoa', username: 'min_education', type: 'minister', title: 'Minister of Education', verified: true, followers: 54000 },
        { name: 'MTN Cameroon', username: 'mtn_cameroon', type: 'company', title: 'Telecommunications', verified: true, followers: 234000 },
        { name: 'University of Yaoundé I', username: 'univ_yaounde1', type: 'institution', title: 'Public University', verified: true, followers: 78000 },
        { name: 'Charlotte Dipanda', username: 'charlotte_dipanda', type: 'artist', title: 'Musician', verified: true, followers: 456000 },
        { name: 'Tenor', username: 'tenor_cm', type: 'artist', title: 'Musician', verified: true, followers: 678000 },
        { name: 'Douala General Hospital', username: 'hgd_douala', type: 'hospital', title: 'Public Hospital', verified: true, followers: 34000 },
        { name: 'CPDM Party', username: 'cpdm_cm', type: 'political_party', title: 'Ruling Party', verified: true, followers: 345000 },
        { name: 'Orange Cameroon', username: 'orange_cm', type: 'company', title: 'Telecommunications', verified: true, followers: 198000 },
        { name: 'Vincent Aboubakar', username: 'aboubakar_cm', type: 'user', title: 'Footballer', verified: true, followers: 567000 },
        { name: 'Foumban Royal Palace', username: 'foumban_palace', type: 'institution', title: 'Cultural Institution', verified: true, followers: 23000 }
      ];

      const locations = [
        { region: 'Centre', city: 'Yaoundé' },
        { region: 'Littoral', city: 'Douala' },
        { region: 'Ouest', city: 'Bafoussam' },
        { region: 'Nord-Ouest', city: 'Bamenda' },
        { region: 'Sud-Ouest', city: 'Buea' },
        { region: 'Nord', city: 'Garoua' },
        { region: 'Adamaoua', city: 'Ngaoundéré' },
        { region: 'Est', city: 'Bertoua' },
        { region: 'Sud', city: 'Ebolowa' },
        { region: 'Extrême-Nord', city: 'Maroua' }
      ];

      const postTypes = ['text', 'poll', 'media', 'event', 'debate'] as const;

      const mockPosts: FeedPost[] = Array.from({ length: 20 }, (_, i) => {
        const author = enhancedAuthors[Math.floor(Math.random() * enhancedAuthors.length)];
        const location = locations[Math.floor(Math.random() * locations.length)];
        const postType = postTypes[Math.floor(Math.random() * postTypes.length)];
        
        let content: string;
        let pollData = undefined;
        
        if (postType === 'poll') {
          const poll = pollTemplates[Math.floor(Math.random() * pollTemplates.length)];
          content = `📊 POLL: ${poll.question}`;
          pollData = poll;
        } else {
          content = contentTemplates[Math.floor(Math.random() * contentTemplates.length)]
            .replace(/\{city\}/g, location.city)
            .replace(/\{region\}/g, location.region);
        }
        
        return {
          id: `post-${reset ? '' : page}-${i}`,
          content,
          type: postType,
          author: {
            id: `${author.username}-${i}`,
            name: author.name,
            username: author.username,
            avatar: '/placeholder.svg',
            verified: author.verified,
            type: author.type as any,
            title: author.title,
            followers: author.followers + Math.floor(Math.random() * 1000)
          },
          metrics: {
            likes: Math.floor(Math.random() * 2000) + 50,
            comments: Math.floor(Math.random() * 200) + 5,
            shares: Math.floor(Math.random() * 100) + 2,
            views: Math.floor(Math.random() * 10000) + 500
          },
          engagement: {
            user_liked: Math.random() > 0.8,
            user_shared: false,
            user_saved: Math.random() > 0.9
          },
          location,
          poll_data: pollData,
          hashtags: content.match(/#[a-zA-Z0-9_]+/g)?.map(tag => tag.slice(1)) || [],
          mentions: content.match(/@[a-zA-Z0-9_]+/g)?.map(mention => mention.slice(1)) || [],
          created_at: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
          priority: ['normal', 'normal', 'normal', 'trending', 'urgent', 'promoted'][Math.floor(Math.random() * 6)] as any,
          sentiment: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)] as any
        };
      });

      if (reset) {
        setPosts(mockPosts);
        setPage(2);
      } else {
        setPosts(prev => [...prev, ...mockPosts]);
        setPage(prev => prev + 1);
      }

      if (mockPosts.length > 0) {
        lastPostIdRef.current = mockPosts[0].id;
      }
      
      setHasMore(mockPosts.length === 20);
    } catch (error) {
      console.error('Error loading feed:', error);
      toast({
        title: 'Error',
        description: 'Failed to load feed posts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, toast]);

  // Define refresh function early to avoid declaration order issues
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setHasNewPosts(false);
    await loadFeedData(true);
  }, [loadFeedData]);

  // Pull to refresh functionality
  const { containerRef, isPulling, pullDistance, isRefreshing, pullProgress, canTrigger } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 60,
    triggerThreshold: 80
  });

  // Real-time auto refresh with content rotation
  useEffect(() => {
    if (isLiveMode) {
      autoRefreshRef.current = setInterval(() => {
        checkForNewPosts();
        // Also refresh sidebar data for dynamic content
        if (Math.random() > 0.6) {
          loadSidebarData();
        }
      }, 10000); // More frequent updates for dynamic feel
    } else {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
      }
    }

    return () => {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
      }
    };
  }, [isLiveMode]);

  // Background content rotation even when not in live mode
  useEffect(() => {
    const rotationInterval = setInterval(() => {
      loadSidebarData(); // Rotate trending and follow suggestions
    }, 30000); // Every 30 seconds

    return () => clearInterval(rotationInterval);
  }, []);

  // Initial load
  useEffect(() => {
    loadFeedData();
    loadSidebarData();
  }, []);

  // Filter change handler
  useEffect(() => {
    if (activeFilter || selectedRegion !== 'all' || searchQuery) {
      loadFeedData(true);
    }
  }, [activeFilter, selectedRegion, searchQuery, loadFeedData]);

  // Slider rotation effects
  useEffect(() => {
    // Auto-slide polls every 5 seconds
    sliderRefs.current.polls = setInterval(() => {
      setPollIndex(prev => (prev + 1) % 3);
    }, 5000);

    // Auto-slide events every 7 seconds  
    sliderRefs.current.events = setInterval(() => {
      setEventIndex(prev => (prev + 1) % 3);
    }, 7000);

    // Auto-slide campaigns every 6 seconds
    sliderRefs.current.campaigns = setInterval(() => {
      setCampaignIndex(prev => (prev + 1) % 3);
    }, 6000);

    return () => {
      Object.values(sliderRefs.current).forEach(clearInterval);
    };
  }, []);

  // Load slider data
  useEffect(() => {
    loadSliderData();
  }, []);

  const loadSliderData = () => {
    // Mock slider polls
    setSliderPolls([
      { id: '1', title: "What's your top concern for 2024?", subtitle: 'Infrastructure vs Healthcare', type: 'poll', priority: 'high' },
      { id: '2', title: "Should CRTV be privatized?", subtitle: 'Media Freedom Discussion', type: 'poll', priority: 'medium' },
      { id: '3', title: "Rate the current education system", subtitle: 'Quality Assessment', type: 'poll', priority: 'medium' }
    ]);

    // Mock slider events
    setSliderEvents([
      { id: '1', title: 'Yaoundé Tech Summit 2024', subtitle: 'Innovation Conference', type: 'event', priority: 'high' },
      { id: '2', title: 'Douala Port Expansion Launch', subtitle: 'Infrastructure Development', type: 'event', priority: 'high' },
      { id: '3', title: 'Cameroon Education Week', subtitle: 'Policy Discussions', type: 'event', priority: 'medium' }
    ]);

    // Mock slider campaigns 
    setSliderCampaigns([
      { id: '1', title: 'Clean Water for All', subtitle: 'Rural Development Initiative', type: 'campaign', priority: 'high' },
      { id: '2', title: 'Digital Literacy Campaign', subtitle: 'Tech Education', type: 'campaign', priority: 'medium' },
      { id: '3', title: 'Youth Employment Drive', subtitle: 'Job Creation Program', type: 'campaign', priority: 'high' }
    ]);

    // Mock government notices
    setSliderNotices([
      { id: '1', title: 'New Tax Policy Update', subtitle: 'MINFI Announcement', type: 'notice', priority: 'high' },
      { id: '2', title: 'Road Closure Notice - Douala', subtitle: 'Construction Work', type: 'notice', priority: 'medium' },
      { id: '3', title: 'Election Commission Update', subtitle: 'ELECAM Notice', type: 'notice', priority: 'high' }
    ]);
  };


  const loadSidebarData = async () => {
    // Mock trending data with rotation
    const trendingOptions = [
      { id: '1', title: 'Infrastructure Development', type: 'topic', count: 1247, change: 15 },
      { id: '2', title: 'Education Reform', type: 'topic', count: 983, change: 8 },
      { id: '3', title: 'Health System', type: 'topic', count: 756, change: -3 },
      { id: '4', title: 'Paul Biya', type: 'politician', count: 2156, change: 25 },
      { id: '5', title: 'Maurice Kamto', type: 'politician', count: 1834, change: 12 },
      { id: '6', title: 'Anglophone Crisis', type: 'topic', count: 1456, change: 18 },
      { id: '7', title: 'Road Infrastructure', type: 'topic', count: 892, change: 7 },
      { id: '8', title: 'Teacher Strikes', type: 'topic', count: 634, change: -12 }
    ];
    
    // Randomly shuffle and take 5
    const shuffled = trendingOptions.sort(() => 0.5 - Math.random()).slice(0, 5);
    setTrending(shuffled as TrendingItem[]);

    // Enhanced follow suggestions with more entities
    const followOptions = [
      // Politicians
      { id: '1', name: 'Paul Biya', username: 'paulbiya_cm', avatar: '/placeholder.svg', type: 'politician', title: 'President of Cameroon', followers: 890000, verified: true, mutual_followers: 45 },
      { id: '2', name: 'Maurice Kamto', username: 'mauricekamto', avatar: '/placeholder.svg', type: 'politician', title: 'Opposition Leader', followers: 456000, verified: true, mutual_followers: 23 },
      { id: '3', name: 'Joshua Osih', username: 'joshuaosih', avatar: '/placeholder.svg', type: 'politician', title: 'SDF Party Leader', followers: 234000, verified: true, mutual_followers: 18 },
      
      // Ministers
      { id: '4', name: 'Minister of Health', username: 'min_sante', avatar: '/placeholder.svg', type: 'politician', title: 'Dr. Manaouda Malachie', followers: 67000, verified: true, mutual_followers: 12 },
      { id: '5', name: 'Minister of Education', username: 'min_education', avatar: '/placeholder.svg', type: 'politician', title: 'Prof. Laurent Serge Etoundi Ngoa', followers: 54000, verified: true, mutual_followers: 8 },
      
      // Institutions
      { id: '6', name: 'Ministry of Health', username: 'minsante_cm', avatar: '/placeholder.svg', type: 'institution', title: 'Government Institution', followers: 145000, verified: true, mutual_followers: 32 },
      { id: '7', name: 'University of Yaoundé I', username: 'univ_yaounde1', avatar: '/placeholder.svg', type: 'institution', title: 'Public University', followers: 78000, verified: true, mutual_followers: 19 },
      { id: '8', name: 'University of Buea', username: 'univ_buea', avatar: '/placeholder.svg', type: 'institution', title: 'Public University', followers: 56000, verified: true, mutual_followers: 14 },
      { id: '9', name: 'Douala General Hospital', username: 'hgd_douala', avatar: '/placeholder.svg', type: 'institution', title: 'Public Hospital', followers: 34000, verified: true, mutual_followers: 9 },
      
      // Companies
      { id: '10', name: 'MTN Cameroon', username: 'mtn_cameroon', avatar: '/placeholder.svg', type: 'company', title: 'Telecommunications', followers: 234000, verified: true, mutual_followers: 67 },
      { id: '11', name: 'Orange Cameroon', username: 'orange_cm', avatar: '/placeholder.svg', type: 'company', title: 'Telecommunications', followers: 198000, verified: true, mutual_followers: 54 },
      { id: '12', name: 'ENEO Cameroon', username: 'eneo_cm', avatar: '/placeholder.svg', type: 'company', title: 'Electricity Provider', followers: 87000, verified: true, mutual_followers: 23 },
      { id: '13', name: 'CAMTEL', username: 'camtel_cm', avatar: '/placeholder.svg', type: 'company', title: 'State Telecom', followers: 45000, verified: true, mutual_followers: 15 },
      
      // Artists
      { id: '14', name: 'Charlotte Dipanda', username: 'charlotte_dipanda', avatar: '/placeholder.svg', type: 'user', title: 'Musician', followers: 456000, verified: true, mutual_followers: 89 },
      { id: '15', name: 'Tenor', username: 'tenor_cm', avatar: '/placeholder.svg', type: 'user', title: 'Musician', followers: 678000, verified: true, mutual_followers: 123 },
      { id: '16', name: 'Daphne', username: 'daphne_njie', avatar: '/placeholder.svg', type: 'user', title: 'Musician', followers: 567000, verified: true, mutual_followers: 98 },
      
      // Schools
      { id: '17', name: 'Lycée Général Leclerc', username: 'lgl_yaounde', avatar: '/placeholder.svg', type: 'institution', title: 'Secondary School', followers: 23000, verified: true, mutual_followers: 7 },
      { id: '18', name: 'Collège de la Retraite', username: 'college_retraite', avatar: '/placeholder.svg', type: 'institution', title: 'Secondary School', followers: 18000, verified: true, mutual_followers: 5 },
      
      // Political Parties
      { id: '19', name: 'CPDM Party', username: 'cpdm_cm', avatar: '/placeholder.svg', type: 'politician', title: 'Ruling Party', followers: 345000, verified: true, mutual_followers: 78 },
      { id: '20', name: 'SDF Party', username: 'sdf_cm', avatar: '/placeholder.svg', type: 'politician', title: 'Opposition Party', followers: 234000, verified: true, mutual_followers: 56 }
    ];

    // Randomly shuffle and take 6
    const shuffledFollows = followOptions.sort(() => 0.5 - Math.random()).slice(0, 6);
    setFollowSuggestions(shuffledFollows as FollowSuggestion[]);
  };

  const checkForNewPosts = async () => {
    // In a real app, this would check for posts newer than lastPostIdRef.current
    // For demo, we'll randomly show new posts available
    if (Math.random() > 0.7) {
      setHasNewPosts(true);
    }
  };


  const handleNewPostsClick = () => {
    setHasNewPosts(false);
    handleRefresh();
    if (feedRef.current) {
      feedRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const createPost = async () => {
    if (!user || !newPost.trim()) return;

    setPosting(true);
    try {
      // In a real app, this would post to the backend
      const newPostData: FeedPost = {
        id: `new-post-${Date.now()}`,
        content: newPost,
        type: 'text',
        author: {
          id: user.id,
          name: profile?.display_name || 'User',
          username: profile?.username || 'user',
          avatar: profile?.avatar_url || '/placeholder.svg',
          verified: false,
          type: 'user',
          followers: 0
        },
        metrics: { likes: 0, comments: 0, shares: 0, views: 0 },
        engagement: { user_liked: false, user_shared: false, user_saved: false },
        hashtags: newPost.match(/#[a-zA-Z0-9_]+/g)?.map(tag => tag.slice(1)) || [],
        mentions: newPost.match(/@[a-zA-Z0-9_]+/g)?.map(mention => mention.slice(1)) || [],
        created_at: new Date().toISOString(),
        priority: 'normal'
      };

      setPosts(prev => [newPostData, ...prev]);
      setNewPost('');
      
      toast({
        title: 'Post Created',
        description: 'Your post has been shared with the community'
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create post',
        variant: 'destructive'
      });
    } finally {
      setPosting(false);
    }
  };

  const toggleLike = async (postId: string, currentlyLiked: boolean) => {
    if (!user) return;

    setPosts(posts.map(post => 
      post.id === postId 
        ? {
            ...post,
            metrics: {
              ...post.metrics,
              likes: currentlyLiked ? post.metrics.likes - 1 : post.metrics.likes + 1
            },
            engagement: {
              ...post.engagement,
              user_liked: !currentlyLiked
            }
          }
        : post
    ));
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getAuthorIcon = (type: string) => {
    switch (type) {
      case 'politician': return <Star className="h-3 w-3 text-yellow-500" />;
      case 'company': return <Building className="h-3 w-3 text-blue-500" />;
      case 'institution': return <Hospital className="h-3 w-3 text-green-500" />;
      default: return null;
    }
  };

  const getPriorityStyle = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-4 border-l-red-500 bg-red-50/50';
      case 'trending': return 'border-l-4 border-l-orange-500 bg-orange-50/50';
      case 'promoted': return 'border-l-4 border-l-blue-500 bg-blue-50/50';
      default: return '';
    }
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-4">Login Required</h2>
              <p className="text-muted-foreground mb-4">Please log in to access the Civic Feed</p>
              <Button onClick={() => window.location.href = '/auth'}>Sign In</Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div ref={containerRef} className="min-h-screen bg-background">
        {/* Pull to Refresh Indicator */}
        <PullToRefreshIndicator
          isPulling={isPulling}
          pullDistance={pullDistance}
          isRefreshing={isRefreshing}
          pullProgress={pullProgress}
          canTrigger={canTrigger}
        />

        {/* Mobile Sticky Header */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
          <div className="px-3 py-2 sm:px-4 sm:py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <h1 className="text-lg sm:text-2xl font-bold flex items-center gap-2">
                  <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  <span className="hidden sm:block">Civic Feed</span>
                </h1>
              </div>
              
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant={isLiveMode ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => setIsLiveMode(!isLiveMode)}
                  className="text-xs px-2 sm:px-3"
                >
                  {isLiveMode ? <Radio className="h-3 w-3 sm:h-4 sm:w-4" /> : <Pause className="h-3 w-3 sm:h-4 sm:w-4" />}
                  <span className="hidden sm:inline ml-1">{isLiveMode ? 'Live' : 'Auto'}</span>
                </Button>
                
                <Button variant="outline" size="sm" className="p-1.5 sm:p-2">
                  <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                
                <Button variant="outline" size="sm" className="p-1.5 sm:p-2">
                  <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>

                <Button variant="outline" size="sm" className="p-1.5 sm:p-2">
                  <Search className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {showMobileSidebar && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileSidebar(false)} />
            <div className="absolute left-0 top-0 h-full w-80 bg-background shadow-lg overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Menu</h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowMobileSidebar(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Mobile Trending */}
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Trending Topics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {trending.slice(0, 3).map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{formatNumber(item.count)} mentions</p>
                        </div>
                        <Badge variant="outline" className={item.change > 0 ? 'text-green-600' : 'text-red-600'}>
                          {item.change > 0 ? '+' : ''}{item.change}%
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Mobile Follow Suggestions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      People to Follow
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {followSuggestions.slice(0, 3).map((suggestion) => (
                      <div key={suggestion.id} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={suggestion.avatar} />
                          <AvatarFallback>{suggestion.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{suggestion.name}</p>
                          <p className="text-xs text-muted-foreground truncate">@{suggestion.username}</p>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs">
                          Follow
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* New Posts Banner */}
        {hasNewPosts && (
          <div className="bg-primary text-primary-foreground py-2 px-4 text-center cursor-pointer hover:bg-primary/90 transition-colors" onClick={handleNewPostsClick}>
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="h-4 w-4" />
              New posts available - Click to refresh
            </div>
          </div>
        )}

        <div className="px-2 sm:px-4 py-3 sm:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6">
            
            {/* Left Sidebar - Trending (Hidden on mobile, shown in drawer) */}
            <div className="hidden lg:block lg:col-span-3 space-y-4 sm:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Trending Topics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trending.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between text-sm hover:bg-accent/50 p-2 rounded cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">#{index + 1}</span>
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{formatNumber(item.count)} mentions</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={item.change > 0 ? 'text-green-600' : 'text-red-600'}>
                        {item.change > 0 ? '+' : ''}{item.change}%
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Quick Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { key: 'all', label: 'All Posts', icon: Globe },
                    { key: 'polls', label: 'Polls', icon: Vote },
                    { key: 'media', label: 'Media', icon: Camera },
                    { key: 'debates', label: 'Debates', icon: MessageCircle },
                    { key: 'officials', label: 'Officials Only', icon: Star }
                  ].map(filter => (
                    <Button
                      key={filter.key}
                      variant={activeFilter === filter.key ? 'default' : 'ghost'}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setActiveFilter(filter.key)}
                    >
                      <filter.icon className="h-4 w-4 mr-2" />
                      {filter.label}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main Feed */}
            <div className="lg:col-span-6 w-full">
              <div className="space-y-3 sm:space-y-6">
              {/* Create Post */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <Avatar>
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback>{profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <Textarea
                        placeholder="What's happening in Cameroon? Share your civic thoughts..."
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        className="min-h-[100px] resize-none border-none focus:ring-0 text-lg"
                        maxLength={500}
                      />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Camera className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Video className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Vote className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <LinkIcon className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">{newPost.length}/500</span>
                          <Button 
                            onClick={createPost}
                            disabled={!newPost.trim() || posting}
                            size="sm"
                          >
                            {posting ? 'Posting...' : 'Post'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Filter Bar */}
              <div className="flex items-center gap-4 overflow-x-auto pb-2">
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-auto">
                    <MapPin className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="centre">Centre</SelectItem>
                    <SelectItem value="littoral">Littoral</SelectItem>
                    <SelectItem value="ouest">Ouest</SelectItem>
                    <SelectItem value="nord-ouest">Nord-Ouest</SelectItem>
                    <SelectItem value="sud-ouest">Sud-Ouest</SelectItem>
                  </SelectContent>
                </Select>

                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              {/* Posts Feed */}
              <div ref={feedRef} className="space-y-4">
                {loading && posts.length === 0 ? (
                  // Skeleton loader
                  Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="pt-6">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 bg-muted rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-1/4"></div>
                            <div className="h-4 bg-muted rounded w-full"></div>
                            <div className="h-4 bg-muted rounded w-3/4"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  posts.map((post) => (
                    <Card key={post.id} className={`hover:shadow-md transition-all duration-200 ${getPriorityStyle(post.priority)}`}>
                      <CardContent className="pt-6">
                        <div className="flex gap-3">
                          <Avatar className="cursor-pointer">
                            <AvatarImage src={post.author.avatar} />
                            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 space-y-3">
                            {/* Author info */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold hover:underline cursor-pointer">
                                  {post.author.name}
                                </span>
                                {post.author.verified && (
                                  <Badge variant="outline" className="text-xs">
                                    ✓ Verified
                                  </Badge>
                                )}
                                {getAuthorIcon(post.author.type)}
                                <span className="text-sm text-muted-foreground">
                                  @{post.author.username}
                                </span>
                                {post.author.title && (
                                  <span className="text-xs text-muted-foreground">
                                    • {post.author.title}
                                  </span>
                                )}
                                <span className="text-sm text-muted-foreground">
                                  • {formatDistanceToNow(new Date(post.created_at))} ago
                                </span>
                              </div>
                              
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Post content */}
                            <div className="space-y-3">
                              <p className="text-base leading-relaxed">
                                {post.content.split(' ').map((word, index) => {
                                  if (word.startsWith('#')) {
                                    return (
                                      <span key={index} className="text-primary hover:underline cursor-pointer">
                                        {word}{' '}
                                      </span>
                                    );
                                  }
                                  if (word.startsWith('@')) {
                                    return (
                                      <span key={index} className="text-primary hover:underline cursor-pointer">
                                        {word}{' '}
                                      </span>
                                    );
                                  }
                                  return word + ' ';
                                })}
                              </p>

                              {/* Media preview */}
                              {post.media && post.media.length > 0 && (
                                <div className="rounded-lg overflow-hidden border">
                                  <img 
                                    src={post.media[0].url} 
                                    alt="Post media"
                                    className="w-full h-64 object-cover"
                                  />
                                </div>
                              )}

                              {/* Location */}
                              {post.location && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {post.location.city}, {post.location.region}
                                </div>
                              )}
                            </div>

                            {/* Engagement bar */}
                            <div className="flex items-center justify-between pt-3 border-t">
                              <div className="flex items-center gap-6">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleLike(post.id, post.engagement.user_liked)}
                                  className={post.engagement.user_liked ? 'text-red-500' : ''}
                                >
                                  <Heart className={`h-4 w-4 mr-1 ${post.engagement.user_liked ? 'fill-current' : ''}`} />
                                  {formatNumber(post.metrics.likes)}
                                </Button>
                                
                                <Button variant="ghost" size="sm">
                                  <MessageCircle className="h-4 w-4 mr-1" />
                                  {formatNumber(post.metrics.comments)}
                                </Button>
                                
                                <Button variant="ghost" size="sm">
                                  <Share2 className="h-4 w-4 mr-1" />
                                  {formatNumber(post.metrics.shares)}
                                </Button>
                                
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Eye className="h-3 w-3" />
                                  {formatNumber(post.metrics.views)}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                  <Bookmark className={`h-4 w-4 ${post.engagement.user_saved ? 'fill-current' : ''}`} />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Flag className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}

                {/* Load more */}
                {hasMore && !loading && (
                  <div className="text-center py-6">
                    <Button 
                      variant="outline" 
                      onClick={() => loadFeedData()}
                      disabled={loading}
                    >
                      {loading ? 'Loading...' : 'Load More Posts'}
                    </Button>
                  </div>
                )}
              </div>
              </div>
            </div>

            {/* Right Sidebar - Follow Suggestions (Hidden on mobile, shown as bottom sheet) */}
            <div className="hidden lg:block lg:col-span-3 space-y-4 sm:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    People to Follow
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {followSuggestions.map((suggestion) => (
                    <div key={suggestion.id} className="flex items-center gap-3">
                      <Avatar className="cursor-pointer">
                        <AvatarImage src={suggestion.avatar} />
                        <AvatarFallback>{suggestion.name[0]}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {suggestion.name}
                          {suggestion.verified && (
                            <Badge variant="outline" className="text-xs ml-1">✓</Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          @{suggestion.username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatNumber(suggestion.followers)} followers
                          {suggestion.mutual_followers && (
                            <> • {suggestion.mutual_followers} mutual</>
                          )}
                        </p>
                      </div>
                      
                      <Button size="sm" variant="outline">
                        Follow
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Trending Institutions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: 'University of Douala', type: 'university', followers: '23K' },
                    { name: 'Douala General Hospital', type: 'hospital', followers: '18K' },
                    { name: 'Ministry of Education', type: 'ministry', followers: '67K' }
                  ].map((institution, index) => (
                    <div key={index} className="flex items-center justify-between text-sm hover:bg-accent/50 p-2 rounded cursor-pointer">
                      <div className="flex items-center gap-2">
                        {institution.type === 'university' && <School className="h-4 w-4 text-blue-500" />}
                        {institution.type === 'hospital' && <Hospital className="h-4 w-4 text-green-500" />}
                        {institution.type === 'ministry' && <Building className="h-4 w-4 text-purple-500" />}
                        <div>
                          <p className="font-medium">{institution.name}</p>
                          <p className="text-xs text-muted-foreground">{institution.followers} followers</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs">
                        Follow
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CivicFeed;