import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, MessageCircle, FileText, BarChart3, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Senator, SenatorRating } from '@/hooks/useSenators';
import { format } from 'date-fns';

interface CitizenFeedbackWallProps {
  senator: Senator;
  ratings: SenatorRating[];
}

export function CitizenFeedbackWall({ senator, ratings }: CitizenFeedbackWallProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  // Mock data for additional feedback features
  const civicQuestions = [
    {
      id: 1,
      question: "What is your stance on the new education reform bill?",
      author: "Concerned Parent",
      date: "2024-01-15",
      upvotes: 24,
      hasAnswer: false
    },
    {
      id: 2,
      question: "How will you address the infrastructure issues in our region?",
      author: "Local Business Owner",
      date: "2024-01-10",
      upvotes: 18,
      hasAnswer: true
    }
  ];

  const petitionMentions = [
    {
      id: 1,
      title: "Improve Healthcare Access in Rural Areas",
      type: "supporting",
      signatures: 1247,
      status: "active"
    },
    {
      id: 2,
      title: "Transparency in Government Spending",
      type: "criticism",
      signatures: 892,
      status: "closed"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Citizen Feedback Wall
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Verified Reviews */}
        <div>
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Star className="h-4 w-4" />
            Verified Reviews from Citizens
          </h4>
          
          {ratings && ratings.length > 0 ? (
            <div className="space-y-4">
              {ratings.slice(0, 3).map((rating) => (
                <div key={rating.id} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {rating.is_anonymous ? 'A' : 'V'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {rating.is_anonymous ? 'Anonymous Citizen' : 'Verified User'}
                        </p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star}
                              className={`h-3 w-3 ${
                                star <= rating.overall_rating 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {formatDate(rating.created_at!)}
                    </Badge>
                  </div>
                  
                  {rating.comment && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      "{rating.comment}"
                    </p>
                  )}
                  
                  {/* Sub-ratings */}
                  {(rating.leadership_rating || rating.transparency_rating || rating.responsiveness_rating) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {rating.leadership_rating && (
                        <Badge variant="outline" className="text-xs">
                          Leadership: {rating.leadership_rating}/5
                        </Badge>
                      )}
                      {rating.transparency_rating && (
                        <Badge variant="outline" className="text-xs">
                          Transparency: {rating.transparency_rating}/5
                        </Badge>
                      )}
                      {rating.responsiveness_rating && (
                        <Badge variant="outline" className="text-xs">
                          Responsiveness: {rating.responsiveness_rating}/5
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {ratings.length > 3 && (
                <Button variant="outline" className="w-full">
                  View All {ratings.length} Reviews
                </Button>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No citizen reviews yet. Be the first to share your feedback!
            </p>
          )}
        </div>

        {/* Civic Questions */}
        <div className="border-t pt-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Civic Questions (Q&A)
          </h4>
          
          <div className="space-y-3">
            {civicQuestions.map((question) => (
              <div key={question.id} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium">{question.question}</p>
                  {question.hasAnswer && (
                    <Badge variant="default" className="text-xs">Answered</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>by {question.author} • {question.date}</span>
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-3 w-3" />
                    <span>{question.upvotes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <Button variant="outline" size="sm" className="w-full mt-3">
            Ask a Question
          </Button>
        </div>

        {/* Petition Mentions */}
        <div className="border-t pt-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Petition Mentions
          </h4>
          
          <div className="space-y-3">
            {petitionMentions.map((petition) => (
              <div key={petition.id} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium">{petition.title}</p>
                  <Badge 
                    variant={petition.type === 'supporting' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {petition.type === 'supporting' ? 'Supporting' : 'Criticism'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{petition.signatures} signatures</span>
                  <Badge variant="outline" className="text-xs">
                    {petition.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Public Poll Participation */}
        <div className="border-t pt-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Public Poll Participation
          </h4>
          
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-muted/30 rounded">
              <p className="text-lg font-bold text-primary">8</p>
              <p className="text-xs text-muted-foreground">Polls Participated</p>
            </div>
            <div className="p-3 bg-muted/30 rounded">
              <p className="text-lg font-bold text-primary">76%</p>
              <p className="text-xs text-muted-foreground">Citizen Agreement</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}