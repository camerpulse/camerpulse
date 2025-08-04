/**
 * CivicPostComposer Component
 * 
 * Advanced post composer with civic intelligence and real-time assistance
 */

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { UserAvatar, CivicTag } from './index';
import { 
  Camera, 
  Video, 
  Vote, 
  Paperclip, 
  Brain, 
  MapPin, 
  Globe, 
  Users, 
  Lock,
  Hash,
  Smile,
  X,
  Send,
  Save,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Zap,
  Eye,
  Settings,
  Plus,
  Mic
} from 'lucide-react';
import type { CivicUser } from './types';

interface MediaAttachment {
  id: string;
  type: 'image' | 'video' | 'file';
  url: string;
  name: string;
  size: number;
}

interface CivicSuggestion {
  type: 'hashtag' | 'ministry' | 'poll' | 'tone';
  content: string;
  confidence: number;
  description?: string;
}

interface PostDraft {
  id: string;
  content: string;
  attachments: MediaAttachment[];
  visibility: string;
  location?: string;
  createdAt: string;
}

interface CivicPostComposerProps {
  user: CivicUser;
  onPost: (data: {
    content: string;
    attachments: MediaAttachment[];
    visibility: string;
    location?: string;
    postType: string;
    hashtags: string[];
  }) => Promise<void>;
  expanded?: boolean;
  onToggleExpanded?: () => void;
  maxLength?: number;
  enabledFeatures?: {
    attachments: boolean;
    polls: boolean;
    tagging: boolean;
    emoji: boolean;
    toneAI: boolean;
    civicAssist: boolean;
    voiceToText: boolean;
  };
  className?: string;
}

const defaultFeatures = {
  attachments: true,
  polls: true,
  tagging: true,
  emoji: true,
  toneAI: true,
  civicAssist: true,
  voiceToText: true
};

