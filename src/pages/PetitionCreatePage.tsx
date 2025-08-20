import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, FileText, Target, Users, Clock, ArrowLeft, Megaphone, 
         CheckCircle, TrendingUp, Globe, Heart, Shield, Lightbulb, 
         HelpCircle, BarChart3, Trophy, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCreatePetition } from '@/hooks/useCivicParticipation';
import { URLBuilder } from '@/utils/slug';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'governance', label: 'Governance', icon: '🏛️' },
  { value: 'justice', label: 'Justice', icon: '⚖️' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'health', label: 'Health', icon: '🏥' },
  { value: 'agriculture', label: 'Agriculture', icon: '🌾' },
  { value: 'digital_rights', label: 'Digital Rights', icon: '💻' },
  { value: 'local_issues', label: 'Local Issues', icon: '🏘️' },
  { value: 'corruption', label: 'Corruption', icon: '🛡️' },
  { value: 'security', label: 'Security', icon: '🔒' },
  { value: 'environment', label: 'Environment', icon: '🌍' },
  { value: 'traditional_authority', label: 'Traditional Authority', icon: '👑' },
  { value: 'others', label: 'Others', icon: '📝' }
];

const REGIONS = [
  { value: 'national', label: 'National' },
  { value: 'centre', label: 'Centre' },
  { value: 'north', label: 'North' },
  { value: 'south', label: 'South' },
  { value: 'east', label: 'East' },
  { value: 'west', label: 'West' },
  { value: 'southwest', label: 'Southwest' },
  { value: 'northwest', label: 'Northwest' },
  { value: 'littoral', label: 'Littoral' },
  { value: 'adamawa', label: 'Adamawa' },
  { value: 'far_north', label: 'Far North' }
];

/**
 * Petition creation page with comprehensive form and validation
 */
const PetitionCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createPetitionMutation = useCreatePetition();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_institution: '',
    category: '',
    region: 'national',
    goal_signatures: 100,
    deadline: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState('create');

  // Calculate form completion percentage
  const formProgress = React.useMemo(() => {
    const fields = ['title', 'description', 'target_institution', 'category'];
    const completedFields = fields.filter(field => formData[field as keyof typeof formData]?.toString().trim()).length;
    return Math.round((completedFields / fields.length) * 100);
  }, [formData]);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!user) {
      toast.error('Please log in to create a petition');
      navigate('/auth');
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    } else if (formData.description.length > 5000) {
      newErrors.description = 'Description must be less than 5000 characters';
    }

    if (!formData.target_institution.trim()) {
      newErrors.target_institution = 'Target institution is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.goal_signatures < 10) {
      newErrors.goal_signatures = 'Goal must be at least 10 signatures';
    } else if (formData.goal_signatures > 1000000) {
      newErrors.goal_signatures = 'Goal cannot exceed 1,000,000 signatures';
    }

    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline);
      const now = new Date();
      const minDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      
      if (deadlineDate <= now) {
        newErrors.deadline = 'Deadline must be in the future';
      } else if (deadlineDate < minDate) {
        newErrors.deadline = 'Deadline must be at least 7 days from now';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      const petition = await createPetitionMutation.mutateAsync({
        title: formData.title,
        description: formData.description,
        target_institution: formData.target_institution,
        category: formData.category,
        location: formData.region,
        goal_signatures: formData.goal_signatures,
        deadline: formData.deadline || undefined,
      });

      toast.success('Petition created successfully!');
      navigate(URLBuilder.petitions.detail({ 
        id: petition.id, 
        title: petition.title 
      }));
    } catch (error: any) {
      console.error('Error creating petition:', error);
      toast.error(error?.message || 'Failed to create petition. Please try again.');
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-card">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/petitions')}
            className="mb-6 h-12 px-6 text-base font-medium hover:bg-primary/10 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Petitions
          </Button>
          
          <div className="text-center py-16 px-8 bg-gradient-heritage rounded-3xl shadow-heritage text-white mb-8 relative overflow-hidden">
            <div className="absolute inset-0 african-pattern opacity-10"></div>
            <div className="relative z-10">
              <Megaphone className="w-16 h-16 mx-auto mb-6 text-white/90" />
              <h1 className="text-6xl font-bold mb-6">Create a Petition</h1>
              <p className="text-2xl text-white/90 max-w-3xl mx-auto mb-8">
                Turn your passion into action. Start a petition to bring about positive change 
                in your community and beyond.
              </p>
              
              {/* Impact Stats */}
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">2.5M+</div>
                  <div className="text-white/80">Signatures Collected</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">1,200+</div>
                  <div className="text-white/80">Successful Campaigns</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">85%</div>
                  <div className="text-white/80">Success Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        {activeTab === 'create' && (
          <Card className="mb-8 border-0 shadow-glow bg-gradient-cowrie">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Petition Progress</h3>
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {formProgress}% Complete
                </Badge>
              </div>
              <Progress value={formProgress} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                Complete all required fields to submit your petition
              </p>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4 h-16 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="create" className="text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-white">
              Create Petition
            </TabsTrigger>
            <TabsTrigger value="tips" className="text-base font-semibold data-[state=active]:bg-secondary data-[state=active]:text-white">
              Tips & Examples
            </TabsTrigger>
            <TabsTrigger value="success" className="text-base font-semibold data-[state=active]:bg-accent data-[state=active]:text-white">
              Success Stories
            </TabsTrigger>
            <TabsTrigger value="faq" className="text-base font-semibold data-[state=active]:bg-cm-green data-[state=active]:text-white">
              FAQ & Help
            </TabsTrigger>
          </TabsList>

          {/* Tips & Examples Tab */}
          <TabsContent value="tips" className="mt-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Writing Tips */}
              <Card className="border-0 shadow-elegant bg-white/90">
                <CardHeader className="bg-gradient-primary text-white">
                  <CardTitle className="flex items-center gap-3">
                    <Lightbulb className="w-6 h-6" />
                    Writing Tips for Effective Petitions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {[
                    {
                      title: "Start with a Strong Hook",
                      description: "Open with a compelling statement that grabs attention and makes people care about your cause.",
                      example: "\"Every day, 500 children in our region walk 5km to school on dangerous roads.\""
                    },
                    {
                      title: "Be Specific About Solutions",
                      description: "Don't just highlight problems - propose concrete, actionable solutions.",
                      example: "\"We demand the construction of a pedestrian bridge at the main intersection.\""
                    },
                    {
                      title: "Use Personal Stories",
                      description: "Include real stories and testimonials that show the human impact.",
                      example: "\"Maria, a 12-year-old student, was injured last month crossing this road.\""
                    },
                    {
                      title: "Include Evidence",
                      description: "Back up your claims with facts, statistics, or credible sources.",
                      example: "\"According to the Ministry of Transport, this intersection has seen 23 accidents this year.\""
                    }
                  ].map((tip, index) => (
                    <div key={index} className="space-y-2">
                      <h4 className="font-semibold text-primary">{tip.title}</h4>
                      <p className="text-sm text-muted-foreground">{tip.description}</p>
                      <div className="bg-muted/50 p-3 rounded-lg text-sm italic">
                        Example: {tip.example}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Petition Examples */}
              <Card className="border-0 shadow-elegant bg-white/90">
                <CardHeader className="bg-gradient-secondary text-white">
                  <CardTitle className="flex items-center gap-3">
                    <FileText className="w-6 h-6" />
                    Sample Petition Structures
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {[
                    {
                      category: "Infrastructure",
                      title: "Better Roads for Rural Communities",
                      structure: [
                        "Problem: Poor road conditions affecting 10,000 residents",
                        "Impact: Difficulty accessing healthcare, education, markets",
                        "Solution: Pave 15km of main road connecting 5 villages",
                        "Target: Ministry of Public Works",
                        "Timeline: Complete within 18 months"
                      ]
                    },
                    {
                      category: "Education",
                      title: "Free School Meals Program",
                      structure: [
                        "Problem: 40% of children attend school hungry",
                        "Impact: Poor academic performance, high dropout rates",
                        "Solution: Daily nutritious meals for 2,000 students",
                        "Target: Ministry of Education",
                        "Timeline: Start next academic year"
                      ]
                    }
                  ].map((example, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{example.category}</Badge>
                        <h4 className="font-semibold">{example.title}</h4>
                      </div>
                      <ul className="space-y-1 text-sm">
                        {example.structure.map((point, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-primary font-bold">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Success Stories Tab */}
          <TabsContent value="success" className="mt-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "New Hospital Built in Bamenda",
                  signatures: "15,000",
                  outcome: "Government allocated 2.5B FCFA for new regional hospital",
                  category: "Health",
                  timeframe: "8 months",
                  impact: "Serving 200,000+ residents"
                },
                {
                  title: "Free WiFi in Universities",
                  signatures: "8,500",
                  outcome: "High-speed internet installed in all public universities",
                  category: "Education",
                  timeframe: "6 months",
                  impact: "300,000+ students benefiting"
                },
                {
                  title: "Clean Water for 50 Villages",
                  signatures: "22,000",
                  outcome: "50 new boreholes drilled across rural areas",
                  category: "Infrastructure",
                  timeframe: "12 months",
                  impact: "Clean water for 80,000 people"
                },
                {
                  title: "Youth Employment Program",
                  signatures: "12,000",
                  outcome: "New job training centers in all 10 regions",
                  category: "Employment",
                  timeframe: "10 months",
                  impact: "5,000 youth trained annually"
                },
                {
                  title: "Maternal Health Initiative",
                  signatures: "18,500",
                  outcome: "Free prenatal care for rural mothers",
                  category: "Health",
                  timeframe: "7 months",
                  impact: "30% reduction in maternal mortality"
                },
                {
                  title: "Road Safety Campaign",
                  signatures: "25,000",
                  outcome: "Speed bumps and signs on 200km of highways",
                  category: "Safety",
                  timeframe: "9 months",
                  impact: "60% reduction in accidents"
                }
              ].map((story, index) => (
                <Card key={index} className="border-0 shadow-glow hover:shadow-heritage transition-all duration-300 fons-card">
                  <CardHeader className="bg-gradient-royal text-white">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">{story.title}</CardTitle>
                      <Trophy className="w-6 h-6 text-yellow-300 flex-shrink-0" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{story.category}</Badge>
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        ✓ Successful
                      </Badge>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="font-semibold">{story.signatures} signatures</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-secondary" />
                        <span>Achieved in {story.timeframe}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm font-medium text-accent">{story.outcome}</p>
                    <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                      <strong>Impact:</strong> {story.impact}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="mt-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="border-0 shadow-elegant bg-white/90">
                <CardHeader className="bg-gradient-accent text-white">
                  <CardTitle className="flex items-center gap-3">
                    <HelpCircle className="w-6 h-6" />
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {[
                    {
                      question: "How long does it take for a petition to be reviewed?",
                      answer: "Most petitions are reviewed within 24-48 hours. Complex petitions may take up to 5 business days."
                    },
                    {
                      question: "What happens if my petition gets rejected?",
                      answer: "You'll receive feedback explaining why it was rejected and suggestions for improvement. You can then edit and resubmit."
                    },
                    {
                      question: "How many signatures do I need for success?",
                      answer: "There's no magic number. Success depends on the issue, target audience, and how well you promote your petition. Some succeed with 500 signatures, others need 50,000+."
                    },
                    {
                      question: "Can I edit my petition after publishing?",
                      answer: "You can make minor edits to description and add updates, but major changes to the title or demands require creating a new petition."
                    },
                    {
                      question: "How do I promote my petition effectively?",
                      answer: "Share on social media, contact local media, reach out to community leaders, and use our built-in sharing tools."
                    }
                  ].map((faq, index) => (
                    <div key={index} className="space-y-2">
                      <h4 className="font-semibold text-primary">{faq.question}</h4>
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-elegant bg-white/90">
                <CardHeader className="bg-gradient-cm-green text-white">
                  <CardTitle className="flex items-center gap-3">
                    <Shield className="w-6 h-6" />
                    Community Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">✅ Allowed Content</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Constructive criticism of policies</li>
                        <li>• Requests for government action</li>
                        <li>• Community improvement initiatives</li>
                        <li>• Public welfare campaigns</li>
                      </ul>
                    </div>
                    
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2">❌ Prohibited Content</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• Personal attacks on individuals</li>
                        <li>• Hate speech or discrimination</li>
                        <li>• Commercial advertisements</li>
                        <li>• False or misleading information</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Create Petition Tab */}
          <TabsContent value="create" className="mt-8">
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-8">
                  <Card className="border-0 shadow-elegant bg-white/80 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-patriotic text-white rounded-t-lg">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <FileText className="w-6 h-6" />
                        Petition Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 p-8">
                      <div className="space-y-3">
                        <Label htmlFor="title" className="text-lg font-semibold">Title *</Label>
                        <Input
                          id="title"
                          placeholder="What change do you want to see?"
                          value={formData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          className={`h-12 text-base border-2 transition-all ${errors.title ? 'border-destructive focus:ring-destructive/20' : 'border-border/50 focus:ring-primary/20 focus:border-primary'}`}
                        />
                        {errors.title && (
                          <p className="text-sm text-destructive mt-1 font-medium">{errors.title}</p>
                        )}
                        <p className="text-sm text-muted-foreground font-medium">
                          {formData.title.length}/200 characters
                        </p>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="description" className="text-lg font-semibold">Description *</Label>
                        <Textarea
                          id="description"
                          placeholder="Explain why this petition is important and what specific changes you want to see..."
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          className={`min-h-40 text-base border-2 transition-all resize-none ${errors.description ? 'border-destructive focus:ring-destructive/20' : 'border-border/50 focus:ring-primary/20 focus:border-primary'}`}
                        />
                        {errors.description && (
                          <p className="text-sm text-destructive mt-1 font-medium">{errors.description}</p>
                        )}
                        <p className="text-sm text-muted-foreground font-medium">
                          {formData.description.length}/5000 characters
                        </p>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="target_institution" className="text-lg font-semibold">Target Institution *</Label>
                        <Input
                          id="target_institution"
                          placeholder="Who has the power to make this change? (e.g., Ministry of Health, Parliament, Mayor)"
                          value={formData.target_institution}
                          onChange={(e) => handleInputChange('target_institution', e.target.value)}
                          className={`h-12 text-base border-2 transition-all ${errors.target_institution ? 'border-destructive focus:ring-destructive/20' : 'border-border/50 focus:ring-primary/20 focus:border-primary'}`}
                        />
                        {errors.target_institution && (
                          <p className="text-sm text-destructive mt-1 font-medium">{errors.target_institution}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-elegant bg-white/80 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-patriotic text-white rounded-t-lg">
                      <CardTitle className="text-xl">Category & Location</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 p-8">
                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                          <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                <div className="flex items-center gap-2">
                                  <span>{category.icon}</span>
                                  <span>{category.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.category && (
                          <p className="text-sm text-destructive mt-1">{errors.category}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="regions">Region</Label>
                        <Select value={formData.region} onValueChange={(value) => handleInputChange('region', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {REGIONS.map((region) => (
                              <SelectItem key={region.value} value={region.value}>
                                {region.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                  <Card className="border-0 shadow-heritage bg-white/80 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-heritage text-white rounded-t-lg">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <Target className="w-6 h-6" />
                        Goals & Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 p-8">
                      <div>
                        <Label htmlFor="goal_signatures">Signature Goal *</Label>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <Input
                            id="goal_signatures"
                            type="number"
                            min="10"
                            max="1000000"
                            value={formData.goal_signatures}
                            onChange={(e) => handleInputChange('goal_signatures', parseInt(e.target.value) || 0)}
                            className={errors.goal_signatures ? 'border-destructive' : ''}
                          />
                        </div>
                        {errors.goal_signatures && (
                          <p className="text-sm text-destructive mt-1">{errors.goal_signatures}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Suggested: 100-10,000 signatures
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="deadline">Deadline (Optional)</Label>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <Input
                            id="deadline"
                            type="date"
                            min={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                            value={formData.deadline}
                            onChange={(e) => handleInputChange('deadline', e.target.value)}
                            className={errors.deadline ? 'border-destructive' : ''}
                          />
                        </div>
                        {errors.deadline && (
                          <p className="text-sm text-destructive mt-1">{errors.deadline}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Leave empty for no deadline
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Preview */}
                  {formData.title && formData.category && (
                    <Card className="border-0 shadow-glow bg-gradient-cowrie">
                      <CardHeader className="bg-gradient-royal text-white rounded-t-lg">
                        <CardTitle className="text-xl">✨ Preview</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <Badge variant="secondary" className="text-base px-3 py-1">
                            {CATEGORIES.find(c => c.value === formData.category)?.icon} {CATEGORIES.find(c => c.value === formData.category)?.label}
                          </Badge>
                          <h3 className="font-bold text-lg line-clamp-2 text-foreground">{formData.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {formData.description || 'Add a description...'}
                          </p>
                          <div className="text-sm font-semibold text-cm-green flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Goal: {formData.goal_signatures.toLocaleString()} signatures
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-6 pt-8 border-t-2 border-border/20">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/petitions')}
                  className="h-14 px-8 text-lg font-semibold border-2 hover:bg-muted/50 transition-all duration-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createPetitionMutation.isPending}
                  className="flex-1 h-14 text-lg font-bold bg-gradient-heritage hover:shadow-heritage transition-all duration-300 border-0"
                >
                  {createPetitionMutation.isPending ? (
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      Creating Petition...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Megaphone className="w-5 h-5" />
                      Create Petition
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PetitionCreatePage;