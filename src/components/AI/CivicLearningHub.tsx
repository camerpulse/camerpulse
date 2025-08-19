import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  GraduationCap, 
  BookOpen, 
  MessageCircle, 
  Volume2, 
  Play, 
  Pause,
  Trophy,
  Users,
  Globe,
  Search,
  FileText,
  Video,
  Award,
  ArrowRight,
  Star,
  Info,
  HelpCircle,
  CheckCircle,
  Lock,
  Unlock,
  Brain,
  Heart,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CivicAIChatbot } from './CivicAIChatbot';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  modules: number;
  completed: boolean;
  progress: number;
  badge: string;
  category: string;
}

interface CivicTopic {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  language: string;
  hasAudio: boolean;
  hasVideo: boolean;
  difficulty: string;
}

interface UserProgress {
  userId: string;
  pathsCompleted: string[];
  badgesEarned: string[];
  totalScore: number;
  currentStreak: number;
}

export const CivicLearningHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [language, setLanguage] = useState('en');
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [civicTopics, setCivicTopics] = useState<CivicTopic[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatQuery, setChatQuery] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [youthMode, setYouthMode] = useState(false);

  const sampleLearningPaths: LearningPath[] = [
    {
      id: '1',
      title: 'How Cameroon\'s Government Works',
      description: 'Understanding the structure of government from local to national level',
      difficulty: 'beginner',
      duration: '45 min',
      modules: 6,
      completed: false,
      progress: 33,
      badge: 'Government Expert',
      category: 'structure'
    },
    {
      id: '2',
      title: 'Your Rights as a Citizen',
      description: 'Learn about your fundamental rights and how to protect them',
      difficulty: 'beginner',
      duration: '35 min',
      modules: 5,
      completed: true,
      progress: 100,
      badge: 'Rights Warrior',
      category: 'rights'
    },
    {
      id: '3',
      title: 'How to Vote Step by Step',
      description: 'Complete guide to voting in Cameroon elections',
      difficulty: 'beginner',
      duration: '25 min',
      modules: 4,
      completed: false,
      progress: 0,
      badge: 'Democracy Champion',
      category: 'voting'
    },
    {
      id: '4',
      title: 'Reporting Corruption and Abuse',
      description: 'Know your options when facing corruption or rights violations',
      difficulty: 'intermediate',
      duration: '50 min',
      modules: 7,
      completed: false,
      progress: 0,
      badge: 'Anti-Corruption Hero',
      category: 'corruption'
    },
    {
      id: '5',
      title: 'Peaceful Civic Participation',
      description: 'How to engage constructively in civic and political processes',
      difficulty: 'intermediate',
      duration: '40 min',
      modules: 6,
      completed: false,
      progress: 15,
      badge: 'Civic Defender',
      category: 'participation'
    }
  ];

  const sampleTopics: CivicTopic[] = [
    {
      id: '1',
      title: 'Role of the President',
      content: 'The President of Cameroon is the head of state and government...',
      category: 'Government Structure',
      tags: ['president', 'executive', 'powers'],
      language: 'en',
      hasAudio: true,
      hasVideo: true,
      difficulty: 'beginner'
    },
    {
      id: '2',
      title: 'How to Register to Vote',
      content: 'To register as a voter in Cameroon, you must...',
      category: 'Elections',
      tags: ['voting', 'registration', 'ELECAM'],
      language: 'en',
      hasAudio: true,
      hasVideo: false,
      difficulty: 'beginner'
    },
    {
      id: '3',
      title: 'Your Right to Free Speech',
      content: 'The Constitution guarantees freedom of expression...',
      category: 'Rights',
      tags: ['freedom', 'speech', 'constitution'],
      language: 'en',
      hasAudio: true,
      hasVideo: true,
      difficulty: 'beginner'
    }
  ];

  const frequentQuestions = [
    {
      question: "How do I register to vote?",
      category: "Voting",
      difficulty: "beginner"
    },
    {
      question: "What is the minimum voting age?",
      category: "Voting",
      difficulty: "beginner"
    },
    {
      question: "What do I do if police harass me?",
      category: "Rights",
      difficulty: "intermediate"
    },
    {
      question: "How can I report corruption?",
      category: "Anti-Corruption",
      difficulty: "intermediate"
    },
    {
      question: "What are the roles of MPs?",
      category: "Government",
      difficulty: "beginner"
    },
    {
      question: "How do local councils work?",
      category: "Government",
      difficulty: "beginner"
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // In a real implementation, these would be fetched from Supabase
      setLearningPaths(sampleLearningPaths);
      setCivicTopics(sampleTopics);
      setUserProgress({
        userId: 'user123',
        pathsCompleted: ['2'],
        badgesEarned: ['Rights Warrior'],
        totalScore: 850,
        currentStreak: 5
      });
    } catch (error) {
      console.error('Error loading civic learning data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTextToSpeech = async (text: string) => {
    try {
      setIsPlaying(true);
      
      // Check if browser supports speech synthesis
      if (!('speechSynthesis' in window)) {
        throw new Error('Speech synthesis not supported');
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice based on language
      const voices = speechSynthesis.getVoices();
      let selectedVoice = null;
      
      if (language === 'fr') {
        selectedVoice = voices.find(voice => voice.lang.startsWith('fr')) || null;
      } else if (language === 'en') {
        selectedVoice = voices.find(voice => voice.lang.startsWith('en')) || null;
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onend = () => {
        setIsPlaying(false);
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsPlaying(false);
      };
      
      speechSynthesis.speak(utterance);
      
    } catch (error) {
      console.error('Error with text-to-speech:', error);
      toast({
        title: "Audio Error",
        description: "Speech synthesis not available. Please check your browser settings.",
        variant: "destructive"
      });
      setIsPlaying(false);
    }
  };

  const handleChatQuery = async () => {
    if (!chatQuery.trim()) return;

    try {
      // Simulate AI response - in real implementation, this would call an AI service
      let response = "I'm here to help with civic questions! ";
      
      if (chatQuery.toLowerCase().includes('vote')) {
        response += "To register to vote in Cameroon, you must be at least 20 years old and register with ELECAM (Elections Cameroon).";
      } else if (chatQuery.toLowerCase().includes('rights')) {
        response += "As a Cameroonian citizen, you have fundamental rights including freedom of speech, assembly, and protection from discrimination.";
      } else if (chatQuery.toLowerCase().includes('corruption')) {
        response += "You can report corruption to ANIF (National Anti-Corruption Agency) or contact local authorities. Document everything and keep records.";
      } else {
        response += "That's a great civic question! Let me help you find the right information in our knowledge library.";
      }

      setChatResponse(response);
    } catch (error) {
      console.error('Error processing chat query:', error);
      setChatResponse("Sorry, I couldn't process your question. Please try again.");
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500';
    if (progress > 50) return 'bg-blue-500';
    return 'bg-gray-400';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-xl"></div>
          ))}
        </div>
        <div className="h-96 bg-muted animate-pulse rounded-xl"></div>
      </div>
    );
  }

  const completedPaths = learningPaths.filter(path => path.completed).length;
  const totalBadges = userProgress?.badgesEarned.length || 0;
  const averageProgress = learningPaths.reduce((acc, path) => acc + path.progress, 0) / learningPaths.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <GraduationCap className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Civic Learning Hub</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Learn about your civic rights, government structure, and how to participate in democracy.
          Available in multiple languages with interactive content for all ages.
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-40">
              <Globe className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant={youthMode ? "default" : "outline"}
            onClick={() => setYouthMode(!youthMode)}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            {youthMode ? 'Youth Mode' : 'Adult Mode'}
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-primary">{completedPaths}</div>
                <p className="text-sm text-muted-foreground">Paths Completed</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">{totalBadges}</div>
                <p className="text-sm text-muted-foreground">Badges Earned</p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{averageProgress.toFixed(0)}%</div>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
              </div>
              <Trophy className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">{userProgress?.currentStreak || 0}</div>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
              <Star className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">📚 Learning Paths</TabsTrigger>
          <TabsTrigger value="library">📖 Knowledge Library</TabsTrigger>
          <TabsTrigger value="chatbot">🤖 CivicBot</TabsTrigger>
          <TabsTrigger value="youth">🎓 Youth Edition</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Interactive Learning Paths
              </CardTitle>
              <CardDescription>
                Structured courses to build your civic knowledge step by step
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {learningPaths.map((path) => (
                  <Card key={path.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-lg leading-tight">{path.title}</h3>
                          {path.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{path.description}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          <Badge className={getDifficultyColor(path.difficulty)}>
                            {path.difficulty}
                          </Badge>
                          <Badge variant="outline">{path.duration}</Badge>
                          <Badge variant="outline">{path.modules} modules</Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{path.progress}%</span>
                          </div>
                          <Progress value={path.progress} className="h-2" />
                        </div>
                        
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Trophy className="h-4 w-4" />
                            {path.badge}
                          </div>
                          <Button size="sm" className="flex items-center gap-1">
                            {path.progress > 0 ? 'Continue' : 'Start'}
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Civic Knowledge Library
              </CardTitle>
              <CardDescription>
                Search for specific civic topics and get detailed explanations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search civic topics... (e.g., 'role of mayor', 'voting rights')"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {civicTopics
                    .filter(topic => 
                      searchQuery === '' || 
                      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      topic.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      topic.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                    .map((topic) => (
                    <Card key={topic.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold">{topic.title}</h3>
                            <Badge className={getDifficultyColor(topic.difficulty)}>
                              {topic.difficulty}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {topic.content}
                          </p>
                          
                          <div className="flex flex-wrap gap-1">
                            {topic.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                              {topic.hasAudio && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleTextToSpeech(topic.content)}
                                  disabled={isPlaying}
                                >
                                  {isPlaying ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                </Button>
                              )}
                              {topic.hasVideo && (
                                <Button size="sm" variant="outline">
                                  <Video className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <Button size="sm">Read More</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chatbot" className="space-y-4">
          <CivicAIChatbot />
        </TabsContent>

        <TabsContent value="youth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                CivicLite - Youth Edition
              </CardTitle>
              <CardDescription>
                Simplified, fun content designed for teens and first-time voters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Youth Edition uses simpler language, shorter content, and more interactive elements 
                    to make civic learning fun and accessible for young people.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="border-2 border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-blue-500" />
                          <h3 className="font-semibold">Your Rights 101</h3>
                        </div>
                        <p className="text-sm">Learn about your basic rights as a young Cameroonian</p>
                        <div className="flex gap-2">
                          <Badge className="bg-blue-100 text-blue-800">5 min read</Badge>
                          <Badge className="bg-green-100 text-green-800">Comic strip</Badge>
                        </div>
                        <Button size="sm" className="w-full">Start Learning</Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2 border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-green-500" />
                          <h3 className="font-semibold">First Time Voting</h3>
                        </div>
                        <p className="text-sm">Everything you need to know about voting for the first time</p>
                        <div className="flex gap-2">
                          <Badge className="bg-green-100 text-green-800">10 min</Badge>
                          <Badge className="bg-purple-100 text-purple-800">Interactive</Badge>
                        </div>
                        <Button size="sm" className="w-full">Start Journey</Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2 border-purple-200 bg-purple-50">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-5 w-5 text-purple-500" />
                          <h3 className="font-semibold">Speak Up Safely</h3>
                        </div>
                        <p className="text-sm">How to express your opinions and participate peacefully</p>
                        <div className="flex gap-2">
                          <Badge className="bg-purple-100 text-purple-800">8 min</Badge>
                          <Badge className="bg-yellow-100 text-yellow-800">Audio story</Badge>
                        </div>
                        <Button size="sm" className="w-full">Listen Now</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold mb-2">Young Civic Champions Challenge</h3>
                        <p className="text-blue-100">Complete all youth modules and earn special recognition</p>
                      </div>
                      <Trophy className="h-12 w-12 text-yellow-300" />
                    </div>
                    <Button className="mt-4 bg-white text-blue-600 hover:bg-blue-50">
                      Join Challenge
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CivicLearningHub;