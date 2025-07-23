import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Flag, Settings, FileText } from 'lucide-react';
import { FlagManagementInterface } from '@/components/admin/civic/FlagManagementInterface';
import { ScoreOverrideControls } from '@/components/admin/civic/ScoreOverrideControls';
import { AuditLogsViewer } from '@/components/admin/civic/AuditLogsViewer';
import { useToast } from '@/hooks/use-toast';

export default function CivicModerationPage() {
  const [activeTab, setActiveTab] = useState('flags');
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Shield className="h-8 w-8" />
            <h1 className="text-4xl font-bold">Civic Reputation Moderation</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive tools for monitoring, managing, and maintaining the integrity of civic reputation scores
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Flag className="h-4 w-4 text-red-500" />
                Active Flags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">12</div>
              <p className="text-sm text-muted-foreground">Requiring review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-4 w-4 text-blue-500" />
                Score Overrides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">3</div>
              <p className="text-sm text-muted-foreground">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-500" />
                Audit Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">847</div>
              <p className="text-sm text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">98%</div>
              <p className="text-sm text-muted-foreground">Score accuracy</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Moderation Interface */}
        <Card>
          <CardHeader>
            <CardTitle>Moderation Dashboard</CardTitle>
            <CardDescription>
              Manage reputation flags, override scores, and monitor system activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="flags" className="flex items-center gap-2">
                  <Flag className="h-4 w-4" />
                  Flag Management
                </TabsTrigger>
                <TabsTrigger value="overrides" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Score Overrides
                </TabsTrigger>
                <TabsTrigger value="audit" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Audit Logs
                </TabsTrigger>
              </TabsList>

              <TabsContent value="flags" className="mt-6">
                <FlagManagementInterface />
              </TabsContent>

              <TabsContent value="overrides" className="mt-6">
                <ScoreOverrideControls />
              </TabsContent>

              <TabsContent value="audit" className="mt-6">
                <AuditLogsViewer />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}