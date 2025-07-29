import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bookmark, Share2, Download, ChevronDown, ChevronRight, Search, Filter, BookOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConstitutionViewerProps {
  selectedLanguage: string;
  searchTerm: string;
}

interface ConstitutionArticle {
  id: string;
  article_number: string;
  title: string;
  content_french: string;
  content_english: string;
  content_pidgin?: string;
  content_fulfulde?: string;
  section_name: string;
  chapter_name?: string;
  summary?: string;
  keywords: string[];
  related_articles: string[];
}

export const ConstitutionViewer: React.FC<ConstitutionViewerProps> = ({
  selectedLanguage,
  searchTerm
}) => {
  const [selectedArticle, setSelectedArticle] = useState<ConstitutionArticle | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [filterSection, setFilterSection] = useState<string>('');
  const { toast } = useToast();

  // Fetch constitution articles
  const { data: articles, isLoading } = useQuery({
    queryKey: ['constitution-articles', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('constitution_articles')
        .select('*')
        .eq('is_active', true)
        .order('article_number');

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,keywords.cs.{${searchTerm}}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ConstitutionArticle[];
    }
  });

  // Group articles by section
  const groupedArticles = articles?.reduce((acc, article) => {
    const section = article.section_name;
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(article);
    return acc;
  }, {} as Record<string, ConstitutionArticle[]>);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getContent = (article: ConstitutionArticle) => {
    switch (selectedLanguage) {
      case 'french':
        return article.content_french;
      case 'pidgin':
        return article.content_pidgin || article.content_english;
      case 'fulfulde':
        return article.content_fulfulde || article.content_english;
      default:
        return article.content_english;
    }
  };

  const handleBookmark = async (article: ConstitutionArticle) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to bookmark articles",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('civic_user_bookmarks')
      .insert({
        user_id: user.id,
        content_type: 'constitution_article',
        content_id: article.id,
        notes: `Article ${article.article_number}: ${article.title}`
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to bookmark article",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Bookmarked",
        description: `Article ${article.article_number} has been saved to your bookmarks`
      });
    }
  };

  const handleShare = (article: ConstitutionArticle) => {
    const url = `${window.location.origin}/civic-education?article=${article.id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied",
      description: "Article link has been copied to clipboard"
    });
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
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Articles List */}
      <div className="lg:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Constitution Navigator
            </CardTitle>
            <CardDescription>
              Browse and search Cameroon's Constitution by section and article
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Section Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Filter by section..."
                  value={filterSection}
                  onChange={(e) => setFilterSection(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Articles by Section */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {Object.entries(groupedArticles || {}).map(([section, sectionArticles]) => {
                  if (filterSection && !section.toLowerCase().includes(filterSection.toLowerCase())) {
                    return null;
                  }
                  
                  const isExpanded = expandedSections.has(section);
                  
                  return (
                    <div key={section} className="border rounded-lg">
                      <button
                        onClick={() => toggleSection(section)}
                        className="w-full p-3 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <span className="font-medium">{section}</span>
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      
                      {isExpanded && (
                        <div className="border-t">
                          {sectionArticles.map((article) => (
                            <button
                              key={article.id}
                              onClick={() => setSelectedArticle(article)}
                              className={`w-full p-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 border-b last:border-b-0 ${
                                selectedArticle?.id === article.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                              }`}
                            >
                              <div className="font-medium">Article {article.article_number}</div>
                              <div className="text-gray-600 dark:text-gray-300 truncate">{article.title}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Article Content */}
      <div className="lg:col-span-2">
        {selectedArticle ? (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    Article {selectedArticle.article_number}
                  </CardTitle>
                  <CardDescription className="text-lg mt-2">
                    {selectedArticle.title}
                  </CardDescription>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="outline">{selectedArticle.section_name}</Badge>
                    {selectedArticle.chapter_name && (
                      <Badge variant="secondary">{selectedArticle.chapter_name}</Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBookmark(selectedArticle)}
                  >
                    <Bookmark className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(selectedArticle)}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Summary */}
                {selectedArticle.summary && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Summary</h4>
                    <p className="text-blue-800 dark:text-blue-200">{selectedArticle.summary}</p>
                  </div>
                )}

                {/* Article Content */}
                <div className="prose dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                    {getContent(selectedArticle)}
                  </div>
                </div>

                {/* Keywords */}
                {selectedArticle.keywords.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedArticle.keywords.map((keyword, index) => (
                        <Badge key={index} variant="outline">{keyword}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Articles */}
                {selectedArticle.related_articles.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Related Articles</h4>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      See also: {selectedArticle.related_articles.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold mb-2">Select an Article</h3>
                <p>Choose an article from the navigator to view its content</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};