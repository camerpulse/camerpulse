import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, DollarSign, Users, Clock, Building2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface TenderCardProps {
  tender: {
    id: string
    title: string
    description: string
    budget_min?: number
    budget_max?: number
    deadline: string
    region?: string
    status: string
    category?: string
    published_by_company_id?: string
    bids_count: number
    created_at: string
    tender_type: string
    currency: string
    views_count: number
  }
  onViewDetails: (tenderId: string) => void
  onPlaceBid?: (tenderId: string) => void
}

export const TenderCard = ({ tender, onViewDetails, onPlaceBid }: TenderCardProps) => {
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

  const timeUntilDeadline = formatDistanceToNow(new Date(tender.deadline), { addSuffix: true })
  const isExpired = new Date(tender.deadline) < new Date()

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 mb-2">
              {tender.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              {tender.tender_type}
            </p>
          </div>
          <Badge className={getStatusColor(tender.status)}>
            {tender.status}
          </Badge>
        </div>
        
        {tender.published_by_company_id && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span className="truncate">Company: {tender.published_by_company_id.slice(0, 8)}...</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {tender.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span>{getBudgetDisplay()}</span>
          </div>

          {tender.region && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="truncate">{tender.region}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <Clock className={`h-4 w-4 ${isExpired ? 'text-red-600' : 'text-orange-600'}`} />
            <span className={isExpired ? 'text-red-600' : ''}>
              Deadline {timeUntilDeadline}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-purple-600" />
            <span>{tender.bids_count} bid{tender.bids_count !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {tender.category && (
          <div className="pt-2">
            <Badge variant="outline" className="text-xs">
              {tender.category}
            </Badge>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onViewDetails(tender.id)}
          className="flex-1"
        >
          View Details
        </Button>
        {tender.status.toLowerCase() === 'open' && !isExpired && onPlaceBid && (
          <Button 
            size="sm" 
            onClick={() => onPlaceBid(tender.id)}
            className="flex-1"
          >
            Place Bid
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}