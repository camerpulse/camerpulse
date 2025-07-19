import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  MapPin, 
  Star,
  AlertTriangle,
  Trash2,
  Edit,
  Eye
} from 'lucide-react';
import { useVillages } from '@/hooks/useVillages';

interface PendingVillage {
  id: string;
  village_name: string;
  region: string;
  division: string;
  subdivision?: string;
  submitted_by: string;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
}

// Mock pending villages data
const pendingVillages: PendingVillage[] = [
  {
    id: '1',
    village_name: 'Nkambe',
    region: 'Northwest',
    division: 'Donga-Mantung',
    subdivision: 'Nkambe',
    submitted_by: 'John Tanyi',
    submitted_at: '2024-01-15T10:30:00Z',
    status: 'pending'
  },
  {
    id: '2',
    village_name: 'Tiko',
    region: 'Southwest', 
    division: 'Fako',
    submitted_by: 'Marie Ndongo',
    submitted_at: '2024-01-14T15:45:00Z',
    status: 'pending'
  }
];

export const AdminVillagePanel: React.FC = () => {
  const { data: villages, isLoading } = useVillages();
  const [selectedTab, setSelectedTab] = React.useState<'pending' | 'verified' | 'analytics'>('pending');
  const [selectedVillage, setSelectedVillage] = React.useState<string | null>(null);

  const handleApprove = (villageId: string) => {
    console.log('Approving village:', villageId);
    // Implementation would go here
  };

  const handleReject = (villageId: string, reason: string) => {
    console.log('Rejecting village:', villageId, 'Reason:', reason);
    // Implementation would go here
  };

  const handleFeature = (villageId: string) => {
    console.log('Featuring village as village of the week:', villageId);
    // Implementation would go here
  };

  const verifiedVillages = villages?.filter(v => v.is_verified) || [];
  const unverifiedVillages = villages?.filter(v => !v.is_verified) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            Village Admin Panel
          </h1>
          <p className="text-muted-foreground">
            Manage village submissions, verification, and featured content
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <div>
              <div className="text-2xl font-bold">{pendingVillages.length}</div>
              <div className="text-sm text-muted-foreground">Pending Approval</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <div className="text-2xl font-bold">{verifiedVillages.length}</div>
              <div className="text-sm text-muted-foreground">Verified Villages</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <div className="text-2xl font-bold">{unverifiedVillages.length}</div>
              <div className="text-sm text-muted-foreground">Needs Review</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-600" />
            <div>
              <div className="text-2xl font-bold">1</div>
              <div className="text-sm text-muted-foreground">Featured This Week</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button 
          variant={selectedTab === 'pending' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('pending')}
        >
          <Clock className="w-4 h-4 mr-2" />
          Pending ({pendingVillages.length})
        </Button>
        <Button 
          variant={selectedTab === 'verified' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('verified')}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Verified ({verifiedVillages.length})
        </Button>
        <Button 
          variant={selectedTab === 'analytics' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('analytics')}
        >
          <Users className="w-4 h-4 mr-2" />
          Analytics
        </Button>
      </div>

      {/* Content */}
      {selectedTab === 'pending' && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Pending Village Submissions</h3>
          <div className="space-y-4">
            {pendingVillages.map((village) => (
              <div key={village.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{village.village_name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{village.division}, {village.region}</span>
                      {village.subdivision && <span>• {village.subdivision}</span>}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Submitted by <strong>{village.submitted_by}</strong> • 
                      {new Date(village.submitted_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    Pending Review
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleApprove(village.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedVillage(village.id)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Review Details
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleReject(village.id, 'Duplicate entry')}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>

                {selectedVillage === village.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded">
                    <h5 className="font-medium mb-2">Admin Notes</h5>
                    <Textarea 
                      placeholder="Add notes for this village submission..."
                      className="mb-2"
                    />
                    <div className="flex gap-2">
                      <Button size="sm">Save Notes</Button>
                      <Button size="sm" variant="outline" onClick={() => setSelectedVillage(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {selectedTab === 'verified' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Verified Villages</h3>
            <div className="flex gap-2">
              <Input placeholder="Search villages..." className="w-64" />
              <Button variant="outline">
                <Star className="w-4 h-4 mr-1" />
                Feature Village
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            {verifiedVillages.slice(0, 10).map((village) => (
              <div key={village.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="font-medium">{village.village_name}</h4>
                    <div className="text-sm text-muted-foreground">
                      {village.division}, {village.region} • {village.overall_rating.toFixed(1)}★
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleFeature(village.id)}>
                    <Star className="w-3 h-3 mr-1" />
                    Feature
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {selectedTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Regional Coverage</h3>
            <div className="space-y-3">
              {['Northwest', 'West', 'Southwest', 'Centre', 'Littoral', 'North', 'Adamawa', 'East', 'South', 'Far North'].map((region) => {
                const count = villages?.filter(v => v.region === region).length || 0;
                return (
                  <div key={region} className="flex justify-between">
                    <span>{region}</span>
                    <Badge variant="outline">{count} villages</Badge>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Village Quality Metrics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Average Rating</span>
                  <span className="text-sm">4.2/5.0</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '84%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Verification Rate</span>
                  <span className="text-sm">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};