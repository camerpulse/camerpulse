import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Clock, CheckCircle, AlertTriangle, Shield, RefreshCw, Eye,
  Activity, Zap, Settings, BarChart3, FileCheck, Ban
} from 'lucide-react';

interface BusinessLogicStats {
  auto_closures_today: number;
  qualification_checks_today: number;
  conflicts_detected_today: number;
  pending_reviews: number;
}

export const BusinessLogicDashboard: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [testingInProgress, setTestingInProgress] = useState(false);

  // Fetch business logic statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['business_logic_stats'],
    queryFn: async (): Promise<BusinessLogicStats> => {
      const today = new Date().toISOString().split('T')[0];
      
      // Mock data since we don't have the actual log tables yet
      return {
        auto_closures_today: Math.floor(Math.random() * 10) + 1,
        qualification_checks_today: Math.floor(Math.random() * 25) + 5,
        conflicts_detected_today: Math.floor(Math.random() * 3),
        pending_reviews: Math.floor(Math.random() * 8) + 2
      };
    },
    refetchInterval: 30000,
  });

  // Manual tender status update
  const updateTenderStatusMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('tender-status-updater');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Status Update Complete",
        description: `Updated ${data.updated_count} tenders automatically.`,
      });
      queryClient.invalidateQueries({ queryKey: ['business_logic_stats'] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update tender statuses.",
        variant: "destructive",
      });
      console.error('Status update error:', error);
    },
  });

  // Test qualification checker
  const testQualificationMutation = useMutation({
    mutationFn: async () => {
      setTestingInProgress(true);
      const { data, error } = await supabase.functions.invoke('bidder-qualification-checker', {
        body: {
          bidder_id: 'test-bidder-id',
          tender_id: 'test-tender-id',
          bid_data: { amount: 50000 }
        }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const result = data.qualification_result;
      toast({
        title: "Qualification Check Complete",
        description: `Bidder ${result.qualified ? 'qualified' : 'disqualified'} with score ${result.score}/100`,
      });
    },
    onError: (error) => {
      toast({
        title: "Test Failed",
        description: "Failed to test qualification checker.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setTestingInProgress(false);
    }
  });

  // Test conflict detector
  const testConflictMutation = useMutation({
    mutationFn: async () => {
      setTestingInProgress(true);
      const { data, error } = await supabase.functions.invoke('conflict-of-interest-detector', {
        body: {
          bidder_id: 'test-bidder-id',
          tender_id: 'test-tender-id',
          tender_issuer_id: 'test-issuer-id'
        }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const result = data.conflict_detection_result;
      toast({
        title: "Conflict Check Complete",
        description: `${result.has_conflict ? 'Conflicts detected' : 'No conflicts found'} - Risk level: ${result.risk_level}`,
        variant: result.has_conflict ? "destructive" : "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Test Failed",
        description: "Failed to test conflict detector.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setTestingInProgress(false);
    }
  });

  const statCards = [
    {
      title: "Auto Closures Today",
      value: stats?.auto_closures_today || 0,
      icon: Clock,
      color: "text-blue-600",
      description: "Tenders automatically closed due to deadline"
    },
    {
      title: "Qualification Checks",
      value: stats?.qualification_checks_today || 0,
      icon: CheckCircle,
      color: "text-green-600",
      description: "Bidder qualification checks performed today"
    },
    {
      title: "Conflicts Detected",
      value: stats?.conflicts_detected_today || 0,
      icon: AlertTriangle,
      color: "text-red-600",
      description: "Conflict of interest cases flagged today"
    },
    {
      title: "Pending Reviews",
      value: stats?.pending_reviews || 0,
      icon: Eye,
      color: "text-orange-600",
      description: "Items requiring manual review"
    },
  ];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Business Logic Dashboard</h2>
          <p className="text-muted-foreground">Monitor automated processes and system intelligence</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure Rules
          </Button>
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="status-updates" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status-updates">Status Updates</TabsTrigger>
          <TabsTrigger value="qualification">Qualification Checks</TabsTrigger>
          <TabsTrigger value="conflict-detection">Conflict Detection</TabsTrigger>
        </TabsList>

        <TabsContent value="status-updates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Automatic Tender Status Updates
              </CardTitle>
              <CardDescription>
                Monitor and control automatic tender status changes based on deadlines and business rules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">Deadline Monitoring</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically closes tenders when deadlines pass and updates status based on bid count
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">24/7 Monitoring</Badge>
                    <Badge variant="outline">Auto-Closure</Badge>
                    <Badge variant="outline">Bid Count Logic</Badge>
                  </div>
                </div>
                <Button 
                  onClick={() => updateTenderStatusMutation.mutate()}
                  disabled={updateTenderStatusMutation.isPending}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${updateTenderStatusMutation.isPending ? 'animate-spin' : ''}`} />
                  Run Now
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-2">Status Rules</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Open → Under Review (if bids received)</li>
                    <li>• Open → Closed No Bids (if no bids)</li>
                    <li>• Deadline + 24hr reminders</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-2">Monitoring Frequency</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Every 5 minutes during business hours</li>
                    <li>• Every 15 minutes off-hours</li>
                    <li>• Immediate on manual trigger</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qualification">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Bidder Qualification System
              </CardTitle>
              <CardDescription>
                Automated evaluation of bidder credentials and qualifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">Multi-Factor Qualification Assessment</h4>
                  <p className="text-sm text-muted-foreground">
                    Evaluates business experience, financial standing, certifications, and past performance
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">70+ Score Required</Badge>
                    <Badge variant="outline">7 Check Categories</Badge>
                    <Badge variant="outline">Auto-Disqualification</Badge>
                  </div>
                </div>
                <Button 
                  onClick={() => testQualificationMutation.mutate()}
                  disabled={testingInProgress}
                  variant="outline"
                >
                  <Zap className={`h-4 w-4 mr-2 ${testingInProgress ? 'animate-pulse' : ''}`} />
                  Test System
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-2">Experience Checks</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Years in business (min 2)</li>
                    <li>• Completed projects (min 5)</li>
                    <li>• Industry experience</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-2">Financial Standing</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Credit rating assessment</li>
                    <li>• Financial stability check</li>
                    <li>• Bonding capacity</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-2">Compliance</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Required certifications</li>
                    <li>• Blacklist verification</li>
                    <li>• Legal standing check</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conflict-detection">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Conflict of Interest Detection
              </CardTitle>
              <CardDescription>
                Advanced AI-powered detection of potential conflicts and ethical issues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">Multi-Layer Conflict Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    Analyzes relationships, financial interests, and coordination patterns to detect conflicts
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">Relationship Mapping</Badge>
                    <Badge variant="outline">Pattern Detection</Badge>
                    <Badge variant="outline">Risk Scoring</Badge>
                  </div>
                </div>
                <Button 
                  onClick={() => testConflictMutation.mutate()}
                  disabled={testingInProgress}
                  variant="outline"
                >
                  <Shield className={`h-4 w-4 mr-2 ${testingInProgress ? 'animate-pulse' : ''}`} />
                  Test Detection
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-2">Detection Categories</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Family relationships</li>
                    <li>• Business partnerships</li>
                    <li>• Employment history</li>
                    <li>• Financial interests</li>
                    <li>• Coordinated bidding</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-2">Risk Levels</h5>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <Badge variant="destructive" className="h-2 w-2 p-0"></Badge>
                      Critical: Auto-disqualification
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="secondary" className="h-2 w-2 p-0 bg-orange-500"></Badge>
                      High: Requires disclosure
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="secondary" className="h-2 w-2 p-0 bg-yellow-500"></Badge>
                      Medium: Enhanced review
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="h-2 w-2 p-0"></Badge>
                      Low: Standard process
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};