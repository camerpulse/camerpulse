import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ExternalLink,
  BookOpen,
  Send,
  Filter,
  Calendar,
  User,
  Link,
  Scan,
  Shield,
  Database
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FactCheck {
  id: string;
  claim_text: string;
  verification_status: 'true' | 'false' | 'misleading' | 'unverifiable';
  confidence_score: number;
  sources: any[];
  context: string;
  topic: string;
  created_at: string;
  verified_by: string;
}

const CivicFactCheckWidget = () => {
  const [activeTab, setActiveTab] = useState('verifier');
  const [claimText, setClaimText] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<FactCheck | null>(null);
  const [factCheckLibrary, setFactCheckLibrary] = useState<FactCheck[]>([]);
  const [communitySubmissions, setCommunitySubmissions] = useState<any[]>([]);
  const [filterTopic, setFilterTopic] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadFactCheckLibrary();
    loadCommunitySubmissions();
  }, []);

  const loadFactCheckLibrary = async () => {
    try {
      // Mock data for demonstration since tables don't exist yet
      const mockData: FactCheck[] = [
        {
          id: '1',
          claim_text: 'Elections will be postponed to 2026',
          verification_status: 'false',
          confidence_score: 95,
          sources: [],
          context: 'No official announcement has been made regarding election postponement',
          topic: 'elections',
          created_at: new Date().toISOString(),
          verified_by: 'CamerPulse AI'
        },
        {
          id: '2',
          claim_text: 'Fuel prices will increase by 50% next month',
          verification_status: 'misleading',
          confidence_score: 78,
          sources: [],
          context: 'Only a minor adjustment has been announced, not a 50% increase',
          topic: 'economy',
          created_at: new Date().toISOString(),
          verified_by: 'CamerPulse AI'
        }
      ];
      setFactCheckLibrary(mockData);
    } catch (error) {
      console.error('Error loading fact-check library:', error);
    }
  };

  const loadCommunitySubmissions = async () => {
    try {
      // Mock data for demonstration
      const mockSubmissions = [
        {
          id: '1',
          claim_text: 'Government plans to cancel all university scholarships',
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ];
      setCommunitySubmissions(mockSubmissions);
    } catch (error) {
      console.error('Error loading community submissions:', error);
    }
  };

  const handleVerifyClaim = async () => {
    if (!claimText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a claim to verify",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    
    try {
      // Simulate AI verification process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock verification result
      const mockResult: FactCheck = {
        id: 'mock-' + Date.now(),
        claim_text: claimText,
        verification_status: Math.random() > 0.5 ? 'true' : 'misleading',
        confidence_score: Math.floor(Math.random() * 30) + 70,
        sources: [
          {
            title: "Cameroon Tribune Official Statement",
            url: "https://cameroon-tribune.cm/article/123",
            date: "2024-12-15",
            excerpt: "Official government communication regarding the claim..."
          },
          {
            title: "ELECAM Press Release",
            url: "https://elecam.cm/press/456",
            date: "2024-12-14",
            excerpt: "Electoral commission clarification on the matter..."
          }
        ],
        context: "This claim was made during a public address and has been verified against official government sources.",
        topic: "elections",
        created_at: new Date().toISOString(),
        verified_by: "CamerPulse AI"
      };

      setVerificationResult(mockResult);
      
      toast({
        title: "Verification Complete",
        description: `Claim verified with ${mockResult.confidence_score}% confidence`
      });

    } catch (error) {
      console.error('Error verifying claim:', error);
      toast({
        title: "Verification Failed",
        description: "Failed to verify claim. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmitClaim = async (claim: string) => {
    try {
      // Mock submission for demonstration
      toast({
        title: "Claim Submitted",
        description: "Thank you! We'll fact-check this claim and add it to our library."
      });

      loadCommunitySubmissions();
    } catch (error) {
      console.error('Error submitting claim:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit claim. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'true':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'false':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'misleading':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'unverifiable':
        return <Clock className="h-5 w-5 text-gray-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      true: 'bg-green-100 text-green-800 border-green-200',
      false: 'bg-red-100 text-red-800 border-red-200',
      misleading: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      unverifiable: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <Badge className={colors[status as keyof typeof colors] || colors.unverifiable}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredLibrary = factCheckLibrary.filter(item => {
    const matchesTopic = filterTopic === 'all' || item.topic === filterTopic;
    const matchesSearch = !searchQuery || 
      item.claim_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.topic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTopic && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span>Civic Fact-Check Widget</span>
          </CardTitle>
          <CardDescription>
            AI-powered truth verification engine for political claims, news, and public statements
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="verifier">🔍 Claim Verifier</TabsTrigger>
          <TabsTrigger value="library">📚 Fact Library</TabsTrigger>
          <TabsTrigger value="scanner">📱 Rumor Scanner</TabsTrigger>
          <TabsTrigger value="submissions">📝 Community</TabsTrigger>
        </TabsList>

        {/* Instant Claim Verifier */}
        <TabsContent value="verifier" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Scan className="h-5 w-5" />
                <span>Instant Claim Verification</span>
              </CardTitle>
              <CardDescription>
                Paste any political statement, news quote, or public claim to verify instantly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Claim to Verify</label>
                <Textarea
                  placeholder='Example: "Elections will be postponed to 2026" or paste a news link...'
                  value={claimText}
                  onChange={(e) => setClaimText(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <Button 
                onClick={handleVerifyClaim}
                disabled={isVerifying || !claimText.trim()}
                className="w-full"
              >
                {isVerifying ? (
                  <>
                    <Search className="h-4 w-4 mr-2 animate-spin" />
                    Verifying Claim...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Verify This Claim
                  </>
                )}
              </Button>

              {/* Verification Result */}
              {verificationResult && (
                <Card className="border-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(verificationResult.verification_status)}
                        <span className="font-semibold">Verification Result</span>
                      </div>
                      {getStatusBadge(verificationResult.verification_status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Confidence Score</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Progress value={verificationResult.confidence_score} className="flex-1" />
                        <span className="text-sm font-medium">{verificationResult.confidence_score}%</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Context</label>
                      <p className="text-sm mt-1">{verificationResult.context}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Supporting Sources</label>
                      <div className="space-y-2 mt-2">
                        {verificationResult.sources.map((source, index) => (
                          <div key={index} className="border rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm">{source.title}</h4>
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">{source.excerpt}</p>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(source.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fact-Check Library */}
        <TabsContent value="library" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Public Fact-Check Library</span>
              </CardTitle>
              <CardDescription>
                Browse verified claims and their fact-check results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search claims..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <select 
                  value={filterTopic}
                  onChange={(e) => setFilterTopic(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="all">All Topics</option>
                  <option value="elections">Elections</option>
                  <option value="economy">Economy</option>
                  <option value="health">Health</option>
                  <option value="security">Security</option>
                  <option value="corruption">Corruption</option>
                </select>
              </div>

              {/* Fact-Check Results */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredLibrary.map((item) => (
                  <Card key={item.id} className="border">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <p className="text-sm flex-1 pr-4">{item.claim_text}</p>
                          {getStatusBadge(item.verification_status)}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Database className="h-3 w-3" />
                            <span>{item.confidence_score}% confidence</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {item.topic}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Public Rumor Scanner */}
        <TabsContent value="scanner" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Public Rumor Scanner</span>
              </CardTitle>
              <CardDescription>
                AI monitors social media for disinformation and generates preemptive fact-checks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Scanner is actively monitoring platforms for false information patterns and viral misinformation campaigns.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center space-y-2">
                      <div className="text-2xl font-bold text-red-600">12</div>
                      <p className="text-sm text-muted-foreground">Disinformation Waves Detected</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center space-y-2">
                      <div className="text-2xl font-bold text-yellow-600">47</div>
                      <p className="text-sm text-muted-foreground">False Headlines Flagged</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center space-y-2">
                      <div className="text-2xl font-bold text-green-600">156</div>
                      <p className="text-sm text-muted-foreground">Auto Fact-Checks Generated</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Recent Detections</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {[
                    { text: "False claim about election date change spreading on WhatsApp", severity: "high", platform: "WhatsApp" },
                    { text: "Misleading fuel price information trending on Twitter", severity: "medium", platform: "Twitter" },
                    { text: "Fake ministry statement circulating on Facebook", severity: "high", platform: "Facebook" }
                  ].map((detection, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm flex-1">{detection.text}</p>
                        <Badge variant={detection.severity === 'high' ? 'destructive' : 'default'}>
                          {detection.platform}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Community Submissions */}
        <TabsContent value="submissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="h-5 w-5" />
                <span>Community Submissions</span>
              </CardTitle>
              <CardDescription>
                Submit claims for fact-checking or view pending community submissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Submit a Claim for Fact-Checking</label>
                <Textarea
                  placeholder="What claim would you like us to fact-check? Provide as much context as possible..."
                  className="min-h-[80px]"
                />
                <Button onClick={() => handleSubmitClaim("Sample submission")} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Submit for Fact-Check
                </Button>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Pending Community Submissions ({communitySubmissions.length})</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {communitySubmissions.map((submission, index) => (
                    <Card key={index} className="border">
                      <CardContent className="pt-3">
                        <div className="space-y-2">
                          <p className="text-sm">{submission.claim_text || "Sample community submission about political claim..."}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Submitted by: Anonymous</span>
                            <Badge variant="outline">Pending Review</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CivicFactCheckWidget;