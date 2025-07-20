import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Scale, 
  Shield, 
  FileText, 
  Phone,
  Mail,
  CheckCircle,
  AlertTriangle,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const LegalAidPortal: React.FC = () => {
  const [requestType, setRequestType] = useState('');
  const [formData, setFormData] = useState({
    requester_alias: '',
    submission_id: '',
    legal_issue_category: '',
    urgency_level: 5,
    request_description: '',
    contact_preference: 'secure_messaging',
    encrypted_contact_info: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const requestTypes = [
    { value: 'advice', label: 'Legal Advice', description: 'Get guidance on legal matters' },
    { value: 'representation', label: 'Legal Representation', description: 'Request a lawyer for your case' },
    { value: 'protection', label: 'Protection Order', description: 'Request legal protection measures' },
  ];

  const legalCategories = [
    'Constitutional Rights',
    'Criminal Defense',
    'Civil Rights',
    'Administrative Law',
    'Employment Law',
    'Human Rights',
    'Environmental Law',
    'Corruption Cases',
    'Whistleblower Protection',
    'Other'
  ];

  const contactPreferences = [
    { value: 'secure_messaging', label: 'Secure Messaging (Recommended)' },
    { value: 'encrypted_email', label: 'Encrypted Email' },
    { value: 'anonymous_phone', label: 'Anonymous Phone Call' },
    { value: 'in_person_secure', label: 'In-Person (Secure Location)' },
  ];

  const generateAlias = () => {
    const adjectives = ['Anonymous', 'Protected', 'Secure', 'Safe', 'Hidden'];
    const nouns = ['Client', 'Seeker', 'Citizen', 'Individual', 'Person'];
    const numbers = Math.floor(1000 + Math.random() * 9000);
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${numbers}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const alias = formData.requester_alias || generateAlias();
      
      const { error } = await supabase
        .from('civic_legal_aid_requests')
        .insert({
          ...formData,
          requester_alias: alias,
          request_type: requestType,
        });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Legal Aid Request Submitted",
        description: "Your request has been securely submitted. You will be contacted through your preferred method.",
      });

    } catch (error: any) {
      console.error('Legal aid request error:', error);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Legal Aid Request Submitted</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="font-semibold mb-4">What happens next?</h3>
            <div className="space-y-3 text-sm text-left">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Your request is being reviewed by our legal aid coordinators</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>A qualified lawyer will be assigned based on your case type</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>You will be contacted within 24-48 hours through your preferred method</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>All communications will be encrypted and confidential</span>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Your request is protected by attorney-client privilege
            </p>
            <p className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              All communications are encrypted end-to-end
            </p>
          </div>

          <Button onClick={() => setSubmitted(false)} variant="outline">
            Submit Another Request
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Civic Legal Aid Portal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium">Free Consultation</h3>
              <p className="text-sm text-muted-foreground">Initial legal advice at no cost</p>
            </div>
            <div className="text-center">
              <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium">Protected Communication</h3>
              <p className="text-sm text-muted-foreground">Attorney-client privilege guaranteed</p>
            </div>
            <div className="text-center">
              <User className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-medium">Anonymous Service</h3>
              <p className="text-sm text-muted-foreground">Complete anonymity if requested</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Selection */}
      {!requestType && (
        <Card>
          <CardHeader>
            <CardTitle>Select Legal Aid Service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {requestTypes.map((type) => (
                <Card 
                  key={type.value} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setRequestType(type.value)}
                >
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{type.label}</h3>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                      <Scale className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Request Form */}
      {requestType && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {requestTypes.find(t => t.value === requestType)?.label} Request
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setRequestType('')}
              >
                Change Service
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Anonymous ID */}
              <div>
                <Label htmlFor="alias">Anonymous ID (Optional)</Label>
                <Input
                  id="alias"
                  value={formData.requester_alias}
                  onChange={(e) => setFormData({...formData, requester_alias: e.target.value})}
                  placeholder="Leave blank for auto-generated ID"
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  A unique anonymous ID will be generated if not provided
                </p>
              </div>

              {/* Related Submission */}
              <div>
                <Label htmlFor="submission">Related Submission Code (Optional)</Label>
                <Input
                  id="submission"
                  value={formData.submission_id}
                  onChange={(e) => setFormData({...formData, submission_id: e.target.value})}
                  placeholder="CS-2025-XXXXXXXX"
                  className="mt-2 font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  If this request relates to a whistleblower submission
                </p>
              </div>

              {/* Legal Issue Category */}
              <div>
                <Label htmlFor="category">Legal Issue Category</Label>
                <Select
                  value={formData.legal_issue_category}
                  onValueChange={(value) => setFormData({...formData, legal_issue_category: value})}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {legalCategories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Urgency Level */}
              <div>
                <Label htmlFor="urgency">Urgency Level (1-10)</Label>
                <Input
                  id="urgency"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.urgency_level}
                  onChange={(e) => setFormData({...formData, urgency_level: parseInt(e.target.value)})}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  1 = General inquiry, 10 = Emergency legal situation
                </p>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Describe Your Legal Situation</Label>
                <Textarea
                  id="description"
                  value={formData.request_description}
                  onChange={(e) => setFormData({...formData, request_description: e.target.value})}
                  placeholder="Provide details about your legal issue, what help you need, and any relevant circumstances. Be as specific as possible to help us assign the right lawyer."
                  rows={6}
                  className="mt-2"
                  required
                />
              </div>

              {/* Contact Preference */}
              <div>
                <Label htmlFor="contact-method">Preferred Contact Method</Label>
                <Select
                  value={formData.contact_preference}
                  onValueChange={(value) => setFormData({...formData, contact_preference: value})}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select contact method" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactPreferences.map((pref) => (
                      <SelectItem key={pref.value} value={pref.value}>{pref.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Contact Information */}
              {formData.contact_preference !== 'secure_messaging' && (
                <div>
                  <Label htmlFor="contact-info">
                    {formData.contact_preference === 'encrypted_email' ? 'Email Address' :
                     formData.contact_preference === 'anonymous_phone' ? 'Phone Number' :
                     'Contact Information'}
                  </Label>
                  <Input
                    id="contact-info"
                    value={formData.encrypted_contact_info}
                    onChange={(e) => setFormData({...formData, encrypted_contact_info: e.target.value})}
                    placeholder={
                      formData.contact_preference === 'encrypted_email' ? 'your.email@example.com' :
                      formData.contact_preference === 'anonymous_phone' ? '+237 XXX XXX XXX' :
                      'Your contact information'
                    }
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This information will be encrypted and only shared with your assigned lawyer
                  </p>
                </div>
              )}

              {/* Security Notice */}
              <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Security & Confidentiality</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• All communications are protected by attorney-client privilege</li>
                  <li>• Your information is encrypted and stored securely</li>
                  <li>• Lawyers are bound by professional confidentiality rules</li>
                  <li>• You can remain completely anonymous if desired</li>
                </ul>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !formData.legal_issue_category || !formData.request_description}
                  className="bg-primary text-primary-foreground"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Legal Aid Request'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Emergency Notice */}
      <Card className="mt-6 border-orange-200 bg-orange-50/50">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <div>
              <p className="font-medium text-sm text-orange-800">Emergency Legal Situations</p>
              <p className="text-xs text-orange-700">
                If you are in immediate legal danger or need emergency protection, 
                contact local authorities or emergency services immediately.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};