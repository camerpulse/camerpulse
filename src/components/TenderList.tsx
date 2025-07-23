import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { TenderCard } from "./TenderCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, SortAsc, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"

interface Tender {
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

interface TenderListProps {
  showFilters?: boolean
  limit?: number
  status?: string
  category?: string
}

export const TenderList = ({ 
  showFilters = true, 
  limit,
  status = 'open',
  category 
}: TenderListProps) => {
  const [tenders, setTenders] = useState<Tender[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(category || "")
  const [selectedStatus, setSelectedStatus] = useState(status)
  const [sortBy, setSortBy] = useState("deadline")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const navigate = useNavigate()
  const { toast } = useToast()

  const itemsPerPage = limit || 12

  const categories = [
    "Construction", "IT Services", "Consulting", "Supply", "Maintenance", 
    "Healthcare", "Education", "Transportation", "Security", "Other"
  ]

  const fetchTenders = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('tenders')
        .select('*', { count: 'exact' })

      // Apply filters
      if (selectedStatus && selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus)
      }
      
      if (selectedCategory) {
        query = query.eq('category', selectedCategory)
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      // Apply sorting
      switch (sortBy) {
        case 'deadline':
          query = query.order('deadline', { ascending: true })
          break
        case 'budget':
          query = query.order('budget_max', { ascending: false })
          break
        case 'recent':
          query = query.order('created_at', { ascending: false })
          break
        case 'bids':
          query = query.order('bids_count', { ascending: false })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      // Pagination
      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) {
        console.error('Error fetching tenders:', error)
        toast({
          title: "Error",
          description: "Failed to load tenders. Please try again.",
          variant: "destructive"
        })
        return
      }

      setTenders(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error fetching tenders:', error)
      toast({
        title: "Error",
        description: "Failed to load tenders. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTenders()
  }, [selectedStatus, selectedCategory, searchQuery, sortBy, currentPage])

  const handleViewDetails = (tenderId: string) => {
    navigate(`/tender/${tenderId}`)
  }

  const handlePlaceBid = (tenderId: string) => {
    navigate(`/tender/${tenderId}/bid`)
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  if (loading && tenders.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading tenders...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {showFilters && (
        <div className="bg-card p-4 rounded-lg border space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tenders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="awarded">Awarded</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deadline">Deadline</SelectItem>
                <SelectItem value="budget">Budget</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="bids">Most Bids</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Showing {tenders.length} of {totalCount} tenders</span>
            {searchQuery && <Badge variant="outline">Search: "{searchQuery}"</Badge>}
            {selectedCategory && <Badge variant="outline">Category: {selectedCategory}</Badge>}
            {selectedStatus !== 'all' && <Badge variant="outline">Status: {selectedStatus}</Badge>}
          </div>
        </div>
      )}

      {tenders.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No tenders found</h3>
          <p className="text-muted-foreground">
            {searchQuery || selectedCategory 
              ? "Try adjusting your search criteria"
              : "No tenders available at the moment"
            }
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenders.map((tender) => (
              <TenderCard
                key={tender.id}
                tender={tender}
                onViewDetails={handleViewDetails}
                onPlaceBid={handlePlaceBid}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <span className="text-sm px-4">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {loading && tenders.length > 0 && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
    </div>
  )
}