import React from 'react'
import { PresidentialHero } from './PresidentialHero'
import { ImpactMetrics } from './ImpactMetrics'
import { VoiceOfTheVoiceless } from './VoiceOfTheVoiceless'
import { PartyGrid } from './PartyGrid'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Vote, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Shield, 
  Heart,
  ArrowRight,
  Star
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface Emergence2035HomePageProps {
  className?: string
}

export const Emergence2035HomePage: React.FC<Emergence2035HomePageProps> = ({ className }) => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const powerfulActions = [
    {
      title: "Citizen Pulse",
      description: "Express yourself, debate, influence national decisions",
      icon: MessageSquare,
      path: "/pulse",
      gradient: "from-primary to-primary/80",
      highlight: "Your voice matters"
    },
    {
      title: "Votes & Polls",
      description: "Participate in consultations that shape our democracy",
      icon: Vote,
      path: "/polls",
      gradient: "from-secondary to-accent",
      highlight: "Direct democracy"
    },
    {
      title: "Transparent Politicians",
      description: "Evaluate, follow and hold your representatives accountable",
      icon: Shield,
      path: "/politicians",
      gradient: "from-accent to-accent/80",
      highlight: "Total transparency"
    },
    {
      title: "Social Engagement",
      description: "Connect with other engaged citizens",
      icon: Users,
      path: "/social",
      gradient: "from-primary via-accent to-secondary",
      highlight: "Collective strength"
    }
  ]

  return (
    <div className={cn("relative min-h-screen", className)}>
      {/* Presidential Hero Section */}
      <PresidentialHero />

      {/* Impact Metrics Dashboard */}
      <ImpactMetrics />

      {/* Powerful Actions Grid */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={cn(
              "text-4xl md:text-5xl font-bold text-foreground mb-6",
              "font-['Playfair_Display',serif]"
            )}>
              Your Democratic Power
            </h2>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
              Four powerful ways to actively participate in Cameroonian democracy 
              and influence the future of our nation
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {powerfulActions.map((action, index) => {
              const IconComponent = action.icon
              return (
                <Card
                  key={index}
                  className={cn(
                    "group relative overflow-hidden cursor-pointer",
                    "border border-border hover:border-primary/40",
                    "transition-all duration-500 hover:shadow-2xl transform hover:scale-[1.02]",
                    "bg-gradient-to-br from-card via-background to-card"
                  )}
                  onClick={() => navigate(action.path)}
                >
                  <CardContent className="p-8 relative">
                    {/* Background gradient overlay */}
                    <div className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500",
                      `bg-gradient-to-br ${action.gradient}`
                    )} />

                    <div className="relative">
                      {/* Highlight badge */}
                      <div className={cn(
                        "inline-flex items-center px-3 py-1 mb-4 text-xs font-bold rounded-full",
                        "bg-accent/10 border border-accent/30 text-accent"
                      )}>
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        {action.highlight}
                      </div>

                      {/* Icon */}
                      <div className={cn(
                        "p-4 rounded-2xl mb-6 inline-flex",
                        `bg-gradient-to-br ${action.gradient}`,
                        "group-hover:scale-110 transition-transform duration-300"
                      )}>
                        <IconComponent className="h-10 w-10 text-white" />
                      </div>

                      {/* Content */}
                      <h3 className={cn(
                        "text-2xl font-bold text-foreground mb-4",
                        "font-['Playfair_Display',serif]",
                        "group-hover:text-primary transition-colors"
                      )}>
                        {action.title}
                      </h3>

                      <p className="text-foreground/70 mb-6 leading-relaxed">
                        {action.description}
                      </p>

                      {/* Action button */}
                      <Button
                        variant="outline"
                        className={cn(
                          "group-hover:bg-primary/10 group-hover:border-primary",
                          "transition-all duration-300 font-medium"
                        )}
                      >
                        Access
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Voice of the Voiceless */}
      <VoiceOfTheVoiceless />

      {/* Political Parties Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <PartyGrid />
        </div>
      </section>

      {/* Presidential Call to Action */}
      <section className={cn(
        "py-20 relative overflow-hidden",
        "bg-gradient-to-br from-primary via-accent to-secondary"
      )}>
        {/* Presidential pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <defs>
              <pattern id="presidential-cta-pattern" x="0" y="0" width="25" height="25" patternUnits="userSpaceOnUse">
                <path d="M12.5 3 L15 10 L22 10 L16.5 15 L19 22 L12.5 18 L6 22 L8.5 15 L3 10 L10 10 Z" 
                      fill="white" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#presidential-cta-pattern)"/>
          </svg>
        </div>

        <div className="relative container mx-auto px-6 text-center">
          <h2 className={cn(
            "text-4xl md:text-5xl font-bold text-white mb-8",
            "font-['Playfair_Display',serif]"
          )}>
            Together, Let's Build Cameroon 2035
          </h2>
          
          <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            Emergence is not a dream, it's a commitment. Join the movement that transforms 
            our nation through citizen engagement and participatory democracy.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {!user && (
              <Button
                onClick={() => navigate('/auth')}
                className={cn(
                  "bg-white text-primary hover:bg-white/90",
                  "font-bold text-lg px-8 py-4 rounded-xl shadow-xl",
                  "transform hover:scale-105 transition-all duration-300"
                )}
              >
                <Heart className="h-5 w-5 mr-3" />
                JOIN THE DEMOCRATIC REVOLUTION
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={() => navigate('/pulse')}
              className={cn(
                "border-white/30 text-white hover:bg-white/10",
                "font-bold text-lg px-8 py-4 rounded-xl",
                "backdrop-blur-sm"
              )}
            >
              <TrendingUp className="h-5 w-5 mr-3" />
              EXPLORE THE PULSE
            </Button>
          </div>

          {/* National motto */}
          <div className="mt-16 pt-8 border-t border-white/20">
            <p className={cn(
              "text-white/80 text-lg font-medium tracking-wide",
              "font-['Playfair_Display',serif]"
            )}>
              "PEACE • WORK • FATHERLAND" 🇨🇲
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}