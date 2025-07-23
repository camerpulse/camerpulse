import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { 
  User, 
  FileText, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Award,
  Eye,
  Loader2 
} from "lucide-react"

interface BidInfo {
  id: string
  tender_id: string
  bid_amount: number
  currency: string
  status: string
  submitted_at: string
  tender: {
    title: string
    deadline: string
    status: string
  }
}

interface UserStats {
  totalBids: number
  activeBids: number
  wonBids: number
  totalValue: number
}

export const UserDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [bids, setBids] = useState<BidInfo[]>([])
  const [stats, setStats] = useState<UserStats>({
    totalBids: 0,
    activeBids: 0,
    wonBids: 0,
    totalValue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/auth')
      return
    }

    fetchUserData()
  }, [user, navigate])

  const fetchUserData = async () => {
    if (!user) return

    try {
      // Fetch user's bids with tender information
      const { data: bidData, error: bidError } = await supabase
        .from('tender_bids')
        .select(`
          id,
          tender_id,
          bid_amount,
          currency,
          status,
          submitted_at,
          tenders (
            title,
            deadline,
            status
          )
        `)
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false })

      if (bidError) {
        console.error('Error fetching bids:', bidError)
        toast({
          title: "Error",
          description: "Failed to load your bids",
          variant: "destructive"
        })
        return
      }

      const bidsWithTender = bidData?.map(bid => ({
        ...bid,
        tender: Array.isArray(bid.tenders) ? bid.tenders[0] : bid.tenders
      })) || []

      setBids(bidsWithTender)

      // Calculate stats
      const totalBids = bidsWithTender.length
      const activeBids = bidsWithTender.filter(bid => 
        bid.status === 'submitted' && bid.tender?.status === 'open'
      ).length
      const wonBids = bidsWithTender.filter(bid => 
        bid.status === 'accepted' || bid.status === 'awarded'
      ).length
      const totalValue = bidsWithTender.reduce((sum, bid) => sum + bid.bid_amount, 0)

      setStats({ totalBids, activeBids, wonBids, totalValue })

    } catch (error) {
      console.error('Error fetching user data:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getBidStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'accepted':
      case 'awarded':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toLocaleString()} ${currency}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.email}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bids</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBids}</div>
            <p className="text-xs text-muted-foreground">
              All time submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bids</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeBids}</div>
            <p className="text-xs text-muted-foreground">
              Pending review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Won Bids</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.wonBids}</div>
            <p className="text-xs text-muted-foreground">
              Successful awards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalValue > 0 ? formatCurrency(stats.totalValue, 'FCFA') : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Bid amounts submitted
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="my-bids" className="space-y-6">
        <TabsList>
          <TabsTrigger value="my-bids">My Bids</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="my-bids" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bids</CardTitle>
            </CardHeader>
            <CardContent>
              {bids.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No bids yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by browsing available tenders and submit your first bid
                  </p>
                  <Button onClick={() => navigate('/tenders')}>
                    Browse Tenders
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bids.map((bid) => (
                    <div
                      key={bid.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-2">
                            {bid.tender?.title || 'Tender Title'}
                          </h4>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span>{formatCurrency(bid.bid_amount, bid.currency)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Submitted {new Date(bid.submitted_at).toLocaleDateString()}
                              </span>
                            </div>
                            {bid.tender?.deadline && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  Deadline {new Date(bid.tender.deadline).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Badge className={getBidStatusColor(bid.status)}>
                            {bid.status}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/tender/${bid.tender_id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Tender
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Member Since</p>
                    <p className="text-sm text-muted-foreground">
                      Recently joined
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button variant="outline">
                    Edit Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}