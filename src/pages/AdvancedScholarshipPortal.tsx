import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GraduationCap, 
  Search, 
  Filter, 
  Calendar,
  MapPin,
  DollarSign,
  FileText,
  Clock,
  User,
  Mail,
  Phone,
  Globe,
  Award,
  BookOpen,
  Users,
  TrendingUp
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ScholarshipProgram {
  id: string;
  program_name: string;
  description: string;
  provider_organization: string;
  scholarship_type: string;
  target_level: string;
  amount_xaf?: number;
  available_slots: number;
  application_start_date?: string;
  application_end_date?: string;
  eligibility_criteria: string[];
  required_documents: string[];
  selection_criteria: string[];
  regions_eligible: string[];
  contact_email?: string;
  contact_phone?: string;
  website_url?: string;
  status: string;
  created_at: string;
}

interface ScholarshipApplication {
  id: string;
  scholarship_id: string;
  applicant_name: string;
  applicant_email: string;
  region: string;
  village?: string;
  status: string;
  submitted_at: string;
}

const AdvancedScholarshipPortal: React.FC = () => {
  const { user } = useAuth();
  const [scholarships, setScholarships] = useState<ScholarshipProgram[]>([]);
  const [applications, setApplications] = useState<ScholarshipApplication[]>([]);
  const [filteredScholarships, setFilteredScholarships] = useState<ScholarshipProgram[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');

  const regions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  const scholarshipTypes = [
    { value: 'academic', label: 'Academic Excellence', icon: BookOpen, color: 'bg-blue-500' },
    { value: 'vocational', label: 'Vocational Training', icon: Award, color: 'bg-green-500' },
    { value: 'research', label: 'Research Grants', icon: TrendingUp, color: 'bg-purple-500' },
    { value: 'community', label: 'Community Service', icon: Users, color: 'bg-orange-500' }
  ];

  const targetLevels = [
    { value: 'primary', label: 'Primary Education' },
    { value: 'secondary', label: 'Secondary Education' },
    { value: 'university', label: 'University' },
    { value: 'postgraduate', label: 'Postgraduate' }
  ];

  useEffect(() => {
    fetchData();
    setupRealtimeSubscriptions();
  }, []);

  useEffect(() => {
    filterScholarships();
  }, [scholarships, searchTerm, selectedType, selectedLevel, selectedRegion]);

  const fetchData = async () => {
    try {
      // Fetch scholarships
      const { data: scholarshipData, error: scholarshipError } = await supabase
        .from('scholarship_programs')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (scholarshipError) throw scholarshipError;

      // Fetch user's applications if logged in
      if (user) {
        const { data: applicationData, error: applicationError } = await supabase
          .from('scholarship_applications')
          .select('*')
          .eq('applicant_user_id', user.id);

        if (applicationError) throw applicationError;
        setApplications(applicationData || []);
      }

      setScholarships(scholarshipData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load scholarship data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    const scholarshipChannel = supabase
      .channel('scholarships-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scholarship_programs'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setScholarships(prev => [payload.new as ScholarshipProgram, ...prev]);
            toast({
              title: "New Scholarship",
              description: "A new scholarship program has been added!",
            });
          } else if (payload.eventType === 'UPDATE') {
            setScholarships(prev => 
              prev.map(scholarship => 
                scholarship.id === payload.new.id ? payload.new as ScholarshipProgram : scholarship
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(scholarshipChannel);
    };
  };

  const filterScholarships = () => {
    let filtered = scholarships;

    if (searchTerm) {
      filtered = filtered.filter(scholarship =>
        scholarship.program_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scholarship.provider_organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scholarship.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType) {
      filtered = filtered.filter(scholarship => scholarship.scholarship_type === selectedType);
    }

    if (selectedLevel) {
      filtered = filtered.filter(scholarship => scholarship.target_level === selectedLevel);
    }

    if (selectedRegion) {
      filtered = filtered.filter(scholarship => 
        scholarship.regions_eligible.length === 0 || 
        scholarship.regions_eligible.includes(selectedRegion)
      );
    }

    setFilteredScholarships(filtered);
  };

  const getTypeConfig = (type: string) => {
    return scholarshipTypes.find(t => t.value === type) || scholarshipTypes[0];
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const isDeadlineApproaching = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDeadline <= 14 && daysUntilDeadline > 0;
  };

  const hasUserApplied = (scholarshipId: string) => {
    return applications.some(app => app.scholarship_id === scholarshipId);
  };

  const getStatistics = () => {
    const totalAmount = scholarships
      .filter(s => s.amount_xaf)
      .reduce((sum, s) => sum + (s.amount_xaf || 0), 0);

    const totalSlots = scholarships.reduce((sum, s) => sum + s.available_slots, 0);

    const typeDistribution = scholarshipTypes.map(type => ({
      ...type,
      count: scholarships.filter(s => s.scholarship_type === type.value).length
    }));

    return {
      totalScholarships: scholarships.length,
      totalAmount,
      totalSlots,
      typeDistribution,
      urgentScholarships: scholarships.filter(s => 
        s.application_end_date && isDeadlineApproaching(s.application_end_date)
      ).length
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = getStatistics();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap className="h-10 w-10" />
            <h1 className="text-4xl font-bold">Advanced Scholarship Portal</h1>
          </div>
          <p className="text-xl opacity-90 max-w-2xl">
            Find and apply for educational scholarships and opportunities across Cameroon
          </p>
          <div className="flex gap-4 mt-6">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {stats.totalScholarships} Programs Available
            </Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {stats.totalSlots} Scholarships Available
            </Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {formatAmount(stats.totalAmount)} Total Value
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full md:w-auto md:grid-cols-3">
            <TabsTrigger value="browse">Browse Scholarships</TabsTrigger>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              {stats.typeDistribution.map((type) => (
                <Card key={type.value}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${type.color} text-white`}>
                        <type.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{type.count}</p>
                        <p className="text-sm text-muted-foreground">{type.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="grid md:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search scholarships..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    className="p-2 border rounded-md"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <option value="">All Types</option>
                    {scholarshipTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  <select
                    className="p-2 border rounded-md"
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                  >
                    <option value="">All Levels</option>
                    {targetLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                  <select
                    className="p-2 border rounded-md"
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                  >
                    <option value="">All Regions</option>
                    {regions.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Advanced
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Urgent Deadlines Alert */}
            {stats.urgentScholarships > 0 && (
              <Card className="border-l-4 border-l-red-500 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-6 w-6 text-red-500" />
                    <div>
                      <h3 className="font-semibold text-red-800">Urgent: Application Deadlines Approaching</h3>
                      <p className="text-sm text-red-700">
                        {stats.urgentScholarships} scholarships have application deadlines within 14 days
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Scholarships Grid */}
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredScholarships.map((scholarship) => {
                const typeConfig = getTypeConfig(scholarship.scholarship_type);
                const isUrgent = scholarship.application_end_date && 
                  isDeadlineApproaching(scholarship.application_end_date);
                const userApplied = hasUserApplied(scholarship.id);

                return (
                  <Card key={scholarship.id} className={`relative ${isUrgent ? 'ring-2 ring-red-500' : ''}`}>
                    {isUrgent && (
                      <div className="absolute -top-2 -right-2">
                        <Badge className="bg-red-500">Deadline Soon</Badge>
                      </div>
                    )}
                    
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${typeConfig.color} text-white`}>
                            <typeConfig.icon className="h-4 w-4" />
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {scholarship.target_level}
                          </Badge>
                        </div>
                        {userApplied && (
                          <Badge className="bg-green-500">Applied</Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{scholarship.program_name}</CardTitle>
                      <CardDescription>
                        {scholarship.provider_organization}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {scholarship.description}
                      </p>

                      <div className="space-y-2">
                        {scholarship.amount_xaf && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-500" />
                            <span className="font-semibold text-green-600">
                              {formatAmount(scholarship.amount_xaf)}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">
                            {scholarship.available_slots} slots available
                          </span>
                        </div>

                        {scholarship.application_end_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-orange-500" />
                            <span className="text-sm">
                              Deadline: {new Date(scholarship.application_end_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        {scholarship.regions_eligible.length > 0 && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-purple-500" />
                            <span className="text-sm">
                              {scholarship.regions_eligible.length === 1 
                                ? scholarship.regions_eligible[0]
                                : `${scholarship.regions_eligible.length} regions eligible`
                              }
                            </span>
                          </div>
                        )}
                      </div>

                      {scholarship.eligibility_criteria.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Key Requirements:</p>
                          <div className="flex flex-wrap gap-1">
                            {scholarship.eligibility_criteria.slice(0, 2).map((criteria, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {criteria}
                              </Badge>
                            ))}
                            {scholarship.eligibility_criteria.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{scholarship.eligibility_criteria.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1">
                          View Details
                        </Button>
                        <Button 
                          size="sm" 
                          variant={userApplied ? "outline" : "default"}
                          disabled={userApplied}
                        >
                          {userApplied ? "Applied" : "Apply Now"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredScholarships.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Scholarships Found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or check back later for new programs
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            {user ? (
              <div>
                <h2 className="text-2xl font-bold mb-6">My Applications</h2>
                {applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.map((application) => {
                      const scholarship = scholarships.find(s => s.id === application.scholarship_id);
                      return (
                        <Card key={application.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold">{scholarship?.program_name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Applied on {new Date(application.submitted_at).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge 
                                className={
                                  application.status === 'accepted' ? 'bg-green-500' :
                                  application.status === 'rejected' ? 'bg-red-500' :
                                  application.status === 'under_review' ? 'bg-yellow-500' :
                                  'bg-blue-500'
                                }
                              >
                                {application.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="text-center py-12">
                    <CardContent>
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
                      <p className="text-muted-foreground">
                        Start by browsing available scholarships and submitting your applications
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Login Required</h3>
                  <p className="text-muted-foreground">
                    Please log in to view your scholarship applications
                  </p>
                  <Button className="mt-4">Sign In</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Application Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800">Start Early</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Begin your application process at least 2-3 months before the deadline
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800">Document Preparation</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Keep all required documents ready: transcripts, certificates, ID copies
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-medium text-purple-800">Personal Statement</h4>
                    <p className="text-sm text-purple-700 mt-1">
                      Write a compelling personal statement that highlights your goals and achievements
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Common Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Academic transcripts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Valid identification</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Recommendation letters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">Personal statement/essay</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Proof of residence</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedScholarshipPortal;