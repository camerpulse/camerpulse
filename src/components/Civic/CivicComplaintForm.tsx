import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, TrendingUp, MapPin, Calendar } from 'lucide-react';

const COMPLAINT_TYPES = [
  { value: 'fuel_scarcity', label: 'Fuel Scarcity', icon: '⛽' },
  { value: 'power_outage', label: 'Power Outage', icon: '⚡' },
  { value: 'water_shortage', label: 'Water Shortage', icon: '💧' },
  { value: 'transport', label: 'Transportation', icon: '🚌' },
  { value: 'education', label: 'Education', icon: '🎓' },
  { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { value: 'infrastructure', label: 'Infrastructure', icon: '🏗️' },
  { value: 'security', label: 'Security', icon: '🛡️' }
];

const REGIONS = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral',
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

const SEVERITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'bg-blue-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500' }
];

export const CivicComplaintForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    complaint_type: '',
    title: '',
    description: '',
    region: '',
    severity_level: 'medium'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit a civic complaint",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('civic_complaints')
        .insert({
          ...formData,
          reported_by: user.id,
          trending_score: 0.0,
          sentiment_score: 0.0
        });

      if (error) throw error;

      toast({
        title: "Complaint Submitted! 📋",
        description: "Your civic complaint has been submitted and will be reviewed for trending analysis."
      });

      // Reset form
      setFormData({
        complaint_type: '',
        title: '',
        description: '',
        region: '',
        severity_level: 'medium'
      });
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit your complaint. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedComplaintType = COMPLAINT_TYPES.find(ct => ct.value === formData.complaint_type);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-xl">
          <AlertTriangle className="w-6 h-6 text-orange-500" />
          Submit Civic Complaint
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Report civic issues that may trigger autonomous poll generation
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Complaint Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Issue Type</label>
            <Select 
              value={formData.complaint_type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, complaint_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select the type of issue" />
              </SelectTrigger>
              <SelectContent>
                {COMPLAINT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Issue Title</label>
            <Input
              placeholder="Brief, descriptive title of the issue"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Provide details about the issue, its impact, and any relevant context..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
            />
          </div>

          {/* Region */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Region
            </label>
            <Select 
              value={formData.region} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select the affected region" />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Severity Level */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Severity Level</label>
            <Select 
              value={formData.severity_level} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, severity_level: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEVERITY_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${level.color}`}></div>
                      <span>{level.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  How it works:
                </p>
                <ul className="text-blue-700 dark:text-blue-200 space-y-1 text-xs">
                  <li>• Your complaint will be analyzed for trending potential</li>
                  <li>• High-impact issues may trigger autonomous poll generation</li>
                  <li>• Polls help gather community sentiment and solutions</li>
                  <li>• Data supports evidence-based civic dialogue</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!formData.complaint_type || !formData.title || !formData.region || submitting}
          >
            {submitting ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Submit Civic Complaint
              </>
            )}
          </Button>

          {selectedComplaintType && (
            <div className="text-center">
              <Badge variant="outline" className="text-xs">
                {selectedComplaintType.icon} {selectedComplaintType.label} Issue
              </Badge>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};