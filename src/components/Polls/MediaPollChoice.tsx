import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Play, Image as ImageIcon, ExternalLink } from 'lucide-react';

interface MediaOption {
  id: string;
  text: string;
  image?: string;
  video?: string;
}

interface MediaPollChoiceProps {
  options: MediaOption[];
  onVoteSubmit: (selectedIds: string[]) => void;
  multipleChoice?: boolean;
  disabled?: boolean;
}

export const MediaPollChoice: React.FC<MediaPollChoiceProps> = ({
  options,
  onVoteSubmit,
  multipleChoice = false,
  disabled = false
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleSingleChoice = (optionId: string) => {
    setSelectedOptions([optionId]);
  };

  const handleMultipleChoice = (optionId: string, checked: boolean) => {
    if (checked) {
      setSelectedOptions([...selectedOptions, optionId]);
    } else {
      setSelectedOptions(selectedOptions.filter(id => id !== optionId));
    }
  };

  const handleSubmit = () => {
    onVoteSubmit(selectedOptions);
  };

  const MediaContent: React.FC<{ option: MediaOption }> = ({ option }) => {
    if (option.video) {
      return (
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          <video 
            src={option.video}
            className="w-full h-full object-cover"
            controls
            preload="metadata"
          />
          <Badge className="absolute top-2 left-2" variant="secondary">
            <Play className="h-3 w-3 mr-1" />
            Video
          </Badge>
        </div>
      );
    }

    if (option.image) {
      return (
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          <img 
            src={option.image}
            alt={option.text}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <Badge className="absolute top-2 left-2" variant="secondary">
            <ImageIcon className="h-3 w-3 mr-1" />
            Image
          </Badge>
        </div>
      );
    }

    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <ImageIcon className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">No media attached</p>
        </div>
      </div>
    );
  };

  if (multipleChoice) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-muted-foreground">
            Select one or more options below
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {options.map((option) => (
            <Card 
              key={option.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedOptions.includes(option.id) 
                  ? 'ring-2 ring-primary' 
                  : ''
              }`}
              onClick={() => !disabled && handleMultipleChoice(
                option.id, 
                !selectedOptions.includes(option.id)
              )}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedOptions.includes(option.id)}
                    onCheckedChange={(checked) => 
                      !disabled && handleMultipleChoice(option.id, checked as boolean)
                    }
                    disabled={disabled}
                  />
                  <span className="font-medium">{option.text}</span>
                </div>
                
                <MediaContent option={option} />
                
                {(option.image || option.video) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(option.image || option.video, '_blank');
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Size
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={handleSubmit}
            disabled={selectedOptions.length === 0 || disabled}
            size="lg"
          >
            Submit Vote ({selectedOptions.length} selected)
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-muted-foreground">
          Select one option below
        </p>
      </div>

      <RadioGroup
        value={selectedOptions[0] || ''}
        onValueChange={handleSingleChoice}
        disabled={disabled}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {options.map((option) => (
            <Card 
              key={option.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedOptions.includes(option.id) 
                  ? 'ring-2 ring-primary' 
                  : ''
              }`}
              onClick={() => !disabled && handleSingleChoice(option.id)}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={option.id}
                    id={option.id}
                    disabled={disabled}
                  />
                  <span className="font-medium">{option.text}</span>
                </div>
                
                <MediaContent option={option} />
                
                {(option.image || option.video) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(option.image || option.video, '_blank');
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Size
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </RadioGroup>

      <div className="flex justify-center">
        <Button 
          onClick={handleSubmit}
          disabled={selectedOptions.length === 0 || disabled}
          size="lg"
        >
          Submit Vote
        </Button>
      </div>
    </div>
  );
};