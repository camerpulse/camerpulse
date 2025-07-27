import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, Mic, MicOff, Paperclip, Lock, Bot, User, Volume2 } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_type: 'user' | 'bot';
  message_type: 'text' | 'voice' | 'file';
  is_encrypted: boolean;
  file_url?: string;
  file_name?: string;
  created_at: string;
}

interface EnhancedChatInterfaceProps {
  conversationId?: string;
  className?: string;
}

export const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({
  conversationId = 'demo-conversation',
  className = ''
}) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (message: Omit<Message, 'id' | 'created_at'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendTextMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // Add user message
    addMessage({
      content: userMessage,
      sender_id: 'user',
      sender_type: 'user',
      message_type: 'text',
      is_encrypted: true
    });

    // Send to support bot
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('support-bot', {
        body: { message: userMessage }
      });

      if (error) throw error;

      // Add bot response
      addMessage({
        content: data.response,
        sender_id: 'support-bot',
        sender_type: 'bot',
        message_type: 'text',
        is_encrypted: false
      });
    } catch (error) {
      console.error('Error sending to support bot:', error);
      toast({
        title: "Error",
        description: "Failed to send message to support bot",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        await processVoiceMessage(audioBlob);
        setAudioChunks([]);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      recorder.start(100);
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Speak your message..."
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Failed to start recording",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const processVoiceMessage = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      // Convert to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      // Transcribe with voice-to-text
      const { data: transcriptionData, error: transcriptionError } = await supabase.functions.invoke('voice-to-text', {
        body: { audio: base64Audio }
      });

      if (transcriptionError) throw transcriptionError;

      const transcribedText = transcriptionData.text;

      // Add user voice message
      addMessage({
        content: transcribedText,
        sender_id: 'user',
        sender_type: 'user',
        message_type: 'voice',
        is_encrypted: true
      });

      // Send to support bot
      const { data: botData, error: botError } = await supabase.functions.invoke('support-bot', {
        body: { message: transcribedText }
      });

      if (botError) throw botError;

      // Add bot response
      addMessage({
        content: botData.response,
        sender_id: 'support-bot',
        sender_type: 'bot',
        message_type: 'text',
        is_encrypted: false
      });

      toast({
        title: "Voice message sent",
        description: "Message transcribed and sent successfully"
      });
    } catch (error) {
      console.error('Error processing voice message:', error);
      toast({
        title: "Error",
        description: "Failed to process voice message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const playTextAsVoice = async (text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('text-to-voice', {
        body: { text, voice: 'alloy' }
      });

      if (error) throw error;

      // Play the audio
      const audioData = `data:audio/mp3;base64,${data.audioContent}`;
      const audio = new Audio(audioData);
      await audio.play();
    } catch (error) {
      console.error('Error playing text as voice:', error);
      toast({
        title: "Error",
        description: "Failed to play voice message",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('chat-files')
        .getPublicUrl(fileName);

      // Add file message
      addMessage({
        content: `Shared file: ${file.name}`,
        sender_id: 'user',
        sender_type: 'user',
        message_type: 'file',
        is_encrypted: true,
        file_url: urlData.publicUrl,
        file_name: file.name
      });

      toast({
        title: "File uploaded",
        description: "File shared successfully"
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className={`flex flex-col h-[600px] ${className}`}>
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Enhanced Chat with AI Support
          <Lock className="h-4 w-4 text-green-500" />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex flex-col flex-1 p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Start a conversation with our AI support bot!</p>
                <p className="text-sm mt-2">Try voice messages, file sharing, or text chat.</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.sender_type === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.sender_type === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground'
                }`}>
                  {message.sender_type === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                
                <div className={`max-w-[70%] ${
                  message.sender_type === 'user' ? 'text-right' : 'text-left'
                }`}>
                  <div className={`rounded-lg p-3 ${
                    message.sender_type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}>
                    {message.message_type === 'file' ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Paperclip className="h-4 w-4" />
                          <span className="text-sm">{message.file_name}</span>
                        </div>
                        {message.file_url && (
                          <a 
                            href={message.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs underline"
                          >
                            Download
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm">{message.content}</p>
                        {message.message_type === 'voice' && (
                          <div className="flex items-center gap-1 text-xs opacity-75">
                            <Mic className="h-3 w-3" />
                            Voice message
                          </div>
                        )}
                        {message.sender_type === 'bot' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => playTextAsVoice(message.content)}
                            className="h-6 px-2 text-xs"
                          >
                            <Volume2 className="h-3 w-3 mr-1" />
                            Play
                          </Button>
                        )}
                      </div>
                    )}
                    {message.is_encrypted && (
                      <Lock className="h-3 w-3 inline ml-2 opacity-50" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatTime(message.created_at)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4 flex-shrink-0">
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept="*/*"
            />
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              variant={isRecording ? "destructive" : "outline"}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
              placeholder="Type your message... (encrypted)"
              disabled={isLoading || isRecording}
              className="flex-1"
            />
            
            <Button 
              onClick={sendTextMessage}
              disabled={isLoading || !inputValue.trim() || isRecording}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {isRecording && (
            <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Recording... Click stop when finished
            </div>
          )}
          
          {isLoading && (
            <div className="mt-2 text-sm text-muted-foreground">
              Processing...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};