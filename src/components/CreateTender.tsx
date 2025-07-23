import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { ArrowLeft, Upload, Plus, X, Loader2, FileText } from "lucide-react"

interface TenderDocument {
  name: string
  description: string
  file?: File
  required: boolean
}

export const CreateTender = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [documents, setDocuments] = useState<TenderDocument[]>([])
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tender_type: "public",
    region: "",
    budget_min: "",
    budget_max: "",
    currency: "FCFA",
    deadline: "",
    bid_opening_date: "",
    eligibility_criteria: "",
    instructions: "",
    evaluation_criteria: ""
  })

  const categories = [
    "Construction", "IT Services", "Consulting", "Supply", "Maintenance", 
    "Healthcare", "Education", "Transportation", "Security", "Other"
  ]

  const regions = [
    "Adamawa", "Centre", "East", "Far North", "Littoral", 
    "North", "Northwest", "South", "Southwest", "West"
  ]

  const tenderTypes = [
    { value: "public", label: "Public Tender" },
    { value: "restricted", label: "Restricted Tender" },
    { value: "direct", label: "Direct Award" },
    { value: "framework", label: "Framework Agreement" }
  ]

  const addDocument = () => {
    setDocuments([...documents, {
      name: "",
      description: "",
      required: false
    }])
  }

  const updateDocument = (index: number, field: keyof TenderDocument, value: any) => {
    const updated = documents.map((doc, i) => 
      i === index ? { ...doc, [field]: value } : doc
    )
    setDocuments(updated)
  }

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index))
  }

  const handleFileUpload = async (files: File[]) => {
    const uploadedUrls: string[] = []
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop()
      const fileName = `tender-docs/${Date.now()}-${Math.random()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('tender-documents')
        .upload(fileName, file)

      if (uploadError) {
        console.error('File upload error:', uploadError)
        continue
      }

      const { data: { publicUrl } } = supabase.storage
        .from('tender-documents')
        .getPublicUrl(fileName)
      
      uploadedUrls.push(publicUrl)
    }
    
    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a tender",
        variant: "destructive"
      })
      return
    }

    if (!formData.title || !formData.description || !formData.category || !formData.deadline) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    if (new Date(formData.deadline) <= new Date()) {
      toast({
        title: "Error",
        description: "Deadline must be in the future",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      // Upload document files
      const documentFiles = documents.filter(doc => doc.file).map(doc => doc.file!)
      const uploadedUrls = documentFiles.length > 0 ? await handleFileUpload(documentFiles) : []

      // Prepare documents data
      const documentsData = documents.map((doc, index) => ({
        name: doc.name,
        description: doc.description,
        required: doc.required,
        url: doc.file ? uploadedUrls[documents.filter((d, i) => i <= index && d.file).length - 1] : null
      })).filter(doc => doc.name)

      // Create tender
      const { data, error } = await supabase
        .from('tenders')
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          tender_type: formData.tender_type,
          region: formData.region,
          budget_min: formData.budget_min ? parseInt(formData.budget_min) : null,
          budget_max: formData.budget_max ? parseInt(formData.budget_max) : null,
          currency: formData.currency,
          deadline: formData.deadline,
          bid_opening_date: formData.bid_opening_date || null,
          eligibility_criteria: formData.eligibility_criteria,
          instructions: formData.instructions,
          evaluation_criteria: formData.evaluation_criteria,
          documents: documentsData,
          published_by_user_id: user.id,
          status: 'open'
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      toast({
        title: "Success",
        description: "Tender created successfully!",
      })

      navigate(`/tender/${data.id}`)
      
    } catch (error) {
      console.error('Error creating tender:', error)
      toast({
        title: "Error",
        description: "Failed to create tender. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-md text-center">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">You need to be logged in to create a tender.</p>
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/dashboard')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Tender</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="title">Tender Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter tender title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tender_type">Tender Type</Label>
                  <Select value={formData.tender_type} onValueChange={(value) => setFormData({...formData, tender_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tenderTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Region *</Label>
                  <Select value={formData.region} onValueChange={(value) => setFormData({...formData, region: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FCFA">FCFA</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed description of the tender requirements..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  required
                />
              </div>
            </div>

            <Separator />

            {/* Budget Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Budget Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget_min">Minimum Budget ({formData.currency})</Label>
                  <Input
                    id="budget_min"
                    type="number"
                    placeholder="0"
                    value={formData.budget_min}
                    onChange={(e) => setFormData({...formData, budget_min: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget_max">Maximum Budget ({formData.currency})</Label>
                  <Input
                    id="budget_max"
                    type="number"
                    placeholder="0"
                    value={formData.budget_max}
                    onChange={(e) => setFormData({...formData, budget_max: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Timeline */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Timeline</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline">Submission Deadline *</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bid_opening_date">Bid Opening Date</Label>
                  <Input
                    id="bid_opening_date"
                    type="datetime-local"
                    value={formData.bid_opening_date}
                    onChange={(e) => setFormData({...formData, bid_opening_date: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Requirements */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Requirements & Criteria</h3>
              
              <div className="space-y-2">
                <Label htmlFor="eligibility_criteria">Eligibility Criteria</Label>
                <Textarea
                  id="eligibility_criteria"
                  placeholder="Specify eligibility requirements for bidders..."
                  value={formData.eligibility_criteria}
                  onChange={(e) => setFormData({...formData, eligibility_criteria: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Bidding Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="Provide detailed instructions for bidders..."
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="evaluation_criteria">Evaluation Criteria</Label>
                <Textarea
                  id="evaluation_criteria"
                  placeholder="Describe how bids will be evaluated..."
                  value={formData.evaluation_criteria}
                  onChange={(e) => setFormData({...formData, evaluation_criteria: e.target.value})}
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            {/* Documents */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Documents</h3>
                <Button type="button" variant="outline" size="sm" onClick={addDocument}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Document
                </Button>
              </div>

              {documents.map((doc, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Document {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Document name"
                        value={doc.name}
                        onChange={(e) => updateDocument(index, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="Description"
                        value={doc.description}
                        onChange={(e) => updateDocument(index, 'description', e.target.value)}
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx,.xlsx"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) updateDocument(index, 'file', file)
                        }}
                      />
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={doc.required}
                          onChange={(e) => updateDocument(index, 'required', e.target.checked)}
                        />
                        <span className="text-sm">Required</span>
                      </label>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Submit */}
            <div className="pt-6">
              <Button 
                type="submit" 
                size="lg" 
                className="w-full"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Tender
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}