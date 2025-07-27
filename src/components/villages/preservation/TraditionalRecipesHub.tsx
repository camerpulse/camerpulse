import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ChefHat, Clock, Users, Star, Eye, Heart, Plus, Bookmark } from 'lucide-react';
import { useTraditionalRecipes, type TraditionalRecipe } from '@/hooks/useTraditionalRecipes';

interface TraditionalRecipesHubProps {
  villageId: string;
}

export const TraditionalRecipesHub: React.FC<TraditionalRecipesHubProps> = ({ villageId }) => {
  const { recipes, loading, submitRecipe } = useTraditionalRecipes(villageId);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const [formData, setFormData] = useState({
    recipe_name: '',
    description: '',
    origin_story: '',
    ingredients: [] as any[],
    instructions: [] as any[],
    cooking_time_minutes: '',
    serving_size: '',
    difficulty_level: 'medium' as const,
    occasion: [] as string[],
    season: [] as string[],
    cultural_significance: '',
    family_lineage: '',
  });

  const [currentIngredient, setCurrentIngredient] = useState('');
  const [currentInstruction, setCurrentInstruction] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitRecipe({
        ...formData,
        cooking_time_minutes: formData.cooking_time_minutes ? parseInt(formData.cooking_time_minutes) : undefined,
        serving_size: formData.serving_size ? parseInt(formData.serving_size) : undefined,
      });
      setShowAddDialog(false);
      // Reset form
      setFormData({
        recipe_name: '',
        description: '',
        origin_story: '',
        ingredients: [],
        instructions: [],
        cooking_time_minutes: '',
        serving_size: '',
        difficulty_level: 'medium',
        occasion: [],
        season: [],
        cultural_significance: '',
        family_lineage: '',
      });
    } catch (error) {
      console.error('Error submitting recipe:', error);
    }
  };

  const addIngredient = () => {
    if (currentIngredient.trim()) {
      setFormData(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, { name: currentIngredient.trim(), amount: '' }]
      }));
      setCurrentIngredient('');
    }
  };

  const addInstruction = () => {
    if (currentInstruction.trim()) {
      setFormData(prev => ({
        ...prev,
        instructions: [...prev.instructions, { step: prev.instructions.length + 1, description: currentInstruction.trim() }]
      }));
      setCurrentInstruction('');
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

  const filteredRecipes = recipes.filter(recipe => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'easy' || activeFilter === 'medium' || activeFilter === 'hard') {
      return recipe.difficulty_level === activeFilter;
    }
    return recipe.occasion?.includes(activeFilter);
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-cm-green">Traditional Recipes</h2>
          <p className="text-muted-foreground">
            Discover and share authentic village recipes passed down through generations
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-cm-green hover:bg-cm-green/90">
              <Plus className="w-4 h-4 mr-2" />
              Share Recipe
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Share Traditional Recipe</DialogTitle>
              <DialogDescription>
                Preserve your family's culinary heritage by sharing a traditional recipe
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipe_name">Recipe Name *</Label>
                  <Input
                    id="recipe_name"
                    value={formData.recipe_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, recipe_name: e.target.value }))}
                    placeholder="e.g., Ndolé Traditional"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="family_lineage">Family/Clan Origin</Label>
                  <Input
                    id="family_lineage"
                    value={formData.family_lineage}
                    onChange={(e) => setFormData(prev => ({ ...prev, family_lineage: e.target.value }))}
                    placeholder="Which family or clan does this recipe come from?"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this traditional dish..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="origin_story">Origin Story</Label>
                <Textarea
                  id="origin_story"
                  value={formData.origin_story}
                  onChange={(e) => setFormData(prev => ({ ...prev, origin_story: e.target.value }))}
                  placeholder="Tell the story behind this recipe - its history, traditions, special occasions..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cooking_time">Cooking Time (minutes)</Label>
                  <Input
                    id="cooking_time"
                    type="number"
                    value={formData.cooking_time_minutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, cooking_time_minutes: e.target.value }))}
                    placeholder="60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serving_size">Serves</Label>
                  <Input
                    id="serving_size"
                    type="number"
                    value={formData.serving_size}
                    onChange={(e) => setFormData(prev => ({ ...prev, serving_size: e.target.value }))}
                    placeholder="4"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty_level">Difficulty</Label>
                  <Select
                    value={formData.difficulty_level}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, difficulty_level: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Ingredients Section */}
              <div className="space-y-4">
                <Label>Ingredients</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentIngredient}
                    onChange={(e) => setCurrentIngredient(e.target.value)}
                    placeholder="Add an ingredient..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                  />
                  <Button type="button" onClick={addIngredient}>Add</Button>
                </div>
                {formData.ingredients.length > 0 && (
                  <div className="space-y-2">
                    {formData.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <span className="flex-1">{ingredient.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            ingredients: prev.ingredients.filter((_, i) => i !== index)
                          }))}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Instructions Section */}
              <div className="space-y-4">
                <Label>Instructions</Label>
                <div className="flex gap-2">
                  <Textarea
                    value={currentInstruction}
                    onChange={(e) => setCurrentInstruction(e.target.value)}
                    placeholder="Add a cooking step..."
                    rows={2}
                  />
                  <Button type="button" onClick={addInstruction}>Add Step</Button>
                </div>
                {formData.instructions.length > 0 && (
                  <div className="space-y-2">
                    {formData.instructions.map((instruction, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-muted rounded">
                        <Badge variant="outline">{instruction.step}</Badge>
                        <span className="flex-1">{instruction.description}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            instructions: prev.instructions.filter((_, i) => i !== index)
                          }))}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cultural_significance">Cultural Significance</Label>
                <Textarea
                  id="cultural_significance"
                  value={formData.cultural_significance}
                  onChange={(e) => setFormData(prev => ({ ...prev, cultural_significance: e.target.value }))}
                  placeholder="Explain the cultural importance of this recipe, when it's prepared, special occasions..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-cm-green hover:bg-cm-green/90">
                  Share Recipe
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveFilter('all')}
        >
          All Recipes
        </Button>
        <Button
          variant={activeFilter === 'easy' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveFilter('easy')}
        >
          Easy
        </Button>
        <Button
          variant={activeFilter === 'medium' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveFilter('medium')}
        >
          Medium
        </Button>
        <Button
          variant={activeFilter === 'hard' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveFilter('hard')}
        >
          Hard
        </Button>
        <Button
          variant={activeFilter === 'wedding' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveFilter('wedding')}
        >
          Wedding
        </Button>
        <Button
          variant={activeFilter === 'festival' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveFilter('festival')}
        >
          Festival
        </Button>
      </div>

      {/* Recipes Grid */}
      {filteredRecipes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="text-6xl mb-4">🍲</div>
            <p className="text-muted-foreground">
              No traditional recipes shared yet. Be the first to preserve your family's culinary heritage!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <Card key={recipe.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-cm-green" />
                    <div>
                      <CardTitle className="text-lg">{recipe.recipe_name}</CardTitle>
                      <CardDescription className="text-sm">
                        {recipe.family_lineage && `${recipe.family_lineage} family recipe`}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={getDifficultyColor(recipe.difficulty_level)}>
                    {recipe.difficulty_level}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {recipe.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {recipe.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {recipe.cooking_time_minutes && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {recipe.cooking_time_minutes}m
                    </span>
                  )}
                  {recipe.serving_size && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Serves {recipe.serving_size}
                    </span>
                  )}
                </div>

                {recipe.occasion && recipe.occasion.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {recipe.occasion.slice(0, 3).map((occasion) => (
                      <Badge key={occasion} variant="secondary" className="text-xs">
                        {occasion}
                      </Badge>
                    ))}
                    {recipe.occasion.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{recipe.occasion.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {recipe.views_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {recipe.likes_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bookmark className="w-3 h-3" />
                      {recipe.saves_count}
                    </span>
                  </div>
                  {recipe.is_sacred && (
                    <Badge variant="outline" className="text-xs">
                      Sacred
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};