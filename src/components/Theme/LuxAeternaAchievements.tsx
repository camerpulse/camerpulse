import React, { useEffect, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useLuxAeternaFeatures } from '@/hooks/useLuxAeternaFeatures'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Star, Heart, Users } from 'lucide-react'

export const LuxAeternaAchievements: React.FC = () => {
  const { currentTheme } = useTheme()
  const { achievements, addAchievement, triggerCelebration } = useLuxAeternaFeatures()
  const [showAchievements, setShowAchievements] = useState(false)
  const [recentAchievement, setRecentAchievement] = useState<string | null>(null)

  // Demo achievements for showcase
  useEffect(() => {
    if (currentTheme.id !== 'lux-aeterna') return

    // Add sample achievements if none exist
    if (achievements.length === 0) {
      setTimeout(() => {
        addAchievement({
          title: "Patriot of Unity",
          description: "Engaged with civic content to promote national unity"
        })
      }, 2000)

      setTimeout(() => {
        addAchievement({
          title: "Voice of Hope",
          description: "Shared positive messages that inspire democratic participation"
        })
      }, 5000)
    }
  }, [currentTheme.id, achievements.length, addAchievement])

  // Listen for new achievements
  useEffect(() => {
    const handleNewAchievement = () => {
      if (achievements.length > 0) {
        const latest = achievements[achievements.length - 1]
        setRecentAchievement(latest.title)
        triggerCelebration()
        
        setTimeout(() => setRecentAchievement(null), 4000)
      }
    }

    if (achievements.length > 0) {
      handleNewAchievement()
    }
  }, [achievements.length, triggerCelebration])

  if (currentTheme.id !== 'lux-aeterna') return null

  return (
    <>
      {/* Achievements Panel */}
      <div className="fixed top-20 right-4 z-50">
        <button
          onClick={() => setShowAchievements(!showAchievements)}
          className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <Trophy className="h-5 w-5" />
          {achievements.length > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5">
              {achievements.length}
            </Badge>
          )}
        </button>

        {showAchievements && (
          <Card className="absolute top-14 right-0 w-80 max-h-96 overflow-y-auto bg-white/95 backdrop-blur-sm border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-700">
                <Star className="h-5 w-5" />
                Civic Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {achievements.length === 0 ? (
                <p className="text-slate-600 text-sm">
                  Start engaging with civic content to unlock achievements!
                </p>
              ) : (
                achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200"
                  >
                    <h4 className="font-semibold text-yellow-800 mb-1">
                      {achievement.title}
                    </h4>
                    <p className="text-sm text-yellow-700 mb-2">
                      {achievement.description}
                    </p>
                    <div className="text-xs text-yellow-600">
                      Unlocked: {achievement.unlockedAt.toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Achievement Notification */}
      {recentAchievement && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <Card className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-none shadow-2xl">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="bg-white/20 p-2 rounded-full">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold">Achievement Unlocked!</h4>
                <p className="text-sm opacity-90">{recentAchievement}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}