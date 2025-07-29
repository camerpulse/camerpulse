import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Crown } from 'lucide-react';
import { useSendSenatorMessage } from '@/hooks/useSenatorExtended';
import { Senator } from '@/hooks/useSenators';

interface SenatorMessageDialogProps {
  senator: Senator;
  trigger: React.ReactNode;
  hasProAccess?: boolean;
}

export const SenatorMessageDialog = ({ senator, trigger, hasProAccess = false }: SenatorMessageDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message_content: '',
    message_type: 'inquiry' as const,
    priority: 'normal' as const,
    is_public: false
  });

  const sendMessage = useSendSenatorMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await sendMessage.mutateAsync({
      senator_id: senator.id,
      requires_pro_membership: !hasProAccess,
      ...formData
    });
    
    setOpen(false);
    setFormData({
      subject: '',
      message_content: '',
      message_type: 'inquiry',
      priority: 'normal',
      is_public: false
    });
  };

  const messageTypes = [
    { value: 'inquiry', label: 'General Inquiry' },
    { value: 'complaint', label: 'Complaint' },
    { value: 'suggestion', label: 'Suggestion' },
    { value: 'support', label: 'Support Request' },
    { value: 'media', label: 'Media Request' }
  ];

  if (!senator.can_receive_messages) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Message Senator
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Senator Info */}
          <Card>
            <CardContent className="pt-6">
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
                <div className="flex-1">
                  <h3 className="font-semibold">{senator.full_name || senator.name}</h3>
                  <p className="text-sm text-muted-foreground">{senator.position}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {senator.region && (
                      <Badge variant="outline" className="text-xs">
                        {senator.region}
                      </Badge>
                    )}
                    {senator.is_claimed && (
                      <Badge variant="default" className="text-xs">
                        <Crown className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {senator.message_response_time_hours && (
                <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm">
                    <strong>Typical Response Time:</strong> {senator.message_response_time_hours} hours
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {!hasProAccess && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-4 w-4 text-primary" />
                  <span className="font-medium text-primary">Pro Feature</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Messaging senators requires a Pro membership. Your message will be queued and 
                  sent once you upgrade to Pro.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Message Type */}
          <div className="space-y-2">
            <Label htmlFor="message_type">Message Type</Label>
            <Select 
              value={formData.message_type}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, message_type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {messageTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select 
              value={formData.priority}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Brief subject line for your message"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              required
            />
          </div>

          {/* Message Content */}
          <div className="space-y-2">
            <Label htmlFor="message_content">Message</Label>
            <Textarea
              id="message_content"
              placeholder="Write your message to the senator. Be respectful and specific about your concerns or questions..."
              value={formData.message_content}
              onChange={(e) => setFormData(prev => ({ ...prev, message_content: e.target.value }))}
              className="min-h-[120px]"
              required
            />
          </div>

          {/* Guidelines */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Message Guidelines:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Be respectful and professional in your communication</li>
              <li>• Clearly state your question or concern</li>
              <li>• Include relevant details like your constituency if applicable</li>
              <li>• Messages are subject to review before delivery</li>
              <li>• Response times vary by senator availability</li>
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
              disabled={
                sendMessage.isPending || 
                !formData.subject.trim() || 
                !formData.message_content.trim()
              }
            >
              <Send className="h-4 w-4 mr-2" />
              {sendMessage.isPending ? 'Sending...' : hasProAccess ? 'Send Message' : 'Queue Message'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};