import React from 'react';
import { Network, MapPin } from 'lucide-react';

interface RelationshipNetworkMapProps {
  villageId: string;
  relationships: any[];
}

export const RelationshipNetworkMap: React.FC<RelationshipNetworkMapProps> = ({
  villageId,
  relationships
}) => {
  // This is a placeholder for the network visualization
  // In a real implementation, you would use a library like D3.js, vis.js, or react-force-graph

  const getUniqueVillages = () => {
    const villages = new Set();
    relationships.forEach(rel => {
      if (rel.source_village) villages.add(JSON.stringify(rel.source_village));
      if (rel.target_village) villages.add(JSON.stringify(rel.target_village));
    });
    return Array.from(villages).map(v => JSON.parse(v as string));
  };

  const uniqueVillages = getUniqueVillages();

  if (relationships.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
        <div className="text-center">
          <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No Network to Display</h3>
          <p className="text-sm text-muted-foreground">
            Add village relationships to see the network visualization
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Network Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-2xl font-bold text-primary">{uniqueVillages.length}</p>
          <p className="text-sm text-muted-foreground">Connected Villages</p>
        </div>
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-2xl font-bold text-primary">{relationships.length}</p>
          <p className="text-sm text-muted-foreground">Total Relationships</p>
        </div>
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-2xl font-bold text-primary">
            {relationships.filter(r => r.relationship_strength === 'strong' || r.relationship_strength === 'very_strong').length}
          </p>
          <p className="text-sm text-muted-foreground">Strong Connections</p>
        </div>
      </div>

      {/* Simple Network Visualization Placeholder */}
      <div className="h-96 bg-muted/30 rounded-lg p-6 flex items-center justify-center relative overflow-hidden">
        <div className="text-center">
          <Network className="h-16 w-16 text-primary mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Interactive Network Map</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            This area will display an interactive network visualization showing connections between villages.
            Features would include node sizing based on relationship strength, clustering by relationship type,
            and interactive exploration of the village network.
          </p>
        </div>

        {/* Simple representation of connected villages */}
        <div className="absolute inset-4 pointer-events-none">
          {uniqueVillages.slice(0, 6).map((village, index) => (
            <div
              key={index}
              className="absolute bg-primary/20 rounded-full p-2 border-2 border-primary/40"
              style={{
                left: `${20 + (index % 3) * 30}%`,
                top: `${20 + Math.floor(index / 3) * 40}%`,
              }}
            >
              <MapPin className="h-4 w-4 text-primary" />
              <div className="text-xs font-medium mt-1 text-center min-w-max">
                {village.village_name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Connected Villages List */}
      <div>
        <h4 className="font-semibold mb-3">Connected Villages</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {uniqueVillages.map((village, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-medium">{village.village_name}</p>
                <p className="text-muted-foreground text-xs">{village.region}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};