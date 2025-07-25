import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfileSlug } from '@/hooks/useProfileSlug';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Check, X, RefreshCw, ExternalLink, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfileSlugManagerProps {
  currentSlug?: string;
  username?: string;
  displayName?: string;
  onSlugUpdate?: (newSlug: string) => void;
}

export const ProfileSlugManager: React.FC<ProfileSlugManagerProps> = ({
  currentSlug,
  username,
  displayName,
  onSlugUpdate
}) => {
  const [slug, setSlug] = useState(currentSlug || '');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    updateProfileSlug,
    generateSlugFromText,
    validateSlug,
    checkSlugAvailability,
    isUpdating,
    isGenerating,
    isValidating
  } = useProfileSlug();

  const profileUrl = `${window.location.origin}/@${slug}`;

  useEffect(() => {
    setSlug(currentSlug || '');
  }, [currentSlug]);

  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (slug && slug !== currentSlug) {
      const timer = setTimeout(async () => {
        await checkSlugValidation();
      }, 500);
      setDebounceTimer(timer);
    } else if (slug === currentSlug) {
      setIsValid(true);
      setIsAvailable(true);
    }

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [slug]);

  const checkSlugValidation = async () => {
    if (!slug || slug.length < 3) {
      setIsValid(false);
      setIsAvailable(null);
      return;
    }

    const valid = await validateSlug(slug);
    setIsValid(valid);

    if (valid) {
      const available = await checkSlugAvailability(slug, user?.id);
      setIsAvailable(available);
    } else {
      setIsAvailable(null);
    }
  };

  const handleSlugChange = (value: string) => {
    // Convert to lowercase and replace spaces with hyphens
    const formattedSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    setSlug(formattedSlug);
    setIsValid(null);
    setIsAvailable(null);
  };

  const handleGenerateSlug = async () => {
    const sourceText = displayName || username || 'user';
    const generated = await generateSlugFromText(sourceText);
    if (generated) {
      setSlug(generated);
    }
  };

  const handleUpdateSlug = async () => {
    if (!isValid || !isAvailable) return;

    const result = await updateProfileSlug(slug);
    if (result.success && result.slug) {
      onSlugUpdate?.(result.slug);
    }
  };

  const copyUrlToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast({
        title: "URL copied to clipboard",
        description: "Your profile URL has been copied to clipboard.",
      });
    } catch (error) {
      console.error('Failed to copy URL:', error);
      toast({
        title: "Failed to copy URL",
        description: "Unable to copy URL to clipboard.",
        variant: "destructive",
      });
    }
  };

  const getValidationIcon = () => {
    if (isValidating) {
      return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
    }
    
    if (isValid === false) {
      return <X className="w-4 h-4 text-destructive" />;
    }
    
    if (isValid === true && isAvailable === false) {
      return <X className="w-4 h-4 text-destructive" />;
    }
    
    if (isValid === true && isAvailable === true) {
      return <Check className="w-4 h-4 text-green-600" />;
    }
    
    return null;
  };

  const getValidationMessage = () => {
    if (isValidating) {
      return "Checking availability...";
    }
    
    if (isValid === false) {
      return "Invalid format. Use 3-30 characters, lowercase letters, numbers, and hyphens only.";
    }
    
    if (isValid === true && isAvailable === false) {
      return "This URL is already taken. Please choose another one.";
    }
    
    if (isValid === true && isAvailable === true) {
      return "This URL is available!";
    }
    
    return "Enter your desired profile URL";
  };

  const canUpdate = isValid && isAvailable && slug !== currentSlug && !isUpdating;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="w-5 h-5" />
          Profile URL
        </CardTitle>
        <CardDescription>
          Choose a custom URL for your profile. This will be how others can find and share your profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="profile-slug">Custom URL</Label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                @
              </div>
              <Input
                id="profile-slug"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="your-username"
                className="pl-8 pr-10"
                maxLength={30}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {getValidationIcon()}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleGenerateSlug}
              disabled={isGenerating}
              className="shrink-0"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className={`text-sm ${
            isValid === false || (isValid && !isAvailable) 
              ? 'text-destructive' 
              : isValid && isAvailable 
                ? 'text-green-600' 
                : 'text-muted-foreground'
          }`}>
            {getValidationMessage()}
          </p>
        </div>

        {slug && (
          <div className="space-y-2">
            <Label>Preview URL</Label>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <code className="flex-1 text-sm text-foreground">
                {profileUrl}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyUrlToClipboard}
                className="shrink-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleUpdateSlug}
            disabled={!canUpdate}
            className="flex-1"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Update URL'
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>URL requirements:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>3-30 characters long</li>
            <li>Lowercase letters, numbers, and hyphens only</li>
            <li>Cannot start or end with a hyphen</li>
            <li>Cannot use reserved words</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};