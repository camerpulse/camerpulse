import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { MapPin, Star, Search, Users, TrendingUp, AlertCircle, MessageCircle, FileText, Share2, Bell, Eye } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const mockCouncils = [
  {
    id: 'council-1',
    name: 'Yaounde City Council',
    region: 'Centre',
    division: 'Mfoundi',
    mayor: 'Luc Messi Atangana',
    population: 3200000,
    rating: 4.1,
    projects: 15,
    status: 'active',
    badges: ['Most Active Council'],
    budget: '45B FCFA',
    budgetUtilization: 73,
    lastUpdate: '1 day ago',
    transparency: 81,
    serviceDelivery: 87,
    responseTime: '2.2 days',
    completedProjects: 32,
    area: '923 km²',
    wards: 7,
    villages: 128,
    councilors: 120,
    establishedYear: 1941,
    totalRatings: 892,
    recentActivity: 'New waste management system launched'
  },
  {
    id: 'council-2',
    name: 'Douala City Council',
    region: 'Littoral',
    division: 'Wouri',
    mayor: 'Roger Mbassa Ndine',
    population: 2800000,
    rating: 3.9,
    projects: 22,
    status: 'active',
    badges: ['Economic Hub'],
    budget: '52B FCFA',
    budgetUtilization: 68,
    lastUpdate: '2 days ago',
    transparency: 78,
    serviceDelivery: 83,
    responseTime: '2.5 days',
    completedProjects: 41,
    area: '923 km²',
    wards: 6,
    villages: 89,
    councilors: 95,
    establishedYear: 1956,
    totalRatings: 1123,
    recentActivity: 'Port modernization project approved'
  },
  {
    id: 'council-3',
    name: 'Bamenda City Council',
    region: 'Northwest',
    division: 'Mezam',
    mayor: 'Paul Achobang',
    population: 800000,
    rating: 3.4,
    projects: 8,
    status: 'flagged',
    badges: ['Flagged by Citizens'],
    budget: '18B FCFA',
    budgetUtilization: 58,
    lastUpdate: '1 week ago',
    transparency: 65,
    serviceDelivery: 72,
    responseTime: '4.1 days',
    completedProjects: 18,
    area: '923 km²',
    wards: 3,
    villages: 45,
    councilors: 68,
    establishedYear: 1963,
    totalRatings: 432,
    recentActivity: 'Security concerns being addressed'
  },
  {
    id: 'council-4',
    name: 'Garoua City Council',
    region: 'North',
    division: 'Benoue',
    mayor: 'Mohamadou Abba Kaka',
    population: 1500000,
    rating: 3.7,
    projects: 12,
    status: 'active',
    badges: ['Development Leader'],
    budget: '28B FCFA',
    budgetUtilization: 75,
    lastUpdate: '3 days ago',
    transparency: 74,
    serviceDelivery: 79,
    responseTime: '3.1 days',
    completedProjects: 25,
    area: '1200 km²',
    wards: 5,
    villages: 67,
    councilors: 85,
    establishedYear: 1952,
    totalRatings: 634,
    recentActivity: 'New water distribution network completed'
  },
  {
    id: 'council-5',
    name: 'Bafoussam City Council',
    region: 'West',
    division: 'Mifi',
    mayor: 'Celestin Tawamba',
    population: 900000,
    rating: 3.8,
    projects: 18,
    status: 'active',
    badges: ['Agricultural Hub'],
    budget: '22B FCFA',
    budgetUtilization: 82,
    lastUpdate: '2 days ago',
    transparency: 76,
    serviceDelivery: 84,
    responseTime: '2.8 days',
    completedProjects: 28,
    area: '850 km²',
    wards: 4,
    villages: 92,
    councilors: 78,
    establishedYear: 1958,
    totalRatings: 567,
    recentActivity: 'Farmers market modernization project launched'
  }
];

