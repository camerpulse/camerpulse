import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Users, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface PoliticalParty {
  id: string
  name: string
  acronym?: string
  logo_url?: string
  founding_date?: string
  ideology?: string
  is_active?: boolean
  mps_count?: number
  senators_count?: number
  mayors_count?: number
}

interface PartyGridProps {
  className?: string
  showHeader?: boolean
}

export const PartyGrid: React.FC<PartyGridProps> = ({ 
  className,
  showHeader = true
}) => {
  const { currentTheme } = useTheme()
  const navigate = useNavigate()

  const { data: parties, isLoading } = useQuery({
    queryKey: ['political_parties_grid'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('political_parties')
        .select('*')
        .eq('is_active', true)
        .order('name')
        .limit(20)

      if (error) throw error
      return data as PoliticalParty[]
    }
  })

  const gridColumns = currentTheme.components.partyGridColumns

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        {showHeader && (
          <div className="text-center">
            <div className="h-8 bg-muted animate-pulse rounded w-64 mx-auto mb-2"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-96 mx-auto"></div>
          </div>
        )}
        <div className={cn(
          "grid gap-4",
          `grid-cols-${gridColumns.mobile} md:grid-cols-${gridColumns.desktop}`
        )}>
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-16 bg-muted rounded mb-3"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {showHeader && (
        <div className="text-center">
          <h2 className={cn(
            "text-2xl md:text-3xl font-bold text-theme-text mb-2",
            "font-[family-name:var(--theme-font-heading)]"
          )}>
            Partis Politiques du Cameroun
          </h2>
          <p className={cn(
            "text-theme-text/70 max-w-2xl mx-auto",
            "font-[family-name:var(--theme-font-body)]"
          )}>
            Découvrez les formations politiques qui façonnent l'avenir démocratique de notre nation
          </p>
        </div>
      )}

      <div className={cn(
        "grid gap-4",
        `grid-cols-${gridColumns.mobile} md:grid-cols-${gridColumns.desktop}`
      )}>
        {parties?.map((party) => (
          <Card 
            key={party.id}
            className={cn(
              "group hover:shadow-lg transition-all duration-300 cursor-pointer",
              "border border-theme-accent/20 hover:border-theme-accent/40",
              "bg-gradient-to-br from-theme-card to-theme-card/80"
            )}
            onClick={() => navigate(`/political-parties/${party.id}`)}
          >
            <CardContent className="p-4 space-y-3">
              {/* Party Logo & Acronym */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {party.logo_url ? (
                    <img 
                      src={party.logo_url} 
                      alt={`Logo ${party.name}`}
                      className="h-12 w-12 object-contain rounded-lg bg-muted p-1"
                    />
                  ) : (
                    <div className={cn(
                      "h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-sm",
                      "bg-gradient-to-br from-theme-primary to-theme-secondary"
                    )}>
                      {party.acronym?.slice(0, 3) || party.name.slice(0, 3).toUpperCase()}
                    </div>
                  )}
                  
                  <div className="min-w-0 flex-1">
                    <h3 className={cn(
                      "font-semibold text-theme-text group-hover:text-theme-primary transition-colors",
                      "text-sm md:text-base truncate",
                      "font-[family-name:var(--theme-font-heading)]"
                    )}>
                      {party.acronym || party.name}
                    </h3>
                    {party.acronym && (
                      <p className="text-xs text-theme-text/60 truncate">
                        {party.name}
                      </p>
                    )}
                  </div>
                </div>

                <ExternalLink className="h-4 w-4 text-theme-text/40 group-hover:text-theme-primary transition-colors" />
              </div>

              {/* Party Info */}
              <div className="space-y-2">
                {party.founding_date && (
                  <div className="flex items-center text-xs text-theme-text/60">
                    <Calendar className="h-3 w-3 mr-1" />
                    Fondé en {new Date(party.founding_date).getFullYear()}
                  </div>
                )}

                {party.ideology && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs bg-theme-accent/10 text-theme-text/70 border-theme-accent/20"
                  >
                    {party.ideology}
                  </Badge>
                )}

                {/* Representatives count */}
                <div className="flex items-center justify-between text-xs text-theme-text/60">
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {(party.mps_count || 0) + (party.senators_count || 0) + (party.mayors_count || 0)} élus
                  </div>
                  
                  {party.is_active && (
                    <Badge className="bg-theme-secondary/10 text-theme-secondary border-theme-secondary/20">
                      Actif
                    </Badge>
                  )}
                </div>
              </div>

              {/* View Details Button */}
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "w-full mt-3 text-xs",
                  "border-theme-primary/20 text-theme-primary hover:bg-theme-primary/10",
                  "group-hover:border-theme-primary/40 transition-all"
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/political-parties/${party.id}`)
                }}
              >
                Voir le profil
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View All Button */}
      {parties && parties.length >= 20 && (
        <div className="text-center mt-8">
          <Button
            onClick={() => navigate('/political-parties')}
            className={cn(
              "bg-gradient-to-r from-theme-primary to-theme-secondary",
              "hover:opacity-90 transition-opacity",
              "text-white font-medium"
            )}
          >
            Voir tous les partis politiques
          </Button>
        </div>
      )}
    </div>
  )
}