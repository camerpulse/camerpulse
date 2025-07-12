import React, { useState } from 'react'
import { Star, Plus, MessageCircle, Users, Vote, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

interface EmergenceFABProps {
  className?: string
}

export const EmergenceFAB: React.FC<EmergenceFABProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const actions = [
    {
      icon: MessageCircle,
      label: "Pulse",
      path: "/pulse",
      color: "from-theme-primary to-theme-primary/80"
    },
    {
      icon: Vote,
      label: "Sondage",
      path: "/polls",
      color: "from-theme-secondary to-theme-secondary/80"
    },
    {
      icon: Users,
      label: "Social",
      path: "/social",
      color: "from-theme-accent to-theme-accent/80"
    }
  ]

  const handleActionClick = (path: string) => {
    navigate(path)
    setIsOpen(false)
  }

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      {/* Action buttons */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 space-y-3">
          {actions.map((action, index) => {
            const IconComponent = action.icon
            return (
              <div
                key={action.path}
                className={cn(
                  "flex items-center space-x-3",
                  "animate-fade-in-up"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className={cn(
                  "bg-theme-card text-theme-text px-3 py-1 rounded-lg text-sm font-medium",
                  "border border-theme-accent/20 shadow-lg",
                  "whitespace-nowrap"
                )}>
                  {action.label}
                </span>
                
                <Button
                  size="sm"
                  className={cn(
                    "h-12 w-12 rounded-full shadow-lg",
                    `bg-gradient-to-r ${action.color}`,
                    "text-white border-0 hover:opacity-90",
                    "animate-press touch-manipulation"
                  )}
                  onClick={() => handleActionClick(action.path)}
                >
                  <IconComponent className="h-5 w-5" />
                </Button>
              </div>
            )
          })}
        </div>
      )}

      {/* Main FAB */}
      <Button
        size="lg"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg",
          "bg-gradient-to-r from-theme-primary via-theme-accent to-theme-secondary",
          "text-white border-0 hover:opacity-90",
          "animate-press touch-manipulation relative overflow-hidden"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Patriotic pulse effect */}
        <div className={cn(
          "absolute inset-0 rounded-full",
          "bg-gradient-to-r from-theme-primary/20 via-theme-accent/20 to-theme-secondary/20",
          "animate-ping"
        )} />
        
        {/* Icon */}
        <div className="relative z-10">
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Star className="h-6 w-6 fill-current" />
          )}
        </div>
      </Button>
    </div>
  )
}