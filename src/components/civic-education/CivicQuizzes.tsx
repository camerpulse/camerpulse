import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Award, Play, Trophy, Target, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  questions: any[];
  passing_score: number;
  time_limit_minutes: number;
}

interface QuizAttempt {
  id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  completed_at: string;
  time_taken_minutes: number;
  user_id: string;
}

export const CivicQuizzes: React.FC = () => {
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const { toast } = useToast();

  // Fetch available quizzes
  const { data: quizzes, isLoading } = useQuery({
    queryKey: ['civic-quizzes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('civic_quizzes')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Quiz[];
    }
  });

  // Fetch user's quiz attempts
  const { data: attempts } = useQuery({
    queryKey: ['user-quiz-attempts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('civic_quiz_attempts')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    }
  });

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'constitution': return '📜';
      case 'rights': return '⚖️';
      case 'electoral': return '🗳️';
      case 'government': return '🏛️';
      default: return '📚';
    }
  };

  const startQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setQuizStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setTimeRemaining(quiz.time_limit_minutes * 60);
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const nextQuestion = () => {
    if (selectedQuiz && currentQuestion < selectedQuiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const submitQuiz = async () => {
    if (!selectedQuiz) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit quiz",
        variant: "destructive"
      });
      return;
    }

    // Calculate score
    let correctAnswers = 0;
    selectedQuiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct_answer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / selectedQuiz.questions.length) * 100);

    // Save attempt
    const { error } = await supabase
      .from('civic_quiz_attempts')
      .insert({
        user_id: user.id,
        quiz_id: selectedQuiz.id,
        score,
        total_questions: selectedQuiz.questions.length,
        correct_answers: correctAnswers,
        time_taken_minutes: selectedQuiz.time_limit_minutes - Math.floor(timeRemaining / 60),
        answers: selectedAnswers
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit quiz",
        variant: "destructive"
      });
      return;
    }

    setQuizCompleted(true);
    
    if (score >= selectedQuiz.passing_score) {
      toast({
        title: "Congratulations!",
        description: `You passed with ${score}%! Well done!`,
      });
    } else {
      toast({
        title: "Quiz Complete",
        description: `You scored ${score}%. Try again to improve!`,
        variant: "destructive"
      });
    }
  };

  const getAttemptForQuiz = (quizId: string) => {
    return attempts?.find(attempt => attempt.quiz_id === quizId);
  };

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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

  if (quizStarted && selectedQuiz) {
    if (quizCompleted) {
      const score = Math.round((Object.values(selectedAnswers).filter((answer, index) => 
        answer === selectedQuiz.questions[index]?.correct_answer
      ).length / selectedQuiz.questions.length) * 100);

      return (
        <Card>
          <CardContent className="text-center py-12">
            <div className="space-y-6">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                score >= selectedQuiz.passing_score ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {score >= selectedQuiz.passing_score ? (
                  <Trophy className="w-10 h-10 text-green-600" />
                ) : (
                  <Target className="w-10 h-10 text-red-600" />
                )}
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {score >= selectedQuiz.passing_score ? 'Congratulations!' : 'Quiz Complete'}
                </h2>
                <p className="text-gray-600">
                  You scored {score}% on "{selectedQuiz.title}"
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{score}%</div>
                  <div className="text-sm text-gray-600">Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Object.values(selectedAnswers).filter((answer, index) => 
                      answer === selectedQuiz.questions[index]?.correct_answer
                    ).length}
                  </div>
                  <div className="text-sm text-gray-600">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{selectedQuiz.questions.length}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button onClick={() => {
                  setQuizStarted(false);
                  setSelectedQuiz(null);
                  setQuizCompleted(false);
                }}>
                  Back to Quizzes
                </Button>
                {score < selectedQuiz.passing_score && (
                  <Button variant="outline" onClick={() => startQuiz(selectedQuiz)}>
                    Try Again
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Quiz taking interface
    const currentQ = selectedQuiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / selectedQuiz.questions.length) * 100;

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{selectedQuiz.title}</CardTitle>
              <CardDescription>
                Question {currentQuestion + 1} of {selectedQuiz.questions.length}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">{currentQ?.question}</h3>
              <div className="space-y-3">
                {currentQ?.options.map((option: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(currentQuestion, index)}
                    className={`w-full p-4 text-left border rounded-lg transition-colors ${
                      selectedAnswers[currentQuestion] === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedAnswers[currentQuestion] === index
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedAnswers[currentQuestion] === index && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={previousQuestion}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              
              {currentQuestion === selectedQuiz.questions.length - 1 ? (
                <Button onClick={submitQuiz}>
                  Submit Quiz
                </Button>
              ) : (
                <Button onClick={nextQuestion}>
                  Next
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Quiz selection interface
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Civic Knowledge Quizzes</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Test your understanding of Cameroon's Constitution, civic rights, and legal frameworks
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes?.map((quiz) => {
          const userAttempt = getAttemptForQuiz(quiz.id);
          const hasPassed = userAttempt && userAttempt.score >= quiz.passing_score;
          
          return (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getCategoryIcon(quiz.category)}</div>
                    <div>
                      <CardTitle className="text-lg">{quiz.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{quiz.description}</CardDescription>
                    </div>
                  </div>
                  {hasPassed && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
                
                <div className="flex items-center gap-2 mt-3">
                  <Badge className={getDifficultyColor(quiz.difficulty_level)}>
                    {quiz.difficulty_level}
                  </Badge>
                  <Badge variant="outline">{quiz.category}</Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{quiz.time_limit_minutes} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-gray-400" />
                      <span>{quiz.passing_score}% to pass</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-400" />
                      <span>{quiz.questions.length} questions</span>
                    </div>
                    {userAttempt && (
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-gray-400" />
                        <span>Best: {userAttempt.score}%</span>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full flex items-center gap-2"
                    onClick={() => startQuiz(quiz)}
                  >
                    <Play className="w-4 h-4" />
                    {userAttempt ? 'Retake Quiz' : 'Start Quiz'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {!isLoading && (!quizzes || quizzes.length === 0) && (
        <Card>
          <CardContent className="flex items-center justify-center h-96">
            <div className="text-center text-gray-500">
              <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold mb-2">No Quizzes Available</h3>
              <p>Check back later for new civic knowledge quizzes</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};