import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Upload, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface DebtRecord {
  id: string;
  year: number;
  total_debt_fcfa: number;
  total_debt_usd: number;
  internal_debt_fcfa: number;
  external_debt_fcfa: number;
  debt_to_gdp_ratio: number;
  gdp_fcfa: number;
  population: number;
  notes: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

interface DebtSource {
  id: string;
  name: string;
  acronym: string;
  logo_url: string;
  website_url: string;
  description: string;
  is_active: boolean;
}

interface DebtNews {
  id: string;
  title: string;
  content: string;
  summary: string;
  author: string;
  source_url: string;
  tags: string[];
  is_featured: boolean;
  published_at: string;
}

export default function DebtAdmin() {
  const [debtRecords, setDebtRecords] = useState<DebtRecord[]>([]);
  const [sources, setSources] = useState<DebtSource[]>([]);
  const [news, setNews] = useState<DebtNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("records");

  // Form states
  const [recordForm, setRecordForm] = useState({
    id: '',
    year: new Date().getFullYear(),
    total_debt_fcfa: 0,
    total_debt_usd: 0,
    internal_debt_fcfa: 0,
    external_debt_fcfa: 0,
    debt_to_gdp_ratio: 0,
    gdp_fcfa: 0,
    population: 27914536,
    notes: '',
    verified: false
  });

  const [sourceForm, setSourceForm] = useState({
    id: '',
    name: '',
    acronym: '',
    logo_url: '',
    website_url: '',
    description: '',
    is_active: true
  });

  const [newsForm, setNewsForm] = useState({
    id: '',
    title: '',
    content: '',
    summary: '',
    author: '',
    source_url: '',
    tags: [] as string[],
    is_featured: false,
    published_at: new Date().toISOString().split('T')[0]
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [debtResult, sourcesResult, newsResult] = await Promise.all([
        supabase.from('debt_records').select('*').order('year', { ascending: false }),
        supabase.from('debt_sources').select('*').order('name'),
        supabase.from('debt_news').select('*').order('published_at', { ascending: false })
      ]);

      if (debtResult.error) throw debtResult.error;
      if (sourcesResult.error) throw sourcesResult.error;
      if (newsResult.error) throw newsResult.error;

      setDebtRecords(debtResult.data || []);
      setSources(sourcesResult.data || []);
      setNews(newsResult.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const resetRecordForm = () => {
    setRecordForm({
      id: '',
      year: new Date().getFullYear(),
      total_debt_fcfa: 0,
      total_debt_usd: 0,
      internal_debt_fcfa: 0,
      external_debt_fcfa: 0,
      debt_to_gdp_ratio: 0,
      gdp_fcfa: 0,
      population: 27914536,
      notes: '',
      verified: false
    });
    setEditingItem(null);
  };

  const resetSourceForm = () => {
    setSourceForm({
      id: '',
      name: '',
      acronym: '',
      logo_url: '',
      website_url: '',
      description: '',
      is_active: true
    });
    setEditingItem(null);
  };

  const resetNewsForm = () => {
    setNewsForm({
      id: '',
      title: '',
      content: '',
      summary: '',
      author: '',
      source_url: '',
      tags: [],
      is_featured: false,
      published_at: new Date().toISOString().split('T')[0]
    });
    setEditingItem(null);
  };

  const handleSaveRecord = async () => {
    try {
      const data = {
        year: recordForm.year,
        total_debt_fcfa: recordForm.total_debt_fcfa,
        total_debt_usd: recordForm.total_debt_usd,
        internal_debt_fcfa: recordForm.internal_debt_fcfa,
        external_debt_fcfa: recordForm.external_debt_fcfa,
        debt_to_gdp_ratio: recordForm.debt_to_gdp_ratio,
        gdp_fcfa: recordForm.gdp_fcfa,
        population: recordForm.population,
        notes: recordForm.notes,
        verified: recordForm.verified
      };

      let result;
      if (editingItem) {
        result = await supabase.from('debt_records').update(data).eq('id', editingItem);
      } else {
        result = await supabase.from('debt_records').insert([data]);
      }

      if (result.error) throw result.error;

      toast.success(editingItem ? 'Record updated successfully' : 'Record created successfully');
      setDialogOpen(false);
      resetRecordForm();
      fetchData();
    } catch (error) {
      console.error('Error saving record:', error);
      toast.error('Failed to save record');
    }
  };

  const handleSaveSource = async () => {
    try {
      const data = {
        name: sourceForm.name,
        acronym: sourceForm.acronym,
        logo_url: sourceForm.logo_url,
        website_url: sourceForm.website_url,
        description: sourceForm.description,
        is_active: sourceForm.is_active
      };

      let result;
      if (editingItem) {
        result = await supabase.from('debt_sources').update(data).eq('id', editingItem);
      } else {
        result = await supabase.from('debt_sources').insert([data]);
      }

      if (result.error) throw result.error;

      toast.success(editingItem ? 'Source updated successfully' : 'Source created successfully');
      setDialogOpen(false);
      resetSourceForm();
      fetchData();
    } catch (error) {
      console.error('Error saving source:', error);
      toast.error('Failed to save source');
    }
  };

  const handleSaveNews = async () => {
    try {
      const data = {
        title: newsForm.title,
        content: newsForm.content,
        summary: newsForm.summary,
        author: newsForm.author,
        source_url: newsForm.source_url,
        tags: newsForm.tags,
        is_featured: newsForm.is_featured,
        published_at: newsForm.published_at
      };

      let result;
      if (editingItem) {
        result = await supabase.from('debt_news').update(data).eq('id', editingItem);
      } else {
        result = await supabase.from('debt_news').insert([data]);
      }

      if (result.error) throw result.error;

      toast.success(editingItem ? 'News updated successfully' : 'News created successfully');
      setDialogOpen(false);
      resetNewsForm();
      fetchData();
    } catch (error) {
      console.error('Error saving news:', error);
      toast.error('Failed to save news');
    }
  };

  const handleDelete = async (table: 'debt_records' | 'debt_sources' | 'debt_news', id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const result = await supabase.from(table).delete().eq('id', id);
      if (result.error) throw result.error;

      toast.success('Item deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const editRecord = (record: DebtRecord) => {
    setRecordForm(record);
    setEditingItem(record.id);
    setDialogOpen(true);
  };

  const editSource = (source: DebtSource) => {
    setSourceForm(source);
    setEditingItem(source.id);
    setDialogOpen(true);
  };

  const editNews = (newsItem: DebtNews) => {
    setNewsForm({
      ...newsItem,
      published_at: newsItem.published_at.split('T')[0]
    });
    setEditingItem(newsItem.id);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Debt Data Administration</h1>
            <p className="text-muted-foreground">Manage national debt records, sources, and news</p>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="records">Debt Records</TabsTrigger>
            <TabsTrigger value="sources">Data Sources</TabsTrigger>
            <TabsTrigger value="news">News & Commentary</TabsTrigger>
          </TabsList>

          {/* Debt Records Tab */}
          <TabsContent value="records" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Debt Records</h2>
              <Dialog open={dialogOpen && activeTab === 'records'} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { resetRecordForm(); setActiveTab('records'); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Record
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingItem ? 'Edit' : 'Add'} Debt Record</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        type="number"
                        value={recordForm.year}
                        onChange={(e) => setRecordForm({ ...recordForm, year: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="population">Population</Label>
                      <Input
                        id="population"
                        type="number"
                        value={recordForm.population}
                        onChange={(e) => setRecordForm({ ...recordForm, population: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="total_debt_fcfa">Total Debt (FCFA)</Label>
                      <Input
                        id="total_debt_fcfa"
                        type="number"
                        value={recordForm.total_debt_fcfa}
                        onChange={(e) => setRecordForm({ ...recordForm, total_debt_fcfa: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="total_debt_usd">Total Debt (USD)</Label>
                      <Input
                        id="total_debt_usd"
                        type="number"
                        value={recordForm.total_debt_usd}
                        onChange={(e) => setRecordForm({ ...recordForm, total_debt_usd: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="internal_debt_fcfa">Internal Debt (FCFA)</Label>
                      <Input
                        id="internal_debt_fcfa"
                        type="number"
                        value={recordForm.internal_debt_fcfa}
                        onChange={(e) => setRecordForm({ ...recordForm, internal_debt_fcfa: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="external_debt_fcfa">External Debt (FCFA)</Label>
                      <Input
                        id="external_debt_fcfa"
                        type="number"
                        value={recordForm.external_debt_fcfa}
                        onChange={(e) => setRecordForm({ ...recordForm, external_debt_fcfa: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="debt_to_gdp_ratio">Debt to GDP Ratio (%)</Label>
                      <Input
                        id="debt_to_gdp_ratio"
                        type="number"
                        step="0.1"
                        value={recordForm.debt_to_gdp_ratio}
                        onChange={(e) => setRecordForm({ ...recordForm, debt_to_gdp_ratio: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="gdp_fcfa">GDP (FCFA)</Label>
                      <Input
                        id="gdp_fcfa"
                        type="number"
                        value={recordForm.gdp_fcfa}
                        onChange={(e) => setRecordForm({ ...recordForm, gdp_fcfa: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={recordForm.notes}
                      onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                      placeholder="Additional notes about this debt record..."
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="verified"
                      checked={recordForm.verified}
                      onCheckedChange={(checked) => setRecordForm({ ...recordForm, verified: checked })}
                    />
                    <Label htmlFor="verified">Verified Data</Label>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleSaveRecord} className="flex-1">
                      {editingItem ? 'Update' : 'Create'} Record
                    </Button>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {debtRecords.map((record) => (
                <Card key={record.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{record.year}</h3>
                          {record.verified ? (
                            <Badge variant="default">Verified</Badge>
                          ) : (
                            <Badge variant="secondary">Unverified</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Total Debt: {(record.total_debt_fcfa / 1000000000000).toFixed(1)}T FCFA 
                          ({(record.total_debt_usd / 1000000000).toFixed(1)}B USD)
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Debt to GDP: {record.debt_to_gdp_ratio}%
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => editRecord(record)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDelete('debt_records', record.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Data Sources Tab */}
          <TabsContent value="sources" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Data Sources</h2>
              <Dialog open={dialogOpen && activeTab === 'sources'} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { resetSourceForm(); setActiveTab('sources'); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Source
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingItem ? 'Edit' : 'Add'} Data Source</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="source_name">Name</Label>
                      <Input
                        id="source_name"
                        value={sourceForm.name}
                        onChange={(e) => setSourceForm({ ...sourceForm, name: e.target.value })}
                        placeholder="e.g., International Monetary Fund"
                      />
                    </div>
                    <div>
                      <Label htmlFor="source_acronym">Acronym</Label>
                      <Input
                        id="source_acronym"
                        value={sourceForm.acronym}
                        onChange={(e) => setSourceForm({ ...sourceForm, acronym: e.target.value })}
                        placeholder="e.g., IMF"
                      />
                    </div>
                    <div>
                      <Label htmlFor="source_website">Website URL</Label>
                      <Input
                        id="source_website"
                        value={sourceForm.website_url}
                        onChange={(e) => setSourceForm({ ...sourceForm, website_url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="source_description">Description</Label>
                      <Textarea
                        id="source_description"
                        value={sourceForm.description}
                        onChange={(e) => setSourceForm({ ...sourceForm, description: e.target.value })}
                        placeholder="Brief description of the organization..."
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="source_active"
                        checked={sourceForm.is_active}
                        onCheckedChange={(checked) => setSourceForm({ ...sourceForm, is_active: checked })}
                      />
                      <Label htmlFor="source_active">Active Source</Label>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleSaveSource} className="flex-1">
                      {editingItem ? 'Update' : 'Create'} Source
                    </Button>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {sources.map((source) => (
                <Card key={source.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{source.name}</h3>
                          <Badge variant="outline">{source.acronym}</Badge>
                          {source.is_active ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{source.description}</p>
                        {source.website_url && (
                          <p className="text-sm text-blue-600">{source.website_url}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => editSource(source)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDelete('debt_sources', source.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">News & Commentary</h2>
              <Dialog open={dialogOpen && activeTab === 'news'} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { resetNewsForm(); setActiveTab('news'); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add News
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingItem ? 'Edit' : 'Add'} News Article</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="news_title">Title</Label>
                      <Input
                        id="news_title"
                        value={newsForm.title}
                        onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                        placeholder="Article title..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="news_summary">Summary</Label>
                      <Textarea
                        id="news_summary"
                        value={newsForm.summary}
                        onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })}
                        placeholder="Brief summary..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="news_content">Content</Label>
                      <Textarea
                        id="news_content"
                        value={newsForm.content}
                        onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                        placeholder="Full article content..."
                        className="min-h-[120px]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="news_author">Author</Label>
                        <Input
                          id="news_author"
                          value={newsForm.author}
                          onChange={(e) => setNewsForm({ ...newsForm, author: e.target.value })}
                          placeholder="Author name..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="news_date">Published Date</Label>
                        <Input
                          id="news_date"
                          type="date"
                          value={newsForm.published_at}
                          onChange={(e) => setNewsForm({ ...newsForm, published_at: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="news_source_url">Source URL</Label>
                      <Input
                        id="news_source_url"
                        value={newsForm.source_url}
                        onChange={(e) => setNewsForm({ ...newsForm, source_url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="news_featured"
                        checked={newsForm.is_featured}
                        onCheckedChange={(checked) => setNewsForm({ ...newsForm, is_featured: checked })}
                      />
                      <Label htmlFor="news_featured">Featured Article</Label>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleSaveNews} className="flex-1">
                      {editingItem ? 'Update' : 'Create'} Article
                    </Button>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {news.map((article) => (
                <Card key={article.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{article.title}</h3>
                          {article.is_featured && (
                            <Badge variant="default">Featured</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{article.summary}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>By {article.author}</span>
                          <span>{new Date(article.published_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => editNews(article)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDelete('debt_news', article.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}