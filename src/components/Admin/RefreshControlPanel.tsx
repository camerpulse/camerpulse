import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  RefreshCw, 
  Clock, 
  Activity, 
  Settings, 
  PlayCircle, 
  PauseCircle,
  Zap,
  AlertTriangle,
  Users,
  BarChart3,
  Shield,
  Monitor
} from 'lucide-react'
import { useRefresh } from '@/contexts/RefreshContext'
import { useWebSocketAlerts } from '@/hooks/useWebSocketAlerts'
import { toast } from '@/hooks/use-toast'

const COMPONENT_ICONS = {
  sentiment_streams: Activity,
  trend_radar: BarChart3,
  election_alerts: AlertTriangle,
  civic_warnings: Shield,
  official_profiles: Users,
  party_statistics: BarChart3,
  dashboard_widgets: Monitor,
  admin_metrics: Settings
}

const COMPONENT_NAMES = {
  sentiment_streams: 'Sentiment Streams',
  trend_radar: 'Trend Radar',
  election_alerts: 'Election Alerts',
  civic_warnings: 'Civic Warnings',
  official_profiles: 'Official Profiles',
  party_statistics: 'Party Statistics',
  dashboard_widgets: 'Dashboard Widgets',
  admin_metrics: 'Admin Metrics'
}

export const RefreshControlPanel: React.FC = () => {
  const { config, state, updateConfig, toggleAutoRefresh, manualRefresh, getNextRefreshTime } = useRefresh()
  const [customIntervals, setCustomIntervals] = useState<Record<string, string>>({})
  
  const { sendTestAlert } = useWebSocketAlerts({
    onUrgentAlert: (alert) => {
      toast({
        title: "🚨 Urgent Alert",
        description: alert.message,
        variant: "destructive"
      })
    },
    onElectionUpdate: (update) => {
      toast({
        title: "📊 Election Update",
        description: "New election data available"
      })
    },
    onCivicWarning: (warning) => {
      toast({
        title: "⚠️ Civic Warning",
        description: warning.message,
        variant: "destructive"
      })
    }
  })

  const formatDuration = (ms: number): string => {
    if (ms < 60000) return `${ms / 1000}s`
    if (ms < 3600000) return `${ms / 60000}m`
    return `${ms / 3600000}h`
  }

  const handleIntervalUpdate = (component: string) => {
    const value = customIntervals[component]
    if (!value) return

    const seconds = parseInt(value)
    if (isNaN(seconds) || seconds < 5) {
      toast({
        title: "Invalid Interval",
        description: "Minimum interval is 5 seconds",
        variant: "destructive"
      })
      return
    }

    updateConfig({ [component]: seconds * 1000 })
    setCustomIntervals(prev => ({ ...prev, [component]: '' }))
    
    toast({
      title: "Interval Updated",
      description: `${COMPONENT_NAMES[component as keyof typeof COMPONENT_NAMES]} now refreshes every ${seconds}s`
    })
  }

  const getStatusColor = (component: string): "default" | "secondary" | "destructive" | "outline" => {
    const error = state.errors[component]
    if (error) return 'destructive'
    
    const lastRefresh = state.lastRefresh[component]
    const interval = config[component as keyof typeof config]
    
    if (!lastRefresh) return 'secondary'
    
    const timeSince = Date.now() - lastRefresh.getTime()
    if (timeSince > interval * 1.5) return 'destructive'
    if (timeSince > interval) return 'default'
    
    return 'default'
  }

  return (
    <div className="space-y-6">
      {/* System Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Smart Refresh System
          </CardTitle>
          <CardDescription>
            Control how often different parts of CamerPulse update with live data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Auto-Refresh System</Label>
              <p className="text-xs text-muted-foreground">
                Enable or disable automatic refreshing across the platform
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge 
                variant={state.isActive ? 'default' : 'secondary'}
                className="flex items-center gap-1"
              >
                {state.isActive ? <PlayCircle className="h-3 w-3" /> : <PauseCircle className="h-3 w-3" />}
                {state.isActive ? 'Active' : 'Paused'}
              </Badge>
              <Switch
                checked={state.isActive}
                onCheckedChange={toggleAutoRefresh}
              />
            </div>
          </div>

          <Separator />

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={sendTestAlert}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Test WebSocket Alert
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Component Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Component Refresh Settings</CardTitle>
          <CardDescription>
            Configure individual refresh intervals for each system component
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {Object.entries(COMPONENT_NAMES).map(([component, name]) => {
              const Icon = COMPONENT_ICONS[component as keyof typeof COMPONENT_ICONS]
              const interval = config[component as keyof typeof config]
              const lastRefresh = state.lastRefresh[component]
              const refreshCount = state.refreshCounts[component] || 0
              const error = state.errors[component]
              const nextRefresh = getNextRefreshTime(component)

              return (
                <div key={component} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">{name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Every {formatDuration(interval)} • {refreshCount} refreshes
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(component)}>
                        {error ? 'Error' : lastRefresh ? 'Active' : 'Waiting'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => manualRefresh(component)}
                        disabled={!state.isActive}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Status Info */}
                  <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium">Last Refresh:</span><br />
                      {lastRefresh ? lastRefresh.toLocaleTimeString() : 'Never'}
                    </div>
                    <div>
                      <span className="font-medium">Next Refresh:</span><br />
                      {nextRefresh && state.isActive ? nextRefresh.toLocaleTimeString() : 'Paused'}
                    </div>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                      <strong>Error:</strong> {error}
                    </div>
                  )}

                  {/* Custom Interval Input */}
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Seconds (min: 5)"
                      type="number"
                      min="5"
                      value={customIntervals[component] || ''}
                      onChange={(e) => setCustomIntervals(prev => ({ 
                        ...prev, 
                        [component]: e.target.value 
                      }))}
                      className="w-32"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleIntervalUpdate(component)}
                      disabled={!customIntervals[component]}
                    >
                      Update
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* System Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            System Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">
                {Object.values(state.refreshCounts).reduce((sum, count) => sum + count, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Refreshes</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {Object.values(state.errors).filter(Boolean).length}
              </div>
              <div className="text-sm text-muted-foreground">Active Errors</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {Object.keys(state.lastRefresh).length}
              </div>
              <div className="text-sm text-muted-foreground">Active Components</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}