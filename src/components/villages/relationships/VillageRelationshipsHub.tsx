import React, { useState } from 'react';
import { Users, Plus, MapPin, Calendar, Globe, Network } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useVillageRelationships, useVillageCulturalConnections, useVillageRelationshipStats } from '@/hooks/useVillageRelationships';
import { VillageRelationshipCard } from './VillageRelationshipCard';
import { CulturalConnectionCard } from './CulturalConnectionCard';
import { AddRelationshipDialog } from './AddRelationshipDialog';
import { RelationshipNetworkMap } from './RelationshipNetworkMap';

interface VillageRelationshipsHubProps {
  villageId: string;
}

export const VillageRelationshipsHub: React.FC<VillageRelationshipsHubProps> = ({ villageId }) => {
  const [showAddRelationship, setShowAddRelationship] = useState(false);
  const [activeTab, setActiveTab] = useState('relationships');

  const { data: relationships = [], isLoading: loadingRelationships } = useVillageRelationships(villageId);
  const { data: culturalConnections = [], isLoading: loadingConnections } = useVillageCulturalConnections(villageId);
  const { data: stats } = useVillageRelationshipStats(villageId);

  const getRelationshipStrengthColor = (strength: string) => {
    switch (strength) {
      case 'very_strong': return 'bg-green-100 text-green-800';
      case 'strong': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'weak': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatRelationshipType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loadingRelationships || loadingConnections) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Village Relationships</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Network className="h-6 w-6" />
            Village Relationships
          </h2>
          <p className="text-muted-foreground">
            Discover connections between villages through history, culture, and commerce
          </p>
        </div>
        <Button onClick={() => setShowAddRelationship(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Relationship
        </Button>
      </div>

      {/* Statistics Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Connections</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Sister Villages</p>
                  <p className="text-2xl font-bold">{stats.byType.sister_village || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Trade Partners</p>
                  <p className="text-2xl font-bold">{stats.byType.trade_partner || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Cultural Exchanges</p>
                  <p className="text-2xl font-bold">{stats.byType.cultural_exchange || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="relationships">All Relationships</TabsTrigger>
          <TabsTrigger value="cultural">Cultural Connections</TabsTrigger>
          <TabsTrigger value="network">Network Map</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="relationships" className="space-y-4">
          {relationships.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Village Relationships Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start building connections by documenting relationships with other villages
                </p>
                <Button onClick={() => setShowAddRelationship(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Relationship
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {relationships.map((relationship: any) => (
                <VillageRelationshipCard
                  key={relationship.id}
                  relationship={relationship}
                  currentVillageId={villageId}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cultural" className="space-y-4">
          {culturalConnections.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Cultural Connections Documented</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Document cultural similarities and exchanges with other villages
                </p>
                <Button onClick={() => setShowAddRelationship(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Cultural Connection
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {culturalConnections.map((connection: any) => (
                <CulturalConnectionCard
                  key={connection.id}
                  connection={connection}
                  currentVillageId={villageId}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relationship Network</CardTitle>
            </CardHeader>
            <CardContent>
              <RelationshipNetworkMap
                villageId={villageId}
                relationships={relationships}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Relationship Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats && Object.entries(stats.byType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm">{formatRelationshipType(type)}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Relationship Strength</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats && Object.entries(stats.byStrength).map(([strength, count]) => (
                  <div key={strength} className="flex items-center justify-between">
                    <span className="text-sm">{formatRelationshipType(strength)}</span>
                    <Badge className={getRelationshipStrengthColor(strength)}>
                      {count}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <AddRelationshipDialog
        open={showAddRelationship}
        onOpenChange={setShowAddRelationship}
        villageId={villageId}
      />
    </div>
  );
};