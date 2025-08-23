import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useDonationCauses } from '@/hooks/useDonations';

interface CauseSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
}

export const CauseSelector: React.FC<CauseSelectorProps> = ({ value, onChange, label = 'Select Cause', required }) => {
  const { causes, isLoading } = useDonationCauses();

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger>
          <SelectValue placeholder={isLoading ? 'Loading causes...' : 'Choose a cause'} />
        </SelectTrigger>
        <SelectContent>
          {causes.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {required && !value && (
        <p className="text-xs text-muted-foreground">Please select a cause</p>
      )}
    </div>
  );
};
