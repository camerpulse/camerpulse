import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, AlertCircle, Star } from 'lucide-react';
import { CivicEntityType, SuggestionType } from '@/hooks/useCivicSuggestions';
import { SuggestionForm } from './SuggestionForm';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/hooks/useNavigation';

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

interface SuggestionButtonProps {
  mode: 'suggest_new' | 'suggest_edit';
  entityType?: CivicEntityType;
  entityId?: string;
  className?: string;
}

export const SuggestionButton: React.FC<SuggestionButtonProps> = ({
  mode,
  entityType,
  entityId,
  className,
}) => {
  const { user } = useAuth();
  const { navigateToAuth } = useNavigation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEntityType, setSelectedEntityType] = useState<CivicEntityType | undefined>(entityType);
  const [selectedSuggestionType, setSelectedSuggestionType] = useState<SuggestionType | undefined>();
  const [showForm, setShowForm] = useState(false);

  const handleButtonClick = () => {
    if (!user) {
      // Show login prompt or redirect to auth
      return;
    }
    setIsOpen(true);
  };

  const handleEntityTypeSelect = (type: CivicEntityType) => {
    setSelectedEntityType(type);
    if (mode === 'suggest_new') {
      setSelectedSuggestionType('new_entity');
      setShowForm(true);
    }
  };

  const handleSuggestionTypeSelect = (type: SuggestionType) => {
    setSelectedSuggestionType(type);
    setShowForm(true);
  };

  const resetDialog = () => {
    setIsOpen(false);
    setShowForm(false);
    setSelectedEntityType(entityType);
    setSelectedSuggestionType(undefined);
  };

  const renderEntityTypeSelector = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium">What type of entity would you like to suggest?</h3>
        <p className="text-sm text-gray-600 mt-1">Choose the category that best fits your suggestion</p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {(Object.keys(entityTypeLabels) as CivicEntityType[]).map((type) => (
          <Button
            key={type}
            variant="outline"
            className="h-auto p-4 text-left justify-start"
            onClick={() => handleEntityTypeSelect(type)}
          >
            <div>
              <div className="font-medium">{entityTypeLabels[type]}</div>
              <div className="text-xs text-gray-500 mt-1">
                {type === 'politician' && 'Elected officials, mayors, governors'}
                {type === 'mp' && 'Members of Parliament'}
                {type === 'senator' && 'Senate members'}
                {type === 'chief_fon' && 'Traditional rulers and chiefs'}
                {type === 'political_party' && 'Political organizations'}
                {type === 'ministry' && 'Government ministries and departments'}
                {type === 'local_council' && 'Municipal and local councils'}
                {type === 'company' && 'Businesses and corporations'}
                {type === 'school' && 'Educational institutions'}
                {type === 'hospital' && 'Healthcare facilities'}
                {type === 'pharmacy' && 'Pharmacy services'}
                {type === 'village' && 'Villages and communities'}
                {type === 'institution' && 'Other public institutions'}
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );

  const renderSuggestionTypeSelector = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium">
          What kind of suggestion for {selectedEntityType ? entityTypeLabels[selectedEntityType] : 'this entity'}?
        </h3>
        <p className="text-sm text-gray-600 mt-1">Choose the type of change you want to suggest</p>
      </div>
      
      <div className="space-y-3">
        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => handleSuggestionTypeSelect('edit_existing')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Existing Information
            </CardTitle>
            <CardDescription>
              Update or correct existing information about this entity
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => handleSuggestionTypeSelect('data_correction')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Data Correction
            </CardTitle>
            <CardDescription>
              Report and correct inaccurate information
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => handleSuggestionTypeSelect('additional_info')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4" />
              Additional Information
            </CardTitle>
            <CardDescription>
              Add missing details or new information
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );

  if (!user) {
    return (
      <Button 
        variant={mode === 'suggest_new' ? 'default' : 'outline'} 
        className={className}
        onClick={() => {
          // Redirect to auth or show login dialog
          navigateToAuth();
        }}
      >
        {mode === 'suggest_new' ? (
          <>
            <Plus className="h-4 w-4 mr-2" />
            Suggest New
          </>
        ) : (
          <>
            <Edit className="h-4 w-4 mr-2" />
            Suggest Edit
          </>
        )}
      </Button>
    );
  }

  return (
    <>
      <Button 
        variant={mode === 'suggest_new' ? 'default' : 'outline'} 
        className={className}
        onClick={handleButtonClick}
      >
        {mode === 'suggest_new' ? (
          <>
            <Plus className="h-4 w-4 mr-2" />
            Suggest New {entityType ? entityTypeLabels[entityType] : 'Entity'}
          </>
        ) : (
          <>
            <Edit className="h-4 w-4 mr-2" />
            Suggest Edit
          </>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={resetDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mode === 'suggest_new' ? 'Suggest New Entity' : 'Suggest Edit'}
            </DialogTitle>
          </DialogHeader>
          
          {showForm && selectedEntityType && selectedSuggestionType ? (
            <SuggestionForm
              entityType={selectedEntityType}
              suggestionType={selectedSuggestionType}
              existingEntityId={entityId}
              onClose={resetDialog}
            />
          ) : (
            <>
              {mode === 'suggest_new' && !selectedEntityType && renderEntityTypeSelector()}
              {mode === 'suggest_edit' && selectedEntityType && !selectedSuggestionType && renderSuggestionTypeSelector()}
              {selectedEntityType && !selectedSuggestionType && mode === 'suggest_new' && renderSuggestionTypeSelector()}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};