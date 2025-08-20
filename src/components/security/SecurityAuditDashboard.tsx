import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Shield, Activity, Users, Search, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SecurityEvent {
  id: string;
  user_id: string | null;
  action_type: string;
  resource_type: string;
  resource_id: string | null;
  details: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  ip_address: string | null;
  user_agent: string | null;
}

interface SecurityStats {
  totalEvents: number;
  criticalEvents: number;
  blockedRequests: number;
  activeThreats: number;
}

export const SecurityAuditDashboard: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState<SecurityStats>({
    totalEvents: 0,
    criticalEvents: 0,
    blockedRequests: 0,
    activeThreats: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('24h');
  const { toast } = useToast();

  useEffect(() => {
    loadSecurityData();
  }, [severityFilter, timeFilter]);

  const loadSecurityData = async () => {
    try {
      let query = supabase
        .from('security_audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      // Apply time filter
      const timeMap = {
        '1h': '1 hour',
        '24h': '24 hours',
        '7d': '7 days',
        '30d': '30 days'
      };
      
      if (timeFilter !== 'all') {
        query = query.gte('timestamp', new Date(Date.now() - getTimeInMs(timeFilter)).toISOString());
      }

      // Apply severity filter
      if (severityFilter !== 'all') {
        query = query.eq('severity', severityFilter);
      }

      const { data: eventsData, error } = await query;

      if (error) throw error;

      setEvents(eventsData || []);

      // Calculate stats
      const totalEvents = eventsData?.length || 0;
      const criticalEvents = eventsData?.filter(e => e.severity === 'critical').length || 0;
      const blockedRequests = eventsData?.filter(e => e.action_type.includes('blocked')).length || 0;
      const activeThreats = eventsData?.filter(e => 
        e.severity === 'high' || e.severity === 'critical' && 
        new Date(e.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
      ).length || 0;

      setStats({
        totalEvents,
        criticalEvents,
        blockedRequests,
        activeThreats
      });

    } catch (error) {
      console.error('Failed to load security data:', error);
      toast({
        title: "Error",
        description: "Failed to load security audit data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTimeInMs = (timeFilter: string): number => {
    switch (timeFilter) {
      case '1h': return 60 * 60 * 1000;
      case '24h': return 24 * 60 * 60 * 1000;
      case '7d': return 7 * 24 * 60 * 60 * 1000;
      case '30d': return 30 * 24 * 60 * 60 * 1000;
      default: return 24 * 60 * 60 * 1000;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getActionIcon = (actionType: string) => {
    if (actionType.includes('login') || actionType.includes('auth')) {
      return <Users className="h-4 w-4" />;
    }
    if (actionType.includes('blocked') || actionType.includes('rate_limit')) {
      return <Shield className="h-4 w-4" />;
    }
    return <Activity className="h-4 w-4" />;
  };

  const exportSecurityData = async () => {
    try {
      const csvData = events.map(event => ({
        timestamp: event.timestamp,
        severity: event.severity,
        action: event.action_type,
        resource: event.resource_type,
        user_id: event.user_id || 'anonymous',
        ip_address: event.ip_address || 'unknown',
        details: JSON.stringify(event.details)
      }));

      const csv = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-audit-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Security audit data exported successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export security data",
        variant: "destructive"
      });
    }
  };

  const filteredEvents = events.filter(event =>
    searchTerm === '' ||
    event.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.user_id && event.user_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Security Audit Dashboard</h2>
          <p className="text-muted-foreground">Monitor security events and system access</p>
        </div>
        <Button onClick={exportSecurityData} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">In selected timeframe</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.criticalEvents}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Requests</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.blockedRequests}</div>
            <p className="text-xs text-muted-foreground">Security blocks active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.activeThreats}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle>Security Events</CardTitle>
          <CardDescription>
            Recent security events and system activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-semibold">No security events found</p>
                <p className="text-muted-foreground">System is secure for the selected timeframe</p>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <div key={event.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getActionIcon(event.action_type)}
                      <div>
                        <p className="font-medium">{event.action_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.resource_type} • {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getSeverityColor(event.severity)}>
                      {event.severity}
                    </Badge>
                  </div>
                  
                  {event.ip_address && (
                    <div className="text-sm text-muted-foreground">
                      IP: {event.ip_address}
                    </div>
                  )}
                  
                  {event.details && Object.keys(event.details).length > 0 && (
                    <details className="text-sm">
                      <summary className="cursor-pointer font-medium">Event Details</summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                        {JSON.stringify(event.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};