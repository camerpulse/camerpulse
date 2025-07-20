import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Building, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Phone,
  Mail,
  Globe,
  MapPin,
  User,
  Search,
  Filter,
  Calendar,
  DollarSign
} from "lucide-react";
import { CamerPlayHeader } from "@/components/Layout/CamerPlayHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface GovernmentAgency {
  id: string;
  name: string;
  short_name: string;
  type: string;
  region: string;
  contact_email: string;
  contact_phone: string;
  website_url: string;
  is_verified: boolean;
  integration_status: string;
  created_at: string;
}

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  reference_number: string;
  estimated_completion: string;
  created_at: string;
  agency?: GovernmentAgency;
}

const GovernmentPortal: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [agencies, setAgencies] = useState<GovernmentAgency[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateRequest, setShowCreateRequest] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    agency_id: ''
  });

  useEffect(() => {
    fetchGovernmentData();
  }, []);

  const fetchGovernmentData = async () => {
    try {
      // Fetch government agencies
      const { data: agenciesData, error: agenciesError } = await supabase
        .from('government_agencies')
        .select('*')
        .order('name', { ascending: true });

      if (agenciesError) throw agenciesError;
      setAgencies(agenciesData || []);

      // Fetch user's service requests if logged in
      if (user) {
        const { data: requestsData, error: requestsError } = await supabase
          .from('service_requests')
          .select(`
            *,
            agency:agency_id(*)
          `)
          .eq('submitted_by', user.id)
          .order('created_at', { ascending: false });

        if (requestsError) throw requestsError;
        setServiceRequests(requestsData || []);
      }

    } catch (error) {
      toast({
        title: "Error loading government data",
        description: "Could not load government portal data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitServiceRequest = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit a service request.",
        variant: "destructive",
      });
      return;
    }

    if (!newRequest.title || !newRequest.description || !newRequest.category) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('service_requests')
        .insert({
          ...newRequest,
          submitted_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Request submitted",
        description: "Your service request has been submitted successfully.",
      });

      setShowCreateRequest(false);
      setNewRequest({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        agency_id: ''
      });
      fetchGovernmentData();
    } catch (error) {
      toast({
        title: "Error submitting request",
        description: "Could not submit your service request.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'submitted': return 'outline';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getIntegrationBadge = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'disabled': return 'outline';
      default: return 'outline';
    }
  };

  const calculateProgress = (status: string) => {
    switch (status) {
      case 'submitted': return 25;
      case 'in_progress': return 75;
      case 'completed': return 100;
      default: return 0;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <CamerPlayHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading government portal...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CamerPlayHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Government Portal</h1>
              <p className="text-muted-foreground">Access government services and submit requests</p>
            </div>
            <Button onClick={() => setShowCreateRequest(true)}>
              <FileText className="mr-2 h-4 w-4" />
              New Service Request
            </Button>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Building className="h-8 w-8 text-primary" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{agencies.length}</p>
                    <p className="text-xs text-muted-foreground">Government Agencies</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{serviceRequests.length}</p>
                    <p className="text-xs text-muted-foreground">Your Requests</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">
                      {serviceRequests.filter(r => r.status === 'completed').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">
                      {serviceRequests.filter(r => r.status === 'in_progress').length}
                    </p>
                    <p className="text-xs text-muted-foreground">In Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="services" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="services" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Service Requests
              </TabsTrigger>
              <TabsTrigger value="agencies" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Government Agencies
              </TabsTrigger>
              <TabsTrigger value="directory" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Services Directory
              </TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="space-y-6">
              {showCreateRequest && (
                <Card>
                  <CardHeader>
                    <CardTitle>Submit New Service Request</CardTitle>
                    <CardDescription>Fill out the form below to submit a new service request</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Request Title</Label>
                        <Input
                          id="title"
                          value={newRequest.title}
                          onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                          placeholder="Brief description of your request"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={newRequest.category}
                          onValueChange={(value) => setNewRequest({...newRequest, category: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="civil_registration">Civil Registration</SelectItem>
                            <SelectItem value="business_license">Business License</SelectItem>
                            <SelectItem value="tax_services">Tax Services</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="infrastructure">Infrastructure</SelectItem>
                            <SelectItem value="social_services">Social Services</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                          value={newRequest.priority}
                          onValueChange={(value) => setNewRequest({...newRequest, priority: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="agency">Preferred Agency (Optional)</Label>
                        <Select
                          value={newRequest.agency_id}
                          onValueChange={(value) => setNewRequest({...newRequest, agency_id: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select agency" />
                          </SelectTrigger>
                          <SelectContent>
                            {agencies.map((agency) => (
                              <SelectItem key={agency.id} value={agency.id}>
                                {agency.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Detailed Description</Label>
                      <Textarea
                        id="description"
                        value={newRequest.description}
                        onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                        placeholder="Provide detailed information about your request"
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowCreateRequest(false)}>
                        Cancel
                      </Button>
                      <Button onClick={submitServiceRequest}>
                        Submit Request
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {serviceRequests.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No service requests found.</p>
                      <Button className="mt-4" onClick={() => setShowCreateRequest(true)}>
                        Submit Your First Request
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  serviceRequests.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                              <h3 className="font-semibold text-lg">{request.title}</h3>
                              <Badge variant={getStatusBadge(request.status)}>
                                {request.status.replace('_', ' ')}
                              </Badge>
                              <Badge variant={getPriorityBadge(request.priority)}>
                                {request.priority} priority
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                              {request.description}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Reference:</span>
                                <p className="font-mono">{request.reference_number}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Category:</span>
                                <p>{request.category.replace('_', ' ')}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Submitted:</span>
                                <p>{new Date(request.created_at).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Estimated Completion:</span>
                                <p>{request.estimated_completion ? new Date(request.estimated_completion).toLocaleDateString() : 'TBD'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span>{calculateProgress(request.status)}%</span>
                          </div>
                          <Progress value={calculateProgress(request.status)} className="h-2" />
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Last updated: {new Date(request.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="agencies" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {agencies.map((agency) => (
                  <Card key={agency.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{agency.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <MapPin className="h-4 w-4" />
                            {agency.region}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {agency.is_verified && (
                            <Badge variant="default">Verified</Badge>
                          )}
                          <Badge variant={getIntegrationBadge(agency.integration_status)}>
                            {agency.integration_status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Type:</span>
                            <span>{agency.type}</span>
                          </div>
                          {agency.contact_email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <a href={`mailto:${agency.contact_email}`} className="text-primary hover:underline">
                                {agency.contact_email}
                              </a>
                            </div>
                          )}
                          {agency.contact_phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <a href={`tel:${agency.contact_phone}`} className="text-primary hover:underline">
                                {agency.contact_phone}
                              </a>
                            </div>
                          )}
                          {agency.website_url && (
                            <div className="flex items-center gap-2 text-sm">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <a 
                                href={agency.website_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                Visit Website
                              </a>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-end">
                          <Button size="sm" onClick={() => {
                            setNewRequest({...newRequest, agency_id: agency.id});
                            setShowCreateRequest(true);
                          }}>
                            Request Service
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="directory" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Government Services Directory</CardTitle>
                  <CardDescription>Browse available government services by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { name: 'Civil Registration', description: 'Birth certificates, marriage licenses, death certificates', icon: User },
                      { name: 'Business Licensing', description: 'Business registration, permits, licenses', icon: Building },
                      { name: 'Tax Services', description: 'Tax filing, payments, refunds', icon: DollarSign },
                      { name: 'Healthcare Services', description: 'Medical records, health insurance, appointments', icon: CheckCircle },
                      { name: 'Education Services', description: 'School enrollment, transcripts, certification', icon: FileText },
                      { name: 'Infrastructure Services', description: 'Utilities, public works, maintenance requests', icon: Building },
                    ].map((service, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <service.icon className="h-8 w-8 text-primary flex-shrink-0" />
                            <div>
                              <h3 className="font-semibold mb-2">{service.name}</h3>
                              <p className="text-sm text-muted-foreground">{service.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default GovernmentPortal;