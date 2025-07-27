import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTraditionalRecipes } from '@/hooks/useTraditionalRecipes';
import { 
  ChefHat, 
  Plus, 
  Clock, 
  Users, 
  Star,
  Eye,
  Utensils
} from 'lucide-react';

export const TraditionalRecipeSharing = () => {
  const villageId = 'default-village-id'; // This would come from context or props
  const { recipes, loading, submitRecipe } = useTraditionalRecipes(villageId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRecipe, setNewRecipe] = useState({
    recipe_name: '',
    description: '',
    ingredients: '',
    preparation_steps: '',
    cooking_time_minutes: 60,
    difficulty_level: 'easy',
    cultural_significance: '',
    special_occasions: '',
    family_lineage: ''
  });

  const difficultyLevels = ['easy', 'medium', 'hard'];

  const resetForm = () => {
    setNewRecipe({
      recipe_name: '',
      description: '',
      ingredients: '',
      preparation_steps: '',
      cooking_time_minutes: 60,
      difficulty_level: 'easy',
      cultural_significance: '',
      special_occasions: '',
      family_lineage: ''
    });
  };

  const handleSaveRecipe = async () => {
    if (!newRecipe.recipe_name || !newRecipe.ingredients) {
      return;
    }

    try {
      await submitRecipe(newRecipe);
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <ChefHat className="h-6 w-6 mr-2 text-primary" />
            Traditional Recipe Sharing
          </h2>
          <p className="text-muted-foreground">
            Share and preserve traditional Cameroonian recipes
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Recipe
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Traditional Recipe</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipe_name">Recipe Name *</Label>
                <Input
                  id="recipe_name"
                  value={newRecipe.recipe_name}
                  onChange={(e) => setNewRecipe(prev => ({ ...prev, recipe_name: e.target.value }))}
                  placeholder="e.g., Ndolé"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newRecipe.description}
                  onChange={(e) => setNewRecipe(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the dish and its significance..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ingredients">Ingredients *</Label>
                <Textarea
                  id="ingredients"
                  value={newRecipe.ingredients}
                  onChange={(e) => setNewRecipe(prev => ({ ...prev, ingredients: e.target.value }))}
                  placeholder="List all ingredients with quantities..."
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preparation_steps">Preparation Steps</Label>
                <Textarea
                  id="preparation_steps"
                  value={newRecipe.preparation_steps}
                  onChange={(e) => setNewRecipe(prev => ({ ...prev, preparation_steps: e.target.value }))}
                  placeholder="Step by step cooking instructions..."
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cooking_time">Cooking Time (minutes)</Label>
                  <Input
                    id="cooking_time"
                    type="number"
                    value={newRecipe.cooking_time_minutes}
                    onChange={(e) => setNewRecipe(prev => ({ ...prev, cooking_time_minutes: parseInt(e.target.value) || 0 }))}
                    placeholder="60"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty_level">Difficulty</Label>
                  <Select
                    value={newRecipe.difficulty_level}
                    onValueChange={(value) => setNewRecipe(prev => ({ ...prev, difficulty_level: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyLevels.map(level => (
                        <SelectItem key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cultural_significance">Cultural Significance</Label>
                <Textarea
                  id="cultural_significance"
                  value={newRecipe.cultural_significance}
                  onChange={(e) => setNewRecipe(prev => ({ ...prev, cultural_significance: e.target.value }))}
                  placeholder="Explain the cultural importance and traditions around this dish..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="special_occasions">Special Occasions</Label>
                <Input
                  id="special_occasions"
                  value={newRecipe.special_occasions}
                  onChange={(e) => setNewRecipe(prev => ({ ...prev, special_occasions: e.target.value }))}
                  placeholder="When is this dish typically served?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="family_lineage">Family Lineage</Label>
                <Input
                  id="family_lineage"
                  value={newRecipe.family_lineage}
                  onChange={(e) => setNewRecipe(prev => ({ ...prev, family_lineage: e.target.value }))}
                  placeholder="Family or lineage this recipe comes from"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveRecipe}>
                  Add Recipe
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Recipes List */}
      <Card>
        <CardHeader>
          <CardTitle>Traditional Recipes</CardTitle>
          <CardDescription>
            Authentic Cameroonian recipes passed down through generations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading recipes...</div>
          ) : !recipes?.length ? (
            <div className="text-center py-8">
              <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No recipes yet</h3>
              <p className="text-muted-foreground">
                Start sharing traditional recipes to preserve culinary heritage
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <Card key={recipe.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{recipe.recipe_name}</CardTitle>
                      <Badge className={getDifficultyColor(recipe.difficulty_level)}>
                        {recipe.difficulty_level}
                      </Badge>
                    </div>
                    {recipe.family_lineage && (
                      <p className="text-sm text-muted-foreground">{recipe.family_lineage}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">{recipe.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        {recipe.cooking_time_minutes && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{recipe.cooking_time_minutes} min</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{recipe.views_count || 0}</span>
                      </div>
                    </div>

                    {recipe.cultural_significance && (
                      <div className="p-3 bg-muted/20 rounded text-sm">
                        <p className="font-medium mb-1">Cultural Significance:</p>
                        <p>{recipe.cultural_significance}</p>
                      </div>
                    )}

                    {recipe.traditional_occasions && (
                      <div className="text-sm">
                        <span className="font-medium">Special Occasions:</span> {recipe.traditional_occasions}
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      Added {new Date(recipe.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};