import React, { useState } from 'react';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { StatCard } from '../components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Scale, 
  Shield, 
  AlertTriangle, 
  Eye,
  Gavel,
  Users,
  FileText,
  Clock
} from 'lucide-react';

interface LegalJusticeModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const LegalJusticeModule: React.FC<LegalJusticeModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [activeTab, setActiveTab] = useState('cases');

  // Legal Cases Data
  const { data: legalCases } = useQuery({
    queryKey: ['admin-legal-cases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_cases')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    }
  });

  // Constitutional Violations Data
  const { data: violations } = useQuery({
    queryKey: ['admin-constitutional-violations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('constitutional_violations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    }
  });

  // Judiciary Members Data
  const { data: judiciary } = useQuery({
    queryKey: ['admin-judiciary-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('judiciary_members')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    }
  });

  // Corruption Cases Data
  const { data: corruptionCases } = useQuery({
    queryKey: ['admin-corruption-cases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('corruption_cases')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    }
  });

  // Whistleblower Submissions Data
  const { data: whistleblower } = useQuery({
    queryKey: ['admin-whistleblower-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whistleblower_submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'under_investigation':
        return <Badge className="bg-blue-100 text-blue-800">Under Investigation</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Legal & Justice System"
        description="Manage legal cases, judiciary, corruption tracking, and whistleblower submissions"
        icon={Scale}
        iconColor="text-cm-orange"
        badge={{
          text: "Justice & Transparency",
          variant: "default"
        }}
        onRefresh={() => {
          logActivity('legal_justice_refresh', { timestamp: new Date() });
        }}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Legal Cases"
          value={legalCases?.filter(c => c.case_status === 'ongoing').length || 0}
          icon={Scale}
          description="Ongoing cases"
          badge={{ text: `${legalCases?.filter(c => c.case_type === 'criminal').length || 0} Criminal Cases`, variant: "destructive" }}
        />
        <StatCard
          title="Constitutional Violations"
          value={violations?.length || 0}
          icon={Shield}
          description="Under investigation"
          trend={{ value: -5, isPositive: false, period: "this month" }}
        />
        <StatCard
          title="Corruption Cases"
          value={corruptionCases?.filter(c => c.case_status === 'active').length || 0}
          icon={AlertTriangle}
          description="Active investigations"
        />
        <StatCard
          title="Whistleblower Reports"
          value={whistleblower?.filter(w => w.verification_status === 'pending').length || 0}
          icon={Eye}
          description="Pending review"
          badge={{ text: `${whistleblower?.filter(w => w.is_anonymous).length || 0} Anonymous`, variant: "secondary" }}
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="cases">Legal Cases</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="judiciary">Judiciary</TabsTrigger>
          <TabsTrigger value="corruption">Corruption</TabsTrigger>
          <TabsTrigger value="whistleblower">Whistleblower</TabsTrigger>
        </TabsList>

        {/* Legal Cases Tab */}
        <TabsContent value="cases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Scale className="h-5 w-5 mr-2" />
                Legal Cases Management
              </CardTitle>
              <CardDescription>
                Track and manage legal cases and proceedings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button>Create New Case</Button>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Case Number</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {legalCases?.map((legalCase) => (
                      <TableRow key={legalCase.id}>
                        <TableCell className="font-mono text-sm">{legalCase.case_reference}</TableCell>
                        <TableCell className="font-medium">{legalCase.case_title}</TableCell>
                        <TableCell>{legalCase.case_type}</TableCell>
                        <TableCell>{getStatusBadge(legalCase.case_status)}</TableCell>
                        <TableCell>{getSeverityBadge('medium')}</TableCell>
                        <TableCell>{new Date(legalCase.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">View</Button>
                            <Button variant="outline" size="sm">Edit</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Constitutional Violations Tab */}
        <TabsContent value="violations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Constitutional Violations
              </CardTitle>
              <CardDescription>
                Monitor and track constitutional violations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Article Violated</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reported Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {violations?.map((violation) => (
                    <TableRow key={violation.id}>
                      <TableCell className="font-medium">{violation.violation_type}</TableCell>
                      <TableCell>{violation.constitutional_article_id}</TableCell>
                      <TableCell>{getSeverityBadge(violation.severity_level || 'medium')}</TableCell>
                      <TableCell>{getStatusBadge('pending')}</TableCell>
                      <TableCell>{new Date(violation.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Review</Button>
                          <Button variant="outline" size="sm">Investigate</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Judiciary Tab */}
        <TabsContent value="judiciary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gavel className="h-5 w-5 mr-2" />
                Judiciary Members
              </CardTitle>
              <CardDescription>
                Manage judiciary members and ratings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Court</TableHead>
                    <TableHead>Appointment Date</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {judiciary?.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name || 'N/A'}</TableCell>
                      <TableCell>Judge</TableCell>
                      <TableCell>{member.court_level}</TableCell>
                      <TableCell>{new Date(member.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="mr-1">N/A</span>
                          <span className="text-yellow-500">★</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Profile</Button>
                          <Button variant="outline" size="sm">Cases</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Corruption Cases Tab */}
        <TabsContent value="corruption" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Corruption Cases
              </CardTitle>
              <CardDescription>
                Track corruption investigations and cases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount (CFA)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {corruptionCases?.map((corruptionCase) => (
                    <TableRow key={corruptionCase.id}>
                      <TableCell className="font-medium">{corruptionCase.case_title}</TableCell>
                      <TableCell>{corruptionCase.case_type}</TableCell>
                      <TableCell className="font-mono">
                        {corruptionCase.amount_involved ? 
                          new Intl.NumberFormat('fr-FR').format(corruptionCase.amount_involved) : 'N/A'}
                      </TableCell>
                      <TableCell>{getStatusBadge(corruptionCase.case_status)}</TableCell>
                      <TableCell>{getSeverityBadge('medium')}</TableCell>
                      <TableCell>{new Date(corruptionCase.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">View</Button>
                          <Button variant="outline" size="sm">Update</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Whistleblower Tab */}
        <TabsContent value="whistleblower" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Whistleblower Submissions
              </CardTitle>
              <CardDescription>
                Review and manage whistleblower reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {whistleblower?.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">{submission.disclosure_type}</TableCell>
                      <TableCell>{submission.disclosure_type}</TableCell>
                      <TableCell>
                        <Badge variant={submission.is_anonymous ? "secondary" : "outline"}>
                          {submission.is_anonymous ? "Anonymous" : "Identified"}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(submission.verification_status)}</TableCell>
                      <TableCell>{new Date(submission.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Review</Button>
                          <Button variant="outline" size="sm">Investigate</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};