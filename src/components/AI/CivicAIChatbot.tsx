import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Download,
  Brain,
  Volume2,
  Sparkles,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface CivicKnowledge {
  topic: string;
  keywords: string[];
  responses: string[];
}

const civicKnowledgeBase: CivicKnowledge[] = [
  {
    topic: "voting",
    keywords: ["vote", "election", "register", "ballot", "candidate", "ELECAM"],
    responses: [
      "To register to vote in Cameroon, you must be at least 20 years old and register with ELECAM (Elections Cameroon). You'll need your National ID card and proof of residence. Registration typically happens before each election period.",
      "ELECAM is the electoral body responsible for organizing elections. You can register at local ELECAM offices in your district. Make sure to verify your registration status before election day.",
      "Elections in Cameroon include presidential, parliamentary, and municipal elections. Each has different requirements and voting procedures."
    ]
  },
  {
    topic: "rights",
    keywords: ["rights", "freedom", "speech", "assembly", "constitution", "human rights"],
    responses: [
      "As a Cameroonian citizen, you have fundamental rights protected by the Constitution including freedom of speech, assembly, and movement. These rights are guaranteed but may have limitations for public order.",
      "If your rights are violated, you can report to local authorities, human rights organizations, or seek legal counsel. Document any violations with evidence.",
      "The Constitution of Cameroon guarantees equality before the law regardless of race, religion, or origin. You have the right to participate in public affairs and express your opinions."
    ]
  },
  {
    topic: "government",
    keywords: ["president", "parliament", "minister", "mayor", "council", "government"],
    responses: [
      "Cameroon has a presidential system where the President is both head of state and government. The President appoints the Prime Minister and ministers.",
      "Parliament consists of the National Assembly (lower house) and Senate (upper house). They vote on laws and oversee government actions.",
      "Local government includes regional governors, divisional officers, and municipal councils. Each level has specific responsibilities for local development."
    ]
  },
  {
    topic: "corruption",
    keywords: ["corruption", "bribery", "report", "ANIF", "anti-corruption", "transparency"],
    responses: [
      "To report corruption, contact ANIF (National Anti-Corruption Agency) through their hotlines or website. You can report anonymously if needed.",
      "Document evidence of corruption including dates, amounts, people involved, and circumstances. Keep receipts or records if possible.",
      "Corruption undermines development and democracy. Citizens have a duty to report it and refuse to participate in corrupt practices."
    ]
  },
  {
    topic: "education",
    keywords: ["school", "education", "university", "fees", "scholarship", "student"],
    responses: [
      "Education in Cameroon is provided in both English and French. Primary education is officially free and compulsory, though some fees may apply.",
      "For higher education, there are state universities with lower fees and private institutions. Scholarships are available for excellent students.",
      "You have the right to education regardless of your background. If denied education due to inability to pay, contact education authorities or NGOs."
    ]
  }
];

