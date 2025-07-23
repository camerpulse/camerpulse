import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  DollarSign,
  Gavel,
  Eye,
  AlertCircle
} from 'lucide-react';
import { useRealtime } from '@/contexts/RealtimeContext';
import CountdownTimer from '@/components/CountdownTimer';
import { useToast } from '@/hooks/use-toast';
import BidSubmissionModal from '@/components/BidSubmissionModal';

interface Bid {
  id: string;
  bidderName: string;
  bidAmount: number;
  submittedAt: string;
  isAnonymous: boolean;
  bidderAvatar?: string;
  timeToSubmit?: number; // seconds taken to submit
}

interface TenderStats {
  totalBids: number;
  activeBidders: number;
  averageBid: number;
  highestBid: number;
  lowestBid: number;
  lastActivity: string;
}

interface LiveBiddingInterfaceProps {
  tenderId: string;
  tenderTitle: string;
  deadline: string;
  budgetMin: number;
  budgetMax: number;
  currency: string;
  isOwner?: boolean;
  userRole?: 'bidder' | 'issuer' | 'observer';
}

export default function LiveBiddingInterface({
  tenderId,
  tenderTitle,
  deadline,
  budgetMin,
  budgetMax,
  currency,
  isOwner = false,
  userRole = 'observer'
}: LiveBiddingInterfaceProps) {
  const { subscribeTo, unsubscribeFrom, lastMessage, isConnected } = useRealtime();
  const { toast } = useToast();
  
  const [bids, setBids] = useState<Bid[]>([
    // Mock data for demonstration
    {
      id: '1',
      bidderName: 'Elite Construction Ltd',
      bidAmount: 2500000,
      submittedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      isAnonymous: false,
      timeToSubmit: 45
    },
    {
      id: '2',
      bidderName: 'Anonymous Bidder',
      bidAmount: 2350000,
      submittedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      isAnonymous: true,
      timeToSubmit: 23
    }
  ]);
  
  const [stats, setStats] = useState<TenderStats>({
    totalBids: 2,
    activeBidders: 15,
    averageBid: 2425000,
    highestBid: 2500000,
    lowestBid: 2350000,
    lastActivity: new Date(Date.now() - 1000 * 60 * 5).toISOString()
  });
  
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidTrend, setBidTrend] = useState<'up' | 'down' | 'stable'>('up');
  const [liveViewers, setLiveViewers] = useState(8);

  // Subscribe to tender updates
  useEffect(() => {
    subscribeTo('tender', tenderId);
    return () => unsubscribeFrom('tender', tenderId);
  }, [tenderId, subscribeTo, unsubscribeFrom]);

  // Handle real-time updates
  useEffect(() => {
    if (lastMessage?.type === 'tender_update' && lastMessage.tenderId === tenderId) {
      const event = lastMessage.event;
      
      if (event?.type === 'bid_submitted') {
        const newBid: Bid = {
          id: Date.now().toString(),
          bidderName: event.data.bidderName,
          bidAmount: event.data.bidAmount,
          submittedAt: event.timestamp,
          isAnonymous: event.data.isAnonymous || false,
          timeToSubmit: event.data.timeToSubmit
        };
        
        setBids(prev => [newBid, ...prev]);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalBids: prev.totalBids + 1,
          highestBid: Math.max(prev.highestBid, newBid.bidAmount),
          lowestBid: Math.min(prev.lowestBid, newBid.bidAmount),
          lastActivity: event.timestamp
        }));
        
        // Determine trend
        if (bids.length > 0) {
          const lastBid = bids[0];
          setBidTrend(newBid.bidAmount > lastBid.bidAmount ? 'up' : 
                     newBid.bidAmount < lastBid.bidAmount ? 'down' : 'stable');
        }
        
        // Show notification for new bids
        if (!isOwner) {
          toast({
            title: "New Bid Submitted",
            description: `${newBid.bidderName} submitted ${newBid.bidAmount.toLocaleString()} ${currency}`,
          });
        }
      }
    }
  }, [lastMessage, tenderId, isOwner, bids, currency, toast]);

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const isExpired = new Date(deadline) < new Date();

  return (
    <div className="space-y-6">
      {/* Header with Countdown */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Gavel className="w-5 h-5" />
                <span>Live Bidding</span>
                {!isConnected && (
                  <Badge variant="outline" className="text-red-600">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Offline
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>{tenderTitle}</CardDescription>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Eye className="w-4 h-4" />
                <span>{liveViewers} watching</span>
              </div>
              
              {!isExpired && (
                <CountdownTimer
                  deadline={deadline}
                  title="Closes In"
                  variant="compact"
                  showDays={true}
                  showSeconds={true}
                />
              )}
              
              {userRole === 'bidder' && !isExpired && (
                <Button onClick={() => setShowBidModal(true)}>
                  Submit Bid
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bidding Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.totalBids}</div>
                  <div className="text-sm text-muted-foreground">Total Bids</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.activeBidders}</div>
                  <div className="text-sm text-muted-foreground">Active Bidders</div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Highest Bid</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(stats.highestBid)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Lowest Bid</span>
                  <span className="font-medium text-red-600">
                    {formatCurrency(stats.lowestBid)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Average Bid</span>
                  <span className="font-medium">
                    {formatCurrency(stats.averageBid)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Budget Range</span>
                  <span className="font-medium">
                    {formatCurrency(budgetMin)} - {formatCurrency(budgetMax)}
                  </span>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Trend</span>
                <div className="flex items-center space-x-1">
                  {bidTrend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : bidTrend === 'down' ? (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  ) : (
                    <div className="w-4 h-4 bg-gray-400 rounded-full" />
                  )}
                  <span className="font-medium capitalize">{bidTrend}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {userRole === 'issuer' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  View All Bidders
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="w-4 h-4 mr-2" />
                  Extend Deadline
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Export Bids
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Live Bids Feed */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Live Bids Feed</span>
                <Badge variant="outline">
                  {bids.length} bids
                </Badge>
              </CardTitle>
              <CardDescription>
                Real-time bid submissions {isConnected ? '(Live)' : '(Offline)'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {bids.length === 0 ? (
                  <div className="text-center py-8">
                    <Gavel className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No bids submitted yet</p>
                    <p className="text-sm text-muted-foreground">
                      Be the first to submit a bid!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bids.map((bid, index) => (
                      <div key={bid.id} className="flex items-start space-x-3 p-3 rounded-lg border bg-card">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={bid.bidderAvatar} />
                          <AvatarFallback>
                            {bid.isAnonymous ? '?' : getInitials(bid.bidderName)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-sm">
                                {bid.isAnonymous ? 'Anonymous Bidder' : bid.bidderName}
                              </p>
                              {index === 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  Latest
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(bid.submittedAt)}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-lg font-bold text-primary">
                              {formatCurrency(bid.bidAmount)}
                            </span>
                            {bid.timeToSubmit && (
                              <span className="text-xs text-muted-foreground">
                                Submitted in {bid.timeToSubmit}s
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center mt-2 space-x-2">
                            {bid.bidAmount === stats.highestBid && (
                              <Badge variant="default" className="text-xs">
                                Highest Bid
                              </Badge>
                            )}
                            {bid.bidAmount === stats.lowestBid && (
                              <Badge variant="outline" className="text-xs">
                                Lowest Bid
                              </Badge>
                            )}
                            {bid.bidAmount >= budgetMin && bid.bidAmount <= budgetMax && (
                              <Badge variant="secondary" className="text-xs">
                                Within Budget
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bid Submission Modal */}
      {showBidModal && (
        <BidSubmissionModal
          isOpen={showBidModal}
          onClose={() => setShowBidModal(false)}
          tender={{
            id: tenderId,
            title: tenderTitle,
            budgetMin,
            budgetMax,
            currency,
            deadline
          }}
        />
      )}
    </div>
  );
}