import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useCivicSuggestions, CivicEntityType, SuggestionType } from '@/hooks/useCivicSuggestions';

const entityTypeLabels: Record<CivicEntityType, string> = {
  politician: 'Politician',
  mp: 'Member of Parliament',
  senator: 'Senator',
  chief_fon: 'Chief/Fon',
  political_party: 'Political Party',
  ministry: 'Government Ministry',
  local_council: 'Local Council',
  company: 'Company',
  school: 'School',
  hospital: 'Hospital',
  pharmacy: 'Pharmacy',
  village: 'Village',
  institution: 'Institution',
};

const suggestionTypeLabels: Record<SuggestionType, string> = {
  new_entity: 'New Entity',
  edit_existing: 'Edit Existing',
  data_correction: 'Data Correction',
  additional_info: 'Additional Information',
};

// Dynamic form schemas based on entity type
const getFormSchema = (entityType: CivicEntityType, suggestionType: SuggestionType) => {
  const baseSchema = {
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().optional(),
    evidence_urls: z.array(z.string().url()).optional(),
    change_summary: suggestionType !== 'new_entity' ? z.string().min(10, 'Please describe what you want to change') : z.string().optional(),
  };

  // Entity-specific fields
  const entityFields: Record<CivicEntityType, any> = {
    politician: {
      name: z.string().min(2, 'Name is required'),
      position: z.string().min(2, 'Position is required'),
      party_affiliation: z.string().optional(),
      constituency: z.string().optional(),
      contact_info: z.object({
        phone: z.string().optional(),
        email: z.string().email().optional(),
        office_address: z.string().optional(),
      }).optional(),
    },
    mp: {
      name: z.string().min(2, 'Name is required'),
      constituency: z.string().min(2, 'Constituency is required'),
      party_affiliation: z.string().min(2, 'Party affiliation is required'),
      parliamentary_session: z.string().optional(),
      committee_memberships: z.array(z.string()).optional(),
    },
    senator: {
      name: z.string().min(2, 'Name is required'),
      constituency: z.string().min(2, 'Constituency is required'),
      party_affiliation: z.string().min(2, 'Party affiliation is required'),
      senate_position: z.string().optional(),
    },
    chief_fon: {
      name: z.string().min(2, 'Name is required'),
      title: z.string().min(2, 'Traditional title is required'),
      village_kingdom: z.string().min(2, 'Village/Kingdom is required'),
      region: z.string().min(2, 'Region is required'),
      installation_year: z.string().optional(),
    },
    political_party: {
      party_name: z.string().min(2, 'Party name is required'),
      founding_year: z.string().optional(),
      party_leader: z.string().optional(),
      headquarters: z.string().optional(),
      ideology: z.string().optional(),
    },
    ministry: {
      ministry_name: z.string().min(2, 'Ministry name is required'),
      minister_name: z.string().optional(),
      ministry_mandate: z.string().optional(),
      location: z.string().optional(),
      budget_allocation: z.string().optional(),
    },
    local_council: {
      council_name: z.string().min(2, 'Council name is required'),
      mayor_name: z.string().optional(),
      location: z.string().min(2, 'Location is required'),
      population_served: z.string().optional(),
      council_type: z.string().optional(),
    },
    company: {
      company_name: z.string().min(2, 'Company name is required'),
      business_type: z.string().min(2, 'Business type is required'),
      location: z.string().min(2, 'Location is required'),
      registration_number: z.string().optional(),
      contact_info: z.object({
        phone: z.string().optional(),
        email: z.string().email().optional(),
        website: z.string().url().optional(),
      }).optional(),
    },
    school: {
      school_name: z.string().min(2, 'School name is required'),
      school_type: z.string().min(2, 'School type is required'),
      location: z.string().min(2, 'Location is required'),
      principal_name: z.string().optional(),
      student_capacity: z.string().optional(),
    },
    hospital: {
      hospital_name: z.string().min(2, 'Hospital name is required'),
      hospital_type: z.string().min(2, 'Hospital type is required'),
      location: z.string().min(2, 'Location is required'),
      medical_director: z.string().optional(),
      specializations: z.array(z.string()).optional(),
    },
    pharmacy: {
      pharmacy_name: z.string().min(2, 'Pharmacy name is required'),
      location: z.string().min(2, 'Location is required'),
      pharmacist_name: z.string().optional(),
      operating_hours: z.string().optional(),
      contact_phone: z.string().optional(),
    },
    village: {
      village_name: z.string().min(2, 'Village name is required'),
      region: z.string().min(2, 'Region is required'),
      division: z.string().min(2, 'Division is required'),
      chief_name: z.string().optional(),
      population: z.string().optional(),
    },
    institution: {
      institution_name: z.string().min(2, 'Institution name is required'),
      institution_type: z.string().min(2, 'Institution type is required'),
      location: z.string().min(2, 'Location is required'),
      director_name: z.string().optional(),
      services_offered: z.array(z.string()).optional(),
    },
  };

  return z.object({
    ...baseSchema,
    suggested_data: z.object(entityFields[entityType]),
  });
};

