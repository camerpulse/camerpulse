import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Send } from 'lucide-react';
import { useEntityReviews, CivicEntityType } from '@/hooks/useCivicSuggestions';
import { useAuth } from '@/contexts/AuthContext';

const reviewSchema = z.object({
  overall_rating: z.number().min(1).max(5),
  transparency_rating: z.number().min(1).max(5).optional(),
  responsiveness_rating: z.number().min(1).max(5).optional(),
  service_quality_rating: z.number().min(1).max(5).optional(),
  accessibility_rating: z.number().min(1).max(5).optional(),
  review_title: z.string().max(100).optional(),
  review_content: z.string().max(1000).optional(),
});

interface EntityReviewFormProps {
  entityType: CivicEntityType;
  entityId: string;
  entityName: string;
}

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  description?: string;
}

const StarRating: React.FC<StarRatingProps> = ({ value, onChange, label, description }) => {
  return (
    <div className="space-y-2">
      <div>
        <FormLabel>{label}</FormLabel>
        {description && <FormDescription>{description}</FormDescription>}
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={`p-1 transition-colors ${
              rating <= value 
                ? 'text-yellow-400 hover:text-yellow-500' 
                : 'text-gray-300 hover:text-gray-400'
            }`}
          >
            <Star 
              className="h-6 w-6" 
              fill={rating <= value ? 'currentColor' : 'none'}
            />
          </button>
        ))}
      </div>
      <p className="text-sm text-gray-600">
        {value === 1 && 'Poor'}
        {value === 2 && 'Fair'}
        {value === 3 && 'Good'}
        {value === 4 && 'Very Good'}
        {value === 5 && 'Excellent'}
      </p>
    </div>
  );
};

export const EntityReviewForm: React.FC<EntityReviewFormProps> = ({
  entityType,
  entityId,
  entityName,
}) => {
  const { user } = useAuth();
  const { reviews, submitReview, isSubmitting } = useEntityReviews(entityType, entityId);
  
  const form = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      overall_rating: 0,
      transparency_rating: 0,
      responsiveness_rating: 0,
      service_quality_rating: 0,
      accessibility_rating: 0,
      review_title: '',
      review_content: '',
    },
  });

  // Check if user has already reviewed this entity
  const existingReview = reviews?.find(review => review.user_id === user?.id);

  const onSubmit = (data: any) => {
    // Filter out zero ratings for optional fields
    const filteredData = {
      ...data,
      transparency_rating: data.transparency_rating || undefined,
      responsiveness_rating: data.responsiveness_rating || undefined,
      service_quality_rating: data.service_quality_rating || undefined,
      accessibility_rating: data.accessibility_rating || undefined,
    };
    
    submitReview(filteredData);
    form.reset();
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Write a Review</CardTitle>
          <CardDescription>
            Please log in to write a review for {entityName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.pathname = '/auth'}>
            Log In to Review
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (existingReview) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Review</CardTitle>
          <CardDescription>
            You have already reviewed {entityName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Overall Rating:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Star
                    key={rating}
                    className={`h-4 w-4 ${
                      rating <= existingReview.overall_rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            {existingReview.review_title && (
              <div>
                <span className="text-sm font-medium">Title:</span>
                <p className="text-sm">{existingReview.review_title}</p>
              </div>
            )}
            
            {existingReview.review_content && (
              <div>
                <span className="text-sm font-medium">Review:</span>
                <p className="text-sm mt-1">{existingReview.review_content}</p>
              </div>
            )}
            
            <p className="text-xs text-gray-500">
              Reviewed on {new Date(existingReview.created_at).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
        <CardDescription>
          Share your experience with {entityName} to help other citizens
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Overall Rating - Required */}
            <FormField
              control={form.control}
              name="overall_rating"
              render={({ field }) => (
                <FormItem>
                  <StarRating
                    value={field.value}
                    onChange={field.onChange}
                    label="Overall Rating *"
                    description="Your general experience with this entity"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category-specific ratings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(entityType === 'politician' || entityType === 'mp' || entityType === 'senator' || entityType === 'ministry') && (
                <FormField
                  control={form.control}
                  name="transparency_rating"
                  render={({ field }) => (
                    <FormItem>
                      <StarRating
                        value={field.value || 0}
                        onChange={field.onChange}
                        label="Transparency"
                        description="How open and transparent are they?"
                      />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="responsiveness_rating"
                render={({ field }) => (
                  <FormItem>
                    <StarRating
                      value={field.value || 0}
                      onChange={field.onChange}
                      label="Responsiveness"
                      description="How quickly do they respond to issues?"
                    />
                  </FormItem>
                )}
              />

              {(entityType === 'hospital' || entityType === 'school' || entityType === 'pharmacy' || entityType === 'company') && (
                <FormField
                  control={form.control}
                  name="service_quality_rating"
                  render={({ field }) => (
                    <FormItem>
                      <StarRating
                        value={field.value || 0}
                        onChange={field.onChange}
                        label="Service Quality"
                        description="Quality of services provided"
                      />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="accessibility_rating"
                render={({ field }) => (
                  <FormItem>
                    <StarRating
                      value={field.value || 0}
                      onChange={field.onChange}
                      label="Accessibility"
                      description="How easy is it to access their services?"
                    />
                  </FormItem>
                )}
              />
            </div>

            {/* Written Review */}
            <FormField
              control={form.control}
              name="review_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Review Title (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief title for your review" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="review_content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Review (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Share your detailed experience..."
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Help others by sharing specific details about your experience
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting || form.watch('overall_rating') === 0}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};