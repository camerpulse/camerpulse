import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, FileText, Upload, CreditCard } from 'lucide-react';
import { useCreateSenatorClaim } from '@/hooks/useSenatorExtended';
import { Senator } from '@/hooks/useSenators';

interface SenatorClaimDialogProps {
  senator: Senator;
  trigger: React.ReactNode;
}

export const SenatorClaimDialog = ({ senator, trigger }: SenatorClaimDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    claim_type: 'ownership',
    claim_reason: '',
    evidence_files: [] as string[],
    claim_fee_amount: 500000 // 500,000 FCFA default
  });

  const createClaim = useCreateSenatorClaim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createClaim.mutateAsync({
      senator_id: senator.id,
      ...formData
    });
    
    setOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real implementation, this would upload files to storage
    // For now, we'll just simulate file paths
    if (e.target.files) {
      const fileNames = Array.from(e.target.files).map(file => file.name);
      setFormData(prev => ({
        ...prev,
        evidence_files: [...prev.evidence_files, ...fileNames]
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Claim Senator Profile
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Senator Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Profile to Claim</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                  {senator.photo_url ? (
                    <img 
                      src={senator.photo_url} 
                      alt={senator.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold">
                      {senator.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{senator.full_name || senator.name}</h3>
                  <p className="text-sm text-muted-foreground">{senator.position}</p>
                  {senator.region && (
                    <Badge variant="outline" className="text-xs mt-1">
                      {senator.region}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Claim Type */}
          <div className="space-y-2">
            <Label htmlFor="claim_type">Claim Type</Label>
            <Select 
              value={formData.claim_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, claim_type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ownership">Profile Ownership</SelectItem>
                <SelectItem value="representative">Official Representative</SelectItem>
                <SelectItem value="family">Family Member</SelectItem>
                <SelectItem value="staff">Official Staff</SelectItem>
                <SelectItem value="correction">Data Correction</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Claim Reason */}
          <div className="space-y-2">
            <Label htmlFor="claim_reason">Reason for Claim</Label>
            <Textarea
              id="claim_reason"
              placeholder="Explain why you are claiming this profile and your relationship to this senator..."
              value={formData.claim_reason}
              onChange={(e) => setFormData(prev => ({ ...prev, claim_reason: e.target.value }))}
              className="min-h-[100px]"
              required
            />
          </div>

          {/* Evidence Upload */}
          <div className="space-y-2">
            <Label htmlFor="evidence">Supporting Documents</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Upload ID cards, official documents, or other evidence
              </p>
              <Input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileUpload}
                className="max-w-xs mx-auto"
              />
            </div>
            
            {formData.evidence_files.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium mb-1">Uploaded Files:</p>
                <div className="space-y-1">
                  {formData.evidence_files.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4" />
                      {file}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Fee Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Claim Fee
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span>Profile Claim Fee:</span>
                <span className="font-semibold">500,000 FCFA</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                This fee helps verify legitimate claims and maintain platform integrity.
                Payment is required after admin approval.
              </p>
            </CardContent>
          </Card>

          {/* Terms */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Important Notes:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Claims will be reviewed by CamerPulse administrators</li>
              <li>• You must provide valid identification and evidence</li>
              <li>• False claims may result in account suspension</li>
              <li>• Payment is only required after claim approval</li>
              <li>• Processing time: 3-7 business days</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={createClaim.isPending || !formData.claim_reason.trim()}
            >
              {createClaim.isPending ? 'Submitting...' : 'Submit Claim'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};