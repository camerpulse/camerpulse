import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Brain, 
  Send, 
  Volume2, 
  Globe, 
  Users, 
  BookOpen,
  HelpCircle,
  Lightbulb,
  Shield,
  Map,
  Languages
} from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  language?: string;
  region?: string;
}

interface ExplanationTopic {
  id: string;
  title: string;
  category: string;
  description: string;
  keywords: string[];
}

const CivicExplainerAssistant = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI Civic Explainer. I can help you understand elections, government, political parties, and civic processes in simple language. What would you like to know about?',
      timestamp: new Date(),
      language: 'en'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedRegion, setSelectedRegion] = useState('cameroon');
  const [userAge, setUserAge] = useState('adult');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const quickTopics: ExplanationTopic[] = [
    {
      id: '1',
      title: 'What does a Mayor do?',
      category: 'governance',
      description: 'Understanding local government roles',
      keywords: ['mayor', 'local', 'government', 'council']
    },
    {
      id: '2',
      title: 'How are MPs elected?',
      category: 'elections',
      description: 'Electoral process in Cameroon',
      keywords: ['mp', 'parliament', 'election', 'voting']
    },
    {
      id: '3',
      title: 'What is ELECAM?',
      category: 'institutions',
      description: 'Electoral commission explained',
      keywords: ['elecam', 'electoral', 'commission', 'oversight']
    },
    {
      id: '4',
      title: 'Why vote matters',
      category: 'civic-education',
      description: 'Importance of civic participation',
      keywords: ['vote', 'democracy', 'participation', 'rights']
    },
    {
      id: '5',
      title: 'Political parties in Cameroon',
      category: 'parties',
      description: 'Understanding party system',
      keywords: ['parties', 'cpdm', 'sdf', 'politics']
    },
    {
      id: '6',
      title: 'Can I run for office?',
      category: 'participation',
      description: 'Requirements for candidacy',
      keywords: ['candidate', 'requirements', 'office', 'eligibility']
    }
  ];

  const regions = [
    { id: 'cameroon', name: 'Cameroon', flag: '🇨🇲' },
    { id: 'centre', name: 'Centre Region', flag: '🏛️' },
    { id: 'littoral', name: 'Littoral', flag: '🌊' },
    { id: 'southwest', name: 'Southwest', flag: '🌴' },
    { id: 'northwest', name: 'Northwest', flag: '⛰️' },
    { id: 'west', name: 'West', flag: '🏔️' },
    { id: 'east', name: 'East', flag: '🌲' },
    { id: 'north', name: 'North', flag: '🌾' },
    { id: 'adamawa', name: 'Adamawa', flag: '🦓' },
    { id: 'far-north', name: 'Far North', flag: '🏜️' },
    { id: 'south', name: 'South', flag: '🌳' }
  ];

  const languages = [
    { id: 'en', name: 'English', flag: '🇬🇧' },
    { id: 'pidgin', name: 'Pidgin', flag: '🗣️' }
  ];

  const ageGroups = [
    { id: 'youth', name: 'Youth (16-25)', icon: '👨‍🎓' },
    { id: 'adult', name: 'Adult (26-55)', icon: '👨‍💼' },
    { id: 'senior', name: 'Senior (55+)', icon: '👨‍🦳' }
  ];

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const generateResponse = async (question: string) => {
    setIsLoading(true);
    
    // Simulate AI response generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let response = '';
    const lowerQuestion = question.toLowerCase();
    
    // Smart response generation based on question content
    if (lowerQuestion.includes('mayor') || lowerQuestion.includes('local government')) {
      response = getRegionalizedResponse('mayor_explanation');
    } else if (lowerQuestion.includes('mp') || lowerQuestion.includes('parliament')) {
      response = getRegionalizedResponse('mp_explanation');
    } else if (lowerQuestion.includes('elecam')) {
      response = getRegionalizedResponse('elecam_explanation');
    } else if (lowerQuestion.includes('vote') || lowerQuestion.includes('voting')) {
      response = getRegionalizedResponse('voting_explanation');
    } else if (lowerQuestion.includes('party') || lowerQuestion.includes('parties')) {
      response = getRegionalizedResponse('parties_explanation');
    } else if (lowerQuestion.includes('run for office') || lowerQuestion.includes('candidate')) {
      response = getRegionalizedResponse('candidacy_explanation');
    } else {
      response = getRegionalizedResponse('general_help');
    }
    
    const assistantMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'assistant',
      content: response,
      timestamp: new Date(),
      language: selectedLanguage,
      region: selectedRegion
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const getRegionalizedResponse = (type: string): string => {
    const responses = {
      mayor_explanation: {
        en: `A Mayor is the head of your local council (municipality). They are responsible for:\n\n• Managing local services like markets, street cleaning, and waste collection\n• Overseeing local development projects\n• Issuing birth certificates and other civil documents\n• Maintaining local roads and public facilities\n\nIn ${getRegionName()}, your mayor works closely with traditional rulers and coordinates with the regional government. They serve for 5 years and are elected by municipal councillors.`,
        // French content removed - English only platform
        pidgin: `Mayor na di head for your local council. E dey handle:\n\n• Market business, street cleaning, and rubbish collection\n• Local development projects\n• Birth certificate and other papers\n• Road and public places maintenance\n\nFor ${getRegionName()}, your mayor dey work with traditional rulers and regional government. E go serve for 5 years.`
      },
      mp_explanation: {
        en: `Members of Parliament (MPs) are elected to represent your constituency in the National Assembly. Here's how it works:\n\n• Every 5 years, you vote for an MP candidate\n• They represent your area's interests in parliament\n• They debate and vote on national laws\n• They can question ministers about government policies\n\nIn ${getRegionName()}, you have ${getConstituencyCount()} constituencies. Your MP should hold regular meetings with constituents to hear your concerns.`,
        // French content removed - English only platform
        pidgin: `MP dem dey represent your area for National Assembly:\n\n• Every 5 years, you go vote for MP candidate\n• E go represent your area interest for parliament\n• E dey debate and vote for national laws\n• E fit question ministers about government policy\n\nFor ${getRegionName()}, we get ${getConstituencyCount()} constituencies. Your MP suppose hold regular meetings with people.`
      },
      elecam_explanation: {
        en: `ELECAM (Elections Cameroon) is the independent body that organizes all elections in Cameroon:\n\n• They register voters and issue voter cards\n• They supervise presidential, parliamentary, and local elections\n• They train election officials and monitors\n• They announce official election results\n\nELECAM has offices in all regions including ${getRegionName()}. They ensure elections are free, fair, and transparent. You can contact your local ELECAM office to register to vote or report election irregularities.`,
        // French content removed - English only platform
        pidgin: `ELECAM na di independent body wey dey organize all elections for Cameroon:\n\n• Dem dey register voters and give voter cards\n• Dem dey supervise presidential, parliamentary, and local elections\n• Dem dey train election officials\n• Dem dey announce official results\n\nELECAM get offices for all regions including ${getRegionName()}. You fit contact dem to register for vote.`
      },
      voting_explanation: {
        en: `Your vote is your voice in democracy! Here's why it matters:\n\n• It's how you choose leaders who represent your interests\n• It gives you a say in policies that affect your daily life\n• It's your constitutional right and civic duty\n• It helps hold politicians accountable\n\nIn ${getRegionName()}, your vote helps decide who becomes your MP, mayor, and councillors. Every vote counts - elections have been won by small margins! To vote, you need to be 20+ years old and registered with ELECAM.`,
        // French content removed - English only platform
        pidgin: `Your vote na your voice for democracy! Na why e dey important:\n\n• Na how you go choose leaders wey go represent your interest\n• E dey give you say for policies wey dey affect your daily life\n• Na your constitutional right and civic duty\n• E dey help hold politicians accountable\n\nFor ${getRegionName()}, your vote dey help decide who go become your MP, mayor, and councillors. Every vote dey count!`
      },
      parties_explanation: {
        en: `Cameroon has multiple political parties with different ideologies:\n\n• **CPDM (Cameroon People's Democratic Movement)** - Ruling party since 1985, focuses on unity and development\n• **SDF (Social Democratic Front)** - Main opposition, advocates for federalism and change\n• **UNDP, MDR, UPC** - Other opposition parties with various platforms\n\nIn ${getRegionName()}, different parties have varying levels of support. You can join any party, attend their rallies, and support their candidates. Each party has a manifesto explaining their policies and promises.`,
        // French content removed - English only platform
        pidgin: `Cameroon get plenty political parties with different ideologies:\n\n• **CPDM** - Ruling party since 1985, dem dey focus on unity and development\n• **SDF** - Main opposition, dem dey advocate for federalism and change\n• **UNDP, MDR, UPC** - Other opposition parties\n\nFor ${getRegionName()}, different parties get different levels of support. You fit join any party and support their candidates.`
      },
      candidacy_explanation: {
        en: `Yes, you can run for office in Cameroon! Here are the basic requirements:\n\n**For Municipal Councillor:**\n• Be at least 23 years old\n• Be a registered voter in the municipality\n• Have clean criminal record\n\n**For MP:**\n• Be at least 25 years old\n• Be a Cameroonian citizen\n• Have clean criminal record\n\n**For President:**\n• Be at least 35 years old\n• Be born Cameroonian\n• Have university degree\n\nIn ${getRegionName()}, you can start by joining a political party or running as an independent. Contact ELECAM for detailed requirements and registration procedures.`,
        // French content removed - English only platform
        pidgin: `Yes, you fit run for office for Cameroon! Na dis requirements:\n\n**For Municipal Councillor:**\n• Be at least 23 years old\n• Be registered voter for the municipality\n• Get clean criminal record\n\n**For MP:**\n• Be at least 25 years old\n• Be Cameroonian citizen\n• Get clean criminal record\n\nFor ${getRegionName()}, you fit start by joining political party or run as independent. Contact ELECAM for detailed requirements.`
      },
      general_help: {
        en: `I'm here to help you understand politics and governance in simple terms! I can explain:\n\n• How elections work in Cameroon\n• What different government officials do\n• Political parties and their ideologies\n• Your rights as a citizen\n• How to participate in democracy\n\nFeel free to ask specific questions like "What does the President do?" or "How do I register to vote?" I'll explain everything in simple language suitable for ${getRegionName()}.`,
        
        pidgin: `I dey here to help you understand politics and governance for simple terms! I fit explain:\n\n• How elections dey work for Cameroon\n• Wetin different government officials dey do\n• Political parties and their ideologies\n• Your rights as citizen\n• How to participate for democracy\n\nFeel free to ask specific questions suitable for ${getRegionName()}.`
      }
    };

    return responses[type]?.[selectedLanguage] || responses[type]?.en || 'I can help you understand that topic better. Please ask a more specific question.';
  };

  const getRegionName = () => {
    const region = regions.find(r => r.id === selectedRegion);
    return region?.name || 'your region';
  };

  const getConstituencyCount = () => {
    const counts = {
      'centre': '18',
      'littoral': '16',
      'southwest': '11',
      'northwest': '14',
      'west': '13',
      'east': '8',
      'north': '10',
      'adamawa': '7',
      'far-north': '15',
      'south': '8'
    };
    return counts[selectedRegion] || 'several';
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      language: selectedLanguage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    await generateResponse(inputValue);
  };

  const handleQuickTopic = async (topic: ExplanationTopic) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: topic.title,
      timestamp: new Date(),
      language: selectedLanguage
    };

    setMessages(prev => [...prev, userMessage]);
    await generateResponse(topic.title);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-primary" />
            <span>AI Citizen Explainer Assistant</span>
            <Badge variant="secondary">24/7 Available</Badge>
          </CardTitle>
          <CardDescription>
            Understanding politics, elections, and governance made simple. Ask questions in English or Pidgin.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Language</label>
              <div className="grid grid-cols-1 gap-2">
                {languages.map((lang) => (
                  <Button
                    key={lang.id}
                    variant={selectedLanguage === lang.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLanguage(lang.id)}
                    className="justify-start"
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Region</label>
              <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto">
                {regions.map((region) => (
                  <Button
                    key={region.id}
                    variant={selectedRegion === region.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedRegion(region.id)}
                    className="justify-start text-xs"
                  >
                    <span className="mr-2">{region.flag}</span>
                    {region.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Age Group</label>
              <div className="grid grid-cols-1 gap-2">
                {ageGroups.map((age) => (
                  <Button
                    key={age.id}
                    variant={userAge === age.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUserAge(age.id)}
                    className="justify-start"
                  >
                    <span className="mr-2">{age.icon}</span>
                    {age.name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Chat Interface */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Chat with AI Assistant</span>
              <Badge variant="outline" className="ml-auto">
                <Globe className="h-3 w-3 mr-1" />
                {getRegionName()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Topics */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Lightbulb className="h-4 w-4 mr-1" />
                Quick Topics
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {quickTopics.map((topic) => (
                  <Button
                    key={topic.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickTopic(topic)}
                    className="h-auto p-2 text-left justify-start"
                  >
                    <div>
                      <div className="font-medium text-xs">{topic.title}</div>
                      <div className="text-xs text-muted-foreground">{topic.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Chat Messages */}
            <ScrollArea className="h-96 border rounded-lg p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      <div className="text-xs mt-1 opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                        {message.language && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {languages.find(l => l.id === message.language)?.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-current rounded-full /* animate-bounce - disabled */" />
                        <div className="w-2 h-2 bg-current rounded-full /* animate-bounce - disabled */" />
                        <div className="w-2 h-2 bg-current rounded-full /* animate-bounce - disabled */" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about elections, government, parties, or civic processes..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              🛡️ This assistant provides factual civic information and counters disinformation with verified sources
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CivicExplainerAssistant;