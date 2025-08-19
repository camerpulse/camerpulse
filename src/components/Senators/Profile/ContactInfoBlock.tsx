import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MapPin, Lock } from 'lucide-react';
import { Senator } from '@/hooks/useSenators';

interface ContactInfoBlockProps {
  senator: Senator;
  hasProAccess: boolean;
}

export function ContactInfoBlock({ senator, hasProAccess }: ContactInfoBlockProps) {
  if (!hasProAccess) {
    return (
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Contact Information</CardTitle>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              <Lock className="h-3 w-3 mr-1" />
              Pro Only
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Lock className="h-12 w-12 mx-auto text-amber-600 mb-3" />
            <p className="text-amber-800 font-medium mb-2">Premium Feature</p>
            <p className="text-sm text-amber-700">
              Upgrade to CamerPulse Pro to access official contact information
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Contact Information</CardTitle>
          <Badge variant="default" className="bg-green-100 text-green-800">
            ✓ Pro Access
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {senator.email && (
          <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
            <Mail className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Official Email</p>
              <p className="font-medium">{senator.email}</p>
            </div>
          </div>
        )}

        {senator.phone && (
          <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
            <Phone className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Phone Number</p>
              <p className="font-medium">{senator.phone}</p>
            </div>
          </div>
        )}

        {/* Office Address - if available */}
        <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
          <MapPin className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">Office Address</p>
            <p className="font-medium">
              Senate Building, Unity Palace<br />
              Yaounde, Centre Region
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> This information is verified and updated by CamerPulse Intelligence.
            Use responsibly for civic engagement purposes only.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}