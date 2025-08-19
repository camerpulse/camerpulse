import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Users, Award, MessageSquare, Search, Globe, Languages, Download } from 'lucide-react';
import { ConstitutionViewer } from '@/components/civic-education/ConstitutionViewer';
import { EducationalContent } from '@/components/civic-education/EducationalContent';
import { CivicQuizzes } from '@/components/civic-education/CivicQuizzes';
import { CivicQuestions } from '@/components/civic-education/CivicQuestions';
import { UserProgress } from '@/components/civic-education/UserProgress';
import { CivicBookmarks } from '@/components/civic-education/CivicBookmarks';

const CivicEducationHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('constitution');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('english');

  const languages = [
    { code: 'english', name: 'English', flag: '🇬🇧' },
    { code: 'french', name: 'Français', flag: '🇫🇷' },
    { code: 'pidgin', name: 'Pidgin', flag: '🇨🇲' },
    { code: 'fulfulde', name: 'Fulfulde', flag: '🌍' }
  ];

  const stats = [
    { label: 'Constitution Articles', value: '120+', icon: BookOpen },
    { label: 'Active Learners', value: '2.5K', icon: Users },
    { label: 'Civic Quizzes', value: '25', icon: Award },
    { label: 'Q&A Discussions', value: '350+', icon: MessageSquare }
  ];

  const features = [
    {
      title: 'Interactive Constitution',
      description: 'Browse Cameroon\'s constitution with multilingual support and searchable articles',
      icon: BookOpen,
      color: 'bg-blue-500'
    },
    {
      title: 'Know Your Rights',
      description: 'Educational modules on citizen rights, duties, and legal protections',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      title: 'Civic Quizzes',
      description: 'Test your knowledge with auto-generated quizzes and earn achievement badges',
      icon: Award,
      color: 'bg-purple-500'
    },
    {
      title: 'Legal Q&A Forum',
      description: 'Ask questions about laws, rights, and civic processes with expert answers',
      icon: MessageSquare,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Civic Education Hub
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Empowering Cameroonian citizens with knowledge of their Constitution, rights, and civic duties through interactive learning in multiple languages
            </p>
            
            {/* Language Selector */}
            <div className="flex justify-center items-center gap-4 mb-8">
              <Globe className="w-5 h-5" />
              <div className="flex gap-2">
                {languages.map((lang) => (
                  <Button
                    key={lang.code}
                    variant={selectedLanguage === lang.code ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLanguage(lang.code)}
                    className="text-white border-white/20 hover:bg-white/10"
                  >
                    {lang.flag} {lang.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex max-w-md mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search Constitution articles, laws, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70"
                />
              </div>
              <Button variant="secondary" className="ml-2">
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-8 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                  <stat.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Learn & Engage
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover comprehensive civic education resources designed to make Cameroon's legal framework accessible to all citizens
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 ${feature.color} rounded-full mb-3`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="container mx-auto px-4 pb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 mb-8">
            <TabsTrigger value="constitution" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Constitution
            </TabsTrigger>
            <TabsTrigger value="education" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Learn
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Quizzes
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Q&A
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Bookmarks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="constitution" className="space-y-6">
            <ConstitutionViewer selectedLanguage={selectedLanguage} searchTerm={searchTerm} />
          </TabsContent>

          <TabsContent value="education" className="space-y-6">
            <EducationalContent selectedLanguage={selectedLanguage} searchTerm={searchTerm} />
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-6">
            <CivicQuizzes />
          </TabsContent>

          <TabsContent value="questions" className="space-y-6">
            <CivicQuestions />
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <UserProgress />
          </TabsContent>

          <TabsContent value="bookmarks" className="space-y-6">
            <CivicBookmarks />
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Become a More Informed Citizen?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Join thousands of Cameroonians learning about their rights, Constitution, and civic duties
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="secondary" size="lg" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download Constitution PDF
            </Button>
            <Button variant="outline" size="lg" className="text-white border-white hover:bg-white/10">
              Take a Quick Quiz
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CivicEducationHub;