import React from 'react'
import { MonumentBackground } from './MonumentBackground'
import { HeartbeatLogo } from './HeartbeatLogo'
import { CivicBanner } from './CivicBanner'
import { PartyGrid } from './PartyGrid'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Users, Vote, Shield, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface Emergence2035HomePageProps {
  className?: string
}

export const Emergence2035HomePage: React.FC<Emergence2035HomePageProps> = ({ className }) => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const quickActions = [
    {
      title: "Pulse Feed",
      description: "Suivez l'actualité politique",
      icon: Users,
      path: "/pulse",
      color: "from-theme-primary to-theme-primary/80"
    },
    {
      title: "Sondages",
      description: "Participez aux débats",
      icon: Vote,
      path: "/polls",
      color: "from-theme-secondary to-theme-secondary/80"
    },
    {
      title: "Politiciens",
      description: "Découvrez les leaders",
      icon: Shield,
      path: "/politicians",
      color: "from-theme-accent to-theme-accent/80"
    },
    {
      title: "Marketplace",
      description: "Commerce équitable",
      icon: TrendingUp,
      path: "/marketplace",
      color: "from-theme-primary to-theme-secondary"
    }
  ]

  return (
    <div className={cn("relative min-h-screen", className)}>
      {/* Monument Background */}
      <MonumentBackground className="text-theme-text" />
      
      <div className="relative z-10 container mx-auto px-4 py-8 space-y-12">
        {/* Hero Section with Heartbeat Logo */}
        <section className="text-center py-12 md:py-20">
          <HeartbeatLogo showAnimation={true} />
        </section>

        {/* Civic Banner */}
        <section>
          <CivicBanner />
        </section>

        {/* Quick Actions */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className={cn(
              "text-2xl md:text-3xl font-bold text-theme-text mb-4",
              "font-[family-name:var(--theme-font-heading)]"
            )}>
              Agissez pour le Cameroun
            </h2>
            <p className="text-theme-text/70 max-w-2xl mx-auto">
              Participez activement à la démocratie camerounaise avec nos outils d'engagement civique
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => {
              const IconComponent = action.icon
              return (
                <Card 
                  key={action.path}
                  className={cn(
                    "group cursor-pointer transition-all duration-300 hover:shadow-lg",
                    "border border-theme-accent/20 hover:border-theme-accent/40",
                    "bg-gradient-to-br from-theme-card to-theme-card/80"
                  )}
                  onClick={() => navigate(action.path)}
                >
                  <CardContent className="p-6 text-center space-y-4">
                    <div className={cn(
                      "mx-auto w-16 h-16 rounded-full flex items-center justify-center",
                      `bg-gradient-to-br ${action.color}`,
                      "group-hover:scale-110 transition-transform duration-300"
                    )}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    
                    <div>
                      <h3 className={cn(
                        "font-semibold text-theme-text group-hover:text-theme-primary transition-colors",
                        "font-[family-name:var(--theme-font-heading)]"
                      )}>
                        {action.title}
                      </h3>
                      <p className="text-sm text-theme-text/70 mt-1">
                        {action.description}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="group-hover:bg-theme-primary/10 transition-colors"
                    >
                      Accéder
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Political Parties Grid */}
        <section>
          <PartyGrid />
        </section>

        {/* Call to Action */}
        <section className={cn(
          "text-center py-16 px-8 rounded-3xl",
          "bg-gradient-to-r from-theme-primary/10 via-theme-accent/10 to-theme-secondary/10",
          "border border-theme-accent/20"
        )}>
          <h2 className={cn(
            "text-3xl md:text-4xl font-bold text-theme-text mb-4",
            "font-[family-name:var(--theme-font-heading)]"
          )}>
            Ensemble vers 2035
          </h2>
          <p className="text-lg text-theme-text/70 mb-8 max-w-3xl mx-auto">
            Rejoignez le mouvement qui transforme le Cameroun. Votre engagement aujourd'hui façonne notre nation de demain.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user && (
              <Button
                onClick={() => navigate('/auth')}
                className={cn(
                  "bg-gradient-to-r from-theme-primary to-theme-secondary",
                  "hover:opacity-90 transition-opacity",
                  "text-white font-medium px-8 py-3 text-lg"
                )}
              >
                Rejoindre CamerPulse
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={() => navigate('/pulse')}
              className={cn(
                "border-theme-primary text-theme-primary hover:bg-theme-primary/10",
                "px-8 py-3 text-lg"
              )}
            >
              Explorer le Pulse
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}