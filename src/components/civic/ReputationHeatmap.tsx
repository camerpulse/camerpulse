import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { MapPin, Users, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface RegionData {
  region: string;
  averageScore: number;
  totalEntities: number;
  flaggedEntities: number;
  trendDirection: 'up' | 'down' | 'stable';
  topEntity: string;
  coordinates: { x: number; y: number };
}

export function ReputationHeatmap() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'score' | 'entities' | 'flags'>('score');

  // Mock data for Cameroon regions
  const regionsData: RegionData[] = [
    {
      region: 'Adamawa',
      averageScore: 72,
      totalEntities: 156,
      flaggedEntities: 8,
      trendDirection: 'up',
      topEntity: 'Governor Hamadou',
      coordinates: { x: 60, y: 40 }
    },
    {
      region: 'Centre',
      averageScore: 68,
      totalEntities: 320,
      flaggedEntities: 15,
      trendDirection: 'stable',
      topEntity: 'Mayor Ondoa',
      coordinates: { x: 50, y: 55 }
    },
    {
      region: 'East',
      averageScore: 75,
      totalEntities: 142,
      flaggedEntities: 5,
      trendDirection: 'up',
      topEntity: 'MP Belinga',
      coordinates: { x: 70, y: 50 }
    },
    {
      region: 'Far North',
      averageScore: 58,
      totalEntities: 198,
      flaggedEntities: 22,
      trendDirection: 'down',
      topEntity: 'SDO Abubakar',
      coordinates: { x: 45, y: 15 }
    },
    {
      region: 'Littoral',
      averageScore: 71,
      totalEntities: 285,
      flaggedEntities: 12,
      trendDirection: 'stable',
      topEntity: 'Mayor Ekema',
      coordinates: { x: 35, y: 60 }
    },
    {
      region: 'North',
      averageScore: 64,
      totalEntities: 174,
      flaggedEntities: 18,
      trendDirection: 'down',
      topEntity: 'Governor Midjiyawa',
      coordinates: { x: 50, y: 25 }
    },
    {
      region: 'Northwest',
      averageScore: 82,
      totalEntities: 156,
      flaggedEntities: 3,
      trendDirection: 'up',
      topEntity: 'Hon. Tamfu',
      coordinates: { x: 35, y: 35 }
    },
    {
      region: 'South',
      averageScore: 69,
      totalEntities: 98,
      flaggedEntities: 7,
      trendDirection: 'stable',
      topEntity: 'Mayor Etoundi',
      coordinates: { x: 50, y: 75 }
    },
    {
      region: 'Southwest',
      averageScore: 77,
      totalEntities: 134,
      flaggedEntities: 6,
      trendDirection: 'up',
      topEntity: 'MP Motanga',
      coordinates: { x: 25, y: 65 }
    },
    {
      region: 'West',
      averageScore: 79,
      totalEntities: 167,
      flaggedEntities: 4,
      trendDirection: 'up',
      topEntity: 'Mayor Fotso',
      coordinates: { x: 40, y: 45 }
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'hsl(var(--success))';
    if (score >= 60) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-success" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-destructive" />;
      default:
        return <div className="h-3 w-3 rounded-full bg-muted" />;
    }
  };

  const selectedRegionData = regionsData.find(r => r.region === selectedRegion);
  const nationalAverage = Math.round(regionsData.reduce((sum, r) => sum + r.averageScore, 0) / regionsData.length);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Reputation Heatmap</h3>
          <Badge variant="outline" className="bg-primary/10 text-primary">
            National Average: {nationalAverage}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'score' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('score')}
          >
            Scores
          </Button>
          <Button
            variant={viewMode === 'entities' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('entities')}
          >
            Entities
          </Button>
          <Button
            variant={viewMode === 'flags' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('flags')}
          >
            Flags
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Visualization */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Cameroon Regions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-96 bg-muted/30 rounded-lg overflow-hidden">
              {/* Simplified Cameroon map outline */}
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full"
                style={{ background: 'hsl(var(--muted))' }}
              >
                {/* Cameroon border outline */}
                <path
                  d="M20,20 L80,20 L85,40 L80,60 L75,80 L25,85 L15,70 L20,50 Z"
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="0.5"
                  opacity="0.3"
                />
                
                {/* Region points */}
                {regionsData.map((region) => {
                  const intensity = viewMode === 'score' 
                    ? region.averageScore / 100
                    : viewMode === 'entities'
                    ? Math.min(region.totalEntities / 300, 1)
                    : Math.min(region.flaggedEntities / 25, 1);
                  
                  const color = viewMode === 'flags' 
                    ? `hsl(var(--destructive))`
                    : getScoreColor(region.averageScore);
                  
                  return (
                    <g key={region.region}>
                      <circle
                        cx={region.coordinates.x}
                        cy={region.coordinates.y}
                        r={3 + intensity * 4}
                        fill={color}
                        opacity={0.7}
                        className="cursor-pointer hover:opacity-100 transition-opacity"
                        onClick={() => setSelectedRegion(
                          selectedRegion === region.region ? null : region.region
                        )}
                      />
                      <text
                        x={region.coordinates.x}
                        y={region.coordinates.y - 8}
                        textAnchor="middle"
                        className="text-xs fill-foreground font-medium"
                        style={{ fontSize: '2px' }}
                      >
                        {region.region}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span className="text-sm">Excellent (80+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <span className="text-sm">Good (60-79)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <span className="text-sm">Poor (&lt;60)</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Click regions for details
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Region Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {selectedRegionData ? selectedRegionData.region : 'Select Region'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRegionData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold" style={{ color: getScoreColor(selectedRegionData.averageScore) }}>
                      {selectedRegionData.averageScore}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Score</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">
                      {selectedRegionData.totalEntities}
                    </div>
                    <div className="text-sm text-muted-foreground">Entities</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant="secondary" style={{ color: getScoreColor(selectedRegionData.averageScore) }}>
                      {getScoreLabel(selectedRegionData.averageScore)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Trend:</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(selectedRegionData.trendDirection)}
                      <span className="text-sm capitalize">{selectedRegionData.trendDirection}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Top Entity:</span>
                    <span className="text-sm text-muted-foreground">{selectedRegionData.topEntity}</span>
                  </div>

                  {selectedRegionData.flaggedEntities > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Flagged:</span>
                      <div className="flex items-center gap-1 text-destructive">
                        <AlertTriangle className="h-3 w-3" />
                        <span className="text-sm">{selectedRegionData.flaggedEntities}</span>
                      </div>
                    </div>
                  )}
                </div>

                <Button className="w-full" variant="outline">
                  View Region Details
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Click on a region to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Regional Rankings */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regionsData
              .sort((a, b) => b.averageScore - a.averageScore)
              .map((region, index) => (
                <div
                  key={region.region}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedRegion(region.region)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{region.region}</div>
                      <div className="text-sm text-muted-foreground">
                        {region.totalEntities} entities
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(region.trendDirection)}
                    <span className="font-medium" style={{ color: getScoreColor(region.averageScore) }}>
                      {region.averageScore}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}