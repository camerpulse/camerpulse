import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Vote, Clock, CheckCircle, XCircle, Flag, MessageSquare, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface CivicIssue {
  id: string;
  issue_type: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  reported_by: string;
  reported_at: string;
  resolved_at?: string;
  resolution_notes?: string;
  support_count: number;
  comment_count: number;
  category: string;
  location_description?: string;
  estimated_cost?: number;
  affected_population?: number;
}

interface Petition {
  id: string;
  title: string;
  description: string;
  petition_status: string;
  target_authority: string;
  signature_goal: number;
  signatures_count: number;
  created_by: string;
  created_at: string;
  deadline?: string;
  success_criteria?: string;
  updates?: string[];
}

interface VillageCivicActivityProps {
  villageId: string;
  villageName: string;
}

export const VillageCivicActivity: React.FC<VillageCivicActivityProps> = ({ villageId, villageName }) => {
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportIssueDialogOpen, setReportIssueDialogOpen] = useState(false);
  const [createPetitionDialogOpen, setCreatePetitionDialogOpen] = useState(false);

  const issueCategories = [
    { value: 'infrastructure', label: 'Infrastructure', icon: AlertTriangle },
    { value: 'health', label: 'Health & Safety', icon: AlertTriangle },
    { value: 'education', label: 'Education', icon: AlertTriangle },
    { value: 'environment', label: 'Environment', icon: AlertTriangle },
    { value: 'governance', label: 'Governance', icon: AlertTriangle },
    { value: 'social', label: 'Social Issues', icon: AlertTriangle },
    { value: 'economic', label: 'Economic', icon: AlertTriangle }
  ];

  const issueStatuses = [
    { value: 'reported', label: 'Reported', icon: Flag, color: 'outline' },
    { value: 'acknowledged', label: 'Acknowledged', icon: Clock, color: 'secondary' },
    { value: 'in_progress', label: 'In Progress', icon: Clock, color: 'warning' },
    { value: 'resolved', label: 'Resolved', icon: CheckCircle, color: 'success' },
    { value: 'closed', label: 'Closed', icon: XCircle, color: 'destructive' }
  ];

  const priorities = [
    { value: 'low', label: 'Low Priority', color: 'outline' },
    { value: 'medium', label: 'Medium Priority', color: 'secondary' },
    { value: 'high', label: 'High Priority', color: 'warning' },
    { value: 'urgent', label: 'Urgent', color: 'destructive' }
  ];

  // Sample data for demo
  const sampleIssues: CivicIssue[] = [
    {
      id: '1',
      issue_type: 'infrastructure',
      title: 'Main Road Needs Repair',
      description: 'The main road connecting to the village has several potholes and becomes impassable during rainy season, affecting transportation and emergency access.',
      status: 'in_progress',
      priority: 'high',
      reported_by: 'Marie Fotso',
      reported_at: '2024-01-15T10:00:00Z',
      support_count: 45,
      comment_count: 12,
      category: 'infrastructure',
      location_description: 'Main access road, approximately 2km stretch',
      estimated_cost: 5000000,
      affected_population: 800
    },
    {
      id: '2',
      issue_type: 'health',
      title: 'Need for Additional Health Clinic',
      description: 'Current health center is understaffed and lacks equipment. Community needs a satellite clinic to serve remote areas.',
      status: 'acknowledged',
      priority: 'medium',
      reported_by: 'Dr. Paul Kenne',
      reported_at: '2024-02-01T14:30:00Z',
      support_count: 67,
      comment_count: 8,
      category: 'health',
      estimated_cost: 15000000,
      affected_population: 500
    },
    {
      id: '3',
      issue_type: 'education',
      title: 'School Lacks Computer Lab',
      description: 'Primary school needs modern computer lab to prepare students for digital literacy requirements.',
      status: 'reported',
      priority: 'medium',
      reported_by: 'Grace Mbenda',
      reported_at: '2024-02-10T09:15:00Z',
      support_count: 32,
      comment_count: 15,
      category: 'education',
      estimated_cost: 3000000,
      affected_population: 300
    },
    {
      id: '4',
      issue_type: 'environment',
      title: 'Water Source Contamination',
      description: 'One of the village water sources shows signs of contamination. Immediate testing and treatment required.',
      status: 'resolved',
      priority: 'urgent',
      reported_by: 'Emmanuel K.',
      reported_at: '2024-01-20T16:00:00Z',
      resolved_at: '2024-01-25T12:00:00Z',
      resolution_notes: 'Water source has been tested, treated, and declared safe. New filtration system installed.',
      support_count: 89,
      comment_count: 23,
      category: 'environment',
      estimated_cost: 2000000,
      affected_population: 1200
    }
  ];

  const samplePetitions: Petition[] = [
    {
      id: '1',
      title: 'Establish Weekly Mobile Banking Service',
      description: 'Petition to government and banks to establish weekly mobile banking service in the village to improve financial inclusion and reduce travel to distant banks.',
      petition_status: 'active',
      target_authority: 'Regional Governor & Banking Association',
      signature_goal: 200,
      signatures_count: 156,
      created_by: 'Village Development Committee',
      created_at: '2024-01-10T10:00:00Z',
      deadline: '2024-03-10T23:59:59Z',
      success_criteria: 'Agreement from at least one major bank to provide weekly service',
      updates: [
        'Petition submitted to Regional Governor office',
        'Meeting scheduled with banking association representative',
        'Local support continues to grow'
      ]
    },
    {
      id: '2',
      title: 'Request for Secondary School Construction',
      description: 'Community petition to Ministry of Education for construction of a secondary school to serve the village and surrounding areas.',
      petition_status: 'under_review',
      target_authority: 'Ministry of Education',
      signature_goal: 500,
      signatures_count: 487,
      created_by: 'Parents Association',
      created_at: '2023-11-15T09:00:00Z',
      deadline: '2024-05-15T23:59:59Z',
      success_criteria: 'Ministry approval and budget allocation for construction',
      updates: [
        'Petition reached signature goal',
        'Under review by Ministry of Education',
        'Site survey completed',
        'Awaiting final approval and budget allocation'
      ]
    }
  ];

  useEffect(() => {
    // Demo mode - using sample data
    setIssues(sampleIssues);
    setPetitions(samplePetitions);
    setLoading(false);
  }, [villageId]);

  const getStatusInfo = (status: string) => {
    return issueStatuses.find(s => s.value === status) || issueStatuses[0];
  };

  const getPriorityInfo = (priority: string) => {
    return priorities.find(p => p.value === priority) || priorities[0];
  };

  const getCategoryInfo = (category: string) => {
    return issueCategories.find(c => c.value === category) || issueCategories[0];
  };

  const IssueCard = ({ issue }: { issue: CivicIssue }) => {
    const statusInfo = getStatusInfo(issue.status);
    const priorityInfo = getPriorityInfo(issue.priority);
    const categoryInfo = getCategoryInfo(issue.category);
    const StatusIcon = statusInfo.icon;
    const CategoryIcon = categoryInfo.icon;

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-bold mb-2 flex items-center gap-2">
                <CategoryIcon className="h-5 w-5 text-muted-foreground" />
                {issue.title}
              </CardTitle>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={statusInfo.color as any}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusInfo.label}
                </Badge>
                <Badge variant={priorityInfo.color as any}>
                  {priorityInfo.label}
                </Badge>
                <Badge variant="outline">
                  {categoryInfo.label}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {issue.description}
          </p>

          {/* Issue Details */}
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{issue.affected_population?.toLocaleString() || 'N/A'} affected</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Reported {new Date(issue.reported_at).toLocaleDateString()}</span>
            </div>
            {issue.estimated_cost && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Est. Cost:</span>
                <span className="font-medium">{(issue.estimated_cost / 1000000).toFixed(1)}M FCFA</span>
              </div>
            )}
            {issue.location_description && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium truncate" title={issue.location_description}>
                  {issue.location_description}
                </span>
              </div>
            )}
          </div>

          {/* Community Support */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Users className="h-4 w-4 mr-1" />
                {issue.support_count} support
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <MessageSquare className="h-4 w-4 mr-1" />
                {issue.comment_count} comments
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              by {issue.reported_by}
            </div>
          </div>

          {/* Resolution Info */}
          {issue.status === 'resolved' && issue.resolution_notes && (
            <div className="mt-4 p-3 bg-success/10 rounded-lg border border-success/20">
              <h5 className="font-medium text-sm text-success mb-1">Resolution</h5>
              <p className="text-xs text-muted-foreground">{issue.resolution_notes}</p>
              {issue.resolved_at && (
                <p className="text-xs text-muted-foreground mt-1">
                  Resolved on {new Date(issue.resolved_at).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const PetitionCard = ({ petition }: { petition: Petition }) => {
    const progressPercentage = (petition.signatures_count / petition.signature_goal) * 100;
    const isSuccessful = petition.signatures_count >= petition.signature_goal;
    const daysLeft = petition.deadline ? Math.ceil((new Date(petition.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-bold mb-2 flex items-center gap-2">
                <Vote className="h-5 w-5 text-primary" />
                {petition.title}
              </CardTitle>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={petition.petition_status === 'active' ? 'secondary' : 'outline'}>
                  {petition.petition_status.replace('_', ' ').toUpperCase()}
                </Badge>
                {isSuccessful && (
                  <Badge variant="success">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Goal Reached
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {petition.description}
          </p>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Signatures</span>
              <span className="text-sm text-muted-foreground">
                {petition.signatures_count.toLocaleString()} / {petition.signature_goal.toLocaleString()}
              </span>
            </div>
            <Progress value={Math.min(progressPercentage, 100)} className="h-2" />
          </div>

          {/* Petition Details */}
          <div className="space-y-2 text-sm mb-4">
            <div>
              <span className="text-muted-foreground">Target Authority:</span>
              <span className="ml-2 font-medium">{petition.target_authority}</span>
            </div>
            {daysLeft !== null && (
              <div>
                <span className="text-muted-foreground">Deadline:</span>
                <span className={`ml-2 font-medium ${daysLeft < 7 ? 'text-warning' : ''}`}>
                  {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                </span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Created by:</span>
              <span className="ml-2 font-medium">{petition.created_by}</span>
            </div>
          </div>

          {/* Latest Updates */}
          {petition.updates && petition.updates.length > 0 && (
            <div className="border-t pt-3">
              <h5 className="font-medium text-sm mb-2">Latest Updates</h5>
              <ul className="text-xs space-y-1">
                {petition.updates.slice(0, 2).map((update, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span className="text-muted-foreground">{update}</span>
                  </li>
                ))}
                {petition.updates.length > 2 && (
                  <li className="text-xs text-primary">+{petition.updates.length - 2} more updates...</li>
                )}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold">Civic Activity</h3>
          <p className="text-muted-foreground">
            {issues.length} reported issues • {petitions.length} active petitions
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={reportIssueDialogOpen} onOpenChange={setReportIssueDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report Issue
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Report Community Issue</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Issue reporting functionality will be available when the database is fully connected.
                </p>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={createPetitionDialogOpen} onOpenChange={setCreatePetitionDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Petition
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Community Petition</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Petition creation functionality will be available when the database is fully connected.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="issues" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="issues">Community Issues</TabsTrigger>
          <TabsTrigger value="petitions">Petitions</TabsTrigger>
        </TabsList>

        <TabsContent value="issues" className="space-y-6">
          {/* Issues Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {issueStatuses.slice(0, 4).map(status => {
              const count = issues.filter(i => i.status === status.value).length;
              const Icon = status.icon;
              return (
                <Card key={status.value} className="text-center p-4">
                  <div className="flex items-center justify-center mb-2">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-primary">{count}</div>
                  <div className="text-sm text-muted-foreground">{status.label}</div>
                </Card>
              );
            })}
          </div>

          {/* Issues List */}
          <div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="flex gap-2">
                        <div className="h-5 bg-muted rounded w-16"></div>
                        <div className="h-5 bg-muted rounded w-20"></div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded"></div>
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : issues.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Issues Reported</h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to report a community issue that needs attention.
                  </p>
                  <Button onClick={() => setReportIssueDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Report First Issue
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {issues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="petitions" className="space-y-6">
          {/* Petitions Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-primary">{petitions.length}</div>
              <div className="text-sm text-muted-foreground">Total Petitions</div>
            </Card>
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-secondary">
                {petitions.filter(p => p.petition_status === 'active').length}
              </div>
              <div className="text-sm text-muted-foreground">Active</div>
            </Card>
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-success">
                {petitions.filter(p => p.signatures_count >= p.signature_goal).length}
              </div>
              <div className="text-sm text-muted-foreground">Goal Reached</div>
            </Card>
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-warning">
                {petitions.reduce((sum, p) => sum + p.signatures_count, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Signatures</div>
            </Card>
          </div>

          {/* Petitions List */}
          <div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-5 bg-muted rounded w-20"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="h-4 bg-muted rounded"></div>
                        <div className="h-2 bg-muted rounded"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : petitions.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Vote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Petitions</h3>
                  <p className="text-muted-foreground mb-4">
                    Start a petition to advocate for change in your community.
                  </p>
                  <Button onClick={() => setCreatePetitionDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Petition
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {petitions.map((petition) => (
                  <PetitionCard key={petition.id} petition={petition} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};