import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddPharmacyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPharmacyAdded: () => void;
}

export function AddPharmacyDialog({ open, onOpenChange, onPharmacyAdded }: AddPharmacyDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    license_number: "",
    pharmacist_in_charge: "",
    region: "",
    division: "",
    village_or_city: "",
    working_hours: "",
    delivery_available: false,
    contact_phone: "",
    contact_whatsapp: "",
    contact_email: "",
    contact_website: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const cameroonRegions = [
    "Adamawa", "Centre", "East", "Far North", "Littoral", 
    "North", "Northwest", "South", "Southwest", "West"
  ];

  const pharmacyTypes = [
    { value: "registered_pharmacy", label: "Registered Pharmacy" },
    { value: "otc_store", label: "OTC Store" },
    { value: "herbal_shop", label: "Herbal Shop" },
    { value: "hospital_linked", label: "Hospital Linked" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type || !formData.region || !formData.division || !formData.village_or_city) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add a pharmacy",
          variant: "destructive",
        });
        return;
      }

      const contact_info = {
        phone: formData.contact_phone,
        whatsapp: formData.contact_whatsapp,
        email: formData.contact_email,
        website: formData.contact_website,
      };

      const { error } = await supabase
        .from("pharmacies")
        .insert([
          {
            name: formData.name,
            type: formData.type,
            license_number: formData.license_number || null,
            pharmacist_in_charge: formData.pharmacist_in_charge || null,
            region: formData.region,
            division: formData.division,
            village_or_city: formData.village_or_city,
            working_hours: formData.working_hours || null,
            delivery_available: formData.delivery_available,
            contact_info,
            created_by: user.id,
          },
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Pharmacy added successfully",
      });

      // Reset form
      setFormData({
        name: "",
        type: "",
        license_number: "",
        pharmacist_in_charge: "",
        region: "",
        division: "",
        village_or_city: "",
        working_hours: "",
        delivery_available: false,
        contact_phone: "",
        contact_whatsapp: "",
        contact_email: "",
        contact_website: "",
      });

      onPharmacyAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding pharmacy:", error);
      toast({
        title: "Error",
        description: "Failed to add pharmacy. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Pharmacy</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Pharmacy Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter pharmacy name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pharmacy type" />
                </SelectTrigger>
                <SelectContent>
                  {pharmacyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_number">License Number</Label>
              <Input
                id="license_number"
                value={formData.license_number}
                onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
                placeholder="Enter license number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pharmacist_in_charge">Pharmacist in Charge</Label>
              <Input
                id="pharmacist_in_charge"
                value={formData.pharmacist_in_charge}
                onChange={(e) => setFormData(prev => ({ ...prev, pharmacist_in_charge: e.target.value }))}
                placeholder="Enter pharmacist name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region *</Label>
              <Select value={formData.region} onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {cameroonRegions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="division">Division *</Label>
              <Input
                id="division"
                value={formData.division}
                onChange={(e) => setFormData(prev => ({ ...prev, division: e.target.value }))}
                placeholder="Enter division"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="village_or_city">Village/City *</Label>
              <Input
                id="village_or_city"
                value={formData.village_or_city}
                onChange={(e) => setFormData(prev => ({ ...prev, village_or_city: e.target.value }))}
                placeholder="Enter village or city"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="working_hours">Working Hours</Label>
              <Input
                id="working_hours"
                value={formData.working_hours}
                onChange={(e) => setFormData(prev => ({ ...prev, working_hours: e.target.value }))}
                placeholder="e.g., Mon-Sat: 8AM-8PM"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="delivery_available"
                checked={formData.delivery_available}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, delivery_available: !!checked }))}
              />
              <Label htmlFor="delivery_available">Delivery Available</Label>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Phone</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_whatsapp">WhatsApp</Label>
                <Input
                  id="contact_whatsapp"
                  value={formData.contact_whatsapp}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_whatsapp: e.target.value }))}
                  placeholder="Enter WhatsApp number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email">Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_website">Website</Label>
                <Input
                  id="contact_website"
                  value={formData.contact_website}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_website: e.target.value }))}
                  placeholder="Enter website URL"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Pharmacy"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}