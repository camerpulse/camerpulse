import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Filter, Search, Eye, EyeOff } from 'lucide-react';
import { FlagEntityForm } from '@/components/Tender/ratings/FlagEntityForm';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function TenderFlaggedPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [hideFromHomepage, setHideFromHomepage] = useState(true);

  // Fetch flagged entities
  const { data: flaggedEntities, isLoading } = useQuery({
    queryKey: ['flagged-entities', searchTerm, selectedSeverity, selectedType, selectedStatus],
    queryFn: async () => {
      let query = supabase
        .from('flagged_tender_entities')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('entity_name', `%${searchTerm}%`);
      }

      if (selectedSeverity !== 'all') {
        query = query.eq('severity', selectedSeverity);
      }

      if (selectedType !== 'all') {
        query = query.eq('entity_type', selectedType);
      }

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Get statistics
  const { data: stats } = useQuery({
    queryKey: ['flagged-stats'],
    queryFn: async () => {
      const [totalResult, activeResult, criticalResult] = await Promise.all([
        supabase.from('flagged_tender_entities').select('id', { count: 'exact' }),
        supabase.from('flagged_tender_entities').select('id', { count: 'exact' }).eq('status', 'active'),
        supabase.from('flagged_tender_entities').select('id', { count: 'exact' }).eq('severity', 'critical').eq('status', 'active'),
      ]);

      return {
        total: totalResult.count || 0,
        active: activeResult.count || 0,
        critical: criticalResult.count || 0,
      };
    },
  });

  const getSeverityBadge = (severity: string) => {
    const variants = {
      low: 'default',
      medium: 'secondary',
      high: 'destructive',
      critical: 'destructive'
    } as const;
    
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    } as const;
    
    return (
      <Badge variant={variants[severity as keyof typeof variants] || 'outline'} className={colors[severity as keyof typeof colors]}>
        {severity}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'destructive',
      resolved: 'default',
      dismissed: 'secondary'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    );
  };

  const getEntityTypeBadge = (type: string) => {
    const colors = {
      issuer: 'bg-blue-100 text-blue-800',
      bidder: 'bg-purple-100 text-purple-800',
      tender: 'bg-gray-100 text-gray-800'
    } as const;
    
    return (
      <Badge variant="outline" className={colors[type as keyof typeof colors]}>
        {type}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Flagged Entities</h1>
          <p className="text-muted-foreground">
            Monitor and review entities with credibility concerns or fraud flags
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Report Entity
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Report an Entity</DialogTitle>
              <DialogDescription>
                Help maintain transparency by reporting entities with credibility concerns
              </DialogDescription>
            </DialogHeader>
            <FlagEntityForm
              entityId="sample-id"
              entityType="issuer"
              entityName="Sample Entity"
              onFlagSubmitted={() => {}}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Flags</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Flags</p>
                <p className="text-2xl font-bold text-orange-600">{stats?.active || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Issues</p>
                <p className="text-2xl font-bold text-red-600">{stats?.critical || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by entity name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="issuer">Issuers</SelectItem>
                <SelectItem value="bidder">Bidders</SelectItem>
                <SelectItem value="tender">Tenders</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={hideFromHomepage ? "default" : "outline"}
              size="sm"
              onClick={() => setHideFromHomepage(!hideFromHomepage)}
            >
              {hideFromHomepage ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {hideFromHomepage ? "Hidden from Public" : "Visible to Public"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Flagged Entities List */}
      <Card>
        <CardHeader>
          <CardTitle>Flagged Entities ({flaggedEntities?.length || 0})</CardTitle>
          <CardDescription>
            Entities with active credibility concerns or fraud flags
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {flaggedEntities?.map((entity) => (
                <div 
                  key={entity.id} 
                  className={`border rounded-lg p-4 ${
                    entity.severity === 'critical' ? 'border-red-300 bg-red-50' :
                    entity.severity === 'high' ? 'border-orange-300 bg-orange-50' :
                    entity.severity === 'medium' ? 'border-yellow-300 bg-yellow-50' :
                    'border-gray-300 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className={`h-4 w-4 ${
                          entity.severity === 'critical' ? 'text-red-500' :
                          entity.severity === 'high' ? 'text-orange-500' :
                          entity.severity === 'medium' ? 'text-yellow-500' :
                          'text-gray-500'
                        }`} />
                        <h3 className="font-semibold">{entity.entity_name}</h3>
                        {getEntityTypeBadge(entity.entity_type)}
                        {getSeverityBadge(entity.severity)}
                        {getStatusBadge(entity.status)}
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Flag Type:</span> {entity.flag_type.replace('_', ' ')}
                        </p>
                        <p>
                          <span className="font-medium">Reason:</span> {entity.flag_reason}
                        </p>
                        {entity.evidence && (
                          <p>
                            <span className="font-medium">Evidence:</span> {entity.evidence}
                          </p>
                        )}
                        {entity.resolution_notes && (
                          <p className="text-green-700">
                            <span className="font-medium">Resolution:</span> {entity.resolution_notes}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span>Flagged on {new Date(entity.created_at).toLocaleDateString()}</span>
                        {entity.resolved_at && (
                          <span>Resolved on {new Date(entity.resolved_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {entity.status === 'active' && (
                        <>
                          <Button size="sm" variant="outline">
                            Review
                          </Button>
                          <Button size="sm" variant="outline">
                            Resolve
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {(!flaggedEntities || flaggedEntities.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  No flagged entities found matching your criteria
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}