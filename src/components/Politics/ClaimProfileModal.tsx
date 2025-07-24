import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ClaimProfileModalProps {
  open: boolean;
  onClose: () => void;
  profileId: string;
  profileName: string;
  profileType: 'politician' | 'senator' | 'mp' | 'minister';
}

export const ClaimProfileModal: React.FC<ClaimProfileModalProps> = ({
  open,
  onClose,
  profileId,
  profileName,
  profileType
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    officialTitle: '',
    verificationReason: '',
    evidenceFiles: [] as File[]
  });
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      evidenceFiles: [...prev.evidenceFiles, ...files]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.verificationReason) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // TODO: Submit claim request to database
      toast({
        title: "Claim Request Submitted",
        description: "Your profile claim request has been submitted for review. You will be notified once it's processed.",
      });
      onClose();
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        officialTitle: '',
        verificationReason: '',
        evidenceFiles: []
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit claim request",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Claim Profile: {profileName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-700">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Profile Verification</span>
            </div>
            <p className="text-sm text-blue-600 mt-1">
              If this is your official profile, please provide verification details below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Full Name *
              </label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Your full legal name"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Official Title
              </label>
              <Input
                value={formData.officialTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, officialTitle: e.target.value }))}
                placeholder="e.g., Senator, MP, Minister"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Email Address *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="official@government.cm"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Phone Number
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+237 XXX XXX XXX"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Verification Reason *
            </label>
            <Textarea
              value={formData.verificationReason}
              onChange={(e) => setFormData(prev => ({ ...prev, verificationReason: e.target.value }))}
              placeholder="Please explain why you should be verified for this profile..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Supporting Documents
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Upload official documents (ID, appointment letter, etc.)
              </p>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="evidence-upload"
              />
              <label htmlFor="evidence-upload" className="cursor-pointer">
                <Button type="button" variant="outline" size="sm">
                  Choose Files
                </Button>
              </label>
            </div>
            {formData.evidenceFiles.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium">Uploaded files:</p>
                <ul className="text-sm text-gray-600">
                  {formData.evidenceFiles.map((file, index) => (
                    <li key={index} className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-700">
              <strong>Note:</strong> Your claim request will be reviewed by our verification team. 
              This process may take 3-5 business days. You will receive an email notification once reviewed.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Submitting...' : 'Submit Claim'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};