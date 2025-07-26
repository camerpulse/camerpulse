import React, { useMemo } from 'react';
import { TreePine, Users, Eye, Star, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FamilyTree, useAncestorRelationships } from '@/hooks/useVillageGenealogy';

interface FamilyTreeViewerProps {
  familyTree: FamilyTree;
  compact?: boolean;
}

export const FamilyTreeViewer: React.FC<FamilyTreeViewerProps> = ({
  familyTree,
  compact = false
}) => {
  const { data: relationships = [] } = useAncestorRelationships(familyTree.founding_ancestor_id);

  // Create a simplified tree structure
  const treeData = useMemo(() => {
    if (!relationships.length) return null;

    // Group relationships by generation level
    const generations = new Map();
    const processed = new Set();

    const processAncestor = (ancestorId: string, level: number = 0) => {
      if (processed.has(ancestorId)) return;
      processed.add(ancestorId);

      if (!generations.has(level)) {
        generations.set(level, []);
      }

      const ancestor = relationships.find(r => 
        r.ancestor_id === ancestorId || r.related_ancestor_id === ancestorId
      );

      if (ancestor) {
        generations.get(level).push(ancestor);
        
        // Process children (next generation)
        const children = relationships.filter(r => 
          r.ancestor_id === ancestorId && r.relationship_type === 'parent'
        );
        
        children.forEach(child => {
          processAncestor(child.related_ancestor_id, level + 1);
        });
      }
    };

    if (familyTree.founding_ancestor_id) {
      processAncestor(familyTree.founding_ancestor_id);
    }

    return Array.from(generations.entries()).sort((a, b) => a[0] - b[0]);
  }, [relationships, familyTree.founding_ancestor_id]);

  const getVisibilityColor = () => {
    switch (familyTree.tree_visibility) {
      case 'public':
        return 'bg-green-100 text-green-800';
      case 'village':
        return 'bg-blue-100 text-blue-800';
      case 'family':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVisibilityIcon = () => {
    switch (familyTree.tree_visibility) {
      case 'public':
        return <Eye className="h-3 w-3" />;
      case 'village':
        return <Users className="h-3 w-3" />;
      case 'family':
        return <Crown className="h-3 w-3" />;
      default:
        return <Eye className="h-3 w-3" />;
    }
  };

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {familyTree.is_founding_lineage && (
              <Star className="h-4 w-4 text-amber-500" />
            )}
            <h4 className="font-semibold">{familyTree.tree_name}</h4>
          </div>
          <Badge variant="secondary" className={getVisibilityColor()}>
            {getVisibilityIcon()}
            <span className="ml-1 capitalize">{familyTree.tree_visibility}</span>
          </Badge>
        </div>

        {familyTree.tree_description && (
          <p className="text-sm text-muted-foreground">
            {familyTree.tree_description}
          </p>
        )}

        <div className="text-sm text-muted-foreground">
          {relationships.length} family connections documented
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TreePine className="h-5 w-5" />
              {familyTree.tree_name}
              {familyTree.is_founding_lineage && (
                <Star className="h-4 w-4 text-amber-500" />
              )}
            </CardTitle>
            {familyTree.tree_description && (
              <p className="text-muted-foreground mt-1">
                {familyTree.tree_description}
              </p>
            )}
          </div>
          <Badge variant="secondary" className={getVisibilityColor()}>
            {getVisibilityIcon()}
            <span className="ml-1 capitalize">{familyTree.tree_visibility}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {!treeData || treeData.length === 0 ? (
          <div className="text-center py-8">
            <TreePine className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-semibold mb-2">Family Tree Structure</h4>
            <p className="text-sm text-muted-foreground mb-4">
              No family relationships have been mapped yet.
            </p>
            <Button variant="outline" size="sm">
              Add Family Members
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tree visualization */}
            <div className="space-y-4">
              {treeData.map(([generation, members], idx) => (
                <div key={generation} className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Generation {generation + 1}
                    {generation === 0 && ' (Founding)'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {members.map((relationship: any) => {
                      const ancestor = relationship.ancestor || relationship.related_ancestor;
                      return (
                        <div
                          key={relationship.id}
                          className="p-3 border rounded-lg bg-card"
                        >
                          <div className="font-medium text-sm">
                            {ancestor?.full_name || 'Unknown'}
                          </div>
                          {ancestor?.occupation && (
                            <div className="text-xs text-muted-foreground">
                              {ancestor.occupation}
                            </div>
                          )}
                          {relationship.relationship_type && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {relationship.relationship_type}
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex justify-center gap-2 pt-4 border-t">
              <Button variant="outline" size="sm">
                View Full Tree
              </Button>
              <Button variant="outline" size="sm">
                Add Member
              </Button>
              <Button variant="outline" size="sm">
                Export Tree
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};