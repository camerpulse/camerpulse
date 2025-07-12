import React, { useState } from 'react'
import { Quote, Heart, Users, MapPin, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoiceOfTheVoicelessProps {
  className?: string
}

interface Testimony {
  id: string
  name: string
  location: string
  role: string
  quote: string
  impact: string
  image?: string
}

export const VoiceOfTheVoiceless: React.FC<VoiceOfTheVoicelessProps> = ({ className }) => {
  const [activeTestimony, setActiveTestimony] = useState(0)

  const testimonies: Testimony[] = [
    {
      id: '1',
      name: "Mama Ngozi",
      location: "Douala, Littoral",
      role: "Commerçante",
      quote: "Grâce à CamerPulse, j'ai pu faire entendre ma voix sur les problèmes de marché. Les autorités nous écoutent maintenant.",
      impact: "A contribué à l'amélioration des infrastructures du marché central"
    },
    {
      id: '2',
      name: "Jean-Baptiste",
      location: "Garoua, Nord",
      role: "Jeune Agriculteur",
      quote: "La plateforme m'a permis de participer aux débats sur l'agriculture. Mes idées sont prises en compte dans les politiques locales.",
      impact: "Ses propositions ont été intégrées dans le plan agricole régional"
    },
    {
      id: '3',
      name: "Dr. Fatima",
      location: "Bamenda, Nord-Ouest",
      role: "Médecin Rurale",
      quote: "J'ai pu alerter sur les besoins sanitaires de notre région. L'engagement citoyen fonctionne vraiment.",
      impact: "A obtenu l'augmentation du budget santé de sa circonscription"
    },
    {
      id: '4',
      name: "Paul Mengolo",
      location: "Bertoua, Est",
      role: "Enseignant",
      quote: "Nos revendications pour l'éducation ont été entendues. C'est ça la vraie démocratie participative.",
      impact: "A contribué à la construction de 3 nouvelles écoles primaires"
    }
  ]

  const currentTestimony = testimonies[activeTestimony]

  return (
    <section className={cn(
      "py-20 bg-gradient-to-br from-theme-background via-theme-card to-theme-background",
      "relative overflow-hidden",
      className
    )}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <svg className="w-full h-full" viewBox="0 0 60 60">
          <defs>
            <pattern id="voice-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="20" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
              <path d="M30 15 L35 25 L45 25 L37 32 L40 42 L30 37 L20 42 L23 32 L15 25 L25 25 Z" 
                    fill="currentColor" opacity="0.2"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#voice-pattern)"/>
        </svg>
      </div>

      <div className="relative container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className={cn(
              "p-4 rounded-full",
              "bg-gradient-to-br from-theme-primary/10 via-theme-accent/10 to-theme-secondary/10",
              "border border-theme-accent/20"
            )}>
              <Heart className="h-10 w-10 text-theme-primary" />
            </div>
          </div>
          
          <h2 className={cn(
            "text-4xl md:text-5xl font-bold text-theme-text mb-6",
            "font-[family-name:var(--theme-font-heading)]"
          )}>
            La Voix des Sans-Voix
          </h2>
          
          <p className="text-xl text-theme-text/70 max-w-3xl mx-auto leading-relaxed">
            Chaque citoyen camerounais a une histoire. Découvrez comment CamerPulse 
            amplifie les voix de ceux qui n'étaient pas entendus.
          </p>
        </div>

        {/* Main Testimony Display */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className={cn(
            "relative p-8 md:p-12 rounded-3xl",
            "bg-gradient-to-br from-theme-card via-theme-background to-theme-card",
            "border border-theme-accent/20 shadow-2xl",
            "overflow-hidden"
          )}>
            {/* Decorative quote marks */}
            <Quote className="absolute top-6 left-6 h-12 w-12 text-theme-accent/20" />
            <Quote className="absolute bottom-6 right-6 h-12 w-12 text-theme-accent/20 rotate-180" />

            <div className="relative">
              {/* Quote */}
              <blockquote className={cn(
                "text-2xl md:text-3xl text-theme-text leading-relaxed mb-8 italic",
                "font-[family-name:var(--theme-font-heading)]"
              )}>
                "{currentTestimony.quote}"
              </blockquote>

              {/* Author Info */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                  <div className={cn(
                    "text-xl font-bold text-theme-primary mb-1",
                    "font-[family-name:var(--theme-font-heading)]"
                  )}>
                    {currentTestimony.name}
                  </div>
                  
                  <div className="flex items-center text-theme-text/70 mb-2">
                    <MapPin className="h-4 w-4 mr-2" />
                    {currentTestimony.location}
                  </div>
                  
                  <div className="text-theme-text/80 font-medium">
                    {currentTestimony.role}
                  </div>
                </div>

                {/* Impact Badge */}
                <div className={cn(
                  "inline-flex items-center px-4 py-2 rounded-full",
                  "bg-gradient-to-r from-theme-secondary/10 to-theme-secondary/20",
                  "border border-theme-secondary/30",
                  "text-theme-secondary font-medium text-sm max-w-md"
                )}>
                  <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{currentTestimony.impact}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimony Navigation */}
        <div className="flex justify-center mb-12">
          <div className="flex space-x-3">
            {testimonies.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTestimony(index)}
                className={cn(
                  "w-4 h-4 rounded-full transition-all duration-300",
                  index === activeTestimony
                    ? "bg-gradient-to-r from-theme-primary to-theme-accent w-12"
                    : "bg-theme-text/20 hover:bg-theme-text/40"
                )}
                aria-label={`Témoignage ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              number: "50,000+",
              label: "Voix Amplifiées",
              description: "Citoyens dont les préoccupations ont été entendues"
            },
            {
              number: "1,247",
              label: "Actions Concrètes",
              description: "Mesures prises suite aux remontées citoyennes"
            },
            {
              number: "89%",
              label: "Satisfaction",
              description: "Des utilisateurs se sentent mieux représentés"
            }
          ].map((stat, index) => (
            <div
              key={index}
              className={cn(
                "text-center p-6 rounded-xl",
                "bg-gradient-to-br from-theme-card/50 to-theme-background/50",
                "border border-theme-accent/10"
              )}
            >
              <div className={cn(
                "text-3xl md:text-4xl font-bold text-theme-primary mb-2",
                "font-[family-name:var(--theme-font-heading)]"
              )}>
                {stat.number}
              </div>
              <div className="font-semibold text-theme-text mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-theme-text/60">
                {stat.description}
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className={cn(
            "inline-flex items-center px-8 py-4 rounded-xl",
            "bg-gradient-to-r from-theme-primary via-theme-accent to-theme-secondary",
            "text-white font-bold text-lg shadow-xl",
            "hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer",
            "font-[family-name:var(--theme-font-heading)]"
          )}>
            <Heart className="h-5 w-5 mr-3" />
            PARTAGEZ VOTRE HISTOIRE
          </div>
          <p className="text-theme-text/60 mt-4 max-w-2xl mx-auto">
            Votre voix compte. Rejoignez des milliers de Camerounais qui façonnent l'avenir de notre nation.
          </p>
        </div>
      </div>
    </section>
  )
}