import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeConfig } from '@/contexts/ThemeContext';
import { 
  Crown, 
  Star, 
  Lightbulb, 
  Users, 
  TrendingUp, 
  MessageCircle,
  Heart,
  Globe,
  Shield
} from 'lucide-react';

interface ThemePreviewProps {
  theme: ThemeConfig;
  isActive?: boolean;
  onActivate?: () => void;
  showDemo?: boolean;
}

export const ThemePreview: React.FC<ThemePreviewProps> = ({ 
  theme, 
  isActive = false, 
  onActivate,
  showDemo = true
}) => {
  // Apply theme colors to a container for preview
  const getPreviewStyles = () => {
    switch (theme.id) {
      case 'lux-aeterna':
        return {
          primary: 'hsl(220, 90%, 15%)',
          secondary: 'hsl(45, 95%, 60%)',
          accent: 'hsl(355, 85%, 45%)',
          background: 'hsl(45, 25%, 98%)',
          card: 'hsl(45, 30%, 99%)',
          foreground: 'hsl(220, 90%, 8%)'
        };
      case 'emergence-2035':
        return {
          primary: 'hsl(12, 85%, 35%)',
          secondary: 'hsl(145, 75%, 25%)',
          accent: 'hsl(48, 95%, 45%)',
          background: 'hsl(0, 0%, 97%)',
          card: 'hsl(0, 0%, 99%)',
          foreground: 'hsl(0, 0%, 8%)'
        };
      default:
        return {
          primary: 'hsl(142, 69%, 40%)',
          secondary: 'hsl(210, 40%, 98%)',
          accent: 'hsl(46, 100%, 60%)',
          background: 'hsl(0, 0%, 100%)',
          card: 'hsl(0, 0%, 100%)',
          foreground: 'hsl(222, 84%, 5%)'
        };
    }
  };

  const previewStyles = getPreviewStyles();

  const getThemeIcon = () => {
    switch (theme.id) {
      case 'lux-aeterna': return Crown;
      case 'emergence-2035': return Star;
      default: return Lightbulb;
    }
  };

  const getThemeContent = () => {
    switch (theme.id) {
      case 'lux-aeterna':
        return {
          title: 'Eternal Light',
          subtitle: 'Where hope illuminates the fatherland',
          features: ['Patriotic Unity', 'Noble Leadership', 'Eternal Light'],
          stats: { users: '4.2M+', hope: '∞', light: '99%' }
        };
      case 'emergence-2035':
        return {
          title: 'Vision 2035',
          subtitle: 'Building the future together',
          features: ['Economic Growth', 'Democratic Progress', 'Global Integration'],
          stats: { year: '2035', progress: '85%', vision: '100%' }
        };
      default:
        return {
          title: 'CamerPulse',
          subtitle: 'Civic intelligence platform',
          features: ['Live Sentiment', 'Politician Ratings', 'Verified Commerce'],
          stats: { users: '2.5M+', pulses: '180K+', verified: '95%' }
        };
    }
  };

  const themeContent = getThemeContent();
  const ThemeIcon = getThemeIcon();

  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
        isActive ? 'ring-2 ring-primary shadow-lg scale-105' : ''
      }`}
      style={{
        backgroundColor: previewStyles.background,
        color: previewStyles.foreground,
        borderColor: previewStyles.primary + '20'
      }}
    >
      {/* Theme Color Bar */}
      <div 
        className="h-2 w-full"
        style={{
          background: `linear-gradient(90deg, ${previewStyles.primary}, ${previewStyles.secondary}, ${previewStyles.accent})`
        }}
      />

      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: previewStyles.primary }}
            >
              <ThemeIcon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg" style={{ color: previewStyles.foreground }}>
                {theme.name}
              </CardTitle>
              <p className="text-sm opacity-70">{themeContent.subtitle}</p>
            </div>
          </div>
          {isActive && (
            <Badge 
              style={{ 
                backgroundColor: previewStyles.accent, 
                color: 'white' 
              }}
            >
              Active
            </Badge>
          )}
        </div>
        <p className="text-sm opacity-80 mt-2">
          {theme.description}
        </p>
      </CardHeader>

      {showDemo && (
        <CardContent className="space-y-4">
          {/* Mini Header Demo */}
          <div 
            className="p-3 rounded-lg text-white text-sm"
            style={{
              background: `linear-gradient(135deg, ${previewStyles.primary}, ${previewStyles.secondary})`
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ThemeIcon className="w-4 h-4" />
                <span className="font-medium">{themeContent.title}</span>
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                <div className="w-2 h-2 bg-white/30 rounded-full"></div>
                <div className="w-2 h-2 bg-white/20 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Feature List */}
          <div className="space-y-2">
            {themeContent.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: previewStyles.accent }}
                />
                <span style={{ color: previewStyles.foreground }}>{feature}</span>
              </div>
            ))}
          </div>

          {/* Stats Preview */}
          <div 
            className="grid grid-cols-3 gap-2 p-3 rounded-lg text-center"
            style={{ backgroundColor: previewStyles.card }}
          >
            {Object.entries(themeContent.stats).map(([key, value]) => (
              <div key={key}>
                <div 
                  className="text-lg font-bold"
                  style={{ color: previewStyles.primary }}
                >
                  {value}
                </div>
                <div className="text-xs opacity-60 capitalize">{key}</div>
              </div>
            ))}
          </div>

          {/* Color Palette */}
          <div className="flex space-x-2">
            <div 
              className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: previewStyles.primary }}
              title="Primary"
            />
            <div 
              className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: previewStyles.secondary }}
              title="Secondary"
            />
            <div 
              className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: previewStyles.accent }}
              title="Accent"
            />
          </div>
        </CardContent>
      )}

      {/* Activation Button */}
      {onActivate && !isActive && (
        <div className="p-4 pt-0">
          <Button 
            onClick={onActivate}
            className="w-full"
            style={{
              backgroundColor: previewStyles.primary,
              color: 'white'
            }}
          >
            Activate Theme
          </Button>
        </div>
      )}

      {/* Theme-specific decoration */}
      {theme.id === 'lux-aeterna' && (
        <div className="absolute top-2 right-2 opacity-10">
          <Crown className="w-8 h-8" style={{ color: previewStyles.secondary }} />
        </div>
      )}
      {theme.id === 'emergence-2035' && (
        <div className="absolute top-2 right-2 opacity-10">
          <Star className="w-8 h-8" style={{ color: previewStyles.accent }} />
        </div>
      )}
    </Card>
  );
};