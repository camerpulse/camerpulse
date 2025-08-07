import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { SafeHtml } from '@/components/Security/SafeHtml';
import { Clock, Users, BookOpen, Play, CheckCircle, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface EducationalContentProps {
  selectedLanguage: string;
  searchTerm: string;
}

interface EducationalModule {
  id: string;
  content_type: string;
  title: string;
  content: any;
  difficulty_level: string;
  estimated_read_time: number;
  tags: string[];
  is_featured: boolean;
}

const contentTypes = [
  { id: 'rights_duties', name: 'Know Your Rights', icon: Users, color: 'bg-blue-500' },
  { id: 'electoral_guide', name: 'Electoral Process', icon: Users, color: 'bg-green-500' },
  { id: 'government_roles', name: 'Government Structure', icon: Users, color: 'bg-purple-500' },
  { id: 'legal_protection', name: 'Legal Protections', icon: Users, color: 'bg-red-500' },
  { id: 'civic_timeline', name: 'Civic Timeline', icon: Clock, color: 'bg-orange-500' },
  { id: 'customary_law', name: 'Customary vs Civil Law', icon: BookOpen, color: 'bg-indigo-500' }
];

export const EducationalContent: React.FC<EducationalContentProps> = ({
  selectedLanguage,
  searchTerm
}) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<EducationalModule | null>(null);

  // Fetch educational content
  const { data: modules, isLoading } = useQuery({
    queryKey: ['educational-content', selectedType, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('civic_educational_content')
        .select('*')
        .eq('is_published', true)
        .order('content_order');

      if (selectedType) {
        query = query.eq('content_type', selectedType);
      }

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as EducationalModule[];
    }
  });

  const getContent = (module: EducationalModule) => {
    const content = module.content;
    if (typeof content === 'object' && content[selectedLanguage]) {
      return content[selectedLanguage];
    }
    return content.english || content.description || 'Content not available in selected language';
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
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
      {/* Content Type Filter */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Button
          variant={selectedType === '' ? "default" : "outline"}
          onClick={() => setSelectedType('')}
          className="h-auto p-4 flex flex-col items-center gap-2"
        >
          <BookOpen className="w-6 h-6" />
          <span className="text-sm">All Topics</span>
        </Button>
        {contentTypes.map((type) => (
          <Button
            key={type.id}
            variant={selectedType === type.id ? "default" : "outline"}
            onClick={() => setSelectedType(type.id)}
            className="h-auto p-4 flex flex-col items-center gap-2"
          >
            <div className={`w-8 h-8 ${type.color} rounded-full flex items-center justify-center`}>
              <type.icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-center">{type.name}</span>
          </Button>
        ))}
      </div>

      {selectedModule ? (
        /* Module Detail View */
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{selectedModule.title}</CardTitle>
                <div className="flex items-center gap-3 mt-3">
                  <Badge className={getDifficultyColor(selectedModule.difficulty_level)}>
                    {selectedModule.difficulty_level}
                  </Badge>
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{selectedModule.estimated_read_time} min read</span>
                  </div>
                  {selectedModule.is_featured && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Featured
                    </Badge>
                  )}
                </div>
              </div>
              <Button variant="outline" onClick={() => setSelectedModule(null)}>
                Back to Modules
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Module Content */}
              <div className="prose dark:prose-invert max-w-none">
                <SafeHtml 
                  className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed"
                  allowedTags={['p', 'br', 'strong', 'em', 'ul', 'li', 'h1', 'h2', 'h3', 'h4']}
                >
                  {getContent(selectedModule)}
                </SafeHtml>
              </div>

              {/* Tags */}
              {selectedModule.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Topics Covered</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedModule.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress Actions */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button size="sm" className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Mark as Complete
                    </Button>
                    <Button variant="outline" size="sm">
                      Bookmark
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Progress: 0%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Modules Grid */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules?.map((module) => {
            const contentType = contentTypes.find(type => type.id === module.content_type);
            
            return (
              <Card key={module.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {contentType && (
                        <div className={`w-10 h-10 ${contentType.color} rounded-lg flex items-center justify-center`}>
                          <contentType.icon className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{module.title}</CardTitle>
                      </div>
                    </div>
                    {module.is_featured && (
                      <Star className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <Badge className={getDifficultyColor(module.difficulty_level)}>
                      {module.difficulty_level}
                    </Badge>
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">{module.estimated_read_time} min</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <CardDescription className="line-clamp-3">
                      {typeof module.content === 'object' 
                        ? module.content.summary || module.content.description || "Educational content about civic rights and duties"
                        : "Educational content about civic rights and duties"}
                    </CardDescription>
                    
                    {/* Tags */}
                    {module.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {module.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {module.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{module.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Progress</span>
                        <span className="text-gray-600 dark:text-gray-300">0%</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                    
                    <Button 
                      className="w-full flex items-center gap-2"
                      onClick={() => setSelectedModule(module)}
                    >
                      <Play className="w-4 h-4" />
                      Start Learning
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!modules || modules.length === 0) && (
        <Card>
          <CardContent className="flex items-center justify-center h-96">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold mb-2">No Educational Content Found</h3>
              <p>Try adjusting your filters or search terms</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};