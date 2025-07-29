import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowRight,
  Users,
  Building2,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle
} from 'lucide-react';

interface CrossModuleAction {
  id: string;
  title: string;
  description: string;
  fromModule: string;
  toModule: string;
  type: 'user_action' | 'report' | 'approval' | 'notification';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  data: any;
  createdAt: string;
}

interface AdminWorkflowManagerProps {
  onModuleNavigate: (moduleId: string) => void;
  onActionExecute: (actionId: string) => void;
}

export const AdminWorkflowManager: React.FC<AdminWorkflowManagerProps> = ({
  onModuleNavigate,
  onActionExecute
}) => {
  const [activeTab, setActiveTab] = useState('pending');

  // Mock workflow data - in real implementation, this would come from Supabase
  const mockWorkflows: CrossModuleAction[] = [
    {
      id: '1',
      title: 'User Flagged for Review',
      description: 'User reported for suspicious marketplace activity',
      fromModule: 'marketplace-admin',
      toModule: 'moderation',
      type: 'report',
      priority: 'high',
      status: 'pending',
      data: { userId: 'user123', reportType: 'fraud' },
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      title: 'Company Verification Required',
      description: 'New company needs admin approval for logistics services',
      fromModule: 'company-directory',
      toModule: 'logistics-admin',
      type: 'approval',
      priority: 'medium',
      status: 'pending',
      data: { companyId: 'comp456', services: ['shipping', 'delivery'] },
      createdAt: '2024-01-15T09:15:00Z'
    },
    {
      id: '3',
      title: 'Village Corruption Report',
      description: 'High severity corruption report needs investigation',
      fromModule: 'village-admin',
      toModule: 'moderation',
      type: 'report',
      priority: 'high',
      status: 'in_progress',
      data: { villageId: 'village789', severity: 'critical' },
      createdAt: '2024-01-15T08:45:00Z'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-warning" />;
      case 'in_progress': return <Activity className="h-4 w-4 text-primary" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-success" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getModuleIcon = (moduleId: string) => {
    switch (moduleId) {
      case 'users-roles': return Users;
      case 'company-directory': return Building2;
      case 'marketplace-admin': return Building2;
      case 'logistics-admin': return TrendingUp;
      case 'moderation': return AlertTriangle;
      case 'village-admin': return MessageSquare;
      default: return Activity;
    }
  };

  const filteredWorkflows = mockWorkflows.filter(workflow => {
    if (activeTab === 'all') return true;
    return workflow.status === activeTab;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Cross-Module Workflows
        </CardTitle>
        <CardDescription>
          Manage actions and approvals that span multiple admin modules
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 mt-4">
            {filteredWorkflows.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No workflows found for this status
              </div>
            ) : (
              <div className="space-y-3">
                {filteredWorkflows.map((workflow) => {
                  const FromIcon = getModuleIcon(workflow.fromModule);
                  const ToIcon = getModuleIcon(workflow.toModule);
                  
                  return (
                    <Card key={workflow.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          {/* Header */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-sm">
                              {getStatusIcon(workflow.status)}
                              <span className="font-medium">{workflow.title}</span>
                            </div>
                            <Badge className={getPriorityColor(workflow.priority)}>
                              {workflow.priority} priority
                            </Badge>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-muted-foreground">
                            {workflow.description}
                          </p>

                          {/* Module Flow */}
                          <div className="flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md">
                              <FromIcon className="h-4 w-4" />
                              <span className="capitalize">
                                {workflow.fromModule.replace('-', ' ')}
                              </span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md">
                              <ToIcon className="h-4 w-4" />
                              <span className="capitalize">
                                {workflow.toModule.replace('-', ' ')}
                              </span>
                            </div>
                          </div>

                          {/* Timestamp */}
                          <p className="text-xs text-muted-foreground">
                            Created: {new Date(workflow.createdAt).toLocaleString()}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onModuleNavigate(workflow.toModule)}
                          >
                            Go to Module
                          </Button>
                          {workflow.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => onActionExecute(workflow.id)}
                            >
                              Take Action
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};