import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Crown, 
  CheckCircle, 
  Star, 
  MessageCircle, 
  Zap, 
  Shield,
  Sparkles,
  CreditCard
} from 'lucide-react';

interface SubscriptionInfo {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

export const PremiumUpgrade: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo>({ subscribed: false });
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    }
  }, [user]);

  const checkSubscriptionStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setSubscriptionInfo(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour vous abonner",
        variant: "destructive"
      });
      return;
    }

    setUpgrading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) throw error;
      
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Erreur",
        description: "Impossible de lancer le processus de paiement",
        variant: "destructive"
      });
    } finally {
      setUpgrading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ouvrir le portail de gestion",
        variant: "destructive"
      });
    }
  };

  const premiumFeatures = [
    {
      icon: <CheckCircle className="w-5 h-5 text-blue-500" />,
      title: "Badge de vérification bleu",
      description: "Badge officiel vérifié comme Facebook et Instagram"
    },
    {
      icon: <MessageCircle className="w-5 h-5 text-green-500" />,
      title: "Messages privés illimités",
      description: "Contactez directement tous les politiciens et citoyens"
    },
    {
      icon: <Star className="w-5 h-5 text-yellow-500" />,
      title: "Accès prioritaire",
      description: "Nouvelles fonctionnalités en avant-première"
    },
    {
      icon: <Zap className="w-5 h-5 text-purple-500" />,
      title: "Analyses avancées",
      description: "Statistiques détaillées et insights exclusifs"
    },
    {
      icon: <Shield className="w-5 h-5 text-blue-600" />,
      title: "Profil mis en avant",
      description: "Votre profil apparaît en priorité dans les recherches"
    },
    {
      icon: <Sparkles className="w-5 h-5 text-pink-500" />,
      title: "Fonctionnalités exclusives",
      description: "Accès à des outils premium et rapports spéciaux"
    }
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (subscriptionInfo.subscribed) {
    return (
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-blue-500" />
            <span>CamerPulse Premium</span>
            <Badge className="bg-blue-500 text-white">
              <CheckCircle className="w-3 h-3 mr-1" />
              Actif
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Vous êtes abonné Premium! Profitez de toutes les fonctionnalités exclusives.
            </p>
            
            {subscriptionInfo.subscription_end && (
              <p className="text-sm text-blue-600">
                Votre abonnement se renouvelle le {new Date(subscriptionInfo.subscription_end).toLocaleDateString()}
              </p>
            )}

            <div className="flex gap-2">
              <Button onClick={handleManageSubscription} variant="outline">
                <CreditCard className="w-4 h-4 mr-2" />
                Gérer l'abonnement
              </Button>
              <Button onClick={checkSubscriptionStatus} variant="ghost">
                Actualiser le statut
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-6 h-6 text-yellow-500" />
          <span>Passez à Premium</span>
          <Badge className="bg-yellow-500 text-white">$10/an</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <p className="text-muted-foreground">
            Débloquez toutes les fonctionnalités premium pour seulement 10$ par an!
          </p>

          <div className="grid gap-4">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                {feature.icon}
                <div>
                  <h4 className="font-medium">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-bold text-lg">10$ USD</p>
                <p className="text-sm text-muted-foreground">par année</p>
              </div>
              <Badge variant="outline" className="border-green-500 text-green-600">
                Économisez 60% vs mensuel
              </Badge>
            </div>

            <Button 
              onClick={handleUpgrade} 
              disabled={upgrading || !user}
              size="lg" 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {upgrading ? (
                <>
                  <Crown className="w-4 h-4 mr-2 animate-pulse" />
                  Redirection...
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4 mr-2" />
                  Devenir Premium maintenant
                </>
              )}
            </Button>

            {!user && (
              <p className="text-xs text-center text-muted-foreground mt-2">
                Vous devez être connecté pour vous abonner
              </p>
            )}

            <p className="text-xs text-center text-muted-foreground mt-4">
              Paiement sécurisé par Stripe • Annulation à tout moment
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};