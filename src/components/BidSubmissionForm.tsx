import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, DollarSign, FileText, Upload, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"

interface TenderInfo {
  id: string
  title: string
  budget_min?: number
  budget_max?: number
  currency: string
  deadline: string
  status: string
}

export const BidSubmissionForm = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [tender, setTender] = useState<TenderInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [bidData, setBidData] = useState({
    bid_amount: "",
    proposed_timeline: "",
    technical_proposal: "",
    financial_proposal: "",
    company_experience: "",
    team_qualifications: ""
  })

  const [documents, setDocuments] = useState<File[]>([])

  useEffect(() => {
    if (!user) {
      navigate('/auth')
      return
    }

    if (!id) return

    const fetchTender = async () => {
      try {
        const { data, error } = await supabase
          .from('tenders')
          .select('id, title, budget_min, budget_max, currency, deadline, status')
          .eq('id', id)
          .single()

        if (error) {
          toast({
            title: "Error",
            description: "Tender not found",
            variant: "destructive"
          })
          navigate('/tenders')
          return
        }

        if (data.status.toLowerCase() !== 'open') {
          toast({
            title: "Error",
            description: "This tender is no longer accepting bids",
            variant: "destructive"
          })
          navigate(`/tender/${id}`)
          return
        }

        if (new Date(data.deadline) < new Date()) {
          toast({
            title: "Error",
            description: "This tender deadline has passed",
            variant: "destructive"
          })
          navigate(`/tender/${id}`)
          return
        }

        setTender(data)
      } catch (error) {
        console.error('Error fetching tender:', error)
        toast({
          title: "Error",
          description: "Failed to load tender information",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTender()
  }, [id, user, navigate, toast])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setDocuments(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !tender) return

    if (!bidData.bid_amount || !bidData.technical_proposal) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setSubmitting(true)

    try {
      // Check if user already has a bid for this tender
      const { data: existingBid } = await supabase
        .from('tender_bids')
        .select('id')
        .eq('tender_id', tender.id)
        .eq('user_id', user.id)
        .single()

      if (existingBid) {
        toast({
          title: "Error",
          description: "You have already submitted a bid for this tender",
          variant: "destructive"
        })
        setSubmitting(false)
        return
      }

      // Submit bid
      const { data: bidResult, error: bidError } = await supabase
        .from('tender_bids')
        .insert({
          tender_id: tender.id,
          user_id: user.id,
          company_id: user.id, // temporary - should be actual company ID
          bid_amount: parseFloat(bidData.bid_amount),
          currency: tender.currency,
          technical_proposal: bidData.technical_proposal,
          financial_proposal: {
            breakdown: bidData.financial_proposal,
            timeline: bidData.proposed_timeline,
            experience: bidData.company_experience,
            qualifications: bidData.team_qualifications
          },
          status: 'submitted'
        })
        .select()
        .single()

      if (bidError) {
        throw bidError
      }

      // Upload documents if any
      if (documents.length > 0) {
        const documentUrls: string[] = []
        
        for (const file of documents) {
          const fileExt = file.name.split('.').pop()
          const fileName = `${bidResult.id}/${Date.now()}.${fileExt}`
          
          const { error: uploadError } = await supabase.storage
            .from('tender-documents')
            .upload(fileName, file)

          if (uploadError) {
            console.error('File upload error:', uploadError)
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('tender-documents')
              .getPublicUrl(fileName)
            documentUrls.push(publicUrl)
          }
        }

        // Update bid with document URLs
        if (documentUrls.length > 0) {
          await supabase
            .from('tender_bids')
            .update({ documents: documentUrls })
            .eq('id', bidResult.id)
        }
      }

      toast({
        title: "Success",
        description: "Your bid has been submitted successfully!",
      })

      navigate(`/tender/${tender.id}`)
      
    } catch (error) {
      console.error('Error submitting bid:', error)
      toast({
        title: "Error",
        description: "Failed to submit bid. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading tender information...</span>
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

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate(`/tender/${tender.id}`)}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Tender Details
      </Button>

      <div className="space-y-6">
        {/* Tender Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Submit Bid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">{tender.title}</h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span>
                    Budget: {tender.budget_min && tender.budget_max 
                      ? `${tender.budget_min.toLocaleString()} - ${tender.budget_max.toLocaleString()} ${tender.currency}`
                      : 'Not disclosed'
                    }
                  </span>
                </div>
                <Badge variant="outline">{tender.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bid Form */}
        <Card>
          <CardHeader>
            <CardTitle>Bid Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Financial Information */}
              <div className="space-y-4">
                <h4 className="font-semibold">Financial Proposal</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bid_amount">Bid Amount ({tender.currency}) *</Label>
                    <Input
                      id="bid_amount"
                      type="number"
                      placeholder="Enter your bid amount"
                      value={bidData.bid_amount}
                      onChange={(e) => setBidData({...bidData, bid_amount: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="proposed_timeline">Proposed Timeline</Label>
                    <Input
                      id="proposed_timeline"
                      placeholder="e.g., 3 months"
                      value={bidData.proposed_timeline}
                      onChange={(e) => setBidData({...bidData, proposed_timeline: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="financial_proposal">Financial Breakdown</Label>
                  <Textarea
                    id="financial_proposal"
                    placeholder="Provide detailed financial breakdown..."
                    value={bidData.financial_proposal}
                    onChange={(e) => setBidData({...bidData, financial_proposal: e.target.value})}
                    rows={4}
                  />
                </div>
              </div>

              <Separator />

              {/* Technical Proposal */}
              <div className="space-y-4">
                <h4 className="font-semibold">Technical Proposal</h4>
                <div className="space-y-2">
                  <Label htmlFor="technical_proposal">Technical Approach *</Label>
                  <Textarea
                    id="technical_proposal"
                    placeholder="Describe your technical approach and methodology..."
                    value={bidData.technical_proposal}
                    onChange={(e) => setBidData({...bidData, technical_proposal: e.target.value})}
                    rows={6}
                    required
                  />
                </div>
              </div>

              <Separator />

              {/* Company Information */}
              <div className="space-y-4">
                <h4 className="font-semibold">Company Information</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_experience">Relevant Experience</Label>
                    <Textarea
                      id="company_experience"
                      placeholder="Describe your company's relevant experience..."
                      value={bidData.company_experience}
                      onChange={(e) => setBidData({...bidData, company_experience: e.target.value})}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team_qualifications">Team Qualifications</Label>
                    <Textarea
                      id="team_qualifications"
                      placeholder="Describe your team's qualifications and expertise..."
                      value={bidData.team_qualifications}
                      onChange={(e) => setBidData({...bidData, team_qualifications: e.target.value})}
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Document Upload */}
              <div className="space-y-4">
                <h4 className="font-semibold">Supporting Documents</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="documents">Upload Documents</Label>
                    <Input
                      id="documents"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xlsx,.jpg,.png"
                      onChange={handleFileChange}
                    />
                    <p className="text-sm text-muted-foreground">
                      Accepted formats: PDF, DOC, DOCX, XLSX, JPG, PNG (Max 10MB each)
                    </p>
                  </div>

                  {documents.length > 0 && (
                    <div className="space-y-2">
                      <Label>Selected Files:</Label>
                      <div className="space-y-2">
                        {documents.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span className="text-sm">{file.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Bid
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}