const CouncilsDirectory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const regions = ['Centre', 'Littoral', 'Northwest', 'West', 'North', 'Far North', 'East', 'South', 'Southwest', 'Adamawa'];

  const filteredCouncils = useMemo(() => {
    let filtered = mockCouncils.filter(council => {
      const matchesSearch = council.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           council.mayor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           council.division.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = regionFilter === 'all' || council.region === regionFilter;
      const matchesStatus = statusFilter === 'all' || council.status === statusFilter;
      const matchesRating = ratingFilter === 'all' || 
        (ratingFilter === 'high' && council.rating >= 4) ||
        (ratingFilter === 'medium' && council.rating >= 3 && council.rating < 4) ||
        (ratingFilter === 'low' && council.rating < 3);
      
      return matchesSearch && matchesRegion && matchesStatus && matchesRating;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'projects':
          return b.projects - a.projects;
        case 'budget':
          return parseFloat(b.budget.replace(/[^0-9.]/g, '')) - parseFloat(a.budget.replace(/[^0-9.]/g, ''));
        case 'transparency':
          return b.transparency - a.transparency;
        case 'population':
          return b.population - a.population;
        case 'service':
          return b.serviceDelivery - a.serviceDelivery;
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [searchTerm, regionFilter, statusFilter, ratingFilter, sortBy]);

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Most Active Council':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Economic Hub':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Development Leader':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Agricultural Hub':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Flagged by Citizens':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'under_audit':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'flagged':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <TrendingUp className="h-4 w-4 text-green-500" />;
    }
  };

  const handleSendFeedback = (id: string) => {
    toast({
      title: "Feedback Form",
      description: "Feedback form would open for this council.",
    });
  };

  const handleStartPetition = (id: string) => {
    toast({
      title: "Petition Started",
      description: "Petition form would open for this council.",
    });
  };

  const handleFollowUpdates = (id: string) => {
    toast({
      title: "Following Updates",
      description: "You will now receive updates from this council.",
    });
  };

  const renderCouncilCard = (council: any) => (
    <Card key={council.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer animate-fade-in group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <MapPin className="h-8 w-8 text-primary mt-1" />
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {council.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground font-medium">{council.division} Division</p>
              <p className="text-sm text-muted-foreground mt-1">Mayor: {council.mayor}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(council.status)}
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">{council.rating}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Projects</span>
              <span className="font-medium">{council.projects}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Completed</span>
              <span className="font-medium">{council.completedProjects}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Population</span>
              <span className="font-medium">{(council.population / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service Delivery</span>
              <span className="font-medium">{council.serviceDelivery}%</span>
            </div>
          </div>

          {/* Budget Utilization */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Budget: {council.budget}</span>
              <span className="font-medium">{council.budgetUtilization}%</span>
            </div>
            <Progress value={council.budgetUtilization} className="h-2" />
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Wards</span>
              <span>{council.wards}</span>
            </div>
            <div className="flex justify-between">
              <span>Villages</span>
              <span>{council.villages}</span>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="p-2 bg-muted/50 rounded text-xs">
            <span className="text-muted-foreground">Recent: </span>
            <span className="font-medium">{council.recentActivity}</span>
          </div>
          
          {council.badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {council.badges.map((badge: string, index: number) => (
                <Badge key={index} className={getBadgeColor(badge)}>
                  {badge}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button 
              size="sm" 
              onClick={() => navigate(`/directory/council/${council.id}`)}
              className="w-full"
            >
              <Eye className="h-3 w-3 mr-1" />
              View Details
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleSendFeedback(council.id)}
              className="w-full"
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              Feedback
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-1">
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => handleStartPetition(council.id)}
              className="text-xs px-2"
            >
              <FileText className="h-3 w-3 mr-1" />
              Petition
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => handleFollowUpdates(council.id)}
              className="text-xs px-2"
            >
              <Bell className="h-3 w-3 mr-1" />
              Follow
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              className="text-xs px-2"
            >
              <Share2 className="h-3 w-3 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Local Councils</h1>
            <p className="text-muted-foreground">
              Explore and engage with Cameroon's local councils and municipalities
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {filteredCouncils.length} Councils
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            Avg Rating: {(filteredCouncils.reduce((acc, c) => acc + c.rating, 0) / filteredCouncils.length).toFixed(1)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Total Population: {(filteredCouncils.reduce((acc, c) => acc + c.population, 0) / 1000000).toFixed(1)}M
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search councils..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Regions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {regions.map(region => (
              <SelectItem key={region} value={region}>{region}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="under_audit">Under Audit</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
          </SelectContent>
        </Select>

        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Ratings" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="high">High (4.0+)</SelectItem>
            <SelectItem value="medium">Medium (3.0-3.9)</SelectItem>
            <SelectItem value="low">Low (Below 3.0)</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="projects">Projects</SelectItem>
            <SelectItem value="budget">Budget</SelectItem>
            <SelectItem value="transparency">Transparency</SelectItem>
            <SelectItem value="population">Population</SelectItem>
            <SelectItem value="service">Service Delivery</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Council Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCouncils.map(renderCouncilCard)}
      </div>

      {filteredCouncils.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No councils found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default CouncilsDirectory;