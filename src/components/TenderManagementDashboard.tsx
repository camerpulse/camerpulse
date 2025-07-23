import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { 
  Plus,
  Edit,
  Eye,
  Users,
  Calendar,
  DollarSign,
  Award,
  AlertCircle,
  Loader2,
  MoreHorizontal,
  FileText
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TenderData {
  id: string
  title: string
  status: string
  deadline: string
  bids_count: number
  views_count: number
  budget_min?: number
  budget_max?: number
  currency: string
  category: string
  region: string
  created_at: string
}

interface BidData {
  id: string
  user_id: string
  bid_amount: number
  currency: string
  status: string
  submitted_at: string
  technical_proposal: string
  profiles?: {
    display_name?: string
    username?: string
  } | null
}

export const TenderManagementDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [tenders, setTenders] = useState<TenderData[]>([])
  const [selectedTender, setSelectedTender] = useState<TenderData | null>(null)
  const [bids, setBids] = useState<BidData[]>([])
  const [loading, setLoading] = useState(true)
  const [bidsLoading, setBidsLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/auth')
      return
    }
    fetchMyTenders()
  }, [user, navigate])

  const fetchMyTenders = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('tenders')
        .select('*')
        .eq('published_by_user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setTenders(data || [])
    } catch (error) {
      console.error('Error fetching tenders:', error)
      toast({
        title: "Error",
        description: "Failed to load your tenders",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchTenderBids = async (tenderId: string) => {
    setBidsLoading(true)
    try {
      const { data, error } = await supabase
        .from('tender_bids')
        .select(`
          *,
          profiles (
            display_name,
            username
          )
        `)
        .eq('tender_id', tenderId)
        .order('submitted_at', { ascending: false })

      if (error) throw error

      setBids((data as any) || [])
    } catch (error) {
      console.error('Error fetching bids:', error)
      toast({
        title: "Error",
        description: "Failed to load bids",
        variant: "destructive"
      })
    } finally {
      setBidsLoading(false)
    }
  }

  const updateTenderStatus = async (tenderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tenders')
        .update({ status: newStatus })
        .eq('id', tenderId)
        .eq('published_by_user_id', user?.id)

      if (error) throw error

      // Update local state
      setTenders(prev => prev.map(tender => 
        tender.id === tenderId ? { ...tender, status: newStatus } : tender
      ))

      if (selectedTender?.id === tenderId) {
        setSelectedTender(prev => prev ? { ...prev, status: newStatus } : null)
      }

      toast({
        title: "Success",
        description: `Tender ${newStatus} successfully`,
      })
    } catch (error) {
      console.error('Error updating tender status:', error)
      toast({
        title: "Error",
        description: "Failed to update tender status",
        variant: "destructive"
      })
    }
  }

  const updateBidStatus = async (bidId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tender_bids')
        .update({ status: newStatus })
        .eq('id', bidId)

      if (error) throw error

      // Update local state
      setBids(prev => prev.map(bid => 
        bid.id === bidId ? { ...bid, status: newStatus } : bid
      ))

      // If awarding a bid, close the tender
      if (newStatus === 'accepted' && selectedTender) {
        await updateTenderStatus(selectedTender.id, 'awarded')
        
        // Reject all other bids
        const otherBids = bids.filter(bid => bid.id !== bidId)
        for (const bid of otherBids) {
          await supabase
            .from('tender_bids')
            .update({ status: 'rejected' })
            .eq('id', bid.id)
        }
        
        // Refresh bids
        fetchTenderBids(selectedTender.id)
      }

      toast({
        title: "Success",
        description: `Bid ${newStatus} successfully`,
      })
    } catch (error) {
      console.error('Error updating bid status:', error)
      toast({
        title: "Error",
        description: "Failed to update bid status",
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'closed':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'awarded':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const getBidStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'accepted':
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

  const isExpired = (deadline: string) => new Date(deadline) < new Date()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading your tenders...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tender Management</h1>
          <p className="text-muted-foreground">Manage your posted tenders and review bids</p>
        </div>
        <Button onClick={() => navigate('/tenders/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Tender
        </Button>
      </div>

      <Tabs defaultValue="my-tenders" className="space-y-6">
        <TabsList>
          <TabsTrigger value="my-tenders">My Tenders ({tenders.length})</TabsTrigger>
          <TabsTrigger value="bid-evaluation">
            Bid Evaluation {selectedTender && `(${selectedTender.title})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-tenders" className="space-y-6">
          {tenders.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="max-w-md mx-auto">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tenders yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start by creating your first tender to begin receiving bids from qualified contractors.
                  </p>
                  <Button onClick={() => navigate('/tenders/create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Tender
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {tenders.map((tender) => (
                <Card key={tender.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getStatusColor(tender.status)}>
                        {tender.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/tender/${tender.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedTender(tender)
                            fetchTenderBids(tender.id)
                          }}>
                            <Users className="h-4 w-4 mr-2" />
                            Review Bids ({tender.bids_count})
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {tender.status === 'open' && (
                            <DropdownMenuItem 
                              onClick={() => updateTenderStatus(tender.id, 'closed')}
                            >
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Close Tender
                            </DropdownMenuItem>
                          )}
                          {tender.status === 'closed' && (
                            <DropdownMenuItem 
                              onClick={() => updateTenderStatus(tender.id, 'open')}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Reopen Tender
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{tender.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className={isExpired(tender.deadline) ? 'text-red-600' : ''}>
                          {new Date(tender.deadline).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{tender.bids_count} bids</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span>{tender.views_count} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs">
                          {tender.budget_min && tender.budget_max 
                            ? `${tender.budget_min.toLocaleString()}-${tender.budget_max.toLocaleString()}`
                            : 'No budget'
                          }
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{tender.category}</Badge>
                      <Badge variant="outline" className="text-xs">{tender.region}</Badge>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => navigate(`/tender/${tender.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedTender(tender)
                          fetchTenderBids(tender.id)
                          // Switch to bid evaluation tab
                          const tabsTrigger = document.querySelector('[value="bid-evaluation"]') as HTMLElement
                          tabsTrigger?.click()
                        }}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Bids ({tender.bids_count})
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bid-evaluation" className="space-y-6">
          {!selectedTender ? (
            <Card className="text-center py-12">
              <CardContent>
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a tender to review bids</h3>
                <p className="text-muted-foreground">
                  Go to "My Tenders" tab and click on "Review Bids" for any tender.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Tender Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{selectedTender.title}</span>
                    <Badge className={getStatusColor(selectedTender.status)}>
                      {selectedTender.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Deadline:</span>
                      <p className="font-medium">{new Date(selectedTender.deadline).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Bids:</span>
                      <p className="font-medium">{selectedTender.bids_count}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Budget Range:</span>
                      <p className="font-medium">
                        {selectedTender.budget_min && selectedTender.budget_max 
                          ? `${formatCurrency(selectedTender.budget_min, selectedTender.currency)} - ${formatCurrency(selectedTender.budget_max, selectedTender.currency)}`
                          : 'Not specified'
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Views:</span>
                      <p className="font-medium">{selectedTender.views_count}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bids List */}
              <Card>
                <CardHeader>
                  <CardTitle>Submitted Bids ({bids.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {bidsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Loading bids...</span>
                    </div>
                  ) : bids.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No bids submitted yet</h3>
                      <p className="text-muted-foreground">
                        Bids will appear here as contractors submit their proposals.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bids.map((bid) => (
                        <Card key={bid.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold">
                                  {bid.profiles?.display_name || bid.profiles?.username || 'Anonymous Bidder'}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Submitted {new Date(bid.submitted_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold text-green-600">
                                  {formatCurrency(bid.bid_amount, bid.currency)}
                                </p>
                                <Badge className={getBidStatusColor(bid.status)}>
                                  {bid.status}
                                </Badge>
                              </div>
                            </div>

                            <div className="mb-4">
                              <h5 className="font-medium mb-2">Technical Proposal:</h5>
                              <p className="text-sm text-muted-foreground line-clamp-3">
                                {bid.technical_proposal}
                              </p>
                            </div>

                            {bid.status === 'submitted' && selectedTender.status === 'open' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateBidStatus(bid.id, 'under_review')}
                                >
                                  Mark as Under Review
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateBidStatus(bid.id, 'rejected')}
                                >
                                  Reject
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => updateBidStatus(bid.id, 'accepted')}
                                >
                                  <Award className="h-4 w-4 mr-1" />
                                  Award Contract
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}