import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/Layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Search, ExternalLink, Calendar, TrendingUp, Pin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  source_name: string;
  source_url: string;
  image_url: string;
  sentiment_label: string;
  sentiment_score: number;
  is_pinned: boolean;
  published_at: string;
  created_at: string;
}

const News = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");

  const { data: articles, isLoading } = useQuery({
    queryKey: ["news_articles", searchTerm, sentimentFilter],
    queryFn: async () => {
      let query = supabase
        .from("news_articles")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("published_at", { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`);
      }

      if (sentimentFilter !== "all") {
        query = query.eq("sentiment_label", sentimentFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as NewsArticle[];
    },
  });

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case "positive": return "bg-green-100 text-green-800";
      case "negative": return "bg-red-100 text-red-800";
      case "neutral": return "bg-gray-100 text-gray-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  const pinnedArticles = articles?.filter(article => article.is_pinned) || [];
  const regularArticles = articles?.filter(article => !article.is_pinned) || [];

  return (
    <AppLayout>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Civic News Feed</h1>
            <p className="text-muted-foreground">Stay informed with the latest political and civic updates</p>
          </div>

          {/* Filters Section */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search news articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={sentimentFilter === "all" ? "default" : "outline"}
                  onClick={() => setSentimentFilter("all")}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={sentimentFilter === "positive" ? "default" : "outline"}
                  onClick={() => setSentimentFilter("positive")}
                  size="sm"
                >
                  Positive
                </Button>
                <Button
                  variant={sentimentFilter === "neutral" ? "default" : "outline"}
                  onClick={() => setSentimentFilter("neutral")}
                  size="sm"
                >
                  Neutral
                </Button>
                <Button
                  variant={sentimentFilter === "negative" ? "default" : "outline"}
                  onClick={() => setSentimentFilter("negative")}
                  size="sm"
                >
                  Negative
                </Button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pinned Articles */}
              {pinnedArticles.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Pin className="h-5 w-5" />
                    Pinned Articles
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    {pinnedArticles.map((article) => (
                      <Card key={article.id} className="border-primary/20 bg-primary/5">
                        {article.image_url && (
                          <div className="aspect-video overflow-hidden rounded-t-lg">
                            <img
                              src={article.image_url}
                              alt={article.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4">
                            <CardTitle className="text-lg">{article.title}</CardTitle>
                            <Pin className="h-4 w-4 text-primary flex-shrink-0" />
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {formatDistanceToNow(new Date(article.published_at || article.created_at), { addSuffix: true })}
                            {article.source_name && (
                              <>
                                <span>•</span>
                                <span>{article.source_name}</span>
                              </>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-muted-foreground">{article.excerpt}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {article.sentiment_label && (
                                <Badge className={getSentimentColor(article.sentiment_label)}>
                                  {article.sentiment_label}
                                </Badge>
                              )}
                              {article.sentiment_score && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <TrendingUp className="h-3 w-3" />
                                  <span>{(article.sentiment_score * 100).toFixed(0)}%</span>
                                </div>
                              )}
                            </div>
                            {article.source_url && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={article.source_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Read Full Article
                                </a>
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Articles */}
              {regularArticles.length > 0 && (
                <div>
                  {pinnedArticles.length > 0 && (
                    <h2 className="text-xl font-semibold text-foreground mb-4">Latest News</h2>
                  )}
                  <div className="space-y-4">
                    {regularArticles.map((article) => (
                      <Card key={article.id}>
                        <div className="flex">
                          {article.image_url && (
                            <div className="w-48 flex-shrink-0">
                              <img
                                src={article.image_url}
                                alt={article.title}
                                className="w-full h-full object-cover rounded-l-lg"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <CardHeader>
                              <CardTitle className="text-lg">{article.title}</CardTitle>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {formatDistanceToNow(new Date(article.published_at || article.created_at), { addSuffix: true })}
                                {article.source_name && (
                                  <>
                                    <span>•</span>
                                    <span>{article.source_name}</span>
                                  </>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <p className="text-muted-foreground">{article.excerpt}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {article.sentiment_label && (
                                    <Badge className={getSentimentColor(article.sentiment_label)}>
                                      {article.sentiment_label}
                                    </Badge>
                                  )}
                                  {article.sentiment_score && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <TrendingUp className="h-3 w-3" />
                                      <span>{(article.sentiment_score * 100).toFixed(0)}%</span>
                                    </div>
                                  )}
                                </div>
                                {article.source_url && (
                                  <Button variant="outline" size="sm" asChild>
                                    <a href={article.source_url} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      Read Full Article
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {articles && articles.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No news articles found matching your criteria.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  );
};

export default News;