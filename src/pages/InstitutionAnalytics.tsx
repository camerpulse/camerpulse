import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { InstitutionAnalyticsDashboard } from '@/components/analytics/InstitutionAnalyticsDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

export default function InstitutionAnalytics() {
  const { institutionId } = useParams<{ institutionId: string }>();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [institutionData, setInstitutionData] = useState<{
    name: string;
    type: string;
  } | null>(null);

  useEffect(() => {
    if (!institutionId) return;
    checkAccessAndLoadInstitution();
  }, [institutionId]);

  const checkAccessAndLoadInstitution = async () => {
    try {
      setLoading(true);
      
      // Check if user has a valid claim for this institution
      const { data: claimData, error: claimError } = await supabase
        .from('institution_claims')
        .select('*, institution_type, institution_name')
        .eq('institution_id', institutionId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('status', 'approved')
        .single();

      if (claimError && claimError.code !== 'PGRST116') {
        throw claimError;
      }

      if (claimData) {
        setHasAccess(true);
        setInstitutionData({
          name: claimData.institution_name,
          type: claimData.institution_type
        });
      } else {
        // Check if user is admin
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .eq('role', 'admin');

        if (rolesError) throw rolesError;

        if (userRoles && userRoles.length > 0) {
          setHasAccess(true);
          // For admin, try to get institution data from multiple sources
          // This is a simplified approach - in real implementation, you'd have a unified institutions table
          setInstitutionData({
            name: 'Institution Name', // Would fetch from actual institution table
            type: 'school' // Would determine from actual data
          });
        }
      }
    } catch (error) {
      console.error('Error checking access:', error);
      toast.error('Failed to verify access to analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 animate-pulse" />
              <span>Loading analytics...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-warning" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground mb-4">
                You don't have permission to view analytics for this institution.
              </p>
              <p className="text-sm text-muted-foreground">
                Only verified institution owners and administrators can access analytics dashboards.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!institutionId || !institutionData) {
    return <Navigate to="/directory" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <InstitutionAnalyticsDashboard
          institutionId={institutionId}
          institutionType={institutionData.type}
          institutionName={institutionData.name}
        />
      </div>
    </div>
  );
}