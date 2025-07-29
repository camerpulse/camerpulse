import { useState } from 'react';
import { Star, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ReviewSubmission } from './ReviewSubmission';
import { ReviewDisplay } from './ReviewDisplay';

interface ReviewsContainerProps {
  institutionId: string;
  institutionType: string;
  institutionName: string;
}

export const ReviewsContainer = ({ institutionId, institutionType, institutionName }: ReviewsContainerProps) => {
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleReviewSubmitted = () => {
    setShowSubmissionForm(false);
    setRefreshKey(prev => prev + 1); // Force refresh of reviews
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Review Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reviews & Ratings</h2>
          <p className="text-muted-foreground">
            Share your experience and read what others have to say about {institutionName}
          </p>
        </div>
        
        <Dialog open={showSubmissionForm} onOpenChange={setShowSubmissionForm}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Write Review
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <ReviewSubmission
              institutionId={institutionId}
              institutionType={institutionType}
              institutionName={institutionName}
              onSubmitted={handleReviewSubmitted}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Reviews Display */}
      <ReviewDisplay 
        key={refreshKey}
        institutionId={institutionId} 
        institutionType={institutionType} 
      />
    </div>
  );
};