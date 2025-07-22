import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Eye, Building, AlertTriangle } from 'lucide-react';

// Note: This is a simplified map implementation. 
// For a production app, you'd want to use a proper mapping library like Mapbox GL JS or Leaflet
interface MapViewProps {
  audits?: any[];
  height?: string;
  onAuditClick?: (auditId: string) => void;
}

interface AuditLocation {
  id: string;
  title: string;
  entity: string;
  region: string;
  latitude: number;
  longitude: number;
  score?: number;
  coverage_type: 'primary_location' | 'affected_area' | 'investigation_site' | 'related_location';
  impact_severity: 'low' | 'medium' | 'high' | 'critical';
  affected_population?: number;
}

// Mock coordinates for Cameroon regions (in a real app, you'd get these from your database)
const regionCoordinates: Record<string, { lat: number; lng: number }> = {
  'Centre': { lat: 3.8480, lng: 11.5021 },
  'Littoral': { lat: 4.0511, lng: 9.7679 },
  'West': { lat: 5.4690, lng: 10.4199 },
  'Southwest': { lat: 4.6129, lng: 9.2675 },
  'Northwest': { lat: 6.2000, lng: 10.2000 },
  'North': { lat: 8.5000, lng: 13.3500 },
  'Far North': { lat: 10.5000, lng: 14.2000 },
  'Adamawa': { lat: 7.3167, lng: 12.3833 },
  'East': { lat: 4.5000, lng: 14.0000 },
  'South': { lat: 2.9167, lng: 11.5167 }
};

export const AuditMapView: React.FC<MapViewProps> = ({
  audits = [],
  height = '500px',
  onAuditClick
}) => {
  const [selectedAudit, setSelectedAudit] = useState<AuditLocation | null>(null);
  const [auditLocations, setAuditLocations] = useState<AuditLocation[]>([]);

  // Convert audits to map locations with mock coordinates
  useEffect(() => {
    const locations: AuditLocation[] = audits.map((audit, index) => {
      const regionCoord = regionCoordinates[audit.region] || { lat: 3.8480, lng: 11.5021 };
      
      return {
        id: audit.id,
        title: audit.document_title,
        entity: audit.entity_audited,
        region: audit.region,
        latitude: regionCoord.lat + (Math.random() - 0.5) * 0.5, // Add some random offset
        longitude: regionCoord.lng + (Math.random() - 0.5) * 0.5,
        score: audit.audit_score,
        coverage_type: 'primary_location',
        impact_severity: audit.audit_score < 40 ? 'critical' : 
                        audit.audit_score < 60 ? 'high' : 
                        audit.audit_score < 80 ? 'medium' : 'low',
        affected_population: Math.floor(Math.random() * 1000000) + 10000
      };
    });
    
    setAuditLocations(locations);
  }, [audits]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444'; // red-500
      case 'high': return '#f97316'; // orange-500
      case 'medium': return '#eab308'; // yellow-500
      case 'low': return '#22c55e'; // green-500
      default: return '#6b7280'; // gray-500
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleMarkerClick = (location: AuditLocation) => {
    setSelectedAudit(location);
  };

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Audit Coverage Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Interactive Map Notice:</strong> This is a simplified map view. 
              In a production environment, this would be integrated with a full mapping service 
              like Mapbox GL JS or Google Maps for interactive functionality.
            </AlertDescription>
          </Alert>

          {/* Simplified Map Display */}
          <div 
            className="relative border rounded-lg bg-slate-100 overflow-hidden"
            style={{ height }}
          >
            {/* Background pattern to simulate map */}
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#94a3b8" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Title overlay */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <h3 className="font-semibold text-lg">Cameroon Audit Coverage</h3>
              <p className="text-sm text-muted-foreground">
                {auditLocations.length} audit locations mapped
              </p>
            </div>

            {/* Audit markers */}
            <div className="absolute inset-0">
              {auditLocations.map((location) => {
                // Convert lat/lng to approximate pixel positions (simplified)
                const x = ((location.longitude + 20) / 40) * 100; // Rough conversion
                const y = ((20 - location.latitude) / 40) * 100;
                
                return (
                  <div
                    key={location.id}
                    className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group"
                    style={{ 
                      left: `${x}%`, 
                      top: `${y}%`
                    }}
                    onClick={() => handleMarkerClick(location)}
                  >
                    {/* Marker circle */}
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white shadow-lg group-hover:scale-125 transition-transform"
                      style={{ 
                        backgroundColor: getSeverityColor(location.impact_severity)
                      }}
                    />
                    
                    {/* Hover tooltip */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {location.title}
                      <br />
                      {location.entity}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <h4 className="font-medium text-sm mb-2">Impact Severity</h4>
              <div className="space-y-1">
                {[
                  { severity: 'critical', label: 'Critical' },
                  { severity: 'high', label: 'High' },
                  { severity: 'medium', label: 'Medium' },
                  { severity: 'low', label: 'Low' }
                ].map(({ severity, label }) => (
                  <div key={severity} className="flex items-center gap-2 text-xs">
                    <div 
                      className="w-3 h-3 rounded-full border border-white"
                      style={{ backgroundColor: getSeverityColor(severity) }}
                    />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Audit Details */}
      {selectedAudit && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Audit Details</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onAuditClick?.(selectedAudit.id)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Full Audit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">{selectedAudit.title}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedAudit.entity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedAudit.region} Region</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Impact Severity:</span>
                  <Badge className={getSeverityBadgeColor(selectedAudit.impact_severity)}>
                    {selectedAudit.impact_severity}
                  </Badge>
                </div>
                
                {selectedAudit.score && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Audit Score:</span>
                    <span className="font-bold">{selectedAudit.score}/100</span>
                  </div>
                )}
                
                {selectedAudit.affected_population && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Affected Population:</span>
                    <span>{selectedAudit.affected_population.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Regional Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Coverage Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(
              auditLocations.reduce((acc, location) => {
                acc[location.region] = (acc[location.region] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([region, count]) => (
              <div key={region} className="text-center p-3 border rounded-lg">
                <div className="font-semibold text-lg">{count}</div>
                <div className="text-sm text-muted-foreground">{region}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};