import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Edit,
  TrendingUp,
  Award,
  FileText,
  Calendar
} from 'lucide-react';
import { useCivicSuggestions, useUserReputation, SuggestionStatus } from '@/hooks/useCivicSuggestions';
import { formatDistanceToNow } from 'date-fns';

const statusColors: Record<SuggestionStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  needs_revision: 'bg-orange-100 text-orange-800',
};

const statusIcons: Record<SuggestionStatus, React.ReactNode> = {
  pending: <Clock className="h-4 w-4" />,
  under_review: <Edit className="h-4 w-4" />,
  approved: <CheckCircle className="h-4 w-4" />,
  rejected: <XCircle className="h-4 w-4" />,
  needs_revision: <Edit className="h-4 w-4" />,
};

export const UserSuggestionsDashboard: React.FC = () => {
  const { userSuggestions, loadingUserSuggestions } = useCivicSuggestions();
  const { reputation, isLoading: loadingReputation } = useUserReputation();

  const groupedSuggestions = {
    pending: userSuggestions?.filter(s => s.status === 'pending') || [],
    under_review: userSuggestions?.filter(s => s.status === 'under_review') || [],
    approved: userSuggestions?.filter(s => s.status === 'approved') || [],
    rejected: userSuggestions?.filter(s => s.status === 'rejected') || [],
    needs_revision: userSuggestions?.filter(s => s.status === 'needs_revision') || [],
  };

  const getContributionLevel = (level: string) => {
    const levels = {
      bronze: { color: 'text-amber-600', icon: '🥉' },
      silver: { color: 'text-gray-500', icon: '🥈' },
      gold: { color: 'text-yellow-500', icon: '🥇' },
      platinum: { color: 'text-purple-600', icon: '💎' },
    };
    return levels[level as keyof typeof levels] || levels.bronze;
  };

  if (loadingUserSuggestions || loadingReputation) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your contributions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with reputation stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5" />
              Contributor Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reputation ? (
              <div className="text-center">
                <div className="text-2xl font-bold flex items-center justify-center gap-2">
                  <span>{getContributionLevel(reputation.contribution_level).icon}</span>
                  <span className={getContributionLevel(reputation.contribution_level).color}>
                    {reputation.contribution_level.charAt(0).toUpperCase() + reputation.contribution_level.slice(1)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {reputation.accuracy_rate}% accuracy rate
                </div>
                <Progress value={reputation.accuracy_rate} className="mt-2" />
              </div>
            ) : (
              <div className="text-center text-gray-500">
                Start contributing to earn reputation
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Total Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-center">
              {reputation?.total_suggestions || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-center text-green-600">
              {reputation?.approved_suggestions || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Reputation Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-center text-blue-600">
              {reputation?.reputation_score || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suggestions tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All ({userSuggestions?.length || 0})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({groupedSuggestions.pending.length})</TabsTrigger>
          <TabsTrigger value="under_review">Under Review ({groupedSuggestions.under_review.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({groupedSuggestions.approved.length})</TabsTrigger>
          <TabsTrigger value="needs_revision">Needs Revision ({groupedSuggestions.needs_revision.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({groupedSuggestions.rejected.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <SuggestionsList suggestions={userSuggestions || []} />
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <SuggestionsList suggestions={groupedSuggestions.pending} />
        </TabsContent>

        <TabsContent value="under_review" className="mt-6">
          <SuggestionsList suggestions={groupedSuggestions.under_review} />
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <SuggestionsList suggestions={groupedSuggestions.approved} />
        </TabsContent>

        <TabsContent value="needs_revision" className="mt-6">
          <SuggestionsList suggestions={groupedSuggestions.needs_revision} />
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <SuggestionsList suggestions={groupedSuggestions.rejected} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface SuggestionsListProps {
  suggestions: any[];
}

const SuggestionsList: React.FC<SuggestionsListProps> = ({ suggestions }) => {
  if (suggestions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600">No suggestions found</h3>
        <p className="text-gray-500 mt-2">Your suggestions will appear here once you submit them.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {suggestions.map((suggestion) => (
        <Card key={suggestion.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                <CardDescription className="mt-1">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="capitalize">
                      {suggestion.suggestion_type.replace('_', ' ')} • {suggestion.entity_type.replace('_', ' ')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(suggestion.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </CardDescription>
              </div>
              <Badge className={statusColors[suggestion.status]}>
                {statusIcons[suggestion.status]}
                <span className="ml-1 capitalize">{suggestion.status.replace('_', ' ')}</span>
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            {suggestion.description && (
              <p className="text-sm text-gray-600 mb-3">
                {suggestion.description}
              </p>
            )}

            {suggestion.change_summary && (
              <div className="mb-3">
                <span className="text-sm font-medium">Changes requested:</span>
                <p className="text-sm text-gray-600 mt-1">{suggestion.change_summary}</p>
              </div>
            )}

            {suggestion.moderator_notes && (
              <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-800">Moderator feedback:</span>
                <p className="text-sm text-blue-700 mt-1">{suggestion.moderator_notes}</p>
              </div>
            )}

            {suggestion.rejection_reason && (
              <div className="mb-3 p-3 bg-red-50 rounded-lg">
                <span className="text-sm font-medium text-red-800">Rejection reason:</span>
                <p className="text-sm text-red-700 mt-1">{suggestion.rejection_reason}</p>
              </div>
            )}

            {suggestion.evidence_urls && suggestion.evidence_urls.length > 0 && (
              <div className="mt-3">
                <span className="text-sm font-medium">Supporting evidence:</span>
                <div className="mt-1 space-y-1">
                  {suggestion.evidence_urls.map((url: string, index: number) => (
                    <a 
                      key={index} 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:text-blue-800 text-sm truncate"
                    >
                      {url}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons for editable suggestions */}
            {suggestion.status === 'needs_revision' && (
              <div className="mt-4 pt-3 border-t">
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Suggestion
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};