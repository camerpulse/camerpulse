import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, Clock, User, Calendar, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PoliticianValidation {
  politician_id: string;
  name: string;
  current_status: string;
  needs_update: boolean;
  days_since_term_end: number | null;
}

interface Politician {
  id: string;
  name: string;
  role_title: string;
  term_status: string;
  is_currently_in_office: boolean;
  term_start_date: string | null;
  term_end_date: string | null;
  office_history: any[];
  last_term_validation: string | null;
}

const TermOfOfficeValidator = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('validation');

  // Fetch politicians needing validation
  const { data: validationData, isLoading: validationLoading, error: validationError } = useQuery({
    queryKey: ['politician-term-validation'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('validate_politician_terms');
      if (error) throw error;
      return data as PoliticianValidation[];
    }
  });

  // Fetch all politicians for status overview
  const { data: politicians, isLoading: politiciansLoading } = useQuery({
    queryKey: ['politicians-terms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('politicians')
        .select(`
          id, name, role_title, term_status, is_currently_in_office,
          term_start_date, term_end_date, office_history, last_term_validation
        `)
        .order('name');
      if (error) throw error;
      return data as Politician[];
    }
  });

  // Update politician status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ politicianId, newStatus, reason }: { 
      politicianId: string; 
      newStatus: string; 
      reason?: string;
    }) => {
      const { data, error } = await supabase.rpc('update_politician_term_status', {
        p_politician_id: politicianId,
        p_new_status: newStatus,
        p_reason: reason
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['politician-term-validation'] });
      queryClient.invalidateQueries({ queryKey: ['politicians-terms'] });
      toast({
        title: "Status Updated",
        description: "Politician term status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update status: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const getStatusBadge = (status: string, inOffice: boolean) => {
    if (status === 'active' && inOffice) {
      return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />In Office</Badge>;
    } else if (status === 'expired') {
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Term Expired</Badge>;
    } else if (status === 'deceased') {
      return <Badge variant="destructive"><User className="h-3 w-3 mr-1" />Deceased</Badge>;
    } else {
      return <Badge variant="outline"><AlertTriangle className="h-3 w-3 mr-1" />Unknown</Badge>;
    }
  };

  const handleStatusUpdate = (politicianId: string, newStatus: string, reason?: string) => {
    updateStatusMutation.mutate({ politicianId, newStatus, reason });
  };

  if (validationLoading || politiciansLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Term of Office Validator</CardTitle>
          <CardDescription>Loading validation data...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (validationError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Term of Office Validator</CardTitle>
          <CardDescription className="text-destructive">
            Error loading validation data: {validationError.message}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const needsUpdateCount = validationData?.filter(p => p.needs_update).length || 0;
  const expiredTerms = validationData?.filter(p => p.days_since_term_end && p.days_since_term_end > 0).length || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Term of Office Validator
          </CardTitle>
          <CardDescription>
            Monitor and validate the current status of all officials in CamerPulse
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Officials</p>
                <p className="text-2xl font-bold">{politicians?.length || 0}</p>
              </div>
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Office</p>
                <p className="text-2xl font-bold text-green-600">
                  {politicians?.filter(p => p.is_currently_in_office).length || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Needs Review</p>
                <p className="text-2xl font-bold text-orange-600">{needsUpdateCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expired Terms</p>
                <p className="text-2xl font-bold text-red-600">{expiredTerms}</p>
              </div>
              <Clock className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="validation">Needs Validation</TabsTrigger>
          <TabsTrigger value="all">All Officials</TabsTrigger>
          <TabsTrigger value="history">Recent Changes</TabsTrigger>
        </TabsList>

        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Officials Requiring Review</CardTitle>
              <CardDescription>
                Officials with expired terms or missing validation data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {validationData?.filter(p => p.needs_update).length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  All officials have been validated. No action required.
                </p>
              ) : (
                <div className="space-y-4">
                  {validationData
                    ?.filter(p => p.needs_update)
                    .map((politician) => (
                      <div
                        key={politician.politician_id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-1">
                          <h4 className="font-semibold">{politician.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Current Status: {politician.current_status}
                            {politician.days_since_term_end && politician.days_since_term_end > 0 && (
                              <span className="text-red-600 ml-2">
                                (Term ended {politician.days_since_term_end} days ago)
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(politician.politician_id, 'expired', 'Term validation - marked as expired')}
                            disabled={updateStatusMutation.isPending}
                          >
                            Mark Expired
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(politician.politician_id, 'active', 'Term validation - confirmed active')}
                            disabled={updateStatusMutation.isPending}
                          >
                            Confirm Active
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Officials Status</CardTitle>
              <CardDescription>Complete overview of all officials and their current status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {politicians?.map((politician) => (
                  <div
                    key={politician.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{politician.name}</h4>
                        {getStatusBadge(politician.term_status, politician.is_currently_in_office)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {politician.role_title}
                        {politician.term_start_date && (
                          <span className="ml-2">
                            • Started: {new Date(politician.term_start_date).toLocaleDateString()}
                          </span>
                        )}
                        {politician.term_end_date && (
                          <span className="ml-2">
                            • Ends: {new Date(politician.term_end_date).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {politician.term_status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(politician.id, 'expired', 'Manual update - marked as expired')}
                          disabled={updateStatusMutation.isPending}
                        >
                          Mark Expired
                        </Button>
                      )}
                      {politician.term_status !== 'active' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(politician.id, 'active', 'Manual update - restored to active')}
                          disabled={updateStatusMutation.isPending}
                        >
                          Restore Active
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Status Changes
              </CardTitle>
              <CardDescription>Latest term status updates and office changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {politicians
                  ?.filter(p => p.office_history && p.office_history.length > 0)
                  .sort((a, b) => new Date(b.last_term_validation || 0).getTime() - new Date(a.last_term_validation || 0).getTime())
                  .slice(0, 10)
                  .map((politician) => {
                    const latestChange = politician.office_history[politician.office_history.length - 1];
                    return (
                      <div key={politician.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                          <h4 className="font-medium">{politician.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {latestChange?.old_status} → {latestChange?.new_status}
                            {latestChange?.reason && (
                              <span className="ml-2">({latestChange.reason})</span>
                            )}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {politician.last_term_validation && 
                            new Date(politician.last_term_validation).toLocaleDateString()
                          }
                        </div>
                      </div>
                    );
                  })}
                {(!politicians?.some(p => p.office_history && p.office_history.length > 0)) && (
                  <p className="text-center text-muted-foreground py-8">
                    No recent status changes recorded.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TermOfOfficeValidator;