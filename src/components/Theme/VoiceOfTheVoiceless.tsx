import React from 'react'
import { Quote, User, MapPin, Heart, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface VoiceOfTheVoicelessProps {
  className?: string
}

export const VoiceOfTheVoiceless: React.FC<VoiceOfTheVoicelessProps> = ({ className }) => {
  const testimonials = [
    {
      name: "Marie Ndongo",
      location: "Douala, Littoral",
      role: "Merchant",
      quote: "Thanks to CamerPulse, I was able to voice my concerns about transportation issues in my city. Our roads have finally improved!",
      impact: "Urban transport improved",
      verified: true
    },
    {
      name: "Jean-Baptiste Fokou",
      location: "Bafoussam, West",
      role: "Farmer",
      quote: "I reported difficulties accessing markets. Now we have a new collection center in our region.",
      impact: "Agricultural infrastructure",
      verified: true
    },
    {
      name: "Aisha Manga",
      location: "Maroua, Far North",
      role: "Teacher",
      quote: "My school lacked materials. After posting on the platform, we received new equipment!",
      impact: "Education strengthened",
      verified: true
    }
  ]

  const impactStats = [
    { icon: Heart, number: "12,450", label: "Voices amplified" },
    { icon: TrendingUp, number: "89%", label: "Issues resolved" },
    { icon: MapPin, number: "237", label: "Municipalities impacted" },
    { icon: User, number: "3.2M", label: "Citizens engaged" }
  ]

  return (
    <section className={cn("py-20 bg-muted/30", className)}>
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className={cn(
            "text-4xl md:text-5xl font-bold text-foreground mb-6",
            "font-['Playfair_Display',serif]"
          )}>
            Voice of the Voiceless
          </h2>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
            Discover how ordinary citizens transform their communities through democratic engagement. 
            Every voice counts, every action has measurable impact.
          </p>
        </div>

        {/* Impact Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {impactStats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <div
                key={index}
                className={cn(
                  "text-center p-6 rounded-xl",
                  "bg-gradient-to-br from-card to-background",
                  "border border-border",
                  "hover:shadow-lg transition-all duration-300 group"
                )}
              >
                <IconComponent className="h-10 w-10 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
                <div className={cn(
                  "text-3xl font-bold text-primary mb-2",
                  "font-['Playfair_Display',serif]"
                )}>
                  {stat.number}
                </div>
                <p className="text-foreground/70 font-medium">{stat.label}</p>
              </div>
            )
          })}
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className={cn(
                "relative overflow-hidden group",
                "border border-primary/20 hover:border-primary/40",
                "transition-all duration-500 hover:shadow-xl",
                "bg-gradient-to-br from-card via-background to-card"
              )}
            >
              <CardContent className="p-8">
                {/* Quote */}
                <Quote className="h-8 w-8 text-accent/60 mb-4" />
                <blockquote className="text-foreground/90 mb-6 leading-relaxed italic">
                  "{testimonial.quote}"
                </blockquote>

                {/* Impact Badge */}
                <div className={cn(
                  "inline-flex items-center px-3 py-1 mb-4 text-xs font-bold rounded-full",
                  "bg-gradient-to-r from-accent/20 to-accent/10",
                  "border border-accent/30 text-accent"
                )}>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {testimonial.impact}
                </div>

                {/* Author Info */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-foreground/70">{testimonial.role}</p>
                    <div className="flex items-center mt-1 text-xs text-foreground/60">
                      <MapPin className="h-3 w-3 mr-1" />
                      {testimonial.location}
                    </div>
                  </div>
                  {testimonial.verified && (
                    <div className={cn(
                      "flex items-center px-2 py-1 rounded-full text-xs",
                      "bg-primary/10 border border-primary/20 text-primary"
                    )}>
                      <Heart className="h-3 w-3 mr-1 fill-current" />
                      Verified
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className={cn(
          "text-center p-12 rounded-2xl",
          "bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5",
          "border border-border"
        )}>
          <h3 className={cn(
            "text-3xl font-bold text-foreground mb-4",
            "font-['Playfair_Display',serif]"
          )}>
            Your Voice Can Change Things
          </h3>
          <p className="text-lg text-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of Cameroonians who use their voice to build 
            a more just, transparent and prosperous society.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className={cn(
                "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90",
                "text-white font-bold px-8 py-4 rounded-xl",
                "shadow-lg hover:shadow-xl transition-all duration-300"
              )}
            >
              <Heart className="h-5 w-5 mr-2" />
              Share My Story
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className={cn(
                "border-primary/30 text-primary hover:bg-primary/10",
                "font-bold px-8 py-4 rounded-xl"
              )}
            >
              <Quote className="h-5 w-5 mr-2" />
              Discover More Testimonials
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}