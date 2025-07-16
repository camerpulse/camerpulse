import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Coins, Award, Wallet, TrendingUp, Gift, Star, Crown, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface UserPoints {
  points_balance: number;
  total_earned: number;
  total_spent: number;
}

interface WalletCredits {
  credit_balance: number;
  total_earned: number;
  total_spent: number;
}

interface PointsTransaction {
  id: string;
  points_amount: number;
  activity_type: string;
  description: string;
  created_at: string;
  transaction_type: string;
}

interface DigitalBadge {
  id: string;
  name: string;
  description: string;
  badge_type: string;
  points_cost: number;
  rarity: string;
  is_owned?: boolean;
}

const RARITY_COLORS = {
  common: 'text-gray-600',
  rare: 'text-blue-600',
  epic: 'text-purple-600', 
  legendary: 'text-yellow-600'
};

const RARITY_ICONS = {
  common: Star,
  rare: Award,
  epic: Crown,
  legendary: Zap
};

export default function RewardsCenter() {
  const { user } = useAuth();
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [walletCredits, setWalletCredits] = useState<WalletCredits | null>(null);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [badges, setBadges] = useState<DigitalBadge[]>([]);
  const [userBadges, setUserBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [conversionAmount, setConversionAmount] = useState<string>('');
  const [converting, setConverting] = useState(false);

  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      // Fetch user points
      const { data: pointsData } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Fetch wallet credits
      const { data: walletData } = await supabase
        .from('wallet_credits')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Fetch recent transactions
      const { data: transactionsData } = await supabase
        .from('points_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch all badges
      const { data: badgesData } = await supabase
        .from('digital_badges')
        .select('*')
        .eq('is_active', true);

      // Fetch user's badges
      const { data: userBadgesData } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', user.id);

      setUserPoints(pointsData);
      setWalletCredits(walletData);
      setTransactions(transactionsData || []);
      setBadges(badgesData || []);
      setUserBadges(userBadgesData?.map(ub => ub.badge_id) || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConvertPoints = async () => {
    if (!user || !conversionAmount) return;
    
    const pointsToConvert = parseInt(conversionAmount);
    if (isNaN(pointsToConvert) || pointsToConvert <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!userPoints || pointsToConvert > userPoints.points_balance) {
      toast.error('Insufficient points balance');
      return;
    }

    setConverting(true);
    try {
      const { data, error } = await supabase.rpc('convert_points_to_credit', {
        p_user_id: user.id,
        p_points_amount: pointsToConvert
      });

      if (error) throw error;

      const result = data as any;
      if (result.success) {
        toast.success(result.message);
        setConversionAmount('');
        fetchUserData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error converting points:', error);
      toast.error('Failed to convert points');
    } finally {
      setConverting(false);
    }
  };

  const handlePurchaseBadge = async (badgeId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('purchase_badge', {
        p_user_id: user.id,
        p_badge_id: badgeId
      });

      if (error) throw error;

      const result = data as any;
      if (result.success) {
        toast.success(result.message);
        fetchUserData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error purchasing badge:', error);
      toast.error('Failed to purchase badge');
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Coins className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
            <p className="text-muted-foreground text-center">
              Please sign in to access your rewards and points.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const conversionRate = 0.01; // 100 points = 1 FCFA
  const creditAmount = parseInt(conversionAmount || '0') * conversionRate;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rewards Center</h1>
          <p className="text-muted-foreground">
            Earn points for participating in polls and convert them to rewards
          </p>
        </div>
      </div>

      {/* Points and Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Balance</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userPoints?.points_balance?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total earned: {userPoints?.total_earned?.toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Credit</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {walletCredits?.credit_balance?.toFixed(2) || '0.00'} FCFA
            </div>
            <p className="text-xs text-muted-foreground">
              Total earned: {walletCredits?.total_earned?.toFixed(2) || '0.00'} FCFA
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Badges Owned</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userBadges.length}</div>
            <p className="text-xs text-muted-foreground">
              Collected achievements
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="convert" className="space-y-4">
        <TabsList>
          <TabsTrigger value="convert">Convert Points</TabsTrigger>
          <TabsTrigger value="badges">Badge Store</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="convert" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Convert Points to Wallet Credit
              </CardTitle>
              <CardDescription>
                Exchange your points for FCFA wallet credit (100 points = 1 FCFA)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">
                    Points to Convert
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter points amount"
                    value={conversionAmount}
                    onChange={(e) => setConversionAmount(e.target.value)}
                    min="1"
                    max={userPoints?.points_balance || 0}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">
                    Credit Received
                  </label>
                  <div className="px-3 py-2 bg-muted rounded-md">
                    {creditAmount.toFixed(2)} FCFA
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Available: {userPoints?.points_balance?.toLocaleString() || 0} points</span>
                <span>Conversion Rate: 100 points = 1 FCFA</span>
              </div>

              <Button 
                onClick={handleConvertPoints}
                disabled={converting || !conversionAmount || parseInt(conversionAmount) <= 0}
                className="w-full"
              >
                {converting ? 'Converting...' : 'Convert Points'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => {
              const isOwned = userBadges.includes(badge.id);
              const RarityIcon = RARITY_ICONS[badge.rarity as keyof typeof RARITY_ICONS];
              
              return (
                <Card key={badge.id} className={`${isOwned ? 'bg-muted/50' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <RarityIcon className={`h-5 w-5 ${RARITY_COLORS[badge.rarity as keyof typeof RARITY_COLORS]}`} />
                        {badge.name}
                      </CardTitle>
                      <Badge variant={isOwned ? "secondary" : "outline"}>
                        {badge.rarity}
                      </Badge>
                    </div>
                    <CardDescription>{badge.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      {badge.badge_type === 'purchasable' && (
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4" />
                          <span className="font-medium">{badge.points_cost} points</span>
                        </div>
                      )}
                      {badge.badge_type === 'achievement' && (
                        <span className="text-sm text-muted-foreground">Achievement</span>
                      )}
                      
                      {isOwned ? (
                        <Badge variant="secondary">Owned</Badge>
                      ) : badge.badge_type === 'purchasable' ? (
                        <Button
                          onClick={() => handlePurchaseBadge(badge.id)}
                          disabled={!userPoints || userPoints.points_balance < badge.points_cost}
                          size="sm"
                        >
                          <Gift className="h-4 w-4 mr-1" />
                          Buy
                        </Button>
                      ) : (
                        <Badge variant="outline">Locked</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Recent points and rewards activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No transactions yet. Start participating in polls to earn points!
                  </p>
                ) : (
                  transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${
                          transaction.transaction_type === 'earned' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.transaction_type === 'earned' ? '+' : '-'}
                          {transaction.points_amount} points
                        </div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {transaction.activity_type.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* How to Earn Points */}
      <Card>
        <CardHeader>
          <CardTitle>How to Earn Points</CardTitle>
          <CardDescription>
            Participate in CamerPulse to earn rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Create Poll</h3>
              <p className="text-sm text-muted-foreground">+50 points</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Vote in Poll</h3>
              <p className="text-sm text-muted-foreground">+10 points</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Gift className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Share Poll</h3>
              <p className="text-sm text-muted-foreground">+15 points</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Daily Login</h3>
              <p className="text-sm text-muted-foreground">+5 points</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}