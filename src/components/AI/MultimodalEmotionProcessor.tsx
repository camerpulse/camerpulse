import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Upload, 
  Image, 
  Mic, 
  Video, 
  FileText, 
  Play, 
  Pause, 
  Eye, 
  Volume2,
  Camera,
  Smile,
  Frown,
  Angry,
  Meh,
  Heart,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmotionAnalysisResult {
  media_type: 'text' | 'image' | 'audio' | 'video' | 'multimodal';
  primary_emotion: string;
  confidence_score: number;
  detailed_analysis: any;
  processing_time_ms: number;
}

interface MultimodalContent {
  text?: string;
  image_file?: File;
  audio_file?: File;
  video_file?: File;
  image_url?: string;
}

export const MultimodalEmotionProcessor = () => {
  const { toast } = useToast();
  const [content, setContent] = useState<MultimodalContent>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<EmotionAnalysisResult[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('text');
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const processMultimodalContent = async () => {
    if (!content.text && !content.image_file && !content.audio_file && !content.video_file && !content.image_url) {
      toast({
        title: "No Content",
        description: "Please provide at least one type of content to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      
      // Add text content
      if (content.text) {
        formData.append('text', content.text);
      }
      
      // Add image
      if (content.image_file) {
        formData.append('image', content.image_file);
        setUploadProgress(25);
      } else if (content.image_url) {
        formData.append('image_url', content.image_url);
        setUploadProgress(25);
      }
      
      // Add audio
      if (content.audio_file) {
        formData.append('audio', content.audio_file);
        setUploadProgress(50);
      }
      
      // Add video
      if (content.video_file) {
        formData.append('video', content.video_file);
        setUploadProgress(75);
      }

      setUploadProgress(90);

      const { data, error } = await supabase.functions.invoke('multimodal-emotion-processor', {
        body: formData
      });

      if (error) throw error;

      setResults(data.results || []);
      setUploadProgress(100);
      
      toast({
        title: "Analysis Complete",
        description: `Processed ${data.results?.length || 0} content type(s) successfully`,
      });

    } catch (error: any) {
      console.error('Multimodal processing error:', error);
      toast({
        title: "Processing Failed",
        description: error.message || "Failed to process multimodal content",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const getEmotionIcon = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'joy': case 'happiness': case 'positive': return <Smile className="h-5 w-5 text-green-500" />;
      case 'anger': case 'rage': return <Angry className="h-5 w-5 text-red-500" />;
      case 'sadness': case 'grief': case 'negative': return <Frown className="h-5 w-5 text-blue-500" />;
      case 'fear': case 'anxiety': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'love': case 'affection': return <Heart className="h-5 w-5 text-pink-500" />;
      default: return <Meh className="h-5 w-5 text-gray-500" />;
    }
  };

  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'audio': return <Volume2 className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'multimodal': return <Brain className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const clearContent = () => {
    setContent({});
    setResults([]);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (audioInputRef.current) audioInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-primary" />
            <span>Multimodal Emotion Processor</span>
          </CardTitle>
          <CardDescription>
            Analyze emotional content across text, images, audio, and video for comprehensive civic sentiment monitoring
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Input Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Content Input</CardTitle>
          <CardDescription>
            Upload or input content for emotional analysis across multiple modalities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="text" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Text</span>
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center space-x-2">
                <Image className="h-4 w-4" />
                <span>Image</span>
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex items-center space-x-2">
                <Volume2 className="h-4 w-4" />
                <span>Audio</span>
              </TabsTrigger>
              <TabsTrigger value="video" className="flex items-center space-x-2">
                <Video className="h-4 w-4" />
                <span>Video</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <div>
                <label className="text-sm font-medium">Text Content</label>
                <Textarea
                  placeholder="Enter text content to analyze for emotional tone (English, French, or Pidgin)..."
                  value={content.text || ''}
                  onChange={(e) => setContent(prev => ({ ...prev, text: e.target.value }))}
                  className="mt-2 min-h-[120px]"
                />
              </div>
            </TabsContent>

            <TabsContent value="image" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Upload Image</label>
                  <Input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setContent(prev => ({ ...prev, image_file: file }));
                      }
                    }}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Analyze facial expressions, protest scenes, crowd emotions, and visual mood
                  </p>
                </div>
                
                <div className="text-sm text-center text-muted-foreground">OR</div>
                
                <div>
                  <label className="text-sm font-medium">Image URL</label>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={content.image_url || ''}
                    onChange={(e) => setContent(prev => ({ ...prev, image_url: e.target.value }))}
                    className="mt-2"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="audio" className="space-y-4">
              <div>
                <label className="text-sm font-medium">Upload Audio</label>
                <Input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setContent(prev => ({ ...prev, audio_file: file }));
                    }
                  }}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Analyze voice tone, chants, speeches, and emotional audio content (supports English, French, Pidgin)
                </p>
              </div>
            </TabsContent>

            <TabsContent value="video" className="space-y-4">
              <div>
                <label className="text-sm font-medium">Upload Video</label>
                <Input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setContent(prev => ({ ...prev, video_file: file }));
                    }
                  }}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Combined analysis of visual emotions, audio tone, and movement patterns
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-6">
            <Button variant="outline" onClick={clearContent}>
              Clear All
            </Button>
            <Button 
              onClick={processMultimodalContent} 
              disabled={isProcessing}
              className="min-w-[120px]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Analyze Emotion
                </>
              )}
            </Button>
          </div>

          {/* Progress Bar */}
          {isProcessing && (
            <div className="mt-4">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-muted-foreground mt-1 text-center">
                Processing multimodal content...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Analysis Results</span>
            </CardTitle>
            <CardDescription>
              Emotional analysis results across all provided content types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getMediaTypeIcon(result.media_type)}
                      <span className="font-medium capitalize">{result.media_type} Analysis</span>
                      <Badge variant="outline" className="flex items-center space-x-1">
                        {getEmotionIcon(result.primary_emotion)}
                        <span>{result.primary_emotion}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        {Math.round(result.confidence_score * 100)}% confidence
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {result.processing_time_ms}ms
                      </Badge>
                    </div>
                  </div>

                  {/* Detailed Analysis */}
                  {result.detailed_analysis && (
                    <div className="bg-muted/50 rounded-md p-3">
                      <h4 className="font-medium text-sm mb-2">Detailed Analysis</h4>
                      <div className="space-y-2">
                        {/* Facial Emotions */}
                        {result.detailed_analysis.facial_emotions && (
                          <div className="text-sm">
                            <strong>Facial Emotions:</strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Object.entries(result.detailed_analysis.facial_emotions).map(([emotion, score]: [string, any]) => (
                                <Badge key={emotion} variant="outline" className="text-xs">
                                  {emotion}: {Math.round(score * 100)}%
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Audio Analysis */}
                        {result.detailed_analysis.audio_analysis && (
                          <div className="text-sm">
                            <strong>Audio Analysis:</strong>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              {result.detailed_analysis.audio_analysis.tone && (
                                <span className="text-xs">Tone: {result.detailed_analysis.audio_analysis.tone}</span>
                              )}
                              {result.detailed_analysis.audio_analysis.language && (
                                <span className="text-xs">Language: {result.detailed_analysis.audio_analysis.language}</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Text Sentiment */}
                        {result.detailed_analysis.text_sentiment && (
                          <div className="text-sm">
                            <strong>Text Sentiment:</strong>
                            <span className="ml-2">
                              {result.detailed_analysis.text_sentiment.polarity} 
                              ({Math.round((result.detailed_analysis.text_sentiment.score + 1) * 50)}%)
                            </span>
                          </div>
                        )}

                        {/* Regional Detection */}
                        {result.detailed_analysis.region_detected && (
                          <div className="text-sm">
                            <strong>Region Detected:</strong>
                            <span className="ml-2">{result.detailed_analysis.region_detected}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Multimodal Analysis Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium flex items-center space-x-2">
                <Image className="h-4 w-4" />
                <span>Image Analysis</span>
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Facial expression recognition</li>
                <li>• Crowd emotion detection</li>
                <li>• Protest scene analysis</li>
                <li>• Visual mood assessment</li>
                <li>• Contextual emotion understanding</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium flex items-center space-x-2">
                <Volume2 className="h-4 w-4" />
                <span>Audio Analysis</span>
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Voice tone detection</li>
                <li>• Multi-language support (EN/FR/Pidgin)</li>
                <li>• Chant and speech analysis</li>
                <li>• Emotional voice patterns</li>
                <li>• Regional dialect identification</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};