import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ThumbsUp, ThumbsDown, MessageSquare, Plus, Search, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CivicQuestion {
  id: string;
  user_id: string;
  question_text: string;
  question_type: string;
  status: string;
  answer_text?: string;
  answered_by?: string;
  answered_at?: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
}

export const CivicQuestions: React.FC = () => {
  const [showNewQuestion, setShowNewQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [questionType, setQuestionType] = useState('general');
  const [filterType, setFilterType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Fetch civic questions
  const { data: questions, isLoading, refetch } = useQuery({
    queryKey: ['civic-questions', filterType, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('civic_questions')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (filterType) {
        query = query.eq('question_type', filterType);
      }

      if (searchTerm) {
        query = query.ilike('question_text', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CivicQuestion[];
    }
  });

  const questionTypes = [
    { id: 'constitution', name: 'Constitution', color: 'bg-blue-500' },
    { id: 'rights', name: 'Rights & Duties', color: 'bg-green-500' },
    { id: 'electoral', name: 'Electoral Process', color: 'bg-purple-500' },
    { id: 'government', name: 'Government', color: 'bg-orange-500' },
    { id: 'legal', name: 'Legal Process', color: 'bg-red-500' },
    { id: 'general', name: 'General', color: 'bg-gray-500' }
  ];

  const submitQuestion = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to ask questions",
        variant: "destructive"
      });
      return;
    }

    if (!newQuestion.trim()) {
      toast({
        title: "Question Required",
        description: "Please enter your question",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('civic_questions')
      .insert({
        user_id: user.id,
        question_text: newQuestion,
        question_type: questionType
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit question",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Question Submitted",
      description: "Your question has been posted and will be reviewed"
    });

    setNewQuestion('');
    setShowNewQuestion(false);
    refetch();
  };

  const handleVote = async (questionId: string, voteType: 'up' | 'down') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to vote on questions",
        variant: "destructive"
      });
      return;
    }

    // For simplicity, we'll just update the vote count directly
    // In a real app, you'd track individual votes to prevent duplicate voting
    const question = questions?.find(q => q.id === questionId);
    if (!question) return;

    const updates = voteType === 'up' 
      ? { upvotes: question.upvotes + 1 }
      : { downvotes: question.downvotes + 1 };

    const { error } = await supabase
      .from('civic_questions')
      .update(updates)
      .eq('id', questionId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to vote",
        variant: "destructive"
      });
      return;
    }

    refetch();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'approved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    const typeObj = questionTypes.find(t => t.id === type);
    return typeObj ? typeObj.color : 'bg-gray-500';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Civic Q&A Forum</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Ask questions about laws, rights, and civic processes
          </p>
        </div>
        <Button onClick={() => setShowNewQuestion(!showNewQuestion)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Ask Question
        </Button>
      </div>

      {/* New Question Form */}
      {showNewQuestion && (
        <Card>
          <CardHeader>
            <CardTitle>Ask a New Question</CardTitle>
            <CardDescription>
              Get expert answers on constitutional law, civic rights, and legal processes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Question Type</label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {questionTypes.map((type) => (
                    <Button
                      key={type.id}
                      variant={questionType === type.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setQuestionType(type.id)}
                      className="text-xs"
                    >
                      {type.name}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Your Question</label>
                <Textarea
                  placeholder="What would you like to know about civic law, rights, or processes?"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  rows={4}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={submitQuestion}>Submit Question</Button>
                <Button variant="outline" onClick={() => setShowNewQuestion(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-background"
          >
            <option value="">All Types</option>
            {questionTypes.map((type) => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions?.map((question) => (
          <Card key={question.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{question.question_text}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getStatusColor(question.status)}>
                      {question.status}
                    </Badge>
                    <Badge variant="outline" className={`${getTypeColor(question.question_type)} text-white`}>
                      {questionTypes.find(t => t.id === question.question_type)?.name || question.question_type}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(question.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            {question.answer_text && (
              <CardContent>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-green-900 dark:text-green-100">Answer</h4>
                  <p className="text-green-800 dark:text-green-200 whitespace-pre-wrap">
                    {question.answer_text}
                  </p>
                  {question.answered_at && (
                    <p className="text-sm text-green-600 dark:text-green-300 mt-2">
                      Answered on {new Date(question.answered_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </CardContent>
            )}
            
            <CardContent className="pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(question.id, 'up')}
                    className="flex items-center gap-1"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    {question.upvotes}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(question.id, 'down')}
                    className="flex items-center gap-1"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    {question.downvotes}
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MessageSquare className="w-4 h-4" />
                  <span>Discuss</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {!isLoading && (!questions || questions.length === 0) && (
        <Card>
          <CardContent className="flex items-center justify-center h-96">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold mb-2">No Questions Found</h3>
              <p>Be the first to ask a question about civic law and rights</p>
              <Button 
                className="mt-4" 
                onClick={() => setShowNewQuestion(true)}
              >
                Ask the First Question
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};