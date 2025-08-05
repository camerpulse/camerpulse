import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  Megaphone, 
  Users, 
  Globe, 
  BarChart3, 
  Download, 
  Play, 
  Calendar,
  MapPin,
  Languages,
  Volume2,
  Image,
  FileText,
  Video,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Target,
  Zap,
  Brain,
  Heart,
  Flag
} from 'lucide-react';

const CivicEducationCampaignManager = () => {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedTone, setSelectedTone] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const [isAutoLaunch, setIsAutoLaunch] = useState(false);

  const topics = [
    { id: 'elections', name: 'Elections & Voting', icon: '🗳️' },
    { id: 'rights', name: 'Citizen Rights', icon: '⚖️' },
    { id: 'duties', name: 'Civic Duties', icon: '🤝' },
    { id: 'corruption', name: 'Anti-Corruption', icon: '🛡️' },
    { id: 'youth', name: 'Youth Participation', icon: '🌟' },
    { id: 'unity', name: 'National Unity', icon: '🇨🇲' }
  ];

  const languages = [
    { id: 'english', name: 'English', flag: '🇬🇧' },
    { id: 'french', name: 'French', flag: '🇫🇷' },
    { id: 'pidgin', name: 'Pidgin English', flag: '🗣️' }
  ];

  const tones = [
    { id: 'youth', name: 'Youth-friendly', description: 'Modern, energetic, social media style' },
    { id: 'religious', name: 'Religious', description: 'Faith-based, respectful, traditional values' },
    { id: 'traditional', name: 'Traditional', description: 'Cultural, elder-focused, respectful' },
    { id: 'academic', name: 'Academic', description: 'Educational, fact-based, formal' }
  ];

  const formats = [
    { id: 'text', name: 'Text Post', icon: FileText },
    { id: 'video', name: 'Video Script', icon: Video },
    { id: 'radio', name: 'Radio Spot', icon: Volume2 },
    { id: 'poster', name: 'Poster Design', icon: Image }
  ];

  const regions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral',
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  const activeCampaigns = [
    {
      id: 1,
      title: 'Know Your Vote 2024',
      topic: 'Elections',
      regions: ['Northwest', 'Southwest'],
      language: 'English',
      status: 'active',
      views: 45620,
      shares: 1340,
      engagement: 78
    },
    {
      id: 2,
      title: 'Droits du Citoyen',
      topic: 'Rights',
      regions: ['Centre', 'Littoral'],
      language: 'French',
      status: 'scheduled',
      views: 23100,
      shares: 890,
      engagement: 65
    }
  ];

  const campaignMetrics = {
    totalCampaigns: 12,
    activeCampaigns: 5,
    totalReach: 125000,
    avgEngagement: 72,
    topPerformingRegion: 'Centre',
    topPerformingTopic: 'Elections'
  };

  const handleRegionToggle = (region: string) => {
    setSelectedRegions(prev => 
      prev.includes(region) 
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
          <Megaphone className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Civic Education Campaign Manager</h1>
          <p className="text-muted-foreground">Create, deploy, and track national civic awareness campaigns</p>
        </div>
      </div>

      <Tabs defaultValue="builder" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Campaign Builder
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Metrics Dashboard
          </TabsTrigger>
          <TabsTrigger value="regional" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Regional Deployment
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Smart Automation
          </TabsTrigger>
        </TabsList>

        {/* Campaign Builder */}
        <TabsContent value="builder" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Campaign Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Campaign Configuration
                </CardTitle>
                <CardDescription>
                  Set up your civic education campaign parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Campaign Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter campaign title..."
                    value={campaignTitle}
                    onChange={(e) => setCampaignTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Campaign Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your campaign objectives..."
                    value={campaignDescription}
                    onChange={(e) => setCampaignDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Campaign Topic</Label>
                  <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose topic..." />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id}>
                          <span className="flex items-center gap-2">
                            {topic.icon} {topic.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language..." />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.id} value={lang.id}>
                            <span className="flex items-center gap-2">
                              {lang.flag} {lang.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tone & Style</Label>
                    <Select value={selectedTone} onValueChange={setSelectedTone}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tone..." />
                      </SelectTrigger>
                      <SelectContent>
                        {tones.map((tone) => (
                          <SelectItem key={tone.id} value={tone.id}>
                            {tone.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Content Format</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {formats.map((format) => {
                      const IconComponent = format.icon;
                      return (
                        <Button
                          key={format.id}
                          variant={selectedFormat === format.id ? "default" : "outline"}
                          className="flex items-center gap-2"
                          onClick={() => setSelectedFormat(format.id)}
                        >
                          <IconComponent className="h-4 w-4" />
                          {format.name}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Region Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Regional Targeting
                </CardTitle>
                <CardDescription>
                  Select regions for campaign deployment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {regions.map((region) => (
                    <Button
                      key={region}
                      variant={selectedRegions.includes(region) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleRegionToggle(region)}
                      className="justify-start"
                    >
                      {region}
                    </Button>
                  ))}
                </div>

                <div className="space-y-3 mt-6">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-launch">Auto-launch on Events</Label>
                    <Switch
                      id="auto-launch"
                      checked={isAutoLaunch}
                      onCheckedChange={setIsAutoLaunch}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Automatically launch counter-campaigns when disinformation spikes are detected
                  </p>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button className="flex-1 flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Generate Campaign
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Metrics Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Campaigns</p>
                    <p className="text-2xl font-bold">{campaignMetrics.totalCampaigns}</p>
                  </div>
                  <Megaphone className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Now</p>
                    <p className="text-2xl font-bold text-green-600">{campaignMetrics.activeCampaigns}</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Reach</p>
                    <p className="text-2xl font-bold">{campaignMetrics.totalReach.toLocaleString()}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Engagement</p>
                    <p className="text-2xl font-bold">{campaignMetrics.avgEngagement}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Campaigns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Active Campaigns Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeCampaigns.map((campaign) => (
                  <div key={campaign.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{campaign.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{campaign.topic}</Badge>
                          <Badge variant="outline">{campaign.language}</Badge>
                          <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                            {campaign.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Engagement Rate</p>
                        <p className="text-xl font-bold">{campaign.engagement}%</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Views</p>
                        <p className="font-semibold">{campaign.views.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Shares</p>
                        <p className="font-semibold">{campaign.shares.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Regions</p>
                        <p className="font-semibold">{campaign.regions.join(', ')}</p>
                      </div>
                    </div>

                    <Progress value={campaign.engagement} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regional Deployment */}
        <TabsContent value="regional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Regional Campaign Analysis
              </CardTitle>
              <CardDescription>
                Cultural adaptation and regional performance insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Regional Adaptation Guidelines</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="font-medium text-blue-900">NW/SW Regions</p>
                      <p className="text-sm text-blue-700">
                        Emphasis on peace-building, unity, and democratic participation
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="font-medium text-green-900">Northern Regions</p>
                      <p className="text-sm text-green-700">
                        Religious emphasis, traditional authority respect, community values
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="font-medium text-purple-900">Centre & Littoral</p>
                      <p className="text-sm text-purple-700">
                        Constitutional focus, formal governance, institutional respect
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Top Performing Regions</h3>
                  <div className="space-y-2">
                    {[
                      { region: 'Centre', score: 85, campaigns: 4 },
                      { region: 'Littoral', score: 78, campaigns: 3 },
                      { region: 'Northwest', score: 72, campaigns: 2 },
                      { region: 'Southwest', score: 69, campaigns: 2 },
                      { region: 'West', score: 65, campaigns: 1 }
                    ].map((item) => (
                      <div key={item.region} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">{item.region}</p>
                          <p className="text-sm text-muted-foreground">{item.campaigns} active campaigns</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{item.score}%</p>
                          <Progress value={item.score} className="w-20 h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Smart Automation */}
        <TabsContent value="automation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Self-Learning Engine
                </CardTitle>
                <CardDescription>
                  AI observes and improves campaign performance automatically
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">Optimal Timing Detection</p>
                        <p className="text-sm text-muted-foreground">Best posting hours identified</p>
                      </div>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">Language Optimization</p>
                        <p className="text-sm text-muted-foreground">Regional language preferences learned</p>
                      </div>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="font-medium">Content Format Learning</p>
                        <p className="text-sm text-muted-foreground">Analyzing format effectiveness</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Learning</Badge>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Latest Insights</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Video content performs 2.3x better in urban areas</li>
                    <li>• Pidgin content shows highest engagement in SW region</li>
                    <li>• Religious tone most effective for voter education</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Automated Triggers
                </CardTitle>
                <CardDescription>
                  Smart campaign launches based on events and conditions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="font-medium">Disinformation Counter</p>
                        <p className="text-sm text-muted-foreground">Auto-launch fact-check campaigns</p>
                      </div>
                    </div>
                    <Switch checked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Election Period Boost</p>
                        <p className="text-sm text-muted-foreground">Increase civic education before elections</p>
                      </div>
                    </div>
                    <Switch checked />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Heart className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="font-medium">Crisis Response</p>
                        <p className="text-sm text-muted-foreground">Deploy unity campaigns during tensions</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button className="w-full flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export Campaign Materials
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Download all materials for offline distribution
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CivicEducationCampaignManager;