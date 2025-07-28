import React, { useState } from 'react';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { Hospital, Pill, ShieldCheck, FileText, Star, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface HealthcareManagementModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const HealthcareManagementModule: React.FC<HealthcareManagementModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [activeTab, setActiveTab] = useState('hospitals');

  // Mock data for demonstration
  const hospitals = [
    {
      id: 1,
      name: 'Yaoundé General Hospital',
      type: 'Public',
      region: 'Centre',
      beds: 450,
      status: 'operational',
      rating: 4.2,
      claims: 23,
      verified: true
    },
    {
      id: 2,
      name: 'Douala Regional Hospital',
      type: 'Public',
      region: 'Littoral',
      beds: 380,
      status: 'operational',
      rating: 4.0,
      claims: 15,
      verified: true
    }
  ];

  const pharmacies = [
    {
      id: 1,
      name: 'Pharmacie Centrale',
      location: 'Yaoundé Centre',
      type: 'Independent',
      license: 'PH-2024-001',
      status: 'active',
      rating: 4.5,
      claims: 5,
      verified: true
    },
    {
      id: 2,
      name: 'Pharmacie du Marché',
      location: 'Douala Akwa',
      type: 'Chain',
      license: 'PH-2024-002',
      status: 'active',
      rating: 4.1,
      claims: 8,
      verified: false
    }
  ];

  const insuranceClaims = [
    {
      id: 1,
      claimNumber: 'INS-2024-001',
      provider: 'CAMTEL Insurance',
      hospital: 'Yaoundé General Hospital',
      amount: 450000,
      status: 'approved',
      date: '2024-01-15'
    },
    {
      id: 2,
      claimNumber: 'INS-2024-002',
      provider: 'National Social Insurance',
      hospital: 'Douala Regional Hospital',
      amount: 280000,
      status: 'pending',
      date: '2024-01-20'
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      operational: "default",
      active: "default",
      approved: "default",
      pending: "secondary",
      under_review: "outline",
      suspended: "destructive"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Healthcare Management"
        description="Manage hospitals, pharmacies, and insurance systems"
        icon={Hospital}
        iconColor="text-blue-600"
        searchPlaceholder="Search healthcare facilities..."
        onSearch={(query) => {
          console.log('Searching healthcare:', query);
        }}
        onRefresh={() => {
          logActivity('healthcare_admin_refresh', { timestamp: new Date() });
        }}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
          <TabsTrigger value="pharmacies">Pharmacies</TabsTrigger>
          <TabsTrigger value="insurance">Insurance Claims</TabsTrigger>
        </TabsList>

        <TabsContent value="hospitals" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Hospitals</CardTitle>
                <Hospital className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Beds</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8,450</div>
                <p className="text-xs text-muted-foreground">Across all regions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89</div>
                <p className="text-xs text-muted-foreground">Requiring review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.2</div>
                <p className="text-xs text-muted-foreground">Based on reviews</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Hospital Directory</CardTitle>
              <CardDescription>Manage hospital registrations and verifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hospitals.map((hospital) => (
                  <div key={hospital.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{hospital.name}</h3>
                        {hospital.verified && <ShieldCheck className="h-4 w-4 text-green-600" />}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{hospital.type}</span>
                        <span>{hospital.region}</span>
                        <span>{hospital.beds} beds</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 fill-current text-yellow-400" />
                          <span>{hospital.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(hospital.status)}
                      {hospital.claims > 0 && (
                        <Badge variant="outline">{hospital.claims} claims</Badge>
                      )}
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pharmacies" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pharmacies</CardTitle>
                <Pill className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,345</div>
                <p className="text-xs text-muted-foreground">+8% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Licensed</CardTitle>
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,201</div>
                <p className="text-xs text-muted-foreground">94% compliance rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">Under investigation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.3</div>
                <p className="text-xs text-muted-foreground">Customer satisfaction</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pharmacy Directory</CardTitle>
              <CardDescription>Manage pharmacy licenses and compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pharmacies.map((pharmacy) => (
                  <div key={pharmacy.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{pharmacy.name}</h3>
                        {pharmacy.verified && <ShieldCheck className="h-4 w-4 text-green-600" />}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{pharmacy.location}</span>
                        <span>{pharmacy.type}</span>
                        <span>License: {pharmacy.license}</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 fill-current text-yellow-400" />
                          <span>{pharmacy.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(pharmacy.status)}
                      {pharmacy.claims > 0 && (
                        <Badge variant="outline">{pharmacy.claims} claims</Badge>
                      )}
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insurance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12,456</div>
                <p className="text-xs text-muted-foreground">This year</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved Claims</CardTitle>
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">11,234</div>
                <p className="text-xs text-muted-foreground">90.2% approval rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.8B</div>
                <p className="text-xs text-muted-foreground">FCFA processed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">456</div>
                <p className="text-xs text-muted-foreground">Awaiting verification</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Insurance Claims Management</CardTitle>
              <CardDescription>Review and process insurance claims</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insuranceClaims.map((claim) => (
                  <div key={claim.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{claim.claimNumber}</h3>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{claim.provider}</span>
                        <span>{claim.hospital}</span>
                        <span>{claim.amount.toLocaleString()} FCFA</span>
                        <span>{claim.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(claim.status)}
                      <Button variant="outline" size="sm">Review</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};