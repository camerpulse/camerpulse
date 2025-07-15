import React, { useEffect, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useLuxAeternaAdvancedEffects } from '@/hooks/useLuxAeternaAdvancedEffects'
import { useLuxAeternaAmbientSound } from '@/hooks/useLuxAeternaAmbientSound'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Hand, 
  Eye, 
  MapPin,
  Cloud,
  Sun,
  CloudRain,
  Wind,
  Zap,
  Sparkles
} from 'lucide-react'
import { useLocalStorage } from '@/hooks/useLocalStorage'

export const LuxAeternaControlPanel: React.FC = () => {
  const { currentTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [effectsEnabled, setEffectsEnabled] = useState(true)
  
  const {
    weather,
    gesture,
    voiceEnabled,
    region,
    enableGestureListening,
    disableGestureListening,
    toggleVoiceRecognition
  } = useLuxAeternaAdvancedEffects()
  
  const {
    config: soundConfig,
    toggleSound,
    changeTrack,
    setVolume
  } = useLuxAeternaAmbientSound()

  const [accessibility, setAccessibility] = useState({
    highContrast: false,
    reducedMotion: false,
    enhancedFocus: false
  })

  const [performance, setPerformance] = useLocalStorage('lux-performance', {
    particles: true,
    animations: true,
    fastMode: false
  })

  useEffect(() => {
    if (currentTheme.id !== 'lux-aeterna') return

    // Listen for special effects
    const handlePatrioticGesture = () => {
      document.body.style.animation = 'pulse-celebration 2s ease-in-out'
      setTimeout(() => {
        document.body.style.animation = ''
      }, 2000)
    }

    const handleVoiceActivation = () => {
      // Special voice activation effect
      const flash = document.createElement('div')
      flash.className = 'fixed inset-0 bg-yellow-400/30 pointer-events-none z-50 animate-pulse'
      document.body.appendChild(flash)
      setTimeout(() => document.body.removeChild(flash), 1000)
    }

    window.addEventListener('lux-patriotic-gesture', handlePatrioticGesture)
    window.addEventListener('lux-voice-activation', handleVoiceActivation)

    return () => {
      window.removeEventListener('lux-patriotic-gesture', handlePatrioticGesture)
      window.removeEventListener('lux-voice-activation', handleVoiceActivation)
    }
  }, [currentTheme.id])

  // Apply accessibility settings
  useEffect(() => {
    if (currentTheme.id !== 'lux-aeterna') return

    const root = document.documentElement
    
    if (accessibility.highContrast) {
      root.style.setProperty('--primary', '45 100% 30%')
      root.style.setProperty('--background', '0 0% 100%')
      root.style.setProperty('--foreground', '0 0% 0%')
    }
    
    if (accessibility.reducedMotion) {
      root.style.setProperty('--lux-special-animation', 'none')
    }
    
    if (accessibility.enhancedFocus) {
      root.style.setProperty('--focus-ring', '3px solid hsl(45 95% 60%)')
    }
  }, [accessibility, currentTheme.id])

  if (currentTheme.id !== 'lux-aeterna') return null

  const getWeatherIcon = () => {
    switch (weather.type) {
      case 'sunny': return <Sun className="h-4 w-4" />
      case 'rainy': return <CloudRain className="h-4 w-4" />
      case 'harmattan': return <Wind className="h-4 w-4" />
      default: return <Cloud className="h-4 w-4" />
    }
  }

  return (
    <>
      {/* Control Panel Trigger */}
      <div className="fixed bottom-20 right-4 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white rounded-full p-3 shadow-lg"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Control Panel */}
      {isOpen && (
        <Card className="fixed bottom-32 right-4 w-80 max-h-96 overflow-y-auto bg-white/95 backdrop-blur-sm border-yellow-200 z-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <Eye className="h-5 w-5" />
              Lux Aeterna Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Region & Weather Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">Region: {region}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {weather.season === 'dry' ? 'Dry Season' : 'Wet Season'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                {getWeatherIcon()}
                <span className="text-sm capitalize">{weather.type} Weather</span>
                <div className="ml-auto text-xs text-yellow-600">
                  Intensity: {Math.round(weather.intensity * 100)}%
                </div>
              </div>
            </div>

            {/* Ambient Sound Controls */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Ambient Sound</span>
                <Switch
                  checked={soundConfig.enabled}
                  onCheckedChange={toggleSound}
                />
              </div>
              
              {soundConfig.enabled && (
                <>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      <Slider
                        value={[soundConfig.volume * 100]}
                        onValueChange={([value]) => setVolume(value / 100)}
                        max={100}
                        step={5}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={soundConfig.currentTrack === 'nature' ? 'default' : 'outline'}
                      onClick={() => changeTrack('nature')}
                    >
                      Nature
                    </Button>
                    <Button
                      size="sm"
                      variant={soundConfig.currentTrack === 'anthem' ? 'default' : 'outline'}
                      onClick={() => changeTrack('anthem')}
                    >
                      Anthem
                    </Button>
                    <Button
                      size="sm"
                      variant={soundConfig.currentTrack === 'silence' ? 'default' : 'outline'}
                      onClick={() => changeTrack('silence')}
                    >
                      Silent
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Interaction Controls */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Voice Commands</span>
                <Button
                  size="sm"
                  variant={voiceEnabled ? 'default' : 'outline'}
                  onClick={toggleVoiceRecognition}
                >
                  {voiceEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Gesture Recognition</span>
                <Button
                  size="sm"
                  variant={gesture.isListening ? 'default' : 'outline'}
                  onClick={gesture.isListening ? disableGestureListening : enableGestureListening}
                >
                  <Hand className="h-4 w-4" />
                </Button>
              </div>
              
              {gesture.gestureCount > 0 && (
                <div className="text-xs text-yellow-600">
                  Gestures detected: {gesture.gestureCount}
                </div>
              )}
            </div>

            {/* Accessibility Options */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Accessibility</h4>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs">High Contrast</span>
                  <Switch
                    checked={accessibility.highContrast}
                    onCheckedChange={(checked) => 
                      setAccessibility(prev => ({ ...prev, highContrast: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs">Reduced Motion</span>
                  <Switch
                    checked={accessibility.reducedMotion}
                    onCheckedChange={(checked) => 
                      setAccessibility(prev => ({ ...prev, reducedMotion: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs">Enhanced Focus</span>
                  <Switch
                    checked={accessibility.enhancedFocus}
                    onCheckedChange={(checked) => 
                      setAccessibility(prev => ({ ...prev, enhancedFocus: checked }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Performance Controls */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Performance
              </h4>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs">Fast Mode</span>
                  <Switch
                    checked={performance.fastMode}
                    onCheckedChange={(checked) => 
                      setPerformance(prev => ({ 
                        ...prev, 
                        fastMode: checked,
                        particles: !checked,
                        animations: !checked
                      }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs">Floating Particles</span>
                  <Switch
                    checked={performance.particles && !performance.fastMode}
                    disabled={performance.fastMode}
                    onCheckedChange={(checked) => 
                      setPerformance(prev => ({ ...prev, particles: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs">Smooth Animations</span>
                  <Switch
                    checked={performance.animations && !performance.fastMode}
                    disabled={performance.fastMode}
                    onCheckedChange={(checked) => 
                      setPerformance(prev => ({ ...prev, animations: checked }))
                    }
                  />
                </div>
              </div>
              
              {performance.fastMode && (
                <div className="text-xs text-green-600 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Optimized for speed
                </div>
              )}
            </div>

            {/* Quick Commands */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Voice Commands</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div>"Lux Aeterna" - Special activation</div>
                <div>"Unity" - Trigger unity effect</div>
                <div>"Hope" - Trigger hope effect</div>
                <div>Swipe up - Patriotic celebration</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}