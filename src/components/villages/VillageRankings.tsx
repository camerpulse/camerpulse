import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTopVillages } from '@/hooks/useVillages';
import { Trophy, Crown, Globe, DollarSign, Book, Sparkles, FileText } from 'lucide-react';

interface RankingCategory {
  key: string;
  title: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

const categories: RankingCategory[] = [
  {
    key: 'developed',
    title: 'Most Developed Villages',
    icon: Trophy,
    color: 'text-yellow-600',
    description: 'Infrastructure and development scores'
  },
  {
    key: 'chiefs',
    title: 'Best-Rated Chiefs',
    icon: Crown,
    color: 'text-purple-600',
    description: 'Governance and leadership ratings'
  },
  {
    key: 'diaspora',
    title: 'Top Diaspora Contributors',
    icon: Globe,
    color: 'text-blue-600',
    description: 'Global community engagement'
  },
  {
    key: 'education',
    title: 'Highest Education Scores',
    icon: Book,
    color: 'text-green-600',
    description: 'Literacy and educational achievements'
  }
];

export const VillageRankings: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = React.useState('developed');
  const { data: topVillages, isLoading } = useTopVillages(selectedCategory, 5);

  const selectedCategoryData = categories.find(cat => cat.key === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">🏆 Village Rankings & Leaderboards</h2>
        <p className="text-muted-foreground mb-6">
          Celebrating excellence across Cameroonian villages
        </p>
      </div>

      {/* Category Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {categories.map((category) => (
          <Button
            key={category.key}
            variant={selectedCategory === category.key ? "default" : "outline"}
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => setSelectedCategory(category.key)}
          >
            <category.icon className={`w-5 h-5 ${category.color}`} />
            <span className="text-sm font-medium text-center">{category.title}</span>
          </Button>
        ))}
      </div>

      {/* Rankings Display */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {selectedCategoryData && (
              <selectedCategoryData.icon className={`w-6 h-6 ${selectedCategoryData.color}`} />
            )}
            <div>
              <h3 className="text-xl font-bold">Top 5 {selectedCategoryData?.title}</h3>
              <p className="text-sm text-muted-foreground">{selectedCategoryData?.description}</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            View Full Leaderboard
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {topVillages?.map((village, index) => (
              <div
                key={village.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-civic text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold">{village.village_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {village.division}, {village.region}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {village.is_verified && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      ✓ Verified
                    </Badge>
                  )}
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {village.overall_rating.toFixed(1)}★
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {village.total_ratings_count} ratings
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};