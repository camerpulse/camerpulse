import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Languages, Loader2 } from 'lucide-react';

interface MessageTranslationProps {
  messageId: string;
  messageContent: string;
  className?: string;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' }
];

export const MessageTranslation: React.FC<MessageTranslationProps> = ({
  messageId,
  messageContent,
  className
}) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [showTranslation, setShowTranslation] = useState(false);
  const { toast } = useToast();

  const detectLanguage = (text: string): string => {
    // Simple language detection (in production, use proper detection)
    const patterns = {
      'es': /[ñáéíóúü]/i,
      'fr': /[àâäéèêëîïôöùûüÿç]/i,
      'de': /[äöüß]/i,
      'it': /[àèéìíîòóù]/i,
      'pt': /[ãõçáéíóúâêôàè]/i,
      'ru': /[а-яё]/i,
      'ja': /[ひらがなカタカナ漢字]/,
      'ko': /[가-힣]/,
      'zh': /[\u4e00-\u9fff]/,
      'ar': /[\u0600-\u06ff]/,
      'hi': /[\u0900-\u097f]/
    };

    for (const [lang, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        return lang;
      }
    }
    
    return 'en'; // Default to English
  };

  const translateMessage = async (targetLanguage: string) => {
    setIsTranslating(true);
    
    try {
      // Check if translation already exists
      const { data: existingTranslation, error: fetchError } = await supabase
        .from('message_translations')
        .select('translated_content')
        .eq('message_id', messageId)
        .eq('to_language', targetLanguage)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (existingTranslation) {
        setTranslatedContent(existingTranslation.translated_content);
        setShowTranslation(true);
        return;
      }

      // Simple translation simulation (in production, use real translation API)
      const translatedText = await simulateTranslation(messageContent, targetLanguage);
      
      // Store translation
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: insertError } = await supabase
        .from('message_translations')
        .insert({
          message_id: messageId,
          user_id: user.id,
          from_language: detectLanguage(messageContent),
          to_language: targetLanguage,
          translated_content: translatedText,
          confidence_score: 0.85
        });

      if (insertError) throw insertError;

      setTranslatedContent(translatedText);
      setShowTranslation(true);
      
      toast({
        title: "Translation complete",
        description: `Message translated to ${SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage)?.name}`,
      });
      
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Translation failed",
        description: "Could not translate the message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const simulateTranslation = async (text: string, targetLang: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple translation simulation
    const translations: Record<string, Record<string, string>> = {
      'Hello': {
        'es': 'Hola',
        'fr': 'Bonjour',
        'de': 'Hallo',
        'it': 'Ciao',
        'pt': 'Olá',
        'ru': 'Привет',
        'ja': 'こんにちは',
        'ko': '안녕하세요',
        'zh': '你好',
        'ar': 'مرحبا',
        'hi': 'नमस्ते'
      },
      'Thank you': {
        'es': 'Gracias',
        'fr': 'Merci',
        'de': 'Danke',
        'it': 'Grazie',
        'pt': 'Obrigado',
        'ru': 'Спасибо',
        'ja': 'ありがとう',
        'ko': '감사합니다',
        'zh': '谢谢',
        'ar': 'شكرا',
        'hi': 'धन्यवाद'
      }
    };

    // Check for exact matches first
    for (const [original, langTranslations] of Object.entries(translations)) {
      if (text.toLowerCase().includes(original.toLowerCase())) {
        return langTranslations[targetLang] || `[Translated to ${targetLang}] ${text}`;
      }
    }

    return `[Translated to ${targetLang}] ${text}`;
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => translateMessage(selectedLanguage)}
          disabled={!selectedLanguage || isTranslating}
        >
          {isTranslating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Languages className="w-4 h-4" />
          )}
          Translate
        </Button>
      </div>

      {showTranslation && translatedContent && (
        <div className="mt-2 p-3 bg-muted rounded-lg border-l-4 border-primary">
          <div className="flex items-center gap-2 mb-1">
            <Languages className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-primary">
              Translation ({SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name})
            </span>
          </div>
          <p className="text-sm">{translatedContent}</p>
        </div>
      )}
    </div>
  );
};