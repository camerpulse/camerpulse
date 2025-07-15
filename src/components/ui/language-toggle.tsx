import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages, Lock } from 'lucide-react';

interface LanguageToggleProps {
  disabled?: boolean;
  adminOverride?: boolean;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ 
  disabled = true, // Disabled by default for English-only mode
  adminOverride = false 
}) => {
  const [language] = useState<'en'>('en'); // Locked to English

  // Admin can see all languages, regular users only see English when locked
  const languages = adminOverride ? [
    { code: 'en', name: 'English', flag: '🇬🇧', initials: 'ENG' },
    { code: 'fr', name: 'Français', flag: '🇫🇷', initials: 'FR' },
  ] : [
    { code: 'en', name: 'English', flag: '🇬🇧', initials: 'ENG' },
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  if (disabled && !adminOverride) {
    return (
      <Button variant="ghost" size="sm" className="gap-2 cursor-not-allowed opacity-50">
        <Languages className="h-4 w-4" />
        <span className="hidden sm:inline-block">ENG</span>
        <Lock className="h-3 w-3" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline-block">
            {currentLanguage?.initials}
          </span>
          <span className="sm:hidden">{currentLanguage?.initials}</span>
          {disabled && <Badge variant="secondary" className="ml-1 text-xs">Locked</Badge>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => {
              if (!disabled || adminOverride) {
                // Only allow change if not disabled or admin override
                console.log(`Language change to ${lang.code} (admin: ${adminOverride})`);
              }
            }}
            className="flex items-center gap-2 cursor-pointer"
            disabled={disabled && !adminOverride && lang.code !== 'en'}
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
            {language === lang.code && (
              <span className="ml-auto text-primary">✓</span>
            )}
            {disabled && lang.code === 'fr' && !adminOverride && (
              <Lock className="ml-auto h-3 w-3 text-muted-foreground" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};