interface SuggestionFormProps {
  entityType: CivicEntityType;
  suggestionType: SuggestionType;
  existingEntityId?: string;
  onClose: () => void;
}

export const SuggestionForm: React.FC<SuggestionFormProps> = ({
  entityType,
  suggestionType,
  existingEntityId,
  onClose,
}) => {
  const { createSuggestion, isCreating } = useCivicSuggestions();
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState('');

  const formSchema = getFormSchema(entityType, suggestionType);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      change_summary: '',
      suggested_data: {},
    },
  });

  const handleAddUrl = () => {
    if (newUrl && !evidenceUrls.includes(newUrl)) {
      setEvidenceUrls([...evidenceUrls, newUrl]);
      setNewUrl('');
    }
  };

  const handleRemoveUrl = (urlToRemove: string) => {
    setEvidenceUrls(evidenceUrls.filter(url => url !== urlToRemove));
  };

  const onSubmit = (data: any) => {
    createSuggestion({
      entity_type: entityType,
      entity_id: existingEntityId,
      suggestion_type: suggestionType,
      title: data.title,
      description: data.description,
      suggested_data: data.suggested_data,
      evidence_urls: evidenceUrls,
      change_summary: data.change_summary,
    });
    onClose();
  };

  const renderEntityFields = () => {
    const entityData = form.watch('suggested_data') || {};

    switch (entityType) {
      case 'politician':
        return (
          <>
            <FormField
              control={form.control}
              name="suggested_data.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter politician's full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="suggested_data.position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Mayor, Governor, Minister" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="suggested_data.party_affiliation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Party Affiliation</FormLabel>
                  <FormControl>
                    <Input placeholder="Political party" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="suggested_data.constituency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Constituency/Region</FormLabel>
                  <FormControl>
                    <Input placeholder="Area they represent" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case 'company':
        return (
          <>
            <FormField
              control={form.control}
              name="suggested_data.company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter company name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="suggested_data.business_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Technology, Manufacturing, Services" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="suggested_data.location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="City, Region" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="suggested_data.registration_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Business registration number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case 'school':
        return (
          <>
            <FormField
              control={form.control}
              name="suggested_data.school_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter school name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="suggested_data.school_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select school type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="primary">Primary School</SelectItem>
                      <SelectItem value="secondary">Secondary School</SelectItem>
                      <SelectItem value="university">University</SelectItem>
                      <SelectItem value="technical">Technical Institute</SelectItem>
                      <SelectItem value="private">Private School</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="suggested_data.location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="City, Region" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      // Add more cases for other entity types...
      default:
        return (
          <FormField
            control={form.control}
            name="suggested_data.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {suggestionTypeLabels[suggestionType]} - {entityTypeLabels[entityType]}
        </CardTitle>
        <CardDescription>
          {suggestionType === 'new_entity' 
            ? `Submit a new ${entityTypeLabels[entityType].toLowerCase()} for inclusion in CamerPulse`
            : `Suggest changes to an existing ${entityTypeLabels[entityType].toLowerCase()}`
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Suggestion Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief title for your suggestion" {...field} />
                  </FormControl>
                  <FormDescription>
                    A clear, descriptive title for your suggestion
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional context or details about your suggestion"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {suggestionType !== 'new_entity' && (
              <FormField
                control={form.control}
                name="change_summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What do you want to change?</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the specific changes you're suggesting"
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="space-y-4">
              <h4 className="text-lg font-medium">Entity Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderEntityFields()}
              </div>
            </div>

            <div className="space-y-4">
              <FormLabel>Supporting Evidence (Optional)</FormLabel>
              <FormDescription>
                Add URLs to documents, websites, or other sources that support your suggestion
              </FormDescription>
              
              <div className="flex gap-2">
                <Input
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.com/document"
                  type="url"
                />
                <Button type="button" onClick={handleAddUrl} variant="outline">
                  Add URL
                </Button>
              </div>

              {evidenceUrls.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {evidenceUrls.map((url, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      <span className="max-w-[200px] truncate">{url}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleRemoveUrl(url)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Submitting...' : 'Submit Suggestion'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};