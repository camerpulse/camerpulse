import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  Mic,
  MicOff,
  Speaker,
  Headphones,
  Settings,
  Download,
  Upload,
  Languages
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VoiceConfig {
  language: 'en' | 'fr' | 'pidgin';
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
  tone: 'neutral' | 'calm' | 'urgent';
}

interface CachedReport {
  id: string;
  title: string;
  content: string;
  audioBlob?: Blob;
  timestamp: Date;
  type: 'daily' | 'alert' | 'summary';
}

export const CivicVoiceAgent = () => {
  const { toast } = useToast();
  
  // Voice synthesis state
  const [isSupported, setIsSupported] = useState(false);
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>({
    language: 'en',
    voice: '',
    rate: 1,
    pitch: 1,
    volume: 0.8,
    tone: 'neutral'
  });
  
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentReport, setCurrentReport] = useState<CachedReport | null>(null);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  
  // Voice recognition state
  const [isListening, setIsListening] = useState(false);
  const [voiceQuery, setVoiceQuery] = useState('');
  
  // Cached reports
  const [cachedReports, setCachedReports] = useState<CachedReport[]>([]);
  
  // Available voices
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  // Refs
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize voice capabilities
  useEffect(() => {
    const checkVoiceSupport = () => {
      const speechSupported = 'speechSynthesis' in window;
      const recognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      
      setIsSupported(speechSupported);
      
      if (speechSupported) {
        const loadVoices = () => {
          const voices = speechSynthesis.getVoices();
          setAvailableVoices(voices);
          
          // Set default voice
          const englishVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
          if (englishVoice && !voiceConfig.voice) {
            setVoiceConfig(prev => ({ ...prev, voice: englishVoice.name }));
          }
        };
        
        loadVoices();
        speechSynthesis.addEventListener('voiceschanged', loadVoices);
        
        return () => speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      }
    };

    checkVoiceSupport();
  }, []);

  // Initialize voice recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceQuery(transcript);
        handleVoiceQuery(transcript);
      };
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: "Could not process voice command",
          variant: "destructive"
        });
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Load cached reports on mount
  useEffect(() => {
    loadCachedReports();
  }, []);

  const loadCachedReports = async () => {
    try {
      // Load recent reports from database
      const { data: sentimentLogs } = await supabase
        .from('camerpulse_intelligence_sentiment_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      const { data: alerts } = await supabase
        .from('camerpulse_intelligence_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      const reports: CachedReport[] = [];
      
      // Add sentiment summary
      if (sentimentLogs && sentimentLogs.length > 0) {
        reports.push({
          id: 'daily-sentiment',
          title: 'Daily Sentiment Overview',
          content: `Today's civic sentiment analysis shows ${sentimentLogs.length} monitored conversations. Primary emotions detected include ${sentimentLogs.slice(0, 3).map(log => log.sentiment_polarity).join(', ')}. Regional monitoring remains active across all divisions.`,
          timestamp: new Date(),
          type: 'daily'
        });
      }
      
      // Add alerts
      alerts?.forEach((alert, idx) => {
        reports.push({
          id: `alert-${alert.id}`,
          title: `${alert.severity.toUpperCase()} Alert: ${alert.title}`,
          content: `${alert.description} Affected regions: ${alert.affected_regions?.join(', ') || 'Multiple areas'}. Recommended actions: ${alert.recommended_actions?.join('. ') || 'Monitor closely'}.`,
          timestamp: new Date(alert.created_at),
          type: 'alert'
        });
      });
      
      setCachedReports(reports);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const speakText = async (text: string, title?: string) => {
    if (!isSupported) {
      toast({
        title: "Voice Not Supported",
        description: "Text-to-speech is not supported in this browser",
        variant: "destructive"
      });
      return;
    }

    // Stop any current speech
    speechSynthesis.cancel();
    
    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice
    const selectedVoice = availableVoices.find(v => v.name === voiceConfig.voice);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = voiceConfig.rate;
    utterance.pitch = voiceConfig.pitch;
    utterance.volume = voiceConfig.volume;
    
    // Set up event handlers
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };
    
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentReport(null);
    };
    
    utterance.onpause = () => {
      setIsPaused(true);
    };
    
    utterance.onresume = () => {
      setIsPaused(false);
    };
    
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      toast({
        title: "Playback Error",
        description: "Could not play audio",
        variant: "destructive"
      });
    };
    
    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
    
    // Set current report if provided
    if (title) {
      const report = cachedReports.find(r => r.title === title);
      if (report) {
        setCurrentReport(report);
      }
    }
  };

  const pausePlayback = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
    }
  };

  const resumePlayback = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
    }
  };

  const stopPlayback = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentReport(null);
  };

  const startVoiceRecognition = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleVoiceQuery = async (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    try {
      if (lowerQuery.includes('national mood') || lowerQuery.includes('overall sentiment')) {
        const { data } = await supabase
          .from('camerpulse_intelligence_sentiment_logs')
          .select('sentiment_polarity, sentiment_score')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
        
        if (data && data.length > 0) {
          const avgSentiment = data.reduce((sum, log) => sum + (log.sentiment_score || 0), 0) / data.length;
          const response = `The national mood today shows an average sentiment score of ${avgSentiment.toFixed(2)}. We've monitored ${data.length} civic conversations in the past 24 hours.`;
          await speakText(response);
        } else {
          await speakText("No recent sentiment data available for analysis.");
        }
      } else if (lowerQuery.includes('danger') || lowerQuery.includes('alert')) {
        const { data } = await supabase
          .from('camerpulse_intelligence_alerts')
          .select('*')
          .eq('acknowledged', false)
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (data && data.length > 0) {
          const response = `There are ${data.length} active alerts. ${data[0].title}: ${data[0].description}`;
          await speakText(response);
        } else {
          await speakText("No active danger alerts at this time.");
        }
      } else if (lowerQuery.includes('trending') || lowerQuery.includes('topics')) {
        const { data } = await supabase
          .from('camerpulse_intelligence_trending_topics')
          .select('*')
          .order('volume_score', { ascending: false })
          .limit(3);
        
        if (data && data.length > 0) {
          const topics = data.map(t => t.topic_text).join(', ');
          const response = `Top trending civic topics include: ${topics}`;
          await speakText(response);
        } else {
          await speakText("No trending topics detected in recent analysis.");
        }
      } else {
        await speakText("I can help you with national mood, danger alerts, or trending topics. Please ask about one of these areas.");
      }
    } catch (error) {
      console.error('Error processing voice query:', error);
      await speakText("Sorry, I encountered an error processing your request.");
    }
  };

  const getVoicesByLanguage = (lang: string) => {
    return availableVoices.filter(voice => voice.lang.startsWith(lang));
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <VolumeX className="h-5 w-5" />
            <span>Voice Agent Unavailable</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Voice synthesis is not supported in this browser. Please use Chrome, Safari, or Edge for voice features.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Voice Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Voice Settings</span>
          </CardTitle>
          <CardDescription>Configure voice synthesis and recognition preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <Select 
                value={voiceConfig.language} 
                onValueChange={(value: 'en' | 'fr' | 'pidgin') => 
                  setVoiceConfig(prev => ({ ...prev, language: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="pidgin">Pidgin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Voice</label>
              <Select 
                value={voiceConfig.voice} 
                onValueChange={(value) => setVoiceConfig(prev => ({ ...prev, voice: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getVoicesByLanguage('en').map((voice) => (
                    <SelectItem key={voice.name} value={voice.name}>
                      {voice.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Speed: {voiceConfig.rate.toFixed(1)}x</label>
              <Slider
                value={[voiceConfig.rate]}
                onValueChange={([value]) => setVoiceConfig(prev => ({ ...prev, rate: value }))}
                min={0.5}
                max={2}
                step={0.1}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Volume: {Math.round(voiceConfig.volume * 100)}%</label>
              <Slider
                value={[voiceConfig.volume]}
                onValueChange={([value]) => setVoiceConfig(prev => ({ ...prev, volume: value }))}
                min={0}
                max={1}
                step={0.1}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice Commands */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mic className="h-5 w-5" />
            <span>Voice Commands</span>
          </CardTitle>
          <CardDescription>Ask questions about civic data using your voice</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button
              onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
              variant={isListening ? "destructive" : "default"}
              className="flex items-center space-x-2"
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              <span>{isListening ? 'Stop Listening' : 'Start Voice Command'}</span>
            </Button>
            
            {isListening && (
              <Badge variant="outline" className="animate-pulse">
                Listening...
              </Badge>
            )}
          </div>
          
          {voiceQuery && (
            <Alert>
              <AlertDescription>
                <strong>Last Command:</strong> "{voiceQuery}"
              </AlertDescription>
            </Alert>
          )}
          
          <div className="text-sm text-muted-foreground">
            <p><strong>Try asking:</strong></p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>"What's the national mood today?"</li>
              <li>"Which region has the highest civic danger?"</li>
              <li>"What's trending in civic conversations?"</li>
              <li>"Are there any active alerts?"</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Playback Controls */}
      {currentReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Speaker className="h-5 w-5" />
              <span>Now Playing</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium">{currentReport.title}</h4>
              <p className="text-sm text-muted-foreground">
                {currentReport.type.charAt(0).toUpperCase() + currentReport.type.slice(1)} Report
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              {!isPlaying && !isPaused && (
                <Button onClick={() => speakText(currentReport.content, currentReport.title)} size="sm">
                  <Play className="h-4 w-4" />
                </Button>
              )}
              
              {isPlaying && !isPaused && (
                <Button onClick={pausePlayback} size="sm">
                  <Pause className="h-4 w-4" />
                </Button>
              )}
              
              {isPaused && (
                <Button onClick={resumePlayback} size="sm">
                  <Play className="h-4 w-4" />
                </Button>
              )}
              
              <Button onClick={stopPlayback} size="sm" variant="outline">
                <Square className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cached Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Headphones className="h-5 w-5" />
            <span>Available Reports</span>
          </CardTitle>
          <CardDescription>Listen to recent civic intelligence reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cachedReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{report.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {report.type.charAt(0).toUpperCase() + report.type.slice(1)} • {report.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant={report.type === 'alert' ? 'destructive' : 'secondary'}>
                    {report.type}
                  </Badge>
                  
                  <Button
                    onClick={() => speakText(report.content, report.title)}
                    size="sm"
                    variant="outline"
                    disabled={isPlaying && currentReport?.id === report.id}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {cachedReports.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No reports available. Refresh to load recent civic intelligence data.
              </p>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <Button onClick={loadCachedReports} variant="outline" className="w-full">
              <RotateCcw className="h-4 w-4 mr-2" />
              Refresh Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};