import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, MapPin, Users, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";

const AddVillageForm = () => {
  const { toast } = useToast();
  const user = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    village_name: "",
    region: "",
    division: "",
    subdivision: "",
    population_estimate: "",
    founding_story: "",
    traditional_languages: "",
    ethnic_groups: "",
    chief_name: "",
    chief_title: "",
    notable_events: "",
    gps_latitude: "",
    gps_longitude: "",
  });

  const regions = [
    "Adamawa", "Centre", "East", "Far North", "Littoral", 
    "North", "Northwest", "South", "Southwest", "West"
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a village",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionData = {
        submitted_by: user.id,
        village_name: formData.village_name,
        region: formData.region,
        division: formData.division,
        subdivision: formData.subdivision,
        population_estimate: formData.population_estimate ? parseInt(formData.population_estimate) : null,
        founding_story: formData.founding_story || null,
        traditional_languages: formData.traditional_languages ? formData.traditional_languages.split(',').map(lang => lang.trim()) : null,
        ethnic_groups: formData.ethnic_groups ? formData.ethnic_groups.split(',').map(group => group.trim()) : null,
        chief_name: formData.chief_name || null,
        chief_title: formData.chief_title || null,
        notable_events: formData.notable_events || null,
        gps_latitude: formData.gps_latitude ? parseFloat(formData.gps_latitude) : null,
        gps_longitude: formData.gps_longitude ? parseFloat(formData.gps_longitude) : null,
      };

      const { error } = await supabase
        .from('village_submissions')
        .insert(submissionData);

      if (error) throw error;

      toast({
        title: "Village Submitted Successfully!",
        description: "Your village submission has been sent for review. Thank you for contributing to our directory!",
      });

      // Reset form
      setFormData({
        village_name: "",
        region: "",
        division: "",
        subdivision: "",
        population_estimate: "",
        founding_story: "",
        traditional_languages: "",
        ethnic_groups: "",
        chief_name: "",
        chief_title: "",
        notable_events: "",
        gps_latitude: "",
        gps_longitude: "",
      });
      setIsOpen(false);

    } catch (error) {
      console.error('Error submitting village:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your village. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-hero text-white border-0 shadow-elegant">
          <Plus className="h-4 w-4" />
          Add Your Village
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Add Your Village to Our Directory
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="village_name">Village Name *</Label>
                <Input
                  id="village_name"
                  value={formData.village_name}
                  onChange={(e) => handleInputChange('village_name', e.target.value)}
                  placeholder="Enter village name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="region">Region *</Label>
                <select
                  id="region"
                  value={formData.region}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md"
                  required
                >
                  <option value="">Select region</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="division">Division *</Label>
                <Input
                  id="division"
                  value={formData.division}
                  onChange={(e) => handleInputChange('division', e.target.value)}
                  placeholder="Enter division"
                  required
                />
              </div>
              <div>
                <Label htmlFor="subdivision">Subdivision *</Label>
                <Input
                  id="subdivision"
                  value={formData.subdivision}
                  onChange={(e) => handleInputChange('subdivision', e.target.value)}
                  placeholder="Enter subdivision"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="population_estimate">Population Estimate</Label>
              <Input
                id="population_estimate"
                type="number"
                value={formData.population_estimate}
                onChange={(e) => handleInputChange('population_estimate', e.target.value)}
                placeholder="Approximate population"
              />
            </div>
          </div>

          {/* Cultural Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Cultural Information</h3>
            
            <div>
              <Label htmlFor="founding_story">Founding Story</Label>
              <Textarea
                id="founding_story"
                value={formData.founding_story}
                onChange={(e) => handleInputChange('founding_story', e.target.value)}
                placeholder="Tell us about how this village was founded..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="traditional_languages">Traditional Languages</Label>
                <Input
                  id="traditional_languages"
                  value={formData.traditional_languages}
                  onChange={(e) => handleInputChange('traditional_languages', e.target.value)}
                  placeholder="Fulfulde, English, French (comma separated)"
                />
              </div>
              <div>
                <Label htmlFor="ethnic_groups">Ethnic Groups</Label>
                <Input
                  id="ethnic_groups"
                  value={formData.ethnic_groups}
                  onChange={(e) => handleInputChange('ethnic_groups', e.target.value)}
                  placeholder="Fulani, Bamiléké (comma separated)"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="chief_name">Chief/Traditional Leader Name</Label>
                <Input
                  id="chief_name"
                  value={formData.chief_name}
                  onChange={(e) => handleInputChange('chief_name', e.target.value)}
                  placeholder="Name of traditional leader"
                />
              </div>
              <div>
                <Label htmlFor="chief_title">Chief Title</Label>
                <Input
                  id="chief_title"
                  value={formData.chief_title}
                  onChange={(e) => handleInputChange('chief_title', e.target.value)}
                  placeholder="Fon, Lamido, Chief, etc."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notable_events">Notable Events/Features</Label>
              <Textarea
                id="notable_events"
                value={formData.notable_events}
                onChange={(e) => handleInputChange('notable_events', e.target.value)}
                placeholder="Notable historical events, festivals, landmarks..."
                rows={3}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Location (Optional)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gps_latitude">GPS Latitude</Label>
                <Input
                  id="gps_latitude"
                  type="number"
                  step="any"
                  value={formData.gps_latitude}
                  onChange={(e) => handleInputChange('gps_latitude', e.target.value)}
                  placeholder="4.0608"
                />
              </div>
              <div>
                <Label htmlFor="gps_longitude">GPS Longitude</Label>
                <Input
                  id="gps_longitude"
                  type="number"
                  step="any"
                  value={formData.gps_longitude}
                  onChange={(e) => handleInputChange('gps_longitude', e.target.value)}
                  placeholder="9.7043"
                />
              </div>
            </div>
          </div>

          {/* Verification Note */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Upload className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Verification Process</p>
                  <p className="text-sm text-muted-foreground">
                    All village submissions are reviewed by our team before being added to the directory. 
                    Please ensure all information is accurate. You may be contacted for additional verification.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-gradient-hero">
              {isSubmitting ? "Submitting..." : "Submit Village"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddVillageForm;