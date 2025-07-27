import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Languages, 
  Plus, 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  BookOpen, 
  Mic,
  FileAudio,
  Search,
  Filter,
  Users,
  Clock,
  Star,
  Award,
  Download,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';

interface LanguageEntry {
  id: string;
  word_or_phrase: string;
  translation: string;
  pronunciation_guide: string;
  audio_url?: string;
  example_sentence: string;
  example_translation: string;
  category: string;
  difficulty_level: string;
  cultural_context: string;
  language_code: string;
  language_name: string;
  region: string;
  contributed_by: string;
  verified: boolean;
  created_at: string;
  usage_frequency: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  language_code: string;
  language_name: string;
  lesson_content: any;
  difficulty_level: string;
  estimated_duration: number;
  prerequisites: string[];
  learning_objectives: string[];
  created_by: string;
  created_at: string;
  completed_count: number;
}

export const LanguagePreservation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('dictionary');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [newEntry, setNewEntry] = useState({
    word_or_phrase: '',
    translation: '',
    pronunciation_guide: '',
    example_sentence: '',
    example_translation: '',
    category: '',
    difficulty_level: 'beginner',
    cultural_context: '',
    language_code: '',
    language_name: '',
    region: '',
    usage_frequency: 'common'
  });

  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    language_code: '',
    language_name: '',
    lesson_content: { sections: [] },
    difficulty_level: 'beginner',
    estimated_duration: 30,
    prerequisites: [''],
    learning_objectives: ['']
  });

  // Fetch language entries
  const { data: entries, isLoading: entriesLoading } = useQuery({
    queryKey: ['language_entries', selectedLanguage, selectedCategory, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('language_dictionary')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedLanguage !== 'all') {
        query = query.eq('language_code', selectedLanguage);
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (searchQuery) {
        query = query.or(`word_or_phrase.ilike.%${searchQuery}%,translation.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as LanguageEntry[];
    },
  });

  // Fetch lessons
  const { data: lessons, isLoading: lessonsLoading } = useQuery({
    queryKey: ['language_lessons', selectedLanguage],
    queryFn: async () => {
      let query = supabase
        .from('language_lessons')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedLanguage !== 'all') {
        query = query.eq('language_code', selectedLanguage);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Lesson[];
    },
  });

  // Save entry mutation
  const saveEntryMutation = useMutation({
    mutationFn: async (entryData: any) => {
      const { error } = await supabase
        .from('language_dictionary')
        .insert({
          ...entryData,
          contributed_by: 'current_user', // Replace with actual user ID
          verified: false,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['language_entries'] });
      toast({
        title: "Entry added",
        description: "Language entry has been added to the dictionary.",
      });
      setIsEntryDialogOpen(false);
      resetEntryForm();
    },
    onError: (error) => {
      toast({
        title: "Error saving entry",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Save lesson mutation
  const saveLessonMutation = useMutation({
    mutationFn: async (lessonData: any) => {
      const { error } = await supabase
        .from('language_lessons')
        .insert({
          ...lessonData,
          created_by: 'current_user', // Replace with actual user ID
          completed_count: 0,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['language_lessons'] });
      toast({
        title: "Lesson created",
        description: "Language lesson has been created successfully.",
      });
      setIsLessonDialogOpen(false);
      resetLessonForm();
    },
    onError: (error) => {
      toast({
        title: "Error saving lesson",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetEntryForm = () => {
    setNewEntry({
      word_or_phrase: '',
      translation: '',
      pronunciation_guide: '',
      example_sentence: '',
      example_translation: '',
      category: '',
      difficulty_level: 'beginner',
      cultural_context: '',
      language_code: '',
      language_name: '',
      region: '',
      usage_frequency: 'common'
    });
    setRecordedAudio(null);
  };

  const resetLessonForm = () => {
    setNewLesson({
      title: '',
      description: '',
      language_code: '',
      language_name: '',
      lesson_content: { sections: [] },
      difficulty_level: 'beginner',
      estimated_duration: 30,
      prerequisites: [''],
      learning_objectives: ['']
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordedAudio(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Recording error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setPlayingAudio(audioUrl);
      audioRef.current.onended = () => setPlayingAudio(null);
    }
  };

  const cameroonLanguages = [
    { code: 'fr', name: 'French' },
    { code: 'en', name: 'English' },
    { code: 'dua', name: 'Duala' },
    { code: 'ewo', name: 'Ewondo' },
    { code: 'bul', name: 'Bulu' },
    { code: 'bas', name: 'Bassa' },
    { code: 'bam', name: 'Bamoun' },
    { code: 'ful', name: 'Fulfulde' },
    { code: 'gba', name: 'Gbaya' },
    { code: 'bkw', name: 'Bakweri' },
    { code: 'kom', name: 'Kom' },
    { code: 'lim', name: 'Limbum' },
    { code: 'tig', name: 'Tikar' },
    { code: 'mak', name: 'Maka' },
    { code: 'fan', name: 'Fang' },
    { code: 'other', name: 'Other' }
  ];

  const categories = [
    'Greetings', 'Family', 'Food', 'Animals', 'Nature', 'Colors', 'Numbers',
    'Time', 'Weather', 'Emotions', 'Body Parts', 'Clothing', 'Tools',
    'Ceremonies', 'Traditions', 'Proverbs', 'Songs', 'Stories', 'Other'
  ];

  const difficultyLevels = ['beginner', 'intermediate', 'advanced'];
  const usageFrequency = ['very_common', 'common', 'uncommon', 'rare', 'archaic'];

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

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
              
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Languages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {cameroonLanguages.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

                  {/* Audio Recording */}
                  <div className="space-y-2">
                    <Label>Audio Pronunciation</Label>
                    <div className="flex items-center gap-2">
                      {!isRecording ? (
                        <Button onClick={startRecording} variant="outline">
                          <Mic className="h-4 w-4 mr-2" />
                          Record
                        </Button>
                      ) : (
                        <Button onClick={stopRecording} variant="destructive">
                          <Square className="h-4 w-4 mr-2" />
                          Stop
                        </Button>
                      )}
                      
                      {recordedAudio && (
                        <Button
                          onClick={() => {
                            const url = URL.createObjectURL(recordedAudio);
                            playAudio(url);
                          }}
                          variant="outline"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Play
                        </Button>
                      )}
                    </div>
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
                    <Label htmlFor="example">Example Sentence</Label>
                    <Textarea
                      id="example"
                      value={newEntry.example_sentence}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, example_sentence: e.target.value }))}
                      placeholder="Show how the word is used in context"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="example_translation">Example Translation</Label>
                    <Textarea
                      id="example_translation"
                      value={newEntry.example_translation}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, example_translation: e.target.value }))}
                      placeholder="Translation of the example sentence"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cultural_context">Cultural Context</Label>
                    <Textarea
                      id="cultural_context"
                      value={newEntry.cultural_context}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, cultural_context: e.target.value }))}
                      placeholder="When and how this word is typically used, cultural significance..."
                      rows={2}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsEntryDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => saveEntryMutation.mutate(newEntry)}
                      disabled={saveEntryMutation.isPending}
                    >
                      {saveEntryMutation.isPending ? 'Saving...' : 'Add Entry'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Dictionary Entries */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {entriesLoading ? (
              <div className="col-span-full text-center py-8">Loading dictionary entries...</div>
            ) : !entries?.length ? (
              <div className="col-span-full text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No entries found</h3>
                <p className="text-muted-foreground">
                  Start building the dictionary by adding language entries
                </p>
              </div>
            ) : (
              entries.map((entry) => (
                <Card key={entry.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{entry.word_or_phrase}</h3>
                        <p className="text-muted-foreground">{entry.translation}</p>
                      </div>
                      {entry.verified && (
                        <Badge variant="outline">
                          <Award className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    {entry.pronunciation_guide && (
                      <p className="text-sm text-muted-foreground mb-2">
                        <span className="font-medium">Pronunciation:</span> {entry.pronunciation_guide}
                      </p>
                    )}

                    {entry.audio_url && (
                      <Button
                        onClick={() => playAudio(entry.audio_url!)}
                        variant="outline"
                        size="sm"
                        className="mb-3"
                      >
                        <Volume2 className="h-3 w-3 mr-1" />
                        Listen
                      </Button>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{entry.language_name}</Badge>
                        <Badge variant="outline">{entry.category}</Badge>
                        <Badge className={difficultyColors[entry.difficulty_level as keyof typeof difficultyColors]}>
                          {entry.difficulty_level}
                        </Badge>
                      </div>

                      {entry.example_sentence && (
                        <div className="text-sm">
                          <p className="italic">"{entry.example_sentence}"</p>
                          {entry.example_translation && (
                            <p className="text-muted-foreground">"{entry.example_translation}"</p>
                          )}
                        </div>
                      )}

                      {entry.cultural_context && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Context:</span> {entry.cultural_context}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Lessons Tab */}
        <TabsContent value="lessons" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Languages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {cameroonLanguages.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Lesson
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Language Lesson</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="lesson_title">Lesson Title *</Label>
                    <Input
                      id="lesson_title"
                      value={newLesson.title}
                      onChange={(e) => setNewLesson(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Basic Greetings in Duala"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lesson_description">Description</Label>
                    <Textarea
                      id="lesson_description"
                      value={newLesson.description}
                      onChange={(e) => setNewLesson(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what students will learn in this lesson..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lesson_language">Language</Label>
                      <Select
                        value={newLesson.language_code}
                        onValueChange={(value) => {
                          const lang = cameroonLanguages.find(l => l.code === value);
                          setNewLesson(prev => ({ 
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
                      <Label htmlFor="lesson_difficulty">Difficulty</Label>
                      <Select
                        value={newLesson.difficulty_level}
                        onValueChange={(value) => setNewLesson(prev => ({ ...prev, difficulty_level: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {difficultyLevels.map(level => (
                            <SelectItem key={level} value={level}>
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Estimated Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newLesson.estimated_duration}
                      onChange={(e) => setNewLesson(prev => ({ ...prev, estimated_duration: parseInt(e.target.value) || 0 }))}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsLessonDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => saveLessonMutation.mutate(newLesson)}
                      disabled={saveLessonMutation.isPending}
                    >
                      {saveLessonMutation.isPending ? 'Creating...' : 'Create Lesson'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Lessons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessonsLoading ? (
              <div className="col-span-full text-center py-8">Loading lessons...</div>
            ) : !lessons?.length ? (
              <div className="col-span-full text-center py-8">
                <Languages className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No lessons available</h3>
                <p className="text-muted-foreground">
                  Create interactive lessons to help preserve and teach languages
                </p>
              </div>
            ) : (
              lessons.map((lesson) => (
                <Card key={lesson.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{lesson.title}</CardTitle>
                    <CardDescription>{lesson.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{lesson.language_name}</Badge>
                        <Badge className={difficultyColors[lesson.difficulty_level as keyof typeof difficultyColors]}>
                          {lesson.difficulty_level}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{lesson.estimated_duration} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{lesson.completed_count} completed</span>
                        </div>
                      </div>

                      <Button className="w-full">
                        <Play className="h-4 w-4 mr-2" />
                        Start Lesson
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Pronunciation Tab */}
        <TabsContent value="pronunciation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pronunciation Practice</CardTitle>
              <CardDescription>
                Practice speaking and listening to improve your pronunciation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Volume2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Pronunciation Tools</h3>
                <p className="text-muted-foreground">
                  Interactive pronunciation practice coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
};