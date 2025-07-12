import React, { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { 
  Palette, 
  Eye, 
  Check, 
  Settings,
  Star,
  Flag,
  Sparkles,
  Monitor,
  Smartphone,
  RefreshCw
} from 'lucide-react'

export const ThemeManagement: React.FC = () => {
  const { currentTheme, availableThemes, switchTheme, isLoading } = useTheme()
  const { toast } = useToast()
  const [previewTheme, setPreviewTheme] = useState<string | null>(null)
  const [isApplying, setIsApplying] = useState(false)

  const handleSwitchTheme = async (themeId: string) => {
    try {
      setIsApplying(true)
      await switchTheme(themeId)
      toast({
        title: "Thème activé",
        description: "Le nouveau thème a été appliqué avec succès"
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'activer le thème",
        variant: "destructive"
      })
    } finally {
      setIsApplying(false)
    }
  }

  const getThemePreview = (themeId: string) => {
    const theme = availableThemes.find(t => t.id === themeId)
    if (!theme) return null

    return (
      <div className="grid grid-cols-3 gap-1 h-6 w-12 rounded border overflow-hidden">
        <div 
          className="h-full" 
          style={{ backgroundColor: theme.colors.primary.replace('hsl(', '').replace(')', '').includes(',') ? `hsl(${theme.colors.primary.replace('hsl(', '').replace(')', '')})` : theme.colors.primary }}
        />
        <div 
          className="h-full" 
          style={{ backgroundColor: theme.colors.secondary.replace('hsl(', '').replace(')', '').includes(',') ? `hsl(${theme.colors.secondary.replace('hsl(', '').replace(')', '')})` : theme.colors.secondary }}
        />
        <div 
          className="h-full" 
          style={{ backgroundColor: theme.colors.accent.replace('hsl(', '').replace(')', '').includes(',') ? `hsl(${theme.colors.accent.replace('hsl(', '').replace(')', '')})` : theme.colors.accent }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Theme Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Thème Actuel
            </span>
            <Badge variant="default" className="bg-green-100 text-green-800">
              Actif
            </Badge>
          </CardTitle>
          <CardDescription>
            Thème actuellement appliqué sur CamerPulse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-4">
              {getThemePreview(currentTheme.id)}
              <div>
                <h3 className="font-semibold">{currentTheme.name}</h3>
                <p className="text-sm text-muted-foreground">{currentTheme.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">Appliqué</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Themes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Thèmes Disponibles
          </CardTitle>
          <CardDescription>
            Gérez et activez les différents thèmes visuels de CamerPulse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {availableThemes.map((theme) => (
              <Card 
                key={theme.id}
                className={cn(
                  "transition-all duration-200",
                  theme.id === currentTheme.id && "ring-2 ring-primary border-primary/50",
                  previewTheme === theme.id && "ring-2 ring-blue-500 border-blue-500/50"
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Theme Preview */}
                      {getThemePreview(theme.id)}
                      
                      {/* Theme Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{theme.name}</h3>
                          {theme.id === 'emergence-2035' && (
                            <Badge className="bg-gradient-to-r from-red-500 to-yellow-500 text-white">
                              <Star className="h-3 w-3 mr-1" />
                              2035
                            </Badge>
                          )}
                          {theme.id === currentTheme.id && (
                            <Badge variant="default">Actuel</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">{theme.description}</p>
                        
                        {/* Theme Features */}
                        <div className="flex flex-wrap gap-2">
                          {theme.components.showMonumentBackground && (
                            <Badge variant="outline" className="text-xs">
                              <Flag className="h-3 w-3 mr-1" />
                              Monuments
                            </Badge>
                          )}
                          {theme.components.showHeartbeatLogo && (
                            <Badge variant="outline" className="text-xs">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Logo Animé
                            </Badge>
                          )}
                          {theme.components.showCivicBanner && (
                            <Badge variant="outline" className="text-xs">
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Bannière Civique
                            </Badge>
                          )}
                          {theme.components.showPartyGrid && (
                            <Badge variant="outline" className="text-xs">
                              <Monitor className="h-3 w-3 mr-1" />
                              Grille Partis
                            </Badge>
                          )}
                        </div>

                        {/* Font Info */}
                        <div className="mt-2 text-xs text-muted-foreground">
                          Police: {theme.fonts.heading} • Responsive: 
                          <Smartphone className="inline h-3 w-3 mx-1" />
                          {theme.components.partyGridColumns.mobile} cols, 
                          <Monitor className="inline h-3 w-3 mx-1" />
                          {theme.components.partyGridColumns.desktop} cols
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewTheme(previewTheme === theme.id ? null : theme.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {previewTheme === theme.id ? 'Masquer' : 'Aperçu'}
                      </Button>
                      
                      {theme.id !== currentTheme.id && (
                        <Button
                          onClick={() => handleSwitchTheme(theme.id)}
                          disabled={isApplying || isLoading}
                          className={cn(
                            theme.id === 'emergence-2035' && 
                            "bg-gradient-to-r from-red-500 to-yellow-500 hover:opacity-90"
                          )}
                        >
                          {isApplying ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 mr-2" />
                          )}
                          Activer
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Preview Section */}
                  {previewTheme === theme.id && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <h4 className="font-medium mb-3">Aperçu du thème</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Color Palette */}
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">Palette de couleurs</h5>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-center">
                              <div 
                                className="w-full h-8 rounded border mb-1"
                                style={{ backgroundColor: theme.colors.primary.includes('hsl') ? theme.colors.primary : `hsl(${theme.colors.primary})` }}
                              />
                              <span className="text-xs text-muted-foreground">Primaire</span>
                            </div>
                            <div className="text-center">
                              <div 
                                className="w-full h-8 rounded border mb-1"
                                style={{ backgroundColor: theme.colors.secondary.includes('hsl') ? theme.colors.secondary : `hsl(${theme.colors.secondary})` }}
                              />
                              <span className="text-xs text-muted-foreground">Secondaire</span>
                            </div>
                            <div className="text-center">
                              <div 
                                className="w-full h-8 rounded border mb-1"
                                style={{ backgroundColor: theme.colors.accent.includes('hsl') ? theme.colors.accent : `hsl(${theme.colors.accent})` }}
                              />
                              <span className="text-xs text-muted-foreground">Accent</span>
                            </div>
                          </div>
                        </div>

                        {/* Typography */}
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">Typographie</h5>
                          <div className="space-y-1">
                            <div 
                              className="text-lg font-bold"
                              style={{ fontFamily: theme.fonts.heading }}
                            >
                              Titre principal ({theme.fonts.heading})
                            </div>
                            <div 
                              className="text-sm"
                              style={{ fontFamily: theme.fonts.body }}
                            >
                              Texte de contenu ({theme.fonts.body})
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Paramètres des Thèmes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-theme">Application automatique</Label>
                <p className="text-sm text-muted-foreground">
                  Appliquer automatiquement les thèmes lors de leur activation
                </p>
              </div>
              <Switch id="auto-theme" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="preview-mode">Mode aperçu</Label>
                <p className="text-sm text-muted-foreground">
                  Permettre la prévisualisation des thèmes avant activation
                </p>
              </div>
              <Switch id="preview-mode" defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}