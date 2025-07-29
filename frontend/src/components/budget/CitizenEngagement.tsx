import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Star, MessageCircle, FileText, Send, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CitizenEngagementProps {
  projectId: string;
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
  type: 'rate' | 'clarify' | 'petition';
}

export const CitizenEngagement: React.FC<CitizenEngagementProps> = ({
  projectId,
  projectName,
  isOpen,
  onClose,
  type
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [email, setEmail] = useState('');
  const [petitionTitle, setPetitionTitle] = useState('');
  const [petitionDescription, setPetitionDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (type === 'rate') {
        toast({
          title: "Rating Submitted",
          description: "Thank you for rating this project. Your feedback helps improve transparency."
        });
      } else if (type === 'clarify') {
        toast({
          title: "Clarification Request Sent",
          description: "Your request has been sent to the responsible ministry. You'll receive updates via email."
        });
      } else if (type === 'petition') {
        toast({
          title: "Petition Created",
          description: "Your petition has been created and is now open for signatures."
        });
      }
      
      onClose();
      // Reset form
      setRating(0);
      setComment('');
      setEmail('');
      setPetitionTitle('');
      setPetitionDescription('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'rate': return 'Rate Project';
      case 'clarify': return 'Request Clarification';
      case 'petition': return 'Start Petition';
      default: return '';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'rate': return <Star className="h-5 w-5" />;
      case 'clarify': return <MessageCircle className="h-5 w-5" />;
      case 'petition': return <FileText className="h-5 w-5" />;
      default: return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            {getTitle()}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Project:</p>
            <p className="font-medium">{projectName}</p>
          </div>

          {type === 'rate' && (
            <>
              <div>
                <p className="text-sm font-medium mb-2">Rate this project's performance:</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-1 ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                      <Star className="h-6 w-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Comments (optional):</label>
                <Textarea
                  placeholder="Share your thoughts on this project..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="mt-1"
                />
              </div>
            </>
          )}

          {type === 'clarify' && (
            <>
              <div>
                <label className="text-sm font-medium">What would you like clarification on?</label>
                <Textarea
                  placeholder="Describe what aspect of this project you'd like more information about..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Your Email:</label>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  We'll send updates about your request to this email
                </p>
              </div>
            </>
          )}

          {type === 'petition' && (
            <>
              <div>
                <label className="text-sm font-medium">Petition Title:</label>
                <Input
                  placeholder="e.g., Improve project transparency"
                  value={petitionTitle}
                  onChange={(e) => setPetitionTitle(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description:</label>
                <Textarea
                  placeholder="Describe what you want to change or address about this project..."
                  value={petitionDescription}
                  onChange={(e) => setPetitionDescription(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Your Email:</label>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
            </>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || (type === 'rate' && rating === 0) || 
                       (type === 'clarify' && (!comment || !email)) ||
                       (type === 'petition' && (!petitionTitle || !petitionDescription || !email))}
              className="flex-1"
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};