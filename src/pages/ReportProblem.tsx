import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ArrowLeft, Send, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AppLayout } from '@/components/Layout/AppLayout';

const ReportProblem = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const villageId = searchParams.get('village');
  
  const [village, setVillage] = useState<any>(null);
  const [formData, setFormData] = useState({
    problem_type: '',
    title: '',
    description: '',
    location_details: '',
    urgency_level: 'medium',
    contact_info: '',
    supporting_evidence: ''
  });
  const [loading, setLoading] = useState(false);

  const problemTypes = [
    { value: 'infrastructure', label: 'Infrastructure Issues' },
    { value: 'water', label: 'Water Problems' },
    { value: 'electricity', label: 'Electricity Issues' },
    { value: 'health', label: 'Health & Safety' },
    { value: 'education', label: 'Education Problems' },
    { value: 'security', label: 'Security Concerns' },
    { value: 'governance', label: 'Governance Issues' },
    { value: 'environment', label: 'Environmental Problems' },
    { value: 'social', label: 'Social Issues' },
    { value: 'economic', label: 'Economic Problems' },
    { value: 'other', label: 'Other' }
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low - Can wait', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium - Address soon', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High - Urgent attention', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Critical - Emergency', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    if (villageId) {
      fetchVillageData();
    }
  }, [villageId]);

  const fetchVillageData = async () => {
    try {
      const { data, error } = await supabase
        .from('villages')
        .select('id, village_name, region, division, subdivision')
        .eq('id', villageId)
        .single();

      if (error) throw error;
      setVillage(data);
    } catch (error) {
      console.error('Error fetching village:', error);
      toast.error('Failed to load village information');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.problem_type || !formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Store the problem report as a village comment for now
      const { error } = await supabase
        .from('village_comments')
        .insert({
          village_id: villageId,
          user_id: user?.id,
          content: `[PROBLEM REPORT] ${formData.title}\n\nType: ${formData.problem_type}\nUrgency: ${formData.urgency_level}\nDescription: ${formData.description}\n\nLocation: ${formData.location_details}\nContact: ${formData.contact_info}\nEvidence: ${formData.supporting_evidence}`
        });

      if (error) throw error;

      toast.success('Problem report submitted successfully');
      navigate(villageId ? `/villages/${villageId}` : '/villages');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate(villageId ? `/villages/${villageId}` : '/villages')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              Report a Problem
            </h1>
            {village && (
              <p className="text-muted-foreground flex items-center gap-2 mt-2">
                <MapPin className="h-4 w-4" />
                {village.village_name}, {village.subdivision}, {village.region}
              </p>
            )}
          </div>
        </div>

        {/* Report Form */}
        <Card>
          <CardHeader>
            <CardTitle>Problem Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Problem Type */}
              <div className="space-y-2">
                <Label htmlFor="problem_type">Problem Type *</Label>
                <Select value={formData.problem_type} onValueChange={(value) => setFormData(prev => ({ ...prev, problem_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select problem type" />
                  </SelectTrigger>
                  <SelectContent>
                    {problemTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Problem Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief description of the problem"
                  required
                />
              </div>

              {/* Urgency Level */}
              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency Level</Label>
                <Select value={formData.urgency_level} onValueChange={(value) => setFormData(prev => ({ ...prev, urgency_level: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {urgencyLevels.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        <div className="flex items-center gap-2">
                          <Badge className={level.color}>{level.value.toUpperCase()}</Badge>
                          <span>{level.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide detailed information about the problem..."
                  rows={5}
                  required
                />
              </div>

              {/* Location Details */}
              <div className="space-y-2">
                <Label htmlFor="location_details">Specific Location</Label>
                <Input
                  id="location_details"
                  value={formData.location_details}
                  onChange={(e) => setFormData(prev => ({ ...prev, location_details: e.target.value }))}
                  placeholder="Quarter, neighborhood, or specific landmark"
                />
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                <Label htmlFor="contact_info">Contact Information (Optional)</Label>
                <Input
                  id="contact_info"
                  value={formData.contact_info}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_info: e.target.value }))}
                  placeholder="Phone number or email for follow-up"
                />
              </div>

              {/* Supporting Evidence */}
              <div className="space-y-2">
                <Label htmlFor="supporting_evidence">Supporting Evidence</Label>
                <Textarea
                  id="supporting_evidence"
                  value={formData.supporting_evidence}
                  onChange={(e) => setFormData(prev => ({ ...prev, supporting_evidence: e.target.value }))}
                  placeholder="Additional details, witness information, or references"
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(villageId ? `/villages/${villageId}` : '/villages')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Report
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ReportProblem;