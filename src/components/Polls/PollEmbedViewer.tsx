import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Poll {
  id: string;
  title: string;
  description?: string;
  options: string[];
  vote_results?: number[];
  votes_count: number;
  creator_name?: string;
  region?: string;
  is_active: boolean;
}

const PollEmbedViewer = () => {
  const { poll_id } = useParams();
  const [searchParams] = useSearchParams();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);

  const style = searchParams.get('style') || 'compact';
  const theme = searchParams.get('theme') || 'light';
  const showCreator = searchParams.get('creator') === 'true';
  const showRegional = searchParams.get('regional') === 'true';

  useEffect(() => {
    if (poll_id) {
      fetchPoll();
    }
  }, [poll_id]);

  const fetchPoll = async () => {
    try {
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .select('*')
        .eq('id', poll_id)
        .single();

      if (pollError) throw pollError;

      // Get vote results
      const { data: voteData, error: voteError } = await supabase
        .from('poll_votes')
        .select('option_index')
        .eq('poll_id', poll_id);

      if (voteError) throw voteError;

      // Calculate vote results
      const optionsArray = Array.isArray(pollData.options) 
        ? pollData.options.map((opt: any) => typeof opt === 'string' ? opt : String(opt))
        : [];
      const voteResults = new Array(optionsArray.length).fill(0);
      voteData.forEach(vote => {
        if (vote.option_index < voteResults.length) {
          voteResults[vote.option_index]++;
        }
      });

      setPoll({
        ...pollData,
        options: optionsArray,
        vote_results: voteResults,
        votes_count: voteData.length
      });

    } catch (error) {
      console.error('Error fetching poll:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Poll not found</p>
      </div>
    );
  }

  const winningOption = poll.vote_results && poll.votes_count > 0 
    ? poll.vote_results.reduce((maxIndex, votes, index, arr) => votes > arr[maxIndex] ? index : maxIndex, 0)
    : null;

  const containerClass = theme === 'dark' 
    ? 'bg-gray-900 text-white' 
    : 'bg-white text-gray-900';

  return (
    <div className={`${containerClass} p-4 font-sans`}>
      {style === 'compact' && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg leading-tight">{poll.title}</h3>
          {showCreator && poll.creator_name && (
            <p className="text-sm opacity-75">by {poll.creator_name}</p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm">Total Votes:</span>
            <Badge className="bg-blue-100 text-blue-800">
              {poll.votes_count}
            </Badge>
          </div>
          {winningOption !== null && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-medium opacity-75">Leading Option:</p>
              <p className="font-semibold">{poll.options[winningOption]}</p>
              <p className="text-sm opacity-75">
                {poll.vote_results?.[winningOption] || 0} votes 
                ({poll.votes_count > 0 ? ((poll.vote_results?.[winningOption] || 0) / poll.votes_count * 100).toFixed(1) : 0}%)
              </p>
            </div>
          )}
          <div className="text-center pt-2">
            <a 
              href={`${window.location.origin}/polls/results/${poll.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              View Full Results on CamerPulse
            </a>
          </div>
        </div>
      )}

      {style === 'full-chart' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg leading-tight">{poll.title}</h3>
          {showCreator && poll.creator_name && (
            <p className="text-sm opacity-75">by {poll.creator_name}</p>
          )}
          <div className="space-y-3">
            {poll.options.map((option, index) => {
              const votes = poll.vote_results?.[index] || 0;
              const percentage = poll.votes_count > 0 ? (votes / poll.votes_count) * 100 : 0;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{option}</span>
                    <span>{percentage.toFixed(1)}% ({votes})</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center pt-2 border-t border-gray-200">
            <p className="text-sm opacity-75 mb-2">{poll.votes_count} total votes</p>
            <a 
              href={`${window.location.origin}/polls/results/${poll.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              View Full Results on CamerPulse
            </a>
          </div>
        </div>
      )}

      {style === 'clean-text' && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg leading-tight">{poll.title}</h3>
          {showCreator && poll.creator_name && (
            <p className="text-sm opacity-75">by {poll.creator_name}</p>
          )}
          <ul className="space-y-2">
            {poll.options.map((option, index) => {
              const votes = poll.vote_results?.[index] || 0;
              const percentage = poll.votes_count > 0 ? (votes / poll.votes_count) * 100 : 0;
              return (
                <li key={index} className="flex justify-between items-center">
                  <span className="font-medium">{option}</span>
                  <span className="text-sm">
                    {percentage.toFixed(1)}% ({votes})
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="text-center pt-2 border-t border-gray-200">
            <p className="text-sm opacity-75 mb-2">{poll.votes_count} total votes</p>
            <a 
              href={`${window.location.origin}/polls/results/${poll.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              View Full Results on CamerPulse
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default PollEmbedViewer;