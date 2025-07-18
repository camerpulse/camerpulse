import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Crown, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Share2, 
  Eye, 
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  ExternalLink,
  Phone,
  Mail
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Billionaire {
  id: string;
  full_name: string;
  profile_picture_url?: string;
  company_affiliation?: string;
  wealth_source: string;
  verified_net_worth_fcfa: number;
  net_worth_usd: number;
  region: string;
  biography?: string;
  business_investments?: string[];
  contact_info?: string;
  media_profiles?: any;
  social_media_handles?: any;
  current_rank?: number;
  previous_rank?: number;
  year_on_year_change?: number;
  profile_views: number;
  is_anonymous: boolean;
  display_alias?: string;
  created_at: string;
}

const BillionaireProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [billionaire, setBillionaire] = useState<Billionaire | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchBillionaire();
      incrementViewCount();
    }
  }, [id]);

  const fetchBillionaire = async () => {
    try {
      const { data, error } = await supabase
        .from('billionaires')
        .select('*')
        .eq('id', id)
        .eq('is_verified', true)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch billionaire profile",
          variant: "destructive"
        });
        return;
      }

      setBillionaire(data);
    } catch (error) {
      console.error('Error fetching billionaire:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    try {
      // First get current view count, then increment
      const { data } = await supabase
        .from('billionaires')
        .select('profile_views')
        .eq('id', id)
        .single();
      
      if (data) {
        await supabase
          .from('billionaires')
          .update({ profile_views: data.profile_views + 1 })
          .eq('id', id);
      }
    } catch (error) {
      // Silently fail - view counting is not critical
      console.error('Error incrementing view count:', error);
    }
  };

  const formatCurrency = (amount: number, currency: 'FCFA' | 'USD' = 'FCFA') => {
    if (currency === 'FCFA') {
      return `${(amount / 1000000).toFixed(1)}M FCFA`;
    }
    return `$${(amount / 1000000).toFixed(1)}M`;
  };

  const getWealthSourceIcon = (source: string) => {
    const icons: { [key: string]: string } = {
      'technology': '🌐',
      'oil_gas': '🛢️',
      'real_estate': '🏘️',
      'banking_finance': '💼',
      'agriculture': '🌾',
      'mining': '⛏️',
      'telecommunications': '📡',
      'manufacturing': '🏭',
      'retail_trade': '🛍️',
      'construction': '🏗️',
      'entertainment': '🎬',
      'healthcare': '🏥',
      'logistics': '🚛',
      'other': '💼'
    };
    return icons[source] || '💼';
  };

  const getRankChangeIcon = (current?: number, previous?: number) => {
    if (!current || !previous) return <Minus className="h-5 w-5 text-muted-foreground" />;
    if (current < previous) return <TrendingUp className="h-5 w-5 text-green-500" />;
    if (current > previous) return <TrendingDown className="h-5 w-5 text-red-500" />;
    return <Minus className="h-5 w-5 text-muted-foreground" />;
  };

  const handleShare = () => {
    if (!billionaire) return;
    
    const url = window.location.href;
    const text = `Check out ${billionaire.is_anonymous ? billionaire.display_alias : billionaire.full_name} on CamerPulse Billionaire Tracker - Ranked #${billionaire.current_rank} with ${formatCurrency(billionaire.verified_net_worth_fcfa)} net worth`;
    
    if (navigator.share) {
      navigator.share({ title: 'CamerPulse Billionaire', text, url });
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Profile link copied to clipboard"
      });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-amber-800">Loading profile...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!billionaire) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <h2 className="text-xl font-bold mb-4">Profile Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The billionaire profile you're looking for doesn't exist or hasn't been verified yet.
              </p>
              <Button asChild>
                <Link to="/billionaires">Back to Tracker</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Button asChild variant="outline" className="gap-2">
              <Link to="/billionaires">
                <ArrowLeft className="h-4 w-4" />
                Back to Tracker
              </Link>
            </Button>
          </div>

          {/* Profile Header */}
          <Card className="mb-8 bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-200">
            <CardContent className="pt-8">
              <div className="flex flex-col md:flex-row items-start gap-8">
                {/* Profile Picture & Rank */}
                <div className="flex-shrink-0 text-center">
                  <div className="relative mb-4">
                    {billionaire.profile_picture_url ? (
                      <img
                        src={billionaire.profile_picture_url}
                        alt={billionaire.is_anonymous ? billionaire.display_alias : billionaire.full_name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-amber-300"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-4xl font-bold text-white border-4 border-amber-300">
                        {billionaire.current_rank || '?'}
                      </div>
                    )}
                    {billionaire.current_rank === 1 && (
                      <Crown className="absolute -top-4 left-1/2 transform -translate-x-1/2 h-8 w-8 text-amber-500" />
                    )}
                  </div>
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    Rank #{billionaire.current_rank || 'N/A'}
                  </Badge>
                </div>

                {/* Profile Info */}
                <div className="flex-grow">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <div>
                      <h1 className="text-4xl font-bold text-amber-700 mb-2">
                        {billionaire.is_anonymous ? billionaire.display_alias : billionaire.full_name}
                        {billionaire.is_anonymous && (
                          <Badge variant="outline" className="ml-2 text-xs">Anonymous</Badge>
                        )}
                      </h1>
                      {billionaire.company_affiliation && (
                        <p className="text-xl text-muted-foreground mb-3 flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          {billionaire.company_affiliation}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getWealthSourceIcon(billionaire.wealth_source)}</span>
                          <Badge variant="secondary">
                            {billionaire.wealth_source.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{billionaire.region}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        {getRankChangeIcon(billionaire.current_rank, billionaire.previous_rank)}
                        <span className="text-sm text-muted-foreground">Rank Change</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        <span>{billionaire.profile_views} views</span>
                      </div>
                    </div>
                  </div>

                  {/* Net Worth */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Card className="bg-gradient-to-r from-green-100 to-emerald-100 border-green-200">
                      <CardContent className="pt-4">
                        <h3 className="font-bold text-green-700 mb-1">Net Worth (FCFA)</h3>
                        <p className="text-3xl font-bold text-green-800">
                          {formatCurrency(billionaire.verified_net_worth_fcfa)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-blue-100 to-cyan-100 border-blue-200">
                      <CardContent className="pt-4">
                        <h3 className="font-bold text-blue-700 mb-1">Net Worth (USD)</h3>
                        <p className="text-3xl font-bold text-blue-800">
                          {formatCurrency(billionaire.net_worth_usd, 'USD')}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button onClick={handleShare} className="gap-2">
                      <Share2 className="h-4 w-4" />
                      Share Profile
                    </Button>
                    <Badge variant="outline" className="border-amber-600 text-amber-600">
                      ✓ Verified by CamerPulse
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Biography */}
            <div className="lg:col-span-2">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Biography & Business Journey</CardTitle>
                </CardHeader>
                <CardContent>
                  {billionaire.biography ? (
                    <p className="text-gray-700 leading-relaxed">
                      {billionaire.biography}
                    </p>
                  ) : (
                    <p className="text-muted-foreground italic">
                      No biography available for this profile.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Business Investments */}
              {billionaire.business_investments && billionaire.business_investments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Business Investments & Holdings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {billionaire.business_investments.map((investment, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium">{investment}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Current Rank</span>
                    <Badge variant="secondary">#{billionaire.current_rank || 'N/A'}</Badge>
                  </div>
                  {billionaire.previous_rank && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Previous Rank</span>
                      <span>#{billionaire.previous_rank}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Profile Views</span>
                    <span>{billionaire.profile_views}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Listed Since</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(billionaire.created_at).getFullYear()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              {billionaire.contact_info && (
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{billionaire.contact_info}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Social Media */}
              {billionaire.social_media_handles && Object.keys(billionaire.social_media_handles).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Social Media</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(billionaire.social_media_handles).map(([platform, handle]) => (
                        <div key={platform} className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          <a 
                            href={handle as string} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline capitalize"
                          >
                            {platform}
                          </a>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Apply CTA */}
              <Card className="bg-gradient-to-r from-green-100 to-emerald-100 border-green-200">
                <CardContent className="pt-6 text-center">
                  <h3 className="font-bold text-green-700 mb-2">
                    Join the Elite
                  </h3>
                  <p className="text-green-600 text-sm mb-4">
                    Think you qualify for this list?
                  </p>
                  <Button asChild size="sm" className="w-full bg-green-600 hover:bg-green-700">
                    <Link to="/billionaires/apply">Apply Now</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default BillionaireProfile;