export const CivicPostComposer: React.FC<CivicPostComposerProps> = ({
  user,
  onPost,
  expanded = false,
  onToggleExpanded,
  maxLength = 280,
  enabledFeatures = defaultFeatures,
  className = ''
}) => {
  const { toast } = useToast();
  
  // Content state
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);
  const [visibility, setVisibility] = useState('public');
  const [location, setLocation] = useState<string>('');
  const [postType, setPostType] = useState('general');
  
  // UI state
  const [isPosting, setIsPosting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [civicAssistEnabled, setCivicAssistEnabled] = useState(true);
  const [toneCheckEnabled, setToneCheckEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  
  // AI suggestions
  const [civicSuggestions, setCivicSuggestions] = useState<CivicSuggestion[]>([]);
  const [toneAnalysis, setToneAnalysis] = useState<{
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    flags: string[];
  } | null>(null);
  
  // Drafts
  const [drafts, setDrafts] = useState<PostDraft[]>([]);
  const [autosaveEnabled, setAutosaveEnabled] = useState(true);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // Auto-save draft
  useEffect(() => {
    if (autosaveEnabled && content.trim() && expanded) {
      const timer = setTimeout(() => {
        saveDraft();
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [content, attachments, visibility, location, autosaveEnabled, expanded]);

  // Civic AI analysis
  useEffect(() => {
    if (civicAssistEnabled && content.length > 20) {
      const timer = setTimeout(() => {
        analyzeCivicContent();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [content, civicAssistEnabled]);

  // Tone analysis
  useEffect(() => {
    if (toneCheckEnabled && content.length > 10) {
      const timer = setTimeout(() => {
        analyzeTone();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [content, toneCheckEnabled]);

  const analyzeCivicContent = async () => {
    // Mock civic AI analysis
    const suggestions: CivicSuggestion[] = [];
    
    // Extract potential hashtags
    const words = content.toLowerCase().split(' ');
    const civicKeywords = ['education', 'health', 'infrastructure', 'corruption', 'economy', 'security'];
    
    civicKeywords.forEach(keyword => {
      if (words.some(word => word.includes(keyword))) {
        suggestions.push({
          type: 'hashtag',
          content: `#${keyword.charAt(0).toUpperCase() + keyword.slice(1)}`,
          confidence: 0.8,
          description: `Popular civic topic`
        });
      }
    });

    // Suggest relevant ministries
    if (content.toLowerCase().includes('school') || content.toLowerCase().includes('education')) {
      suggestions.push({
        type: 'ministry',
        content: '@MinistryOfEducation',
        confidence: 0.9,
        description: 'Ministry of Basic Education'
      });
    }

    setCivicSuggestions(suggestions);
  };

  const analyzeTone = async () => {
    // Mock tone analysis
    const angryWords = ['angry', 'frustrated', 'terrible', 'awful', 'hate'];
    const positiveWords = ['great', 'excellent', 'good', 'amazing', 'wonderful'];
    
    const words = content.toLowerCase().split(' ');
    const hasAngryWords = words.some(word => angryWords.some(angry => word.includes(angry)));
    const hasPositiveWords = words.some(word => positiveWords.some(positive => word.includes(positive)));
    
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    let flags: string[] = [];
    
    if (hasAngryWords) {
      sentiment = 'negative';
      flags.push('Strong language detected');
    } else if (hasPositiveWords) {
      sentiment = 'positive';
    }

    setToneAnalysis({
      sentiment,
      confidence: 0.75,
      flags
    });
  };

  const saveDraft = () => {
    if (!content.trim()) return;
    
    const draft: PostDraft = {
      id: Date.now().toString(),
      content,
      attachments,
      visibility,
      location,
      createdAt: new Date().toISOString()
    };
    
    setDrafts(prev => [draft, ...prev.slice(0, 4)]); // Keep only 5 drafts
    toast({
      title: "Draft saved",
      description: "Your post has been saved automatically."
    });
  };

  const loadDraft = (draft: PostDraft) => {
    setContent(draft.content);
    setAttachments(draft.attachments);
    setVisibility(draft.visibility);
    setLocation(draft.location || '');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      const attachment: MediaAttachment = {
        id: Date.now().toString() + Math.random(),
        type: file.type.startsWith('image/') ? 'image' : 
              file.type.startsWith('video/') ? 'video' : 'file',
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size
      };
      
      setAttachments(prev => [...prev, attachment]);
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === id);
      if (attachment) {
        URL.revokeObjectURL(attachment.url);
      }
      return prev.filter(a => a.id !== id);
    });
  };

  const handlePost = async () => {
    if (!content.trim()) return;

    setIsPosting(true);
    try {
      const hashtags = content.match(/#[a-zA-Z0-9_]+/g)?.map(tag => tag.slice(1)) || [];
      
      await onPost({
        content,
        attachments,
        visibility,
        location,
        postType,
        hashtags
      });

      // Reset form
      setContent('');
      setAttachments([]);
      setVisibility('public');
      setLocation('');
      setPostType('general');
      setCivicSuggestions([]);
      setToneAnalysis(null);
      
      if (onToggleExpanded) onToggleExpanded();

      // Show civic impact
      toast({
        title: "🎯 Pulse shared!",
        description: `Your civic voice helps inform 200+ users in your region.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share your pulse. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPosting(false);
    }
  };

  const applySuggestion = (suggestion: CivicSuggestion) => {
    if (suggestion.type === 'hashtag' || suggestion.type === 'ministry') {
      setContent(prev => `${prev} ${suggestion.content}`);
    }
  };

  const getCharacterColor = () => {
    const percentage = (content.length / maxLength) * 100;
    if (percentage > 90) return 'text-destructive';
    if (percentage > 75) return 'text-cm-yellow';
    return 'text-muted-foreground';
  };

  const getToneColor = () => {
    if (!toneAnalysis) return 'text-muted-foreground';
    switch (toneAnalysis.sentiment) {
      case 'positive': return 'text-cm-green';
      case 'negative': return 'text-cm-red';
      default: return 'text-muted-foreground';
    }
  };

  if (!expanded) {
    return (
      <Card className={`border-cm-red/20 hover:border-cm-red/40 transition-all cursor-pointer ${className}`}>
        <CardContent className="p-4" onClick={onToggleExpanded}>
          <div className="flex items-center gap-3">
            <UserAvatar user={user} size="default" showDiaspora={true} />
            <div className="flex-1 p-4 bg-muted/30 rounded-xl border border-dashed border-cm-red/30 hover:bg-muted/50 transition-colors">
              <span className="text-muted-foreground">What's on your civic mind?</span>
            </div>
            <Button size="sm" className="bg-cm-red hover:bg-cm-red/90 text-white rounded-xl">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-cm-red/20 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserAvatar user={user} size="default" showDiaspora={true} />
            <div>
              <p className="font-medium text-foreground">{user.name}</p>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
            {user.isDiaspora && (
              <Badge variant="outline" className="border-cm-yellow text-cm-yellow">
                🌍 Diaspora
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setShowAdvanced(!showAdvanced)}>
              <Settings className="w-4 h-4" />
            </Button>
            {onToggleExpanded && (
              <Button variant="ghost" size="icon" onClick={onToggleExpanded}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="p-3 bg-muted/30 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Civic AI Assist</span>
              <Switch checked={civicAssistEnabled} onCheckedChange={setCivicAssistEnabled} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tone Check</span>
              <Switch checked={toneCheckEnabled} onCheckedChange={setToneCheckEnabled} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Auto-save Drafts</span>
              <Switch checked={autosaveEnabled} onCheckedChange={setAutosaveEnabled} />
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="space-y-3">
          <Textarea
            ref={textareaRef}
            placeholder="What's happening in Cameroon? Share your civic thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] max-h-[300px] resize-none border-cm-red/20 focus:border-cm-red bg-background text-base"
            maxLength={maxLength}
          />
          
          {/* Character count and tone indicator */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className={`text-xs ${getCharacterColor()}`}>
                {content.length}/{maxLength}
              </span>
              {toneAnalysis && (
                <div className={`flex items-center gap-1 text-xs ${getToneColor()}`}>
                  <Brain className="w-3 h-3" />
                  <span className="capitalize">{toneAnalysis.sentiment}</span>
                  {toneAnalysis.flags.length > 0 && (
                    <AlertTriangle className="w-3 h-3 text-cm-yellow" />
                  )}
                </div>
              )}
            </div>
            
            <Progress value={(content.length / maxLength) * 100} className="w-16 h-1" />
          </div>
        </div>

        {/* Civic AI Suggestions */}
        {civicSuggestions.length > 0 && civicAssistEnabled && (
          <div className="p-3 bg-cm-green/5 border border-cm-green/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-cm-green" />
              <span className="text-sm font-medium text-cm-green">Civic AI Suggestions</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {civicSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => applySuggestion(suggestion)}
                  className="text-xs border-cm-green/30 hover:bg-cm-green/10"
                >
                  {suggestion.content}
                  <span className="ml-1 text-xs text-muted-foreground">
                    {Math.round(suggestion.confidence * 100)}%
                  </span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Tone warnings */}
        {toneAnalysis?.flags.length > 0 && toneCheckEnabled && (
          <div className="p-3 bg-cm-yellow/5 border border-cm-yellow/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-cm-yellow" />
              <span className="text-sm font-medium text-cm-yellow">Tone Check</span>
            </div>
            {toneAnalysis.flags.map((flag, index) => (
              <p key={index} className="text-xs text-muted-foreground">{flag}</p>
            ))}
          </div>
        )}

        {/* Media Attachments */}
        {attachments.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="relative border rounded-lg overflow-hidden">
                {attachment.type === 'image' && (
                  <img src={attachment.url} alt="" className="w-full h-24 object-cover" />
                )}
                {attachment.type === 'video' && (
                  <video src={attachment.url} className="w-full h-24 object-cover" />
                )}
                {attachment.type === 'file' && (
                  <div className="p-3 bg-muted/50 h-24 flex items-center">
                    <Paperclip className="w-4 h-4 mr-2" />
                    <span className="text-xs truncate">{attachment.name}</span>
                  </div>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6"
                  onClick={() => removeAttachment(attachment.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Post Settings */}
        <div className="flex flex-wrap gap-3">
          <Select value={visibility} onValueChange={setVisibility}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">
                <div className="flex items-center gap-2">
                  <Globe className="w-3 h-3" />
                  Public
                </div>
              </SelectItem>
              <SelectItem value="region">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  Region
                </div>
              </SelectItem>
              <SelectItem value="followers">
                <div className="flex items-center gap-2">
                  <Users className="w-3 h-3" />
                  Followers
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={postType} onValueChange={setPostType}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="civic_opinion">Civic Opinion</SelectItem>
              <SelectItem value="alert">Alert</SelectItem>
              <SelectItem value="petition">Petition</SelectItem>
              <SelectItem value="campaign">Campaign</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            
            {enabledFeatures.attachments && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-muted-foreground hover:text-cm-green"
                >
                  <Camera className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-cm-green"
                >
                  <Video className="w-4 h-4" />
                </Button>
              </>
            )}
            
            {enabledFeatures.polls && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-cm-yellow"
              >
                <Vote className="w-4 h-4" />
              </Button>
            )}
            
            {enabledFeatures.voiceToText && (
              <Button
                variant="ghost"
                size="sm"
                className={`text-muted-foreground hover:text-cm-red ${isRecording ? 'animate-pulse text-cm-red' : ''}`}
                onClick={() => setIsRecording(!isRecording)}
              >
                <Mic className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={saveDraft}
              disabled={!content.trim()}
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
            
            <Button
              size="sm"
              onClick={handlePost}
              disabled={!content.trim() || isPosting || content.length > maxLength}
              className="bg-cm-green hover:bg-cm-green/90 text-white rounded-xl"
            >
              {isPosting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sharing...
                </div>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1" />
                  Share Pulse
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Draft Management */}
        {drafts.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <details className="group">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                {drafts.length} saved drafts
              </summary>
              <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                {drafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="p-2 bg-muted/30 rounded text-xs cursor-pointer hover:bg-muted/50"
                    onClick={() => loadDraft(draft)}
                  >
                    <p className="truncate">{draft.content}</p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(draft.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
};