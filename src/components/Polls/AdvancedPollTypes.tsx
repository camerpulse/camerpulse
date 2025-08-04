import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  BarChart3, 
  Star, 
  ArrowUpDown, 
  Calendar, 
  Target,
  CheckSquare,
  RotateCcw,
  Users
} from 'lucide-react';

interface PollOption {
  id: string;
  text: string;
  description?: string;
  imageUrl?: string;
}

interface AdvancedPollConfig {
  pollType: string;
  title: string;
  description: string;
  options: PollOption[];
  settings: Record<string, any>;
}

interface AdvancedPollTypesProps {
  onConfigChange: (config: AdvancedPollConfig) => void;
  initialConfig?: Partial<AdvancedPollConfig>;
}

export const AdvancedPollTypes = ({ onConfigChange, initialConfig }: AdvancedPollTypesProps) => {
  const [selectedType, setSelectedType] = useState(initialConfig?.pollType || 'single_choice');
  const [title, setTitle] = useState(initialConfig?.title || '');
  const [description, setDescription] = useState(initialConfig?.description || '');
  const [options, setOptions] = useState<PollOption[]>(
    initialConfig?.options || [
      { id: '1', text: 'Option 1' },
      { id: '2', text: 'Option 2' }
    ]
  );
  const [settings, setSettings] = useState(initialConfig?.settings || {});

  const pollTypes = [
    {
      id: 'single_choice',
      name: 'Single Choice',
      icon: RotateCcw,
      description: 'Users can select only one option'
    },
    {
      id: 'multiple_choice',
      name: 'Multiple Choice',
      icon: CheckSquare,
      description: 'Users can select multiple options'
    },
    {
      id: 'ranking',
      name: 'Ranking Poll',
      icon: ArrowUpDown,
      description: 'Users rank options in order of preference'
    },
    {
      id: 'rating',
      name: 'Rating Poll',
      icon: Star,
      description: 'Users rate each option on a scale'
    },
    {
      id: 'matrix',
      name: 'Matrix Poll',
      icon: BarChart3,
      description: 'Multiple questions with same answer choices'
    },
    {
      id: 'demographic',
      name: 'Demographic Poll',
      icon: Users,
      description: 'Collect demographic data with responses'
    },
    {
      id: 'scheduled',
      name: 'Scheduled Poll',
      icon: Calendar,
      description: 'Poll opens and closes at specific times'
    },
    {
      id: 'quota',
      name: 'Quota Poll',
      icon: Target,
      description: 'Poll closes when target responses reached'
    }
  ];

  const updateConfig = () => {
    const config: AdvancedPollConfig = {
      pollType: selectedType,
      title,
      description,
      options,
      settings
    };
    onConfigChange(config);
  };

  const addOption = () => {
    const newId = (options.length + 1).toString();
    setOptions([...options, { id: newId, text: `Option ${newId}` }]);
  };

  const updateOption = (id: string, field: keyof PollOption, value: string) => {
    setOptions(options.map(opt => 
      opt.id === id ? { ...opt, [field]: value } : opt
    ));
  };

  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter(opt => opt.id !== id));
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const renderPollTypeSettings = () => {
    switch (selectedType) {
      case 'multiple_choice':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Maximum selections allowed</Label>
              <Input
                type="number"
                min="2"
                max={options.length}
                value={settings.maxSelections || 3}
                onChange={(e) => updateSetting('maxSelections', parseInt(e.target.value))}
                className="w-20"
              />
            </div>
          </div>
        );

      case 'ranking':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={settings.allowPartialRanking || false}
                onCheckedChange={(checked) => updateSetting('allowPartialRanking', checked)}
              />
              <Label>Allow partial ranking</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={settings.showRankNumbers || true}
                onCheckedChange={(checked) => updateSetting('showRankNumbers', checked)}
              />
              <Label>Show rank numbers</Label>
            </div>
          </div>
        );

      case 'rating':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rating scale</Label>
              <Select
                value={settings.ratingScale || '5'}
                onValueChange={(value) => updateSetting('ratingScale', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">1-3 Scale</SelectItem>
                  <SelectItem value="5">1-5 Scale</SelectItem>
                  <SelectItem value="7">1-7 Scale</SelectItem>
                  <SelectItem value="10">1-10 Scale</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Scale labels</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Low label (e.g., Poor)"
                  value={settings.lowLabel || ''}
                  onChange={(e) => updateSetting('lowLabel', e.target.value)}
                />
                <Input
                  placeholder="High label (e.g., Excellent)"
                  value={settings.highLabel || ''}
                  onChange={(e) => updateSetting('highLabel', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 'scheduled':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start date/time</Label>
                <Input
                  type="datetime-local"
                  value={settings.startDate || ''}
                  onChange={(e) => updateSetting('startDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End date/time</Label>
                <Input
                  type="datetime-local"
                  value={settings.endDate || ''}
                  onChange={(e) => updateSetting('endDate', e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={settings.showCountdown || true}
                onCheckedChange={(checked) => updateSetting('showCountdown', checked)}
              />
              <Label>Show countdown timer</Label>
            </div>
          </div>
        );

      case 'quota':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Target responses</Label>
              <Input
                type="number"
                min="10"
                value={settings.targetResponses || 100}
                onChange={(e) => updateSetting('targetResponses', parseInt(e.target.value))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={settings.showProgress || true}
                onCheckedChange={(checked) => updateSetting('showProgress', checked)}
              />
              <Label>Show progress bar</Label>
            </div>
          </div>
        );

      case 'demographic':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Demographic questions</Label>
              <div className="space-y-2">
                {['Age', 'Gender', 'Region', 'Education', 'Income'].map(demo => (
                  <div key={demo} className="flex items-center space-x-2">
                    <Checkbox
                      checked={settings.demographics?.[demo] || false}
                      onCheckedChange={(checked) => 
                        updateSetting('demographics', {
                          ...settings.demographics,
                          [demo]: checked
                        })
                      }
                    />
                    <Label>{demo}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Poll Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Poll Type</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedType}
            onValueChange={setSelectedType}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {pollTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div key={type.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={type.id} id={type.id} />
                  <Label 
                    htmlFor={type.id} 
                    className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border hover:bg-muted flex-1"
                  >
                    <Icon className="w-5 h-5" />
                    <div>
                      <div className="font-medium">{type.name}</div>
                      <div className="text-xs text-muted-foreground">{type.description}</div>
                    </div>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Poll Content */}
      <Card>
        <CardHeader>
          <CardTitle>Poll Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="poll-title">Poll Title</Label>
            <Input
              id="poll-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your poll question"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="poll-description">Description (Optional)</Label>
            <Textarea
              id="poll-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide additional context for your poll"
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Poll Options</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={addOption}
                disabled={options.length >= 10}
              >
                Add Option
              </Button>
            </div>
            
            {options.map((option, index) => (
              <div key={option.id} className="space-y-2 p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{index + 1}</Badge>
                  <Input
                    value={option.text}
                    onChange={(e) => updateOption(option.id, 'text', e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                  {options.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(option.id)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                
                {['ranking', 'rating', 'matrix'].includes(selectedType) && (
                  <Input
                    value={option.description || ''}
                    onChange={(e) => updateOption(option.id, 'description', e.target.value)}
                    placeholder="Option description (optional)"
                    className="text-sm"
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Type-specific Settings */}
      {selectedType !== 'single_choice' && (
        <Card>
          <CardHeader>
            <CardTitle>Poll Settings</CardTitle>
          </CardHeader>
          <CardContent>
            {renderPollTypeSettings()}
          </CardContent>
        </Card>
      )}

      {/* Preview & Save */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Type:</strong> {pollTypes.find(t => t.id === selectedType)?.name}
            </div>
            <div>
              <strong>Options:</strong> {options.length}
            </div>
          </div>
          
          <Button onClick={updateConfig} className="w-full">
            Apply Configuration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};