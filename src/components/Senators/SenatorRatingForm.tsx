import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RatingStars } from '@/components/camerpulse/RatingStars';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useRateSenator, useUserSenatorRating } from '@/hooks/useSenators';
import { useAuth } from '@/hooks/useAuth';

const ratingSchema = z.object({
  overall_rating: z.number().min(1).max(5),
  leadership_rating: z.number().min(1).max(5).optional(),
  transparency_rating: z.number().min(1).max(5).optional(),
  responsiveness_rating: z.number().min(1).max(5).optional(),
  effectiveness_rating: z.number().min(1).max(5).optional(),
  comment: z.string().optional(),
  is_anonymous: z.boolean().default(false),
});

type RatingFormData = z.infer<typeof ratingSchema>;

interface SenatorRatingFormProps {
  senatorId: string;
}

export const SenatorRatingForm = ({ senatorId }: SenatorRatingFormProps) => {
  const { user } = useAuth();
  const { data: existingRating } = useUserSenatorRating(senatorId);
  const rateSenator = useRateSenator();

  const form = useForm<RatingFormData>({
    resolver: zodResolver(ratingSchema),
    defaultValues: existingRating ? {
      overall_rating: existingRating.overall_rating,
      leadership_rating: existingRating.leadership_rating || 0,
      transparency_rating: existingRating.transparency_rating || 0,
      responsiveness_rating: existingRating.responsiveness_rating || 0,
      effectiveness_rating: existingRating.effectiveness_rating || 0,
      comment: existingRating.comment || '',
      is_anonymous: existingRating.is_anonymous,
    } : {
      overall_rating: 0,
      leadership_rating: 0,
      transparency_rating: 0,
      responsiveness_rating: 0,
      effectiveness_rating: 0,
      comment: '',
      is_anonymous: false,
    },
  });

  const onSubmit = (data: RatingFormData) => {
    if (!user) {
      alert('Please sign in to rate senators');
      return;
    }

    rateSenator.mutate({
      senator_id: senatorId,
      overall_rating: data.overall_rating,
      leadership_rating: data.leadership_rating || undefined,
      transparency_rating: data.transparency_rating || undefined,
      responsiveness_rating: data.responsiveness_rating || undefined,
      effectiveness_rating: data.effectiveness_rating || undefined,
      comment: data.comment,
      is_anonymous: data.is_anonymous,
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            {existingRating ? 'Update Your Rating' : 'Rate This Senator'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="overall_rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Rating</FormLabel>
                    <FormControl>
                      <RatingStars
                        rating={field.value}
                        maxRating={5}
                        size="lg"
                        showLabel
                        onRatingChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="leadership_rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Leadership</FormLabel>
                      <FormControl>
                        <RatingStars
                          rating={field.value || 0}
                          maxRating={5}
                          onRatingChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transparency_rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transparency</FormLabel>
                      <FormControl>
                        <RatingStars
                          rating={field.value || 0}
                          maxRating={5}
                          onRatingChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="responsiveness_rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsiveness</FormLabel>
                      <FormControl>
                        <RatingStars
                          rating={field.value || 0}
                          maxRating={5}
                          onRatingChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="effectiveness_rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Effectiveness</FormLabel>
                      <FormControl>
                        <RatingStars
                          rating={field.value || 0}
                          maxRating={5}
                          onRatingChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comment (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your thoughts about this senator..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_anonymous"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Submit anonymously</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full"
                disabled={rateSenator.isPending || form.watch('overall_rating') === 0}
              >
                {rateSenator.isPending ? 'Submitting...' : 
                 existingRating ? 'Update Rating' : 'Submit Rating'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};