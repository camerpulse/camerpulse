import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, Plus, X, Vote } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessagePollProps {
  messageId?: string;
  isCreating?: boolean;
  onPollCreate?: (pollData: any) => void;
  onClose?: () => void;
}

interface PollOption {
  text: string;
  votes: number;
  userVoted: boolean;
}

interface Poll {
  id: string;
  question: string;
  options: any;
  allow_multiple: boolean;
  expires_at: string | null;
  created_by: string;
  created_at: string;
}

export const MessagePoll: React.FC<MessagePollProps> = ({
  messageId,
  isCreating = false,
  onPollCreate,
  onClose
}) => {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [pollOptions, setPollOptions] = useState<PollOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [userVotes, setUserVotes] = useState<number[]>([]);
  
  // Poll creation state
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [expiresIn, setExpiresIn] = useState<string>('24'); // hours
  
  const { toast } = useToast();

  useEffect(() => {
    if (messageId && !isCreating) {
      loadPoll();
      loadPollVotes();
    }
  }, [messageId, isCreating]);

  const loadPoll = async () => {
    if (!messageId) return;
    
    try {
      const { data, error } = await supabase
        .from('message_polls')
        .select('*')
        .eq('message_id', messageId)
        .single();

      if (error) throw error;
      
      setPoll(data);
      
      // Initialize poll options
      const pollOpts = (data.options as string[]).map(option => ({
        text: option,
        votes: 0,
        userVoted: false
      }));
      setPollOptions(pollOpts);
      
    } catch (error) {
      console.error('Error loading poll:', error);
    }
  };

  const loadPollVotes = async () => {
    if (!poll) return;
    
    try {
      const { data: votes, error } = await supabase
        .from('poll_votes')
        .select('*')
        .eq('poll_id', poll.id);

      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      // Calculate vote counts and user votes
      const voteCounts = new Array(pollOptions.length).fill(0);
      const currentUserVotes: number[] = [];

      votes.forEach(vote => {
        voteCounts[vote.option_index]++;
        if (vote.user_id === currentUserId) {
          currentUserVotes.push(vote.option_index);
        }
      });

      setPollOptions(prev => prev.map((option, index) => ({
        ...option,
        votes: voteCounts[index],
        userVoted: currentUserVotes.includes(index)
      })));

      setUserVotes(currentUserVotes);
      
    } catch (error) {
      console.error('Error loading poll votes:', error);
    }
  };

  const createPoll = async () => {
    if (question.trim() === '' || options.filter(o => o.trim()).length < 2) {
      toast({
        title: "Invalid poll",
        description: "Please provide a question and at least 2 options.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const pollData = {
        question: question.trim(),
        options: options.filter(o => o.trim()),
        allow_multiple: allowMultiple,
        expires_at: expiresIn ? new Date(Date.now() + parseInt(expiresIn) * 60 * 60 * 1000).toISOString() : null
      };

      onPollCreate?.(pollData);
      onClose?.();
      
      toast({
        title: "Poll created",
        description: "Your poll has been created successfully."
      });
      
    } catch (error) {
      console.error('Error creating poll:', error);
      toast({
        title: "Error",
        description: "Failed to create poll. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const vote = async (optionIndex: number) => {
    if (!poll) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user already voted for this option
      const alreadyVoted = userVotes.includes(optionIndex);
      
      if (alreadyVoted) {
        // Remove vote
        const { error } = await supabase
          .from('poll_votes')
          .delete()
          .eq('poll_id', poll.id)
          .eq('user_id', user.id)
          .eq('option_index', optionIndex);

        if (error) throw error;
        
        setUserVotes(prev => prev.filter(v => v !== optionIndex));
      } else {
        // Add vote (remove other votes if single choice)
        if (!poll.allow_multiple && userVotes.length > 0) {
          // Remove existing votes first
          const { error: deleteError } = await supabase
            .from('poll_votes')
            .delete()
            .eq('poll_id', poll.id)
            .eq('user_id', user.id);

          if (deleteError) throw deleteError;
        }

        const { error } = await supabase
          .from('poll_votes')
          .insert({
            poll_id: poll.id,
            user_id: user.id,
            option_index: optionIndex
          });

        if (error) throw error;
        
        if (poll.allow_multiple) {
          setUserVotes(prev => [...prev, optionIndex]);
        } else {
          setUserVotes([optionIndex]);
        }
      }

      // Reload votes to update counts
      await loadPollVotes();
      
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Failed to record vote. Please try again.",
        variant: "destructive"
      });
    }
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const getTotalVotes = () => {
    return pollOptions.reduce((sum, option) => sum + option.votes, 0);
  };

  const getPercentage = (votes: number) => {
    const total = getTotalVotes();
    return total > 0 ? Math.round((votes / total) * 100) : 0;
  };

  if (isCreating) {
    return (
      <Dialog open={isCreating} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Create Poll
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Question</label>
              <Input
                placeholder="What's your question?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Options</label>
              <div className="space-y-2 mt-1">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                    />
                    {options.length > 2 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeOption(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {options.length < 6 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addOption}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Option
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="multiple"
                checked={allowMultiple}
                onCheckedChange={(checked) => setAllowMultiple(checked === true)}
              />
              <label htmlFor="multiple" className="text-sm">
                Allow multiple selections
              </label>
            </div>

            <div>
              <label className="text-sm font-medium">Expires in (hours)</label>
              <Input
                type="number"
                placeholder="24"
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
                className="mt-1 w-24"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={createPoll} disabled={loading}>
              {loading ? 'Creating...' : 'Create Poll'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (!poll) {
    return null;
  }

  const isExpired = poll.expires_at && new Date(poll.expires_at) < new Date();

  return (
    <div className="border rounded-lg p-4 mt-2 bg-card">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-5 h-5 text-primary" />
        <span className="font-medium">Poll</span>
        {isExpired && (
          <span className="text-xs bg-muted px-2 py-1 rounded">Expired</span>
        )}
      </div>

      <h4 className="font-medium mb-3">{poll.question}</h4>

      <div className="space-y-2">
        {pollOptions.map((option, index) => {
          const percentage = getPercentage(option.votes);
          const isVoted = userVotes.includes(index);

          return (
            <div key={index} className="relative">
              <Button
                variant={isVoted ? "default" : "outline"}
                className={cn(
                  "w-full justify-start h-auto p-3 relative overflow-hidden",
                  isExpired && "cursor-not-allowed opacity-60"
                )}
                onClick={() => !isExpired && vote(index)}
                disabled={isExpired}
              >
                <div 
                  className="absolute left-0 top-0 h-full bg-primary/10 transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
                <div className="relative flex justify-between items-center w-full">
                  <span>{option.text}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {option.votes} vote{option.votes !== 1 ? 's' : ''}
                    </span>
                    <span className="text-sm font-medium">{percentage}%</span>
                    {isVoted && <Vote className="w-4 h-4" />}
                  </div>
                </div>
              </Button>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between text-xs text-muted-foreground mt-3">
        <span>{getTotalVotes()} total vote{getTotalVotes() !== 1 ? 's' : ''}</span>
        {poll.expires_at && (
          <span>
            {isExpired ? 'Expired' : `Expires ${new Date(poll.expires_at).toLocaleDateString()}`}
          </span>
        )}
      </div>
    </div>
  );
};