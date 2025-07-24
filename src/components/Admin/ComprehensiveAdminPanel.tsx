import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Users, 
  BarChart3, 
  Shield, 
  Globe, 
  Database, 
  Puzzle,
  Monitor,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Eye,
  Bot,
  Music,
  Building,
  FileText,
  Heart,
  MapPin,
  Vote,
  Scale,
  Crown,
  UserCheck,
  Calendar,
  MessageCircle,
  Star,
  Zap,
  Camera,
  Mic,
  Video,
  Briefcase,
  GraduationCap,
  Hospital,
  Pill,
  Home,
  Church,
  DollarSign,
  TrendingDown,
  Activity,
  Plus,
  Minus,
  Info,
  Save,
  Upload,
  Download,
  Edit,
  Trash2,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  ArrowUpDown,
  Power,
  Lock,
  Unlock,
  Mail,
  Phone,
  Bell,
  Clock,
  Target,
  Flag,
  Award,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  Newspaper,
  Bug,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

interface Feature {
  id: string;
  name: string;
  category: string;
  description: string;
  isEnabled: boolean;
  isCore: boolean;
  routes: string[];
  components: string[];
  icon: React.ReactNode;
  version: string;
  lastUpdated: string;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  usage: number;
  dependencies: string[];
}

interface SystemStats {
  totalUsers: number;
  activeFeatures: number;
  totalPolls: number;
  totalPoliticians: number;
  totalVillages: number;
  systemHealth: number;
  uptime: string;
  dataSize: string;
}

