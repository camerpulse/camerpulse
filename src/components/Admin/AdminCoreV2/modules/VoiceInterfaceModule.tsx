import React, { useState } from 'react';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { StatCard } from '../components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Mic, Volume2, MessageSquare, Settings, 
  PlayCircle, Square, Users, Languages, Headphones
} from 'lucide-react';

interface VoiceInterfaceModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const VoiceInterfaceModule: React.FC<VoiceInterfaceModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [activeTab, setActiveTab] = useState('conversations');
  const [isRecording, setIsRecording] = useState(false);

  const voiceConversations = [
    {
      id: 1,
      user: 'John Mbaku',
      startTime: '2024-01-15 14:30',
      duration: '3m 45s',
      status: 'completed',
      language: 'English',
      topic: 'Political Discussion',
      sentiment: 'positive',
      transcriptLength: 847,
      voiceModel: 'Advanced-EN-v2'
    },
    {
      id: 2,
      user: 'Marie Ngozi',
      startTime: '2024-01-15 14:15',
      duration: '2m 12s',
      status: 'completed',
      language: 'French',
      topic: 'Community Events',
      sentiment: 'neutral',
      transcriptLength: 456,
      voiceModel: 'Advanced-FR-v1'
    },
    {
      id: 3,
      user: 'Paul Biya Jr.',
      startTime: '2024-01-15 13:45',
      duration: '5m 30s',
      status: 'active',
      language: 'English',
      topic: 'Economic Policy',
      sentiment: 'engaged',
      transcriptLength: 1250,
      voiceModel: 'Advanced-EN-v2'
    }
  ];

  const voiceCommands = [
    {
      id: 1,
      command: 'Show me latest political news',
      frequency: 1250,
      successRate: 96.8,
      avgResponseTime: '1.2s',
      category: 'News',
      lastUsed: '2024-01-15 14:45'
    },
    {
      id: 2,
      command: 'Create new civic report',
      frequency: 890,
      successRate: 94.2,
      avgResponseTime: '2.1s',
      category: 'Content',
      lastUsed: '2024-01-15 14:30'
    },
    {
      id: 3,
      command: 'Schedule meeting with officials',
      frequency: 567,
      successRate: 92.5,
      avgResponseTime: '1.8s',
      category: 'Scheduling',
      lastUsed: '2024-01-15 13:20'
    },
    {
      id: 4,
      command: 'Analyze regional sentiment',
      frequency: 423,
      successRate: 89.7,
      avgResponseTime: '3.4s',
      category: 'Analytics',
      lastUsed: '2024-01-15 12:50'
    }
  ];

  const speechToTextStats = [
    {
      id: 1,
      language: 'English',
      accuracy: 97.2,
      processed24h: 12450,
      avgLatency: '450ms',
      errorRate: 0.8,
      modelVersion: 'Whisper-Large-v3'
    },
    {
      id: 2,
      language: 'French',
      accuracy: 95.8,
      processed24h: 8970,
      avgLatency: '520ms',
      errorRate: 1.2,
      modelVersion: 'Whisper-Large-v3'
    },
    {
      id: 3,
      language: 'Fulfulde',
      accuracy: 89.4,
      processed24h: 2340,
      avgLatency: '680ms',
      errorRate: 3.1,
      modelVersion: 'Custom-v1.2'
    },
    {
      id: 4,
      language: 'Ewondo',
      accuracy: 87.6,
      processed24h: 1890,
      avgLatency: '720ms',
      errorRate: 3.8,
      modelVersion: 'Custom-v1.1'
    }
  ];

  const voiceSettings = [
    {
      id: 1,
      setting: 'Default Voice Model',
      value: 'OpenAI Alloy',
      description: 'Primary voice for AI responses',
      category: 'Text-to-Speech'
    },
    {
      id: 2,
      setting: 'Speech Recognition Engine',
      value: 'Whisper Large v3',
      description: 'STT model for processing voice input',
      category: 'Speech-to-Text'
    },
    {
      id: 3,
      setting: 'Voice Command Timeout',
      value: '5 seconds',
      description: 'Maximum wait time for voice commands',
      category: 'Commands'
    },
    {
      id: 4,
      setting: 'Language Auto-Detection',
      value: 'Enabled',
      description: 'Automatically detect spoken language',
      category: 'Language'
    },
    {
      id: 5,
      setting: 'Background Noise Filtering',
      value: 'Advanced',
      description: 'Noise reduction for better accuracy',
      category: 'Audio Processing'
    }
  ];

  const handleStartRecording = () => {
    setIsRecording(true);
    logActivity('voice_recording_start', { timestamp: new Date() });
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    logActivity('voice_recording_stop', { timestamp: new Date() });
  };

  const handleTestVoiceCommand = (commandId: number) => {
    logActivity('voice_command_test', { command_id: commandId });
  };

  const handleUpdateSetting = (settingId: number) => {
    logActivity('voice_setting_update', { setting_id: settingId });
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-100';
      case 'neutral':
        return 'text-gray-600 bg-gray-100';
      case 'engaged':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 95) return 'text-green-600';
    if (accuracy >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Voice Interface Management"
        description="Manage voice conversations, speech recognition, and voice commands"
        icon={Mic}
        iconColor="text-purple-600"
        onRefresh={() => {
          logActivity('voice_interface_refresh', { timestamp: new Date() });
        }}
      />

      {/* Voice Interface Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Conversations"
          value="127"
          icon={MessageSquare}
          trend={{ value: 12.3, isPositive: true, period: "vs yesterday" }}
          description="Voice interactions today"
        />
        <StatCard
          title="Speech Accuracy"
          value="96.4%"
          icon={Mic}
          description="STT recognition rate"
          badge={{ text: "Excellent", variant: "default" }}
        />
        <StatCard
          title="Voice Commands"
          value="3,240"
          icon={Volume2}
          trend={{ value: 18.7, isPositive: true, period: "24h" }}
          description="Commands processed"
        />
        <StatCard
          title="Languages Supported"
          value="8"
          icon={Languages}
          description="Active voice models"
          badge={{ text: "Multilingual", variant: "secondary" }}
        />
      </div>

      {/* Voice Interface Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="commands">Voice Commands</TabsTrigger>
          <TabsTrigger value="recognition">Speech Recognition</TabsTrigger>
          <TabsTrigger value="settings">Voice Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="conversations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Headphones className="h-5 w-5" />
                  Live Voice Test
                </CardTitle>
                <CardDescription>
                  Test voice recognition and response system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    variant={isRecording ? "destructive" : "default"}
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    className="h-20 w-20 rounded-full"
                  >
                    {isRecording ? (
                      <Square className="h-8 w-8" />
                    ) : (
                      <Mic className="h-8 w-8" />
                    )}
                  </Button>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    {isRecording ? 'Recording... Click to stop' : 'Click to start voice test'}
                  </p>
                  {isRecording && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full animate-pulse w-3/4"></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Voice Input Preview</h4>
                  <p className="text-sm text-muted-foreground">
                    {isRecording ? 
                      'Listening for voice input...' : 
                      'Start recording to see live transcription here'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Voice Conversations</CardTitle>
                <CardDescription>
                  Latest voice interactions and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {voiceConversations.slice(0, 3).map((conversation) => (
                    <div key={conversation.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{conversation.user}</h4>
                        <Badge className={getSentimentColor(conversation.sentiment)}>
                          {conversation.sentiment}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <span>Duration: {conversation.duration}</span>
                        <span>Language: {conversation.language}</span>
                        <span>Topic: {conversation.topic}</span>
                        <span>Words: {conversation.transcriptLength}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                All Voice Conversations
              </CardTitle>
              <CardDescription>
                Complete history of voice interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {voiceConversations.map((conversation) => (
                  <div key={conversation.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                          conversation.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <MessageSquare className={`h-6 w-6 ${
                            conversation.status === 'active' ? 'text-green-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-semibold">{conversation.user}</h4>
                          <p className="text-sm text-muted-foreground">
                            {conversation.topic} • {conversation.duration}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getSentimentColor(conversation.sentiment)}>
                          {conversation.sentiment}
                        </Badge>
                        <Badge variant="outline">{conversation.language}</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Started:</span>
                        <p className="font-medium">{conversation.startTime}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Words:</span>
                        <p className="font-medium">{conversation.transcriptLength}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Model:</span>
                        <p className="font-medium">{conversation.voiceModel}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <p className="font-medium capitalize">{conversation.status}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commands" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Voice Commands Analytics
              </CardTitle>
              <CardDescription>
                Most used voice commands and their performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {voiceCommands.map((command) => (
                  <div key={command.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">"{command.command}"</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{command.category}</Badge>
                          <span className="text-sm text-muted-foreground">
                            Used {command.frequency} times
                          </span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleTestVoiceCommand(command.id)}
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Test
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Success Rate:</span>
                        <p className="font-medium text-green-600">{command.successRate}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg Response:</span>
                        <p className="font-medium">{command.avgResponseTime}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Used:</span>
                        <p className="font-medium">{command.lastUsed}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recognition" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                Speech Recognition Performance
              </CardTitle>
              <CardDescription>
                Accuracy and performance metrics by language
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {speechToTextStats.map((stat) => (
                  <div key={stat.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Languages className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{stat.language}</h4>
                          <p className="text-sm text-muted-foreground">
                            Model: {stat.modelVersion}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getAccuracyColor(stat.accuracy)}`}>
                          {stat.accuracy}%
                        </div>
                        <p className="text-sm text-muted-foreground">accuracy</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Processed (24h):</span>
                        <p className="font-medium">{stat.processed24h.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Latency:</span>
                        <p className="font-medium">{stat.avgLatency}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Error Rate:</span>
                        <p className="font-medium">{stat.errorRate}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Model:</span>
                        <p className="font-medium">{stat.modelVersion}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Voice Interface Configuration
              </CardTitle>
              <CardDescription>
                Configure voice recognition and response settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {voiceSettings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{setting.setting}</h4>
                      <p className="text-sm text-muted-foreground mb-1">
                        {setting.description}
                      </p>
                      <Badge variant="outline">{setting.category}</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-medium">{setting.value}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleUpdateSetting(setting.id)}
                      >
                        Configure
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};