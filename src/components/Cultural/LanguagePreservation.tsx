import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLanguagePreservation } from '@/hooks/useLanguagePreservation';
import { 
  Languages, 
  Plus, 
  Search,
  BookOpen,
  Volume2,
  Eye
} from 'lucide-react';

export const LanguagePreservation = () => {
  const villageId = 'default-village-id'; // This would come from context or props
  const { entries, loading, submitEntry } = useLanguagePreservation(villageId);
  const [activeTab, setActiveTab] = useState('dictionary');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  
  const [newEntry, setNewEntry] = useState({
    word_or_phrase: '',
    translation: '',
    pronunciation_guide: '',
    example_sentence: '',
    example_translation: '',
    category: '',
    language_code: '',
    language_name: '',
    cultural_context: ''
  });

  const cameroonLanguages = [
    { code: 'fr', name: 'French' },
    { code: 'en', name: 'English' },
    { code: 'dua', name: 'Duala' },
    { code: 'ewo', name: 'Ewondo' },
    { code: 'bul', name: 'Bulu' },
    { code: 'bas', name: 'Bassa' },
    { code: 'bam', name: 'Bamoun' },
    { code: 'ful', name: 'Fulfulde' },
    { code: 'other', name: 'Other' }
  ];

  const categories = [
    'Greetings', 'Family', 'Food', 'Animals', 'Nature', 'Colors', 'Numbers',
    'Time', 'Weather', 'Emotions', 'Body Parts', 'Clothing', 'Tools',
    'Ceremonies', 'Traditions', 'Proverbs', 'Songs', 'Stories', 'Other'
  ];

  const resetEntryForm = () => {
    setNewEntry({
      word_or_phrase: '',
      translation: '',
      pronunciation_guide: '',
      example_sentence: '',
      example_translation: '',
      category: '',
      language_code: '',
      language_name: '',
      cultural_context: ''
    });
  };

  const handleSaveEntry = async () => {
    if (!newEntry.word_or_phrase || !newEntry.translation) {
      return;
    }

    try {
      await submitEntry(newEntry);
      setIsEntryDialogOpen(false);
      resetEntryForm();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const filteredEntries = entries?.filter(entry => 
    !searchQuery || 
    entry.word_or_phrase?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.translation?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Languages className="h-6 w-6 mr-2 text-primary" />
            Language Preservation Tools
          </h2>
          <p className="text-muted-foreground">
            Preserve, learn, and share Cameroon's linguistic heritage
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dictionary">
            <BookOpen className="h-4 w-4 mr-2" />
            Dictionary
          </TabsTrigger>
          <TabsTrigger value="lessons">
            <Languages className="h-4 w-4 mr-2" />
            Lessons
          </TabsTrigger>
          <TabsTrigger value="pronunciation">
            <Volume2 className="h-4 w-4 mr-2" />
            Pronunciation
          </TabsTrigger>
        </TabsList>

        {/* Dictionary Tab */}
        <TabsContent value="dictionary" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search words or translations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>

            <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Dictionary Entry</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="word">Word/Phrase *</Label>
                      <Input
                        id="word"
                        value={newEntry.word_or_phrase}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, word_or_phrase: e.target.value }))}
                        placeholder="Enter word or phrase"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="translation">Translation *</Label>
                      <Input
                        id="translation"
                        value={newEntry.translation}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, translation: e.target.value }))}
                        placeholder="English/French translation"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pronunciation">Pronunciation Guide</Label>
                    <Input
                      id="pronunciation"
                      value={newEntry.pronunciation_guide}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, pronunciation_guide: e.target.value }))}
                      placeholder="How to pronounce (phonetic spelling)"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value={newEntry.language_code}
                        onValueChange={(value) => {
                          const lang = cameroonLanguages.find(l => l.code === value);
                          setNewEntry(prev => ({ 
                            ...prev, 
                            language_code: value,
                            language_name: lang?.name || ''
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {cameroonLanguages.map(lang => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newEntry.category}
                        onValueChange={(value) => setNewEntry(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="example_sentence">Example Sentence</Label>
                    <Input
                      id="example_sentence"
                      value={newEntry.example_sentence}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, example_sentence: e.target.value }))}
                      placeholder="Example usage in context"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="example_translation">Example Translation</Label>
                    <Input
                      id="example_translation"
                      value={newEntry.example_translation}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, example_translation: e.target.value }))}
                      placeholder="Translation of the example"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cultural_context">Cultural Context</Label>
                    <Textarea
                      id="cultural_context"
                      value={newEntry.cultural_context}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, cultural_context: e.target.value }))}
                      placeholder="Cultural background or significance of this word/phrase"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsEntryDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveEntry}>
                      Add Entry
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Dictionary Entries */}
          <Card>
            <CardHeader>
              <CardTitle>Dictionary Entries</CardTitle>
              <CardDescription>
                Words and phrases preserved for future generations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading entries...</div>
              ) : !filteredEntries.length ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No entries found</h3>
                  <p className="text-muted-foreground">
                    Start building the language dictionary by adding words and phrases
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEntries.map((entry) => (
                    <div key={entry.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{entry.word_or_phrase}</h3>
                          <p className="text-muted-foreground">{entry.translation}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {entry.category && (
                            <Badge variant="outline">{entry.category}</Badge>
                          )}
                          {entry.language_name && (
                            <Badge variant="secondary">{entry.language_name}</Badge>
                          )}
                        </div>
                      </div>

                      {entry.pronunciation && (
                        <p className="text-sm text-muted-foreground mb-2">
                          <span className="font-medium">Pronunciation:</span> {entry.pronunciation}
                        </p>
                      )}

                      {entry.context_usage && (
                        <div className="mt-3 p-3 bg-muted/20 rounded">
                          <p className="text-sm italic mb-1">{String(entry.context_usage)}</p>
                        </div>
                      )}

                      {entry.cultural_context && (
                        <div className="mt-3">
                          <p className="text-sm">
                            <span className="font-medium">Cultural Context:</span> {entry.cultural_context}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lessons Tab */}
        <TabsContent value="lessons">
          <Card>
            <CardHeader>
              <CardTitle>Language Lessons</CardTitle>
              <CardDescription>
                Interactive lessons to learn local languages
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Languages className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
              <p className="text-muted-foreground">
                Interactive language lessons will be available soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pronunciation Tab */}
        <TabsContent value="pronunciation">
          <Card>
            <CardHeader>
              <CardTitle>Pronunciation Guide</CardTitle>
              <CardDescription>
                Audio guides for proper pronunciation
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Volume2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
              <p className="text-muted-foreground">
                Audio pronunciation guides will be available soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};