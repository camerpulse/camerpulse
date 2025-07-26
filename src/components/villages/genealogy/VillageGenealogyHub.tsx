import React, { useState } from 'react';
import { Search, Users, TreePine, Plus, Crown, Eye, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVillageAncestors, useVillageFamilyTrees, useSearchAncestors } from '@/hooks/useVillageGenealogy';
import { AddAncestorDialog } from './AddAncestorDialog';
import { FamilyTreeViewer } from './FamilyTreeViewer';
import { AncestorProfileCard } from './AncestorProfileCard';

interface VillageGenealogyHubProps {
  villageId: string;
  villageName: string;
}

export const VillageGenealogyHub: React.FC<VillageGenealogyHubProps> = ({
  villageId,
  villageName
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddAncestor, setShowAddAncestor] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  const { data: ancestors = [], isLoading: ancestorsLoading } = useVillageAncestors(villageId);
  const { data: familyTrees = [], isLoading: treesLoading } = useVillageFamilyTrees(villageId);
  const { data: searchResults = [] } = useSearchAncestors(searchTerm);

  const filteredAncestors = searchTerm 
    ? searchResults.filter(a => a.village_id === villageId)
    : ancestors;

  const verifiedAncestors = ancestors.filter(a => a.verified_by_elders);
  const foundingLineages = familyTrees.filter(t => t.is_founding_lineage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Village Genealogy</h2>
          <p className="text-muted-foreground">
            Explore the ancestral heritage of {villageName}
          </p>
        </div>
        <Button onClick={() => setShowAddAncestor(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Ancestor
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{ancestors.length}</div>
                <div className="text-sm text-muted-foreground">Total Ancestors</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              <div>
                <div className="text-2xl font-bold">{verifiedAncestors.length}</div>
                <div className="text-sm text-muted-foreground">Elder Verified</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TreePine className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{familyTrees.length}</div>
                <div className="text-sm text-muted-foreground">Family Trees</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{foundingLineages.length}</div>
                <div className="text-sm text-muted-foreground">Founding Lineages</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search ancestors by name, occupation, or title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ancestors">Ancestors</TabsTrigger>
          <TabsTrigger value="trees">Family Trees</TabsTrigger>
          <TabsTrigger value="lineages">Founding Lineages</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Founding Families Preview */}
          {foundingLineages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TreePine className="h-5 w-5" />
                  Founding Lineages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {foundingLineages.slice(0, 4).map((tree) => (
                    <div key={tree.id} className="p-4 border rounded-lg">
                      <h4 className="font-semibold">{tree.tree_name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {tree.tree_description}
                      </p>
                      <Badge variant="secondary" className="mt-2">
                        Founding Family
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notable Ancestors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Notable Ancestors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {verifiedAncestors.slice(0, 6).map((ancestor) => (
                  <AncestorProfileCard key={ancestor.id} ancestor={ancestor} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ancestors" className="space-y-4">
          {ancestorsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading ancestors...</p>
            </div>
          ) : filteredAncestors.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Ancestors Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? "No ancestors match your search criteria." 
                    : "Be the first to add an ancestor to this village's heritage."
                  }
                </p>
                <Button onClick={() => setShowAddAncestor(true)}>
                  Add First Ancestor
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAncestors.map((ancestor) => (
                <AncestorProfileCard key={ancestor.id} ancestor={ancestor} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="trees" className="space-y-4">
          {treesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading family trees...</p>
            </div>
          ) : familyTrees.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <TreePine className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Family Trees</h3>
                <p className="text-muted-foreground mb-4">
                  Create the first family tree to map ancestral connections.
                </p>
                <Button>Create Family Tree</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {familyTrees.map((tree) => (
                <FamilyTreeViewer key={tree.id} familyTree={tree} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="lineages" className="space-y-4">
          {foundingLineages.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Founding Lineages</h3>
                <p className="text-muted-foreground mb-4">
                  Mark family trees as founding lineages to preserve the village's origin stories.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {foundingLineages.map((tree) => (
                <Card key={tree.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Star className="h-5 w-5 text-amber-500" />
                          {tree.tree_name}
                        </CardTitle>
                        <p className="text-muted-foreground mt-1">
                          {tree.tree_description}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        <Eye className="h-3 w-3 mr-1" />
                        {tree.tree_visibility}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <FamilyTreeViewer familyTree={tree} compact />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Ancestor Dialog */}
      <AddAncestorDialog
        open={showAddAncestor}
        onOpenChange={setShowAddAncestor}
        villageId={villageId}
      />
    </div>
  );
};