const ComprehensiveAdminPanel: React.FC = () => {
  const { toast } = useToast();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'status'>('name');
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  // Initialize mock data (replace with real API calls)
  useEffect(() => {
    const mockFeatures: Feature[] = [
      // CORE FEATURES
      {
        id: 'civic-engagement',
        name: 'Civic Engagement Core',
        category: 'Core',
        description: 'Core civic participation, polls, and democratic engagement tools',
        isEnabled: true,
        isCore: true,
        routes: ['/polls', '/civic-reputation', '/analytics'],
        components: ['PollsDashboard', 'ReputationSystem', 'CivicAnalytics'],
        icon: <Vote className="h-4 w-4" />,
        version: '3.0.0',
        lastUpdated: '2024-01-22',
        status: 'active',
        usage: 95,
        dependencies: ['authentication', 'notifications']
      },
      {
        id: 'politician-tracker',
        name: 'Politician Tracker',
        category: 'Government',
        description: 'Track politicians, ministers, senators, MPs, and government officials',
        isEnabled: true,
        isCore: true,
        routes: ['/politicians', '/senators', '/ministers', '/mps', '/mayors', '/governors'],
        components: ['PoliticiansPage', 'SenatorsPage', 'MinistersPage', 'MPsDirectory'],
        icon: <UserCheck className="h-4 w-4" />,
        version: '2.8.0',
        lastUpdated: '2024-01-20',
        status: 'active',
        usage: 89,
        dependencies: ['database', 'image-storage']
      },
      {
        id: 'user-management',
        name: 'User Management',
        category: 'Core',
        description: 'User accounts, profiles, authentication, and permissions',
        isEnabled: true,
        isCore: true,
        routes: ['/profile', '/settings', '/auth'],
        components: ['ProfilePage', 'SettingsPage', 'AuthSystem'],
        icon: <Users className="h-4 w-4" />,
        version: '4.1.0',
        lastUpdated: '2024-01-21',
        status: 'active',
        usage: 100,
        dependencies: ['supabase-auth', 'storage']
      },

      // BUSINESS & ECONOMIC FEATURES
      {
        id: 'camertenders',
        name: 'CamerTenders',
        category: 'Business',
        description: 'Government tender and procurement management system',
        isEnabled: true,
        isCore: false,
        routes: ['/tenders', '/tenders/create', '/tenders/:id', '/my-bids'],
        components: ['TendersList', 'TenderDetail', 'BidSubmission', 'TenderAnalytics'],
        icon: <FileText className="h-4 w-4" />,
        version: '2.1.0',
        lastUpdated: '2024-01-20',
        status: 'active',
        usage: 78,
        dependencies: ['pdf-generator', 'file-upload', 'notifications']
      },
      {
        id: 'business-directory',
        name: 'Business Directory',
        category: 'Business',
        description: 'Company listings, business verification, and billionaire tracking',
        isEnabled: true,
        isCore: false,
        routes: ['/companies', '/billionaires', '/business-verification'],
        components: ['CompanyDashboard', 'BillionaireTracker', 'BusinessVerification'],
        icon: <Building className="h-4 w-4" />,
        version: '1.9.0',
        lastUpdated: '2024-01-19',
        status: 'active',
        usage: 65,
        dependencies: ['verification-service', 'maps']
      },
      {
        id: 'economics',
        name: 'Economics Dashboard',
        category: 'Business',
        description: 'Economic analysis, market insights, and financial data',
        isEnabled: true,
        isCore: false,
        routes: ['/economics'],
        components: ['EconomicsPage', 'MarketAnalysis', 'FinancialInsights'],
        icon: <TrendingUp className="h-4 w-4" />,
        version: '1.4.0',
        lastUpdated: '2024-01-18',
        status: 'active',
        usage: 45,
        dependencies: ['charts', 'data-analytics']
      },
      {
        id: 'jobs-board',
        name: 'Jobs Board',
        category: 'Business',
        description: 'Job listings, applications, and career opportunities',
        isEnabled: true,
        isCore: false,
        routes: ['/jobs'],
        components: ['JobsPage', 'JobApplications', 'CareerCenter'],
        icon: <Briefcase className="h-4 w-4" />,
        version: '1.6.0',
        lastUpdated: '2024-01-17',
        status: 'active',
        usage: 72,
        dependencies: ['file-upload', 'notifications']
      },

      // ENTERTAINMENT & MEDIA
      {
        id: 'camerplay',
        name: 'CamerPlay Music',
        category: 'Entertainment',
        description: 'Music streaming, artist management, and entertainment platform',
        isEnabled: true,
        isCore: false,
        routes: ['/camerplay', '/artists', '/events'],
        components: ['CamerPlayHome', 'ArtistDashboard', 'EventCalendar', 'MusicPlayer'],
        icon: <Music className="h-4 w-4" />,
        version: '1.8.5',
        lastUpdated: '2024-01-18',
        status: 'active',
        usage: 83,
        dependencies: ['audio-player', 'file-upload', 'streaming']
      },
      {
        id: 'events-calendar',
        name: 'Events Calendar',
        category: 'Entertainment',
        description: 'Event management, calendar, and community gatherings',
        isEnabled: true,
        isCore: false,
        routes: ['/events'],
        components: ['EventCalendarPage', 'EventDetails', 'EventCreation'],
        icon: <Calendar className="h-4 w-4" />,
        version: '1.3.0',
        lastUpdated: '2024-01-16',
        status: 'active',
        usage: 56,
        dependencies: ['calendar', 'notifications']
      },
      {
        id: 'video-center',
        name: 'Video Center',
        category: 'Entertainment',
        description: 'Video content, streaming, and media sharing platform',
        isEnabled: false,
        isCore: false,
        routes: ['/videos'],
        components: ['VideosPage', 'VideoPlayer', 'VideoUpload'],
        icon: <Video className="h-4 w-4" />,
        version: '0.9.0',
        lastUpdated: '2024-01-10',
        status: 'inactive',
        usage: 12,
        dependencies: ['video-player', 'cdn', 'transcoding']
      },

      // CIVIC DIRECTORIES
      {
        id: 'village-registry',
        name: 'Village Registry',
        category: 'Civic',
        description: 'Comprehensive village documentation and management',
        isEnabled: true,
        isCore: false,
        routes: ['/villages', '/villages/search'],
        components: ['VillagesPage', 'VillageProfile', 'VillageSearch'],
        icon: <Home className="h-4 w-4" />,
        version: '2.3.1',
        lastUpdated: '2024-01-16',
        status: 'active',
        usage: 91,
        dependencies: ['maps', 'geolocation', 'search']
      },
      {
        id: 'schools-directory',
        name: 'Schools Directory',
        category: 'Civic',
        description: 'Educational institutions, schools, and learning centers',
        isEnabled: true,
        isCore: false,
        routes: ['/schools'],
        components: ['SchoolsPage', 'SchoolProfile', 'EducationSearch'],
        icon: <GraduationCap className="h-4 w-4" />,
        version: '1.7.0',
        lastUpdated: '2024-01-15',
        status: 'active',
        usage: 68,
        dependencies: ['maps', 'ratings']
      },
      {
        id: 'hospitals-directory',
        name: 'Hospitals Directory',
        category: 'Civic',
        description: 'Healthcare facilities, hospitals, and medical centers',
        isEnabled: true,
        isCore: false,
        routes: ['/hospitals'],
        components: ['HospitalsDirectory', 'HospitalProfile', 'HealthcareSearch'],
        icon: <Hospital className="h-4 w-4" />,
        version: '1.5.0',
        lastUpdated: '2024-01-14',
        status: 'active',
        usage: 74,
        dependencies: ['maps', 'emergency-services']
      },
      {
        id: 'pharmacies-directory',
        name: 'Pharmacies Directory',
        category: 'Civic',
        description: 'Pharmacy locations, medicine availability, and healthcare services',
        isEnabled: true,
        isCore: false,
        routes: ['/pharmacies'],
        components: ['PharmaciesPage', 'PharmacyProfile', 'MedicineSearch'],
        icon: <Pill className="h-4 w-4" />,
        version: '1.4.0',
        lastUpdated: '2024-01-13',
        status: 'active',
        usage: 59,
        dependencies: ['maps', 'inventory']
      },
      {
        id: 'churches-directory',
        name: 'Churches Directory',
        category: 'Civic',
        description: 'Religious institutions, churches, and spiritual centers',
        isEnabled: false,
        isCore: false,
        routes: ['/churches'],
        components: ['ChurchesPage', 'ChurchProfile', 'FaithSearch'],
        icon: <Church className="h-4 w-4" />,
        version: '0.8.0',
        lastUpdated: '2024-01-08',
        status: 'inactive',
        usage: 23,
        dependencies: ['maps', 'events']
      },

      // COMMUNICATION & TOOLS
      {
        id: 'pulse-messenger',
        name: 'Pulse Messenger',
        category: 'Communication',
        description: 'Secure civic communication and messaging platform',
        isEnabled: false,
        isCore: false,
        routes: ['/pulse-messenger'],
        components: ['MessengerPage', 'SecureChat', 'GroupChannels'],
        icon: <MessageCircle className="h-4 w-4" />,
        version: '1.2.0',
        lastUpdated: '2024-01-10',
        status: 'inactive',
        usage: 34,
        dependencies: ['encryption', 'websockets', 'real-time']
      },
      {
        id: 'rating-system',
        name: 'Rating & Reviews',
        category: 'Tools',
        description: 'Rating system for services, politicians, and civic entities',
        isEnabled: true,
        isCore: false,
        routes: ['/ratings'],
        components: ['TenderRatingsPage', 'ReviewSystem', 'RatingAnalytics'],
        icon: <Star className="h-4 w-4" />,
        version: '2.0.0',
        lastUpdated: '2024-01-19',
        status: 'active',
        usage: 67,
        dependencies: ['analytics', 'moderation']
      },
      {
        id: 'civic-education',
        name: 'Civic Education Hub',
        category: 'Education',
        description: 'Constitutional law, civic rights, and educational resources',
        isEnabled: true,
        isCore: false,
        routes: ['/laws', '/government-hierarchy'],
        components: ['CivicEducationHub', 'CivicShield', 'LegalResources'],
        icon: <BookOpen className="h-4 w-4" />,
        version: '1.6.0',
        lastUpdated: '2024-01-17',
        status: 'active',
        usage: 52,
        dependencies: ['content-management', 'search']
      },

      // GOVERNMENT FEATURES
      {
        id: 'judiciary-tracker',
        name: 'Judiciary Tracker',
        category: 'Government',
        description: 'Court system, judicial proceedings, and legal transparency',
        isEnabled: true,
        isCore: false,
        routes: ['/judiciary'],
        components: ['JudiciaryPage', 'CourtTracker', 'LegalCases'],
        icon: <Scale className="h-4 w-4" />,
        version: '1.1.0',
        lastUpdated: '2024-01-12',
        status: 'active',
        usage: 41,
        dependencies: ['legal-database', 'document-viewer']
      },
      {
        id: 'legislation-tracker',
        name: 'Legislation Tracker',
        category: 'Government',
        description: 'Bills, laws, and legislative process monitoring',
        isEnabled: true,
        isCore: false,
        routes: ['/legislation'],
        components: ['LegislationTracker', 'BillTracker', 'LawDatabase'],
        icon: <FileText className="h-4 w-4" />,
        version: '1.8.0',
        lastUpdated: '2024-01-16',
        status: 'active',
        usage: 48,
        dependencies: ['document-processing', 'notifications']
      }
    ];

    const mockStats: SystemStats = {
      totalUsers: 250847,
      activeFeatures: mockFeatures.filter(f => f.isEnabled).length,
      totalPolls: 15420,
      totalPoliticians: 342,
      totalVillages: 15678,
      systemHealth: 94,
      uptime: '99.8%',
      dataSize: '2.3 TB'
    };

    setTimeout(() => {
      setFeatures(mockFeatures);
      setSystemStats(mockStats);
      setLoading(false);
    }, 1000);
  }, []);

  const handleToggleFeature = async (featureId: string, newState: boolean) => {
    const feature = features.find(f => f.id === featureId);
    
    if (feature?.isCore && !newState) {
      toast({
        title: "Cannot Disable Core Feature",
        description: "Core features are essential for platform functionality and cannot be disabled.",
        variant: "destructive"
      });
      return;
    }

    setFeatures(prev => prev.map(f => 
      f.id === featureId 
        ? { ...f, isEnabled: newState, status: newState ? 'active' : 'inactive' }
        : f
    ));

    toast({
      title: newState ? "Feature Enabled" : "Feature Disabled",
      description: `${feature?.name} has been ${newState ? 'enabled' : 'disabled'} successfully.`,
      variant: newState ? "default" : "destructive"
    });

    // In real implementation, this would call your API
    console.log(`Feature ${featureId} ${newState ? 'enabled' : 'disabled'}`);
  };

  const filteredFeatures = features.filter(feature => {
    const matchesCategory = selectedCategory === 'all' || feature.category === selectedCategory;
    const matchesSearch = feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feature.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedFeatures = [...filteredFeatures].sort((a, b) => {
    switch (sortBy) {
      case 'usage':
        return b.usage - a.usage;
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const categories = ['all', ...Array.from(new Set(features.map(f => f.category)))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-gray-500';
      case 'maintenance': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className={`h-4 w-4 ${getStatusColor(status)}`} />;
      case 'inactive': return <XCircle className={`h-4 w-4 ${getStatusColor(status)}`} />;
      case 'maintenance': return <AlertTriangle className={`h-4 w-4 ${getStatusColor(status)}`} />;
      case 'error': return <AlertTriangle className={`h-4 w-4 ${getStatusColor(status)}`} />;
      default: return <Info className={`h-4 w-4 ${getStatusColor(status)}`} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2">Loading admin panel...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">CamerPulse Admin Control Center</h1>
          <p className="text-muted-foreground text-lg">
            Complete platform management, feature control, and system monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save All Changes
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      {systemStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{systemStats.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Puzzle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{systemStats.activeFeatures}</p>
                  <p className="text-xs text-muted-foreground">Active Features</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Vote className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{systemStats.totalPolls.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Polls</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-2xl font-bold">{systemStats.totalPoliticians}</p>
                  <p className="text-xs text-muted-foreground">Politicians</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Home className="h-5 w-5 text-cyan-600" />
                <div>
                  <p className="text-2xl font-bold">{systemStats.totalVillages.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Villages</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{systemStats.systemHealth}%</p>
                  <p className="text-xs text-muted-foreground">System Health</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-2xl font-bold">{systemStats.uptime}</p>
                  <p className="text-xs text-muted-foreground">Uptime</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-2xl font-bold">{systemStats.dataSize}</p>
                  <p className="text-xs text-muted-foreground">Data Size</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Feature Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Puzzle className="h-5 w-5" />
            Platform Features & Plugin Management
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Enable or disable platform features, manage plugins, and control functionality
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Features</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="sm:w-48">
              <Label htmlFor="category">Filter by Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="sm:w-32">
              <Label htmlFor="sort">Sort By</Label>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'name' | 'usage' | 'status')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="usage">Usage</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {sortedFeatures.map((feature) => (
              <Card key={feature.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <div className="flex items-center space-x-2">
                    {feature.icon}
                    <div>
                      <CardTitle className="text-sm font-medium">{feature.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{feature.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {feature.isCore && (
                      <Badge variant="secondary" className="text-xs">Core</Badge>
                    )}
                    <Switch
                      checked={feature.isEnabled}
                      onCheckedChange={(checked) => handleToggleFeature(feature.id, checked)}
                      disabled={feature.isCore && !feature.isEnabled}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{feature.description}</p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(feature.status)}
                      <span className={getStatusColor(feature.status)}>{feature.status}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">v{feature.version}</Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Usage</span>
                      <span>{feature.usage}%</span>
                    </div>
                    <Progress value={feature.usage} className="h-1" />
                  </div>
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{feature.routes.length} routes</span>
                    <span>Updated {feature.lastUpdated}</span>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setSelectedFeature(feature)}
                  >
                    <Info className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {sortedFeatures.length === 0 && (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No features found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-semibold mb-1">User Management</h3>
            <p className="text-sm text-muted-foreground">Manage users, roles, and permissions</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <h3 className="font-semibold mb-1">Analytics Dashboard</h3>
            <p className="text-sm text-muted-foreground">View platform analytics and insights</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Shield className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-semibold mb-1">Security Center</h3>
            <p className="text-sm text-muted-foreground">Security settings and monitoring</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Database className="h-8 w-8 mx-auto mb-2 text-amber-600" />
            <h3 className="font-semibold mb-1">Database Management</h3>
            <p className="text-sm text-muted-foreground">Backup, optimize, and maintain data</p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Details Modal */}
      {selectedFeature && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-3">
                {selectedFeature.icon}
                <div>
                  <CardTitle className="text-xl">{selectedFeature.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{selectedFeature.category} • v{selectedFeature.version}</p>
                </div>
              </div>
              <Button variant="ghost" onClick={() => setSelectedFeature(null)}>
                <XCircle className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedFeature.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Routes ({selectedFeature.routes.length})</h4>
                  <div className="space-y-1">
                    {selectedFeature.routes.map((route) => (
                      <Badge key={route} variant="outline" className="mr-2 mb-1">
                        {route}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Components ({selectedFeature.components.length})</h4>
                  <div className="space-y-1">
                    {selectedFeature.components.map((component) => (
                      <Badge key={component} variant="secondary" className="mr-2 mb-1">
                        {component}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Dependencies ({selectedFeature.dependencies.length})</h4>
                <div className="space-y-1">
                  {selectedFeature.dependencies.map((dep) => (
                    <Badge key={dep} variant="outline" className="mr-2 mb-1">
                      {dep}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-md">
                  <p className="text-lg font-bold">{selectedFeature.usage}%</p>
                  <p className="text-xs text-muted-foreground">Usage Rate</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-md">
                  <p className="text-lg font-bold">{selectedFeature.status}</p>
                  <p className="text-xs text-muted-foreground">Current Status</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-md">
                  <p className="text-lg font-bold">{selectedFeature.isCore ? 'Yes' : 'No'}</p>
                  <p className="text-xs text-muted-foreground">Core Feature</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-md">
                  <p className="text-lg font-bold">{selectedFeature.lastUpdated}</p>
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedFeature(null)}>
                  Close
                </Button>
                <Button 
                  variant={selectedFeature.isEnabled ? "destructive" : "default"}
                  onClick={() => {
                    handleToggleFeature(selectedFeature.id, !selectedFeature.isEnabled);
                    setSelectedFeature(null);
                  }}
                  disabled={selectedFeature.isCore && selectedFeature.isEnabled}
                >
                  {selectedFeature.isEnabled ? 'Disable Feature' : 'Enable Feature'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ComprehensiveAdminPanel;