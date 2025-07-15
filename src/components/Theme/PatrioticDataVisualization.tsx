import React, { useEffect, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface PatrioticDataVisualizationProps {
  data?: {
    sentimentTrend: Array<{ time: string; hope: number; unity: number; progress: number }>
    regionalMood: Array<{ region: string; sentiment: number; color: string }>
    engagementMetrics: Array<{ metric: string; value: number; color: string }>
  }
}

export const PatrioticDataVisualization: React.FC<PatrioticDataVisualizationProps> = ({ data }) => {
  const { currentTheme } = useTheme()
  const [animatedData, setAnimatedData] = useState<any>(null)

  // Default patriotic data
  const defaultData = {
    sentimentTrend: [
      { time: '06:00', hope: 65, unity: 70, progress: 60 },
      { time: '09:00', hope: 72, unity: 75, progress: 68 },
      { time: '12:00', hope: 80, unity: 85, progress: 75 },
      { time: '15:00', hope: 85, unity: 88, progress: 82 },
      { time: '18:00', hope: 90, unity: 92, progress: 88 },
      { time: '21:00', hope: 87, unity: 89, progress: 85 },
    ],
    regionalMood: [
      { region: 'Centre', sentiment: 85, color: '#fbbf24' },
      { region: 'Nord', sentiment: 78, color: '#10b981' },
      { region: 'Sud', sentiment: 82, color: '#ef4444' },
      { region: 'Est', sentiment: 76, color: '#8b5cf6' },
      { region: 'Ouest', sentiment: 80, color: '#f97316' },
    ],
    engagementMetrics: [
      { metric: 'Civic Participation', value: 92, color: '#fbbf24' },
      { metric: 'Democratic Trust', value: 87, color: '#10b981' },
      { metric: 'National Unity', value: 94, color: '#ef4444' },
      { metric: 'Hope Index', value: 96, color: '#8b5cf6' },
    ]
  }

  const chartData = data || defaultData

  useEffect(() => {
    if (currentTheme.id !== 'lux-aeterna') return

    // Animate data on load
    setTimeout(() => setAnimatedData(chartData), 500)
  }, [currentTheme.id, chartData])

  if (currentTheme.id !== 'lux-aeterna') return null

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg border border-yellow-200 shadow-lg">
          <p className="font-semibold text-yellow-800">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value}%
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
      <h3 className="text-2xl font-bold text-center text-yellow-800 mb-6">
        🇨🇲 Pulse of the Fatherland
      </h3>

      {/* Sentiment Trend Chart */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <h4 className="text-lg font-semibold text-yellow-700 mb-4">National Spirit Throughout the Day</h4>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={animatedData?.sentimentTrend || chartData.sentimentTrend}>
            <defs>
              <linearGradient id="hopeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="unityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="hope"
              stroke="#fbbf24"
              strokeWidth={3}
              fill="url(#hopeGradient)"
              name="Hope"
            />
            <Area
              type="monotone"
              dataKey="unity"
              stroke="#10b981"
              strokeWidth={3}
              fill="url(#unityGradient)"
              name="Unity"
            />
            <Area
              type="monotone"
              dataKey="progress"
              stroke="#ef4444"
              strokeWidth={3}
              fill="url(#progressGradient)"
              name="Progress"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Regional Mood Chart */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <h4 className="text-lg font-semibold text-yellow-700 mb-4">Regional Patriotic Spirit</h4>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData.regionalMood}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="sentiment"
            >
              {chartData.regionalMood.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {chartData.regionalMood.map((region, index) => (
            <div key={index} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: region.color }}
              />
              <span className="text-sm text-gray-600">{region.region}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <h4 className="text-lg font-semibold text-yellow-700 mb-4">Democratic Engagement Index</h4>
        <div className="space-y-3">
          {chartData.engagementMetrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{metric.metric}</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${metric.value}%`,
                      backgroundColor: metric.color,
                      animationDelay: `${index * 200}ms`
                    }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-800">{metric.value}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Patriotic Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Citizens', value: '4.2M+', icon: '👥' },
          { label: 'Daily Hope', value: '96%', icon: '✨' },
          { label: 'Unity Score', value: '94%', icon: '🤝' },
          { label: 'Light Verified', value: '∞', icon: '🌟' }
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-yellow-400 to-amber-500 text-white p-4 rounded-lg text-center shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-xl font-bold">{stat.value}</div>
            <div className="text-xs opacity-90">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}