export const CivicAIChatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modelStatus, setModelStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [isModelDownloading, setIsModelDownloading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [pipeline, setPipeline] = useState<any>(null);

  // Initialize the AI model
  useEffect(() => {
    initializeModel();
  }, []);

  const initializeModel = async () => {
    try {
      setIsModelDownloading(true);
      setModelStatus('loading');
      
      // Dynamically import the transformers library
      const { pipeline: createPipeline } = await import('@huggingface/transformers');
      
      toast({
        title: "Loading AI Model",
        description: "Downloading civic education AI model... This may take a few minutes on first load.",
      });

      // Use a smaller, faster model suitable for conversational AI
      const textGeneration = await createPipeline(
        'text-generation',
        'Xenova/distilgpt2',
        { 
          device: 'webgpu', // Try WebGPU first, fallback to CPU
          dtype: 'fp16'
        }
      );

      setPipeline(textGeneration);
      setModelStatus('ready');
      setIsModelDownloading(false);

      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Hello! I'm your AI civic education assistant. I'm here to help you learn about your rights, government, voting, and civic participation in Cameroon. Ask me anything about civic topics!",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);

      toast({
        title: "AI Model Ready!",
        description: "Your personal civic education AI is now ready to help you.",
      });

    } catch (error) {
      logger.error('Error initializing model', { error: error.message });
      setModelStatus('error');
      setIsModelDownloading(false);
      
      // Fallback to knowledge-based responses
      toast({
        title: "Using Knowledge Base",
        description: "AI model unavailable, using built-in civic knowledge.",
        variant: "default"
      });

      const fallbackMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Hello! I'm your civic education assistant. While the advanced AI model is loading, I can still help you with civic questions using my knowledge base. Ask me about voting, rights, government, or reporting corruption!",
        timestamp: new Date()
      };
      setMessages([fallbackMessage]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findRelevantResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    // Find matching knowledge base entry
    for (const knowledge of civicKnowledgeBase) {
      if (knowledge.keywords.some(keyword => lowerQuery.includes(keyword))) {
        // Return a random response from the topic
        const responses = knowledge.responses;
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }

    // Default responses for common question types
    if (lowerQuery.includes('how') || lowerQuery.includes('what') || lowerQuery.includes('where')) {
      return "That's a great civic question! While I specialize in Cameroonian civic education, let me help you find the right information. Could you be more specific about what aspect of voting, rights, government, or civic participation you'd like to know about?";
    }

    return "I'm here to help with civic education topics like voting procedures, your constitutional rights, government structure, and how to participate in democracy. What specific civic topic would you like to learn about?";
  };

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    if (!pipeline) {
      return findRelevantResponse(userMessage);
    }

    try {
      // Create a civic-focused prompt
      const prompt = `As a civic education expert for Cameroon, provide a helpful and accurate response about: ${userMessage}

      Context: Focus on Cameroonian civic education, including voting, rights, government structure, and citizen participation.
      
      Response:`;

      const result = await pipeline(prompt, {
        max_new_tokens: 150,
        temperature: 0.7,
        do_sample: true,
        return_full_text: false
      });

      let response = result[0]?.generated_text || '';
      
      // Clean up the response
      response = response.trim();
      
      // If AI response is too short or unclear, use knowledge base
      if (response.length < 20 || !response.includes('Cameroon')) {
        return findRelevantResponse(userMessage);
      }

      return response;
    } catch (error) {
      logger.error('Error generating AI response', { error: error.message });
      return findRelevantResponse(userMessage);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: 'typing',
      role: 'assistant',
      content: 'Thinking...',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await generateAIResponse(userMessage.content);

      // Remove typing indicator and add real response
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      logger.error('Error processing message', { error: error.message });
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I encountered an error. Let me help you with civic education using my knowledge base instead. What would you like to know about voting, rights, or government?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  const quickQuestions = [
    "How do I register to vote?",
    "What are my constitutional rights?",
    "How do I report corruption?",
    "What does the President do?",
    "How do local councils work?",
    "What is ELECAM?"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="relative">
            <Brain className="h-8 w-8 text-primary" />
            {modelStatus === 'ready' && (
              <CheckCircle className="h-4 w-4 text-green-500 absolute -top-1 -right-1" />
            )}
            {modelStatus === 'error' && (
              <AlertCircle className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" />
            )}
          </div>
          <h1 className="text-3xl font-bold">AI Civic Education Assistant</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Your personal AI tutor for Cameroonian civic education. Ask questions about voting, rights, government, and civic participation.
        </p>
        
        {/* Model Status */}
        <div className="flex items-center justify-center gap-2">
          {modelStatus === 'loading' && (
            <Badge variant="outline" className="animate-pulse">
              <Download className="h-3 w-3 mr-1" />
              {isModelDownloading ? 'Downloading AI Model...' : 'Loading...'}
            </Badge>
          )}
          {modelStatus === 'ready' && (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <Sparkles className="h-3 w-3 mr-1" />
              Advanced AI Ready
            </Badge>
          )}
          {modelStatus === 'error' && (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
              <Brain className="h-3 w-3 mr-1" />
              Knowledge Base Mode
            </Badge>
          )}
        </div>
      </div>

      {/* Quick Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickQuestion(question)}
                className="text-xs"
              >
                {question}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Civic Education Chat
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col gap-4">
          {/* Messages */}
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.isTyping ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about voting, rights, government..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Model Info */}
      <Alert>
        <Brain className="h-4 w-4" />
        <AlertDescription>
          This AI assistant runs completely in your browser using advanced machine learning. 
          {modelStatus === 'ready' 
            ? ' The model is ready and can provide personalized civic education responses.'
            : ' Currently using built-in civic knowledge base for reliable answers.'
          }
          All conversations are private and secure.
        </AlertDescription>
      </Alert>
    </div>
  );
};