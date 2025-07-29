import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Target, AlertCircle } from 'lucide-react';

interface PromisesManagerProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const PromisesManager: React.FC<PromisesManagerProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  // Mock data for political promises
  const promises = [
    {
      id: '1',
      title: 'Build 100 Schools by 2025',
      politician: 'Paul Biya',
      status: 'in_progress',
      progress: 45,
      deadline: '2025-12-31',
      category: 'Education'
    },
    {
      id: '2',
      title: 'Improve Healthcare Access',
      politician: 'Maurice Kamto',
      status: 'broken',
      progress: 15,
      deadline: '2024-06-30',
      category: 'Healthcare'
    },
    {
      id: '3',
      title: 'Create 50,000 Jobs',
      politician: 'Cabral Libii',
      status: 'fulfilled',
      progress: 100,
      deadline: '2024-01-01',
      category: 'Employment'
    }
  ];

  const totalPromises = promises.length;
  const fulfilledPromises = promises.filter(p => p.status === 'fulfilled').length;
  const brokenPromises = promises.filter(p => p.status === 'broken').length;
  const inProgressPromises = promises.filter(p => p.status === 'in_progress').length;

  const handleUpdatePromiseStatus = (promiseId: string, newStatus: string) => {
    logActivity('promise_status_updated', { promise_id: promiseId, new_status: newStatus });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fulfilled': return 'default';
      case 'broken': return 'destructive';
      case 'in_progress': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fulfilled': return CheckCircle;
      case 'broken': return AlertCircle;
      case 'in_progress': return Clock;
      default: return Target;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center">
          <Target className="h-6 w-6 mr-2 text-green-600" />
          Promises Tracker Management
        </h2>
        <p className="text-muted-foreground">Monitor and manage political promises and their fulfillment</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalPromises}</p>
                <p className="text-sm text-muted-foreground">Total Promises</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{fulfilledPromises}</p>
                <p className="text-sm text-muted-foreground">Fulfilled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{inProgressPromises}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{brokenPromises}</p>
                <p className="text-sm text-muted-foreground">Broken</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Political Promises</CardTitle>
          <CardDescription>Track and update the status of political promises</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {promises.map((promise) => {
              const StatusIcon = getStatusIcon(promise.status);
              return (
                <div key={promise.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold">{promise.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {promise.politician} • {promise.category}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusColor(promise.status)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {promise.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{promise.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${promise.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdatePromiseStatus(promise.id, 'fulfilled')}
                      >
                        Mark Fulfilled
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdatePromiseStatus(promise.id, 'broken')}
                      >
                        Mark Broken
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {promises.length === 0 && (
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Promises Tracked</h3>
              <p className="text-muted-foreground">Political promises will appear here for tracking</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Promise Analytics</CardTitle>
          <CardDescription>Performance metrics and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-4">Fulfillment Rate</h4>
              <div className="text-3xl font-bold text-green-600">
                {totalPromises > 0 ? Math.round((fulfilledPromises / totalPromises) * 100) : 0}%
              </div>
              <p className="text-sm text-muted-foreground">
                {fulfilledPromises} out of {totalPromises} promises fulfilled
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">By Category</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Education</span>
                  <Badge variant="outline">1</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Healthcare</span>
                  <Badge variant="outline">1</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Employment</span>
                  <Badge variant="outline">1</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};