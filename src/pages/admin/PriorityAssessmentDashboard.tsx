import React, { useState } from 'react';
import { TabSwitcher } from '@/components/camerpulse/TabSwitcher';
import { GapAnalysisForm } from '@/components/admin/PriorityAssessment/GapAnalysisForm';
import { PriorityMatrix } from '@/components/admin/PriorityAssessment/PriorityMatrix';
import { RoadmapPlanner } from '@/components/admin/PriorityAssessment/RoadmapPlanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePriorityAssessmentStats } from '@/hooks/usePriorityAssessment';
import { Badge } from '@/components/ui/badge';

const PriorityAssessmentDashboard: React.FC = () => {
  const [showGapForm, setShowGapForm] = useState(false);
  const { data: stats } = usePriorityAssessmentStats();

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Gaps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.totalGaps || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>By Priority</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Must Have</span>
                  <Badge variant="destructive">{stats?.byPriority.must_have || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Should Have</span>
                  <Badge variant="secondary">{stats?.byPriority.should_have || 0}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>By Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>In Progress</span>
                  <Badge>{stats?.byStatus.in_progress || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Completed</span>
                  <Badge variant="outline">{stats?.byStatus.completed || 0}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <PriorityMatrix />
        </div>
      ),
    },
    {
      id: 'gaps',
      label: 'Gap Analysis',
      content: showGapForm ? (
        <GapAnalysisForm onSuccess={() => setShowGapForm(false)} />
      ) : (
        <div className="text-center py-8">
          <button 
            onClick={() => setShowGapForm(true)}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg"
          >
            Create New Gap Analysis
          </button>
        </div>
      ),
    },
    {
      id: 'roadmap',
      label: 'Roadmap',
      content: <RoadmapPlanner />,
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Priority Assessment Dashboard</h1>
        <p className="text-muted-foreground">
          Analyze platform gaps, prioritize improvements, and plan development roadmaps
        </p>
      </div>

      <TabSwitcher tabs={tabs} defaultTab="overview" />
    </div>
  );
};

export default PriorityAssessmentDashboard;