import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, Users, MapPin } from 'lucide-react';
import { useGrantPrograms } from '@/hooks/useCivicIncentives';
import { format } from 'date-fns';

export const GrantProgramsList: React.FC = () => {
  const { data: grantPrograms, isLoading } = useGrantPrograms('open');

  if (isLoading) {
    return <div>Loading grant programs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Available Grant Programs</h2>
        <Badge variant="secondary">{grantPrograms?.length || 0} Active</Badge>
      </div>

      <div className="grid gap-6">
        {grantPrograms?.map((program) => (
          <Card key={program.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{program.program_name}</CardTitle>
                  <CardDescription className="mt-2">{program.description}</CardDescription>
                </div>
                <Badge variant={program.program_type === 'grant' ? 'default' : 'secondary'}>
                  {program.program_type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Max Amount</p>
                    <p className="text-xs text-muted-foreground">
                      {program.max_award_amount_fcfa?.toLocaleString()} FCFA
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Deadline</p>
                    <p className="text-xs text-muted-foreground">
                      {program.application_deadline 
                        ? format(new Date(program.application_deadline), 'MMM dd, yyyy')
                        : 'Open'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Category</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {program.program_category.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <Badge variant="outline" className="text-xs">
                      {program.program_status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                <Button size="sm">
                  Apply Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!grantPrograms?.length && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No grant programs are currently available.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Check back soon for new opportunities!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};