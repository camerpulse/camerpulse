import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  ChefHat, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  Users, 
  MapPin,
  Star,
  Heart,
  BookOpen,
  Utensils,
  Leaf,
  Timer,
  Award,
  Share2
} from 'lucide-react';

interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prep_time_minutes: number;
  cooking_time_minutes: number;
  servings: number;
  difficulty_level: string;
  cuisine_type: string;
  region: string;
  cultural_significance: string;
  family_origin: string;
  nutritional_notes: string;
  seasonal_availability: string[];
  created_by: string;
  created_at: string;
  tags: string[];
  image_url?: string;
  likes_count: number;
  is_vegetarian: boolean;
  is_traditional: boolean;
}

interface NewRecipe {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prep_time_minutes: number;
  cooking_time_minutes: number;
  servings: number;
  difficulty_level: string;
  cuisine_type: string;
  region: string;
  cultural_significance: string;
  family_origin: string;
  nutritional_notes: string;
  seasonal_availability: string[];
  tags: string[];
  is_vegetarian: boolean;
  is_traditional: boolean;
}

export const TraditionalRecipeSharing = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newRecipe, setNewRecipe] = useState<NewRecipe>({
    title: '',
    description: '',
    ingredients: [''],
    instructions: [''],
    prep_time_minutes: 0,
    cooking_time_minutes: 0,
    servings: 4,
    difficulty_level: 'medium',
    cuisine_type: '',
    region: '',
    cultural_significance: '',
    family_origin: '',
    nutritional_notes: '',
    seasonal_availability: [],
    tags: [],
    is_vegetarian: false,
    is_traditional: true,
  });

  // Fetch recipes
  const { data: recipes, isLoading } = useQuery({
    queryKey: ['traditional_recipes', selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('traditional_recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('cuisine_type', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Recipe[];
    },
  });

  // Save recipe mutation
  const saveRecipeMutation = useMutation({
    mutationFn: async (recipe: NewRecipe) => {
      const { error } = await supabase
        .from('traditional_recipes')
        .insert({
          ...recipe,
          created_by: 'current_user', // Replace with actual user ID
          likes_count: 0,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traditional_recipes'] });
      toast({
        title: "Recipe saved",
        description: "Your traditional recipe has been shared successfully.",
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error saving recipe",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setNewRecipe({
      title: '',
      description: '',
      ingredients: [''],
      instructions: [''],
      prep_time_minutes: 0,
      cooking_time_minutes: 0,
      servings: 4,
      difficulty_level: 'medium',
      cuisine_type: '',
      region: '',
      cultural_significance: '',
      family_origin: '',
      nutritional_notes: '',
      seasonal_availability: [],
      tags: [],
      is_vegetarian: false,
      is_traditional: true,
    });
    setEditingRecipe(null);
  };

  const addIngredient = () => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }));
  };

  const removeIngredient = (index: number) => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const updateIngredient = (index: number, value: string) => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => i === index ? value : ing)
    }));
  };

  const addInstruction = () => {
    setNewRecipe(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const removeInstruction = (index: number) => {
    setNewRecipe(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setNewRecipe(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => i === index ? value : inst)
    }));
  };

  const handleSaveRecipe = () => {
    if (!newRecipe.title || !newRecipe.description || newRecipe.ingredients.length === 0) {
      toast({
        title: "Missing information",
        description: "Please provide at least a title, description, and ingredients.",
        variant: "destructive",
      });
      return;
    }

    // Filter out empty ingredients and instructions
    const cleanedRecipe = {
      ...newRecipe,
      ingredients: newRecipe.ingredients.filter(ing => ing.trim() !== ''),
      instructions: newRecipe.instructions.filter(inst => inst.trim() !== ''),
    };

    saveRecipeMutation.mutate(cleanedRecipe);
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800',
  };

  const cuisineTypes = [
    'Bamileke', 'Duala', 'Ewondo', 'Bassa', 'Fulani', 'Bamoun', 
    'Bakweri', 'Gbaya', 'Sara', 'Kotoko', 'Coastal', 'Forest', 
    'Savanna', 'Mountain', 'Other'
  ];

  const cameroonRegions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral',
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  const seasons = ['Dry Season', 'Rainy Season', 'Year Round'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <ChefHat className="h-6 w-6 mr-2 text-primary" />
            Traditional Recipe Sharing
          </h2>
          <p className="text-muted-foreground">
            Preserve and share ancestral culinary wisdom
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Share Recipe
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Share a Traditional Recipe</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Recipe Title *</Label>
                  <Input
                    id="title"
                    value={newRecipe.title}
                    onChange={(e) => setNewRecipe(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Grandmother's Ndolé"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="family_origin">Family/Origin</Label>
                  <Input
                    id="family_origin"
                    value={newRecipe.family_origin}
                    onChange={(e) => setNewRecipe(prev => ({ ...prev, family_origin: e.target.value }))}
                    placeholder="e.g., Ngozi family, passed down 3 generations"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newRecipe.description}
                  onChange={(e) => setNewRecipe(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the dish, its cultural significance, and when it's traditionally prepared..."
                  rows={3}
                />
              </div>

              {/* Cultural Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cuisine_type">Cuisine Type</Label>
                  <Select
                    value={newRecipe.cuisine_type}
                    onValueChange={(value) => setNewRecipe(prev => ({ ...prev, cuisine_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cuisine" />
                    </SelectTrigger>
                    <SelectContent>
                      {cuisineTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Select
                    value={newRecipe.region}
                    onValueChange={(value) => setNewRecipe(prev => ({ ...prev, region: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {cameroonRegions.map(region => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={newRecipe.difficulty_level}
                    onValueChange={(value) => setNewRecipe(prev => ({ ...prev, difficulty_level: value }))}
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

              {/* Timing and Servings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prep_time">Prep Time (minutes)</Label>
                  <Input
                    id="prep_time"
                    type="number"
                    value={newRecipe.prep_time_minutes}
                    onChange={(e) => setNewRecipe(prev => ({ ...prev, prep_time_minutes: parseInt(e.target.value) || 0 }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cooking_time">Cooking Time (minutes)</Label>
                  <Input
                    id="cooking_time"
                    type="number"
                    value={newRecipe.cooking_time_minutes}
                    onChange={(e) => setNewRecipe(prev => ({ ...prev, cooking_time_minutes: parseInt(e.target.value) || 0 }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="servings">Servings</Label>
                  <Input
                    id="servings"
                    type="number"
                    value={newRecipe.servings}
                    onChange={(e) => setNewRecipe(prev => ({ ...prev, servings: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              {/* Ingredients */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Ingredients *</Label>
                  <Button onClick={addIngredient} variant="outline" size="sm">
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {newRecipe.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={ingredient}
                        onChange={(e) => updateIngredient(index, e.target.value)}
                        placeholder={`Ingredient ${index + 1}`}
                      />
                      {newRecipe.ingredients.length > 1 && (
                        <Button
                          onClick={() => removeIngredient(index)}
                          variant="outline"
                          size="sm"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Instructions</Label>
                  <Button onClick={addInstruction} variant="outline" size="sm">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Step
                  </Button>
                </div>
                <div className="space-y-2">
                  {newRecipe.instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <Textarea
                        value={instruction}
                        onChange={(e) => updateInstruction(index, e.target.value)}
                        placeholder={`Step ${index + 1}`}
                        rows={2}
                      />
                      {newRecipe.instructions.length > 1 && (
                        <Button
                          onClick={() => removeInstruction(index)}
                          variant="outline"
                          size="sm"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Cultural Significance */}
              <div className="space-y-2">
                <Label htmlFor="cultural_significance">Cultural Significance</Label>
                <Textarea
                  id="cultural_significance"
                  value={newRecipe.cultural_significance}
                  onChange={(e) => setNewRecipe(prev => ({ ...prev, cultural_significance: e.target.value }))}
                  placeholder="Explain the cultural importance, traditional occasions, or ceremonies where this dish is served..."
                  rows={3}
                />
              </div>

              {/* Additional Notes */}
              <div className="space-y-2">
                <Label htmlFor="nutritional_notes">Nutritional & Health Notes</Label>
                <Textarea
                  id="nutritional_notes"
                  value={newRecipe.nutritional_notes}
                  onChange={(e) => setNewRecipe(prev => ({ ...prev, nutritional_notes: e.target.value }))}
                  placeholder="Traditional health benefits, nutritional information, or dietary considerations..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveRecipe}
                  disabled={saveRecipeMutation.isPending}
                >
                  {saveRecipeMutation.isPending ? 'Saving...' : 'Share Recipe'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          All Recipes
        </Button>
        {cuisineTypes.slice(0, 6).map(type => (
          <Button
            key={type}
            variant={selectedCategory === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(type)}
          >
            {type}
          </Button>
        ))}
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8">Loading recipes...</div>
        ) : !recipes?.length ? (
          <div className="col-span-full text-center py-8">
            <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No recipes yet</h3>
            <p className="text-muted-foreground">
              Start sharing traditional recipes to preserve culinary heritage
            </p>
          </div>
        ) : (
          recipes.map((recipe) => (
            <Card key={recipe.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{recipe.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {recipe.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Heart className="h-3 w-3" />
                    <span>{recipe.likes_count}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(recipe.prep_time_minutes + recipe.cooking_time_minutes)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{recipe.servings}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{recipe.region}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={difficultyColors[recipe.difficulty_level as keyof typeof difficultyColors]}>
                    {recipe.difficulty_level}
                  </Badge>
                  {recipe.is_traditional && (
                    <Badge variant="outline">
                      <Award className="h-3 w-3 mr-1" />
                      Traditional
                    </Badge>
                  )}
                  {recipe.is_vegetarian && (
                    <Badge variant="outline">
                      <Leaf className="h-3 w-3 mr-1" />
                      Vegetarian
                    </Badge>
                  )}
                </div>

                {recipe.cuisine_type && (
                  <div className="text-sm">
                    <span className="font-medium">Cuisine:</span> {recipe.cuisine_type}
                  </div>
                )}

                {recipe.family_origin && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Origin:</span> {recipe.family_origin}
                  </div>
                )}

                <Separator />

                <div className="flex justify-between items-center">
                  <Button variant="outline" size="sm">
                    <BookOpen className="h-3 w-3 mr-1" />
                    View Recipe
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-3 w-3 mr-1" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};