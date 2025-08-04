import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Institution } from "@/types/directory";
import { 
  Building, 
  FileText, 
  Camera, 
  CheckCircle, 
  Upload,
  MapPin,
  User,
  Phone,
  Mail
} from "lucide-react";
import { toast } from "sonner";

interface ClaimInstitutionFlowProps {
  institution?: Institution;
  onComplete: () => void;
}

export const ClaimInstitutionFlow = ({ institution, onComplete }: ClaimInstitutionFlowProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [selectedInstitution, setSelectedInstitution] = useState(institution?.id || "");
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [claimType, setClaimType] = useState("ownership");
  const [claimReason, setClaimReason] = useState("");
  const [contactInfo, setContactInfo] = useState({
    name: "",
    title: "",
    phone: "",
    email: "",
    alternateContact: ""
  });
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState("");

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const claimTypes = [
    { 
      id: "ownership", 
      label: "Institution Owner/Administrator",
      description: "You are the owner, director, or authorized administrator of this institution"
    },
    { 
      id: "representative", 
      label: "Authorized Representative",
      description: "You are authorized to manage the online presence of this institution"
    },
    { 
      id: "correction", 
      label: "Information Correction",
      description: "You want to correct inaccurate information about this institution"
    }
  ];

  const searchInstitutions = async (query: string) => {
    if (query.length < 3) return;
    
    try {
      const { data, error } = await supabase
        .from('institutions')
        .select('*')
        .ilike('name', `%${query}%`)
        .eq('claimed_by', null)
        .limit(10);

      if (error) throw error;
      setInstitutions(data || []);
    } catch (error) {
      console.error('Error searching institutions:', error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setEvidenceFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitClaim = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to submit a claim');
        return;
      }

      // Get institution details
      const { data: institutionData, error: instError } = await supabase
        .from('institutions')
        .select('name, institution_type')
        .eq('id', selectedInstitution)
        .single();

      if (instError) throw instError;

      // Upload evidence files if any
      const evidenceUrls: string[] = [];
      for (const file of evidenceFiles) {
        const fileName = `${user.id}/${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
          .from('institution-claims')
          .upload(fileName, file);

        if (error) throw error;
        evidenceUrls.push(data.path);
      }

      // Create the claim record
      const { error } = await supabase
        .from('institution_claims')
        .insert({
          institution_id: selectedInstitution,
          user_id: user.id,
          institution_type: institutionData.institution_type as any,
          institution_name: institutionData.name,
          claim_type: claimType,
          claim_reason: claimReason,
          evidence_files: evidenceUrls,
          admin_notes: `Contact: ${contactInfo.name} (${contactInfo.title})\nPhone: ${contactInfo.phone}\nEmail: ${contactInfo.email}\n\nAdditional Notes:\n${additionalNotes}`
        });

      if (error) throw error;

      toast.success('Claim submitted successfully! You will be notified when it is reviewed.');
      onComplete();
      
    } catch (error) {
      console.error('Error submitting claim:', error);
      toast.error('Failed to submit claim');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Claim Institution</h1>
          <p className="text-lg text-gray-600">
            Claim ownership or request corrections for an institution listing
          </p>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Step {currentStep} of {totalSteps}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Institution Selection */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Select Institution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {institution ? (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold">{institution.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{institution.institution_type}</p>
                  <p className="text-sm text-gray-600">{institution.region}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Label>Search for Institution</Label>
                  <Input
                    placeholder="Type institution name..."
                    onChange={(e) => searchInstitutions(e.target.value)}
                  />
                  
                  {institutions.length > 0 && (
                    <div className="space-y-2">
                      <Label>Select Institution</Label>
                      <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose an institution" />
                        </SelectTrigger>
                        <SelectContent>
                          {institutions.map((inst) => (
                            <SelectItem key={inst.id} value={inst.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{inst.name}</span>
                                <span className="text-xs text-gray-500 capitalize ml-2">
                                  {inst.institution_type}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={nextStep} 
                  disabled={!selectedInstitution}
                >
                  Next Step
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Claim Type & Reason */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Claim Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Claim Type</Label>
                <RadioGroup value={claimType} onValueChange={setClaimType}>
                  {claimTypes.map((type) => (
                    <div key={type.id} className="flex items-start space-x-2">
                      <RadioGroupItem value={type.id} id={type.id} className="mt-1" />
                      <Label htmlFor={type.id} className="flex-1 cursor-pointer">
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-gray-600">{type.description}</div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Reason for Claim</Label>
                <Textarea
                  value={claimReason}
                  onChange={(e) => setClaimReason(e.target.value)}
                  placeholder="Explain why you are claiming this institution..."
                  rows={4}
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={prevStep}>
                  Previous
                </Button>
                <Button onClick={nextStep} disabled={!claimReason.trim()}>
                  Next Step
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Contact Information */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={contactInfo.name}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Title/Position</Label>
                  <Input
                    value={contactInfo.title}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Your role at the institution"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+237 6XX XXX XXX"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Alternate Contact (Optional)</Label>
                <Input
                  value={contactInfo.alternateContact}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, alternateContact: e.target.value }))}
                  placeholder="Alternative phone or email"
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={prevStep}>
                  Previous
                </Button>
                <Button 
                  onClick={nextStep} 
                  disabled={!contactInfo.name || !contactInfo.phone || !contactInfo.email}
                >
                  Next Step
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Evidence & Submission */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Supporting Evidence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Upload Supporting Documents</Label>
                  <p className="text-sm text-gray-600 mb-2">
                    Upload documents that prove your connection to this institution (ID, authorization letter, photos, etc.)
                  </p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Click to upload or drag and drop files
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="evidence-upload"
                    />
                    <Button variant="outline" asChild>
                      <label htmlFor="evidence-upload" className="cursor-pointer">
                        Choose Files
                      </label>
                    </Button>
                  </div>
                </div>

                {evidenceFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Files</Label>
                    {evidenceFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{file.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFile(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Additional Notes</Label>
                  <Textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Any additional information to support your claim..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={prevStep}>
                  Previous
                </Button>
                <Button 
                  onClick={handleSubmitClaim} 
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit Claim
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Steps Overview */}
        <Card className="bg-gray-50">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">What happens next?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium">1</span>
                </div>
                <span>Your claim is submitted for review</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium">2</span>
                </div>
                <span>Our team verifies your documentation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium">3</span>
                </div>
                <span>You receive notification of the decision</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};