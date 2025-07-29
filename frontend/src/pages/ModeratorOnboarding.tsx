import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  GraduationCap, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock,
  ChevronLeft,
  ChevronRight,
  Award
} from 'lucide-react';

interface TrainingSlide {
  id: string;
  slide_number: number;
  title: string;
  subtitle: string;
  content: string;
  slide_type: string;
  media_url?: string;
}

interface QuizQuestion {
  id: string;
  question_number: number;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'text_input' | 'essay';
  options?: Record<string, string>;
  correct_answer: string;
  explanation: string;
  points: number;
}

interface OnboardingProgress {
  id: string;
  current_step: 'training' | 'quiz' | 'oath' | 'completed';
  slides_completed: number;
  quiz_attempts: number;
  quiz_score?: number;
  quiz_passed: boolean;
  oath_accepted_at?: string;
  completed_at?: string;
  assigned_region?: string;
  mentor_id?: string;
  notes?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

const ModeratorOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<'training' | 'quiz' | 'oath' | 'completed'>('training');
  
  // Training state
  const [slides, setSlides] = useState<TrainingSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidesCompleted, setSlidesCompleted] = useState(0);
  
  // Quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizPassed, setQuizPassed] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);
  
  // Oath state
  const [oathAccepted, setOathAccepted] = useState(false);
  
  // Progress state
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setUser(user);
    await loadProgress(user.id);
    setLoading(false);
  };

  const loadProgress = async (userId: string) => {
    try {
      // Load existing progress
      const { data: existingProgress } = await supabase
        .from('moderator_onboarding_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existingProgress) {
        setProgress(existingProgress as OnboardingProgress);
        setCurrentStep(existingProgress.current_step as 'training' | 'quiz' | 'oath' | 'completed');
        setSlidesCompleted(existingProgress.slides_completed);
        setQuizPassed(existingProgress.quiz_passed);
        if (existingProgress.quiz_score) {
          setQuizScore(existingProgress.quiz_score);
        }
        if (existingProgress.oath_accepted_at) {
          setOathAccepted(true);
        }
      } else {
        // Create new progress record
        const { data: newProgress } = await supabase
          .from('moderator_onboarding_progress')
          .insert([{ user_id: userId }])
          .select()
          .single();
        setProgress(newProgress as OnboardingProgress);
      }

      // Load training slides
      const { data: slidesData } = await supabase
        .from('moderator_training_slides')
        .select('*')
        .eq('is_active', true)
        .order('slide_number');
      if (slidesData) setSlides(slidesData);

      // Load quiz questions
      const { data: questionsData } = await supabase
        .from('moderator_quiz_questions')
        .select('*')
        .eq('is_active', true)
        .order('question_number');
      if (questionsData) setQuestions(questionsData as QuizQuestion[]);

    } catch (error) {
      console.error('Error loading progress:', error);
      toast({
        title: "Error",
        description: "Failed to load onboarding progress.",
        variant: "destructive",
      });
    }
  };

  const updateProgress = async (updates: Partial<OnboardingProgress>) => {
    if (!progress || !user) return;

    try {
      const { data: updatedProgress } = await supabase
        .from('moderator_onboarding_progress')
        .update(updates)
        .eq('id', progress.id)
        .select()
        .single();

      if (updatedProgress) {
        setProgress(updatedProgress as OnboardingProgress);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const completeSlide = async () => {
    const newSlidesCompleted = Math.max(slidesCompleted, currentSlide + 1);
    setSlidesCompleted(newSlidesCompleted);
    
    if (newSlidesCompleted >= slides.length) {
      await updateProgress({ 
        slides_completed: newSlidesCompleted,
        current_step: 'quiz'
      });
      setCurrentStep('quiz');
      toast({
        title: "Training Complete!",
        description: "You can now proceed to the quiz.",
      });
    } else {
      await updateProgress({ slides_completed: newSlidesCompleted });
    }
  };

  const startQuiz = () => {
    setQuizStartTime(new Date());
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  const submitQuiz = async () => {
    if (!quizStartTime || !user || !progress) return;

    const endTime = new Date();
    const timeTaken = Math.round((endTime.getTime() - quizStartTime.getTime()) / (1000 * 60));

    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;

    questions.forEach((question) => {
      totalPoints += question.points;
      const userAnswer = answers[question.id];
      
      if (question.question_type === 'essay') {
        // Essays need manual review
        return;
      }
      
      if (question.question_type === 'text_input') {
        // Check if answer contains key terms
        const correctTerms = question.correct_answer.toLowerCase().split(', ');
        const userTerms = userAnswer?.toLowerCase() || '';
        const matchedTerms = correctTerms.filter(term => userTerms.includes(term));
        if (matchedTerms.length >= 2) {
          earnedPoints += question.points;
        }
      } else {
        if (userAnswer === question.correct_answer) {
          earnedPoints += question.points;
        }
      }
    });

    const score = Math.round((earnedPoints / totalPoints) * 100);
    const passed = score >= 80;

    setQuizScore(score);
    setQuizPassed(passed);
    setShowResults(true);

    // Save quiz attempt
    try {
      await supabase.from('moderator_quiz_attempts').insert([{
        user_id: user.id,
        onboarding_progress_id: progress.id,
        attempt_number: (progress.quiz_attempts || 0) + 1,
        answers: answers,
        score: score,
        passed: passed,
        time_taken_minutes: timeTaken
      }]);

      await updateProgress({
        quiz_attempts: (progress.quiz_attempts || 0) + 1,
        quiz_score: score,
        quiz_passed: passed,
        current_step: passed ? 'oath' : 'quiz'
      });

      if (passed) {
        setCurrentStep('oath');
        toast({
          title: "Quiz Passed!",
          description: `You scored ${score}%. You can now take the civic oath.`,
        });
      } else {
        toast({
          title: "Quiz Failed",
          description: `You scored ${score}%. You need 80% to pass. Please study and try again.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    }
  };

  const acceptOath = async () => {
    if (!user || !progress) return;

    try {
      const now = new Date().toISOString();
      
      await updateProgress({
        oath_accepted_at: now,
        completed_at: now,
        current_step: 'completed'
      });

      // Add moderator role
      await supabase.from('user_roles').insert([{
        user_id: user.id,
        role: 'moderator'
      }]);

      setCurrentStep('completed');
      setOathAccepted(true);

      toast({
        title: "Welcome, Civic Moderator!",
        description: "You have successfully completed the onboarding process.",
      });
    } catch (error) {
      console.error('Error accepting oath:', error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStepProgress = () => {
    switch (currentStep) {
      case 'training':
        return Math.round((slidesCompleted / slides.length) * 33);
      case 'quiz':
        return 33 + (quizPassed ? 33 : 0);
      case 'oath':
        return 66 + (oathAccepted ? 34 : 0);
      case 'completed':
        return 100;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-4">
            CamerPulse Civic Moderator Onboarding
          </h1>
          <p className="text-xl text-muted-foreground">
            Become a guardian of the people's story
          </p>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto mt-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Progress</span>
              <span>{getStepProgress()}%</span>
            </div>
            <Progress value={getStepProgress()} className="h-3" />
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center space-x-8 mt-6">
            <div className={`flex items-center space-x-2 ${currentStep === 'training' ? 'text-primary' : slidesCompleted >= slides.length ? 'text-green-600' : 'text-muted-foreground'}`}>
              <BookOpen className="h-5 w-5" />
              <span>Training</span>
              {slidesCompleted >= slides.length && <CheckCircle className="h-4 w-4 text-green-600" />}
            </div>
            <div className={`flex items-center space-x-2 ${currentStep === 'quiz' ? 'text-primary' : quizPassed ? 'text-green-600' : 'text-muted-foreground'}`}>
              <GraduationCap className="h-5 w-5" />
              <span>Quiz</span>
              {quizPassed && <CheckCircle className="h-4 w-4 text-green-600" />}
            </div>
            <div className={`flex items-center space-x-2 ${currentStep === 'oath' ? 'text-primary' : oathAccepted ? 'text-green-600' : 'text-muted-foreground'}`}>
              <Shield className="h-5 w-5" />
              <span>Oath</span>
              {oathAccepted && <CheckCircle className="h-4 w-4 text-green-600" />}
            </div>
            <div className={`flex items-center space-x-2 ${currentStep === 'completed' ? 'text-primary' : 'text-muted-foreground'}`}>
              <Award className="h-5 w-5" />
              <span>Complete</span>
              {currentStep === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
            </div>
          </div>
        </div>

        {/* Training Section */}
        {currentStep === 'training' && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-6 w-6" />
                  <span>Training Module</span>
                  <Badge variant="outline">
                    Slide {currentSlide + 1} of {slides.length}
                  </Badge>
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  {slidesCompleted} of {slides.length} completed
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {slides[currentSlide] && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-primary mb-2">
                      {slides[currentSlide].title}
                    </h2>
                    {slides[currentSlide].subtitle && (
                      <p className="text-xl text-muted-foreground mb-6">
                        {slides[currentSlide].subtitle}
                      </p>
                    )}
                  </div>
                  
                  <div className="prose prose-lg max-w-none">
                    <p className="text-foreground leading-relaxed">
                      {slides[currentSlide].content}
                    </p>
                  </div>

                  <div className="flex justify-between pt-6">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                      disabled={currentSlide === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    
                    <Button
                      onClick={() => {
                        if (currentSlide < slides.length - 1) {
                          setCurrentSlide(currentSlide + 1);
                          if (currentSlide + 1 > slidesCompleted) {
                            completeSlide();
                          }
                        } else {
                          completeSlide();
                        }
                      }}
                    >
                      {currentSlide === slides.length - 1 ? 'Complete Training' : 'Next'}
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quiz Section */}
        {currentStep === 'quiz' && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-6 w-6" />
                <span>Moderator Qualification Quiz</span>
                <Badge variant="outline">80% required to pass</Badge>
              </CardTitle>
              <CardDescription>
                Test your understanding of moderator responsibilities and guidelines.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!quizStartTime ? (
                <div className="text-center space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold">Ready to take the quiz?</h3>
                    <p className="text-muted-foreground">
                      You have {progress?.quiz_attempts || 0} previous attempts. 
                      The quiz contains {questions.length} questions and you need 80% to pass.
                    </p>
                  </div>
                  <Button onClick={startQuiz} size="lg">
                    <Clock className="h-4 w-4 mr-2" />
                    Start Quiz
                  </Button>
                </div>
              ) : showResults ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className={`text-6xl font-bold mb-4 ${quizPassed ? 'text-green-600' : 'text-red-500'}`}>
                      {quizScore}%
                    </div>
                    <div className="flex items-center justify-center space-x-2 mb-6">
                      {quizPassed ? (
                        <>
                          <CheckCircle className="h-8 w-8 text-green-600" />
                          <span className="text-2xl font-bold text-green-600">Passed!</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-8 w-8 text-red-500" />
                          <span className="text-2xl font-bold text-red-500">Failed</span>
                        </>
                      )}
                    </div>
                    <p className="text-muted-foreground">
                      {quizPassed ? 
                        "Congratulations! You can now proceed to take the civic oath." :
                        "You need 80% to pass. Review the training materials and try again."
                      }
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold">Review Your Answers:</h4>
                    {questions.map((question, index) => {
                      const userAnswer = answers[question.id];
                      const isCorrect = question.question_type === 'essay' ? 
                        null : 
                        question.question_type === 'text_input' ?
                          question.correct_answer.toLowerCase().split(', ').some(term => 
                            userAnswer?.toLowerCase().includes(term)
                          ) :
                          userAnswer === question.correct_answer;

                      return (
                        <div key={question.id} className="border rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            {isCorrect === null ? (
                              <Clock className="h-5 w-5 text-yellow-500 mt-1" />
                            ) : isCorrect ? (
                              <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500 mt-1" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium">{question.question_text}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Your answer: {userAnswer || 'No answer'}
                              </p>
                              {question.explanation && (
                                <p className="text-sm text-blue-600 mt-2">
                                  <strong>Explanation:</strong> {question.explanation}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-center space-x-4">
                    {!quizPassed && (
                      <Button onClick={() => {
                        setQuizStartTime(null);
                        setShowResults(false);
                        setAnswers({});
                        setCurrentQuestion(0);
                      }}>
                        Retake Quiz
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep('training')}
                    >
                      Review Training
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">
                      Question {currentQuestion + 1} of {questions.length}
                    </h3>
                    <Badge variant="outline">
                      {questions[currentQuestion]?.points} points
                    </Badge>
                  </div>

                  {questions[currentQuestion] && (
                    <div className="space-y-4">
                      <h4 className="text-xl font-medium">
                        {questions[currentQuestion].question_text}
                      </h4>

                      {questions[currentQuestion].question_type === 'multiple_choice' && (
                        <RadioGroup
                          value={answers[questions[currentQuestion].id] || ''}
                          onValueChange={(value) => setAnswers({
                            ...answers,
                            [questions[currentQuestion].id]: value
                          })}
                        >
                          {Object.entries(questions[currentQuestion].options || {}).map(([key, value]) => (
                            <div key={key} className="flex items-center space-x-2">
                              <RadioGroupItem value={key} id={key} />
                              <Label htmlFor={key}>{value}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      )}

                      {questions[currentQuestion].question_type === 'true_false' && (
                        <RadioGroup
                          value={answers[questions[currentQuestion].id] || ''}
                          onValueChange={(value) => setAnswers({
                            ...answers,
                            [questions[currentQuestion].id]: value
                          })}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id="true" />
                            <Label htmlFor="true">True</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id="false" />
                            <Label htmlFor="false">False</Label>
                          </div>
                        </RadioGroup>
                      )}

                      {questions[currentQuestion].question_type === 'text_input' && (
                        <Input
                          value={answers[questions[currentQuestion].id] || ''}
                          onChange={(e) => setAnswers({
                            ...answers,
                            [questions[currentQuestion].id]: e.target.value
                          })}
                          placeholder="Enter your answer..."
                        />
                      )}

                      {questions[currentQuestion].question_type === 'essay' && (
                        <Textarea
                          value={answers[questions[currentQuestion].id] || ''}
                          onChange={(e) => setAnswers({
                            ...answers,
                            [questions[currentQuestion].id]: e.target.value
                          })}
                          placeholder="Write your essay answer..."
                          rows={6}
                        />
                      )}
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                      disabled={currentQuestion === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    
                    <Button
                      onClick={() => {
                        if (currentQuestion < questions.length - 1) {
                          setCurrentQuestion(currentQuestion + 1);
                        } else {
                          submitQuiz();
                        }
                      }}
                    >
                      {currentQuestion === questions.length - 1 ? 'Submit Quiz' : 'Next'}
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Oath Section */}
        {currentStep === 'oath' && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-6 w-6" />
                <span>The Civic Oath</span>
              </CardTitle>
              <CardDescription>
                Your final step to becoming a CamerPulse Civic Moderator
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-8">
                  <h3 className="text-2xl font-bold text-center mb-6 text-primary">
                    🛡️ The CamerPulse Civic Moderator Oath
                  </h3>
                  
                  <div className="prose prose-lg max-w-none text-center space-y-4">
                    <p className="italic text-lg leading-relaxed">
                      I, <strong>{user?.email}</strong>, solemnly swear to serve the people of Cameroon with truth, respect, and diligence.
                    </p>
                    
                    <p className="leading-relaxed">
                      I pledge to preserve the identity, history, and dignity of our villages.
                    </p>
                    
                    <p className="leading-relaxed">
                      I will verify, not fabricate. I will honor the voices of the forgotten. I will protect facts, not favor.
                    </p>
                    
                    <p className="leading-relaxed">
                      I recognize that every village holds a piece of our nation's soul, and I will do my part to keep it alive.
                    </p>
                    
                    <p className="font-bold text-lg">
                      So help me God, my ancestors, and my conscience.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="oath-accept"
                      checked={oathAccepted}
                      onCheckedChange={(checked) => setOathAccepted(checked as boolean)}
                    />
                    <Label htmlFor="oath-accept" className="text-lg">
                      I accept this oath and will uphold it with honor.
                    </Label>
                  </div>

                  <div className="text-center">
                    <Button
                      onClick={acceptOath}
                      disabled={!oathAccepted}
                      size="lg"
                      className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                    >
                      <Award className="h-5 w-5 mr-2" />
                      Activate My Moderator Badge
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completion Section */}
        {currentStep === 'completed' && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-600">
                <Award className="h-6 w-6" />
                <span>Congratulations!</span>
              </CardTitle>
              <CardDescription>
                You are now a certified CamerPulse Civic Moderator
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-8">
                <div className="space-y-4">
                  <div className="text-6xl">🎉</div>
                  <h2 className="text-3xl font-bold text-green-600">
                    Welcome to the Civic Moderator Corps!
                  </h2>
                  <p className="text-xl text-muted-foreground">
                    You are now a guardian of the people's story
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-bold text-green-800 mb-4">What happens next?</h3>
                  <ul className="text-left space-y-2 text-green-700">
                    <li>✅ Your moderator badge has been activated</li>
                    <li>✅ You now have access to the Moderator Dashboard</li>
                    <li>✅ You will be assigned villages/regions to moderate</li>
                    <li>✅ You can join the moderator community chat</li>
                    <li>✅ You will start earning badges and recognition</li>
                  </ul>
                </div>

                <div className="flex justify-center space-x-4">
                  <Button 
                    onClick={() => navigate('/moderators')}
                    size="lg"
                  >
                    Go to Moderator Dashboard
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/')}
                    size="lg"
                  >
                    Return to Home
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ModeratorOnboarding;