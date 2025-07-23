import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, MapPin, DollarSign, Users, Building2, FileText, Clock, Eye } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface TenderDetail {
  id: string
  title: string
  description: string
  budget_min?: number
  budget_max?: number
  deadline: string
  region: string
  status: string
  category: string
  tender_type: string
  currency: string
  bids_count: number
  views_count: number
  created_at: string
  eligibility_criteria?: string
  instructions?: string
  evaluation_criteria?: string
  documents?: any
  published_by_company_id?: string
  bid_opening_date?: string
}

export const TenderDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [tender, setTender] = useState<TenderDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const fetchTender = async () => {
      try {
        const { data, error } = await supabase
          .from('tenders')
          .select('*')
          .eq('id', id)
          .single()

        if (error) {
          console.error('Error fetching tender:', error)
          toast({
            title: "Error",
            description: "Tender not found",
            variant: "destructive"
          })
          navigate('/tenders')
          return
        }

        setTender(data)

        // Increment view count
        await supabase
          .from('tenders')
          .update({ views_count: data.views_count + 1 })
          .eq('id', id)

      } catch (error) {
        console.error('Error fetching tender:', error)
        toast({
          title: "Error",
          description: "Failed to load tender details",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTender()
  }, [id, navigate, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading tender details...</span>
      </div>
    )
  }

  if (!tender) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Tender Not Found</h2>
        <Button onClick={() => navigate('/tenders')}>
          Back to Tenders
        </Button>
      </div>
    )
  }

  const getBudgetDisplay = () => {
    if (tender.budget_min && tender.budget_max) {
      return `${tender.budget_min.toLocaleString()} - ${tender.budget_max.toLocaleString()} ${tender.currency}`
    }
    if (tender.budget_min) {
      return `From ${tender.budget_min.toLocaleString()} ${tender.currency}`
    }
    return "Budget not disclosed"
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

  const isExpired = new Date(tender.deadline) < new Date()
  const canBid = tender.status.toLowerCase() === 'open' && !isExpired

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/tenders')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Tenders
      </Button>

      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{tender.title}</CardTitle>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span>{tender.tender_type}</span>
                  <Badge className={getStatusColor(tender.status)}>
                    {tender.status}
                  </Badge>
                  <Badge variant="outline">{tender.category}</Badge>
                </div>
              </div>
              
              {canBid && (
                <Button 
                  size="lg" 
                  onClick={() => navigate(`/tender/${tender.id}/bid`)}
                >
                  Place Bid
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span>{getBudgetDisplay()}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span>{tender.region}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className={`h-5 w-5 ${isExpired ? 'text-red-600' : 'text-orange-600'}`} />
                <span className={isExpired ? 'text-red-600' : ''}>
                  Deadline: {format(new Date(tender.deadline), 'PPP')}
                  <span className="ml-2 text-sm">
                    ({formatDistanceToNow(new Date(tender.deadline), { addSuffix: true })})
                  </span>
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span>{tender.bids_count} bid{tender.bids_count !== 1 ? 's' : ''}</span>
              </div>

              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-gray-600" />
                <span>{tender.views_count} view{tender.views_count !== 1 ? 's' : ''}</span>
              </div>
              
              {tender.bid_opening_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span>Bid Opening: {format(new Date(tender.bid_opening_date), 'PPP')}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{tender.description}</p>
          </CardContent>
        </Card>

        {/* Additional Information */}
        {(tender.eligibility_criteria || tender.instructions || tender.evaluation_criteria) && (
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tender.eligibility_criteria && (
                <div>
                  <h4 className="font-semibold mb-2">Eligibility Criteria</h4>
                  <p className="whitespace-pre-wrap text-sm">{tender.eligibility_criteria}</p>
                </div>
              )}
              
              {tender.instructions && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Instructions</h4>
                    <p className="whitespace-pre-wrap text-sm">{tender.instructions}</p>
                  </div>
                </>
              )}
              
              {tender.evaluation_criteria && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Evaluation Criteria</h4>
                    <p className="whitespace-pre-wrap text-sm">{tender.evaluation_criteria}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Documents */}
        {tender.documents && Array.isArray(tender.documents) && tender.documents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tender.documents.map((doc: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h5 className="font-medium">{doc.name || `Document ${index + 1}`}</h5>
                      {doc.description && (
                        <p className="text-sm text-muted-foreground">{doc.description}</p>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          {canBid && (
            <Button 
              size="lg" 
              onClick={() => navigate(`/tender/${tender.id}/bid`)}
              className="flex-1"
            >
              Place Your Bid
            </Button>
          )}
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => window.print()}
          >
            Print Details
          </Button>
        </div>
      </div>
    </div>
  )
}