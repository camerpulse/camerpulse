import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Flag, Eye, TrendingUp, AlertTriangle, Shield, Users } from 'lucide-react';
import { toast } from 'sonner';

interface AuditRecord {
  id: string;
  document_title: string;
  entity_audited: string;
  fiscal_year: string;
  audit_summary: string;
  audit_score: number;
  source_type: string;
  source_organization: string;
  region: string;
  tags: string[];
  document_authenticity: string;
  view_count: number;
  download_count: number;
  flag_count: number;
  watchlist_count: number;
  created_at: string;
  is_sensitive: boolean;
  uploaded_files: any;
}

interface AuditStats {
  total_audits: number;
  approved_audits: number;
  pending_audits: number;
  flagged_audits: number;
  total_downloads: number;
  avg_audit_score: number;
}

export const AuditDashboard = () => {
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [sortBy, setSortBy] = useState('created_at');

  useEffect(() => {
    fetchAuditsAndStats();
  }, []);

  const fetchAuditsAndStats = async () => {
    try {
      // Fetch approved audits
      let query = supabase
        .from('audit_registry')
        .select('*')
        .eq('status', 'approved')
        .order(sortBy, { ascending: false });

      if (searchTerm) {
        query = query.or(`document_title.ilike.%${searchTerm}%,entity_audited.ilike.%${searchTerm}%,audit_summary.ilike.%${searchTerm}%`);
      }

      if (selectedRegion) {
        query = query.eq('region', selectedRegion);
      }

      if (selectedSource) {
        query = query.eq('source_type', selectedSource as any);
      }

      const { data: auditsData, error: auditsError } = await query;

      if (auditsError) throw auditsError;

      setAudits(auditsData as AuditRecord[] || []);

      // Fetch statistics
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_audit_statistics');

      if (statsError) throw statsError;

      setStats(statsData as unknown as AuditStats);

    } catch (error: any) {
      console.error('Error fetching audits:', error);
      toast.error('Failed to load audit data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditsAndStats();
  }, [searchTerm, selectedRegion, selectedSource, sortBy]);

  const handleViewAudit = async (auditId: string) => {
    try {
      await supabase.rpc('track_audit_interaction', {
        p_audit_id: auditId,
        p_action_type: 'view'
      });
      
      // Refresh the audit data to show updated view count
      fetchAuditsAndStats();
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const handleDownloadAudit = async (auditId: string) => {
    try {
      await supabase.rpc('track_audit_interaction', {
        p_audit_id: auditId,
        p_action_type: 'download'
      });
      
      toast.success('Download tracked');
      fetchAuditsAndStats();
    } catch (error) {
      console.error('Error tracking download:', error);
    }
  };

  const handleWatchlistToggle = async (auditId: string, isAdding: boolean) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        toast.error('Please sign in to manage watchlist');
        return;
      }

      if (isAdding) {
        await supabase
          .from('audit_watchlists')
          .insert({ 
            audit_id: auditId,
            user_id: user.data.user.id 
          });
        
        await supabase.rpc('track_audit_interaction', {
          p_audit_id: auditId,
          p_action_type: 'watchlist_add'
        });
        
        toast.success('Added to watchlist');
      } else {
        await supabase
          .from('audit_watchlists')
          .delete()
          .eq('audit_id', auditId)
          .eq('user_id', user.data.user.id);
        
        await supabase.rpc('track_audit_interaction', {
          p_audit_id: auditId,
          p_action_type: 'watchlist_remove'
        });
        
        toast.success('Removed from watchlist');
      }
      
      fetchAuditsAndStats();
    } catch (error: any) {
      console.error('Error managing watchlist:', error);
      toast.error('Failed to update watchlist');
    }
  };

  const getSourceTypeLabel = (sourceType: string) => {
    return sourceType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getAuthenticityBadge = (authenticity: string) => {
    switch (authenticity) {
      case 'verified':
        return <Badge variant="default" className="bg-green-100 text-green-800">Verified</Badge>;
      case 'pending_verification':
        return <Badge variant="secondary">Pending Verification</Badge>;
      case 'questionable':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Questionable</Badge>;
      case 'disputed':
        return <Badge variant="destructive">Disputed</Badge>;
      case 'fake_flagged':
        return <Badge variant="destructive">Flagged as Fake</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Audits</p>
                  <p className="text-2xl font-bold">{stats.total_audits}</p>
                </div>
                <FileText className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Downloads</p>
                  <p className="text-2xl font-bold">{stats.total_downloads}</p>
                </div>
                <Download className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                  <p className="text-2xl font-bold">{stats.avg_audit_score.toFixed(1)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold">{stats.pending_audits}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter Audits</CardTitle>
          <CardDescription>
            Find specific audit reports and disclosures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search audits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Regions</SelectItem>
                <SelectItem value="Adamawa">Adamawa</SelectItem>
                <SelectItem value="Centre">Centre</SelectItem>
                <SelectItem value="East">East</SelectItem>
                <SelectItem value="Far North">Far North</SelectItem>
                <SelectItem value="Littoral">Littoral</SelectItem>
                <SelectItem value="North">North</SelectItem>
                <SelectItem value="Northwest">Northwest</SelectItem>
                <SelectItem value="South">South</SelectItem>
                <SelectItem value="Southwest">Southwest</SelectItem>
                <SelectItem value="West">West</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger>
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Sources</SelectItem>
                <SelectItem value="government_official">Government Official</SelectItem>
                <SelectItem value="third_party_review">Third-Party Review</SelectItem>
                <SelectItem value="whistleblower_leak">Whistleblower Leak</SelectItem>
                <SelectItem value="media_report">Media Report</SelectItem>
                <SelectItem value="user_submitted">User Submitted</SelectItem>
                <SelectItem value="investigative_journalism">Investigative Journalism</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Most Recent</SelectItem>
                <SelectItem value="download_count">Most Downloaded</SelectItem>
                <SelectItem value="view_count">Most Viewed</SelectItem>
                <SelectItem value="audit_score">Highest Score</SelectItem>
                <SelectItem value="flag_count">Most Flagged</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Results */}
      <div className="grid grid-cols-1 gap-6">
        {audits.map((audit) => (
          <Card key={audit.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2">
                    {audit.is_sensitive && <Shield className="w-4 h-4 text-yellow-500" />}
                    {audit.document_title}
                  </CardTitle>
                  <CardDescription>
                    <span className="font-medium">{audit.entity_audited}</span>
                    {audit.fiscal_year && ` • ${audit.fiscal_year}`}
                    {audit.region && ` • ${audit.region}`}
                  </CardDescription>
                </div>
                {getAuthenticityBadge(audit.document_authenticity)}
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {audit.audit_summary}
                </p>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {getSourceTypeLabel(audit.source_type)}
                  </Badge>
                  {audit.source_organization && (
                    <Badge variant="secondary">
                      {audit.source_organization}
                    </Badge>
                  )}
                  {audit.audit_score && (
                    <Badge variant="default" className="bg-blue-100 text-blue-800">
                      Score: {audit.audit_score}/100
                    </Badge>
                  )}
                  {audit.tags?.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {audit.view_count} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      {audit.download_count} downloads
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {audit.watchlist_count} watching
                    </span>
                    {audit.flag_count > 0 && (
                      <span className="flex items-center gap-1 text-yellow-600">
                        <Flag className="w-3 h-3" />
                        {audit.flag_count} flags
                      </span>
                    )}
                  </div>
                  <span>
                    {new Date(audit.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleViewAudit(audit.id)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  
                  {audit.uploaded_files?.length > 0 && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDownloadAudit(audit.id)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Files
                    </Button>
                  )}
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleWatchlistToggle(audit.id, true)}
                  >
                    Add to Watchlist
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {audits.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No audits found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or check back later for new audit reports.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};