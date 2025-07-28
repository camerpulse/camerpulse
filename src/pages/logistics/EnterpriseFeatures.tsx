import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  BarChart3, 
  Plug, 
  Palette, 
  Shield, 
  Truck,
  Users,
  Database,
  Activity,
  Settings,
  Bell,
  FileText
} from 'lucide-react';
import { MultiTenantManager } from '@/components/logistics/enterprise/MultiTenantManager';
import { AdvancedAnalytics } from '@/components/logistics/enterprise/AdvancedAnalytics';
import { ApiGateway } from '@/components/logistics/enterprise/ApiGateway';
import { InsuranceManager } from '@/components/logistics/enterprise/InsuranceManager';
import { FleetManagement } from '@/components/logistics/enterprise/FleetManagement';

export const EnterpriseFeatures = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const features = [
    {
      id: 'tenants',
      title: 'Multi-tenant Architecture',
      description: 'Manage different logistics companies with isolated data',
      icon: Building2,
      status: 'active',
      companies: 12,
      component: <MultiTenantManager />
    },
    {
      id: 'analytics',
      title: 'Advanced Analytics & Reporting',
      description: 'Real-time dashboards and custom reports',
      icon: BarChart3,
      status: 'active',
      reports: 24,
      component: <AdvancedAnalytics />
    },
    {
      id: 'api',
      title: 'API Gateway',
      description: 'Third-party integrations and webhook management',
      icon: Plug,
      status: 'active',
      integrations: 8,
      component: <ApiGateway />
    },
    {
      id: 'whitelabel',
      title: 'White-label Solutions',
      description: 'Custom branding and configuration per company',
      icon: Palette,
      status: 'active',
      brands: 5,
      component: (
        <div className="p-6">
          <h3 className="text-2xl font-bold mb-4">White-label Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Brand Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Customize logos, colors, and branding for each company
                </p>
                <Button className="w-full">Configure Branding</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Custom Domains
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Set up custom domains for partner companies
                </p>
                <Button className="w-full">Manage Domains</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Custom email and document templates
                </p>
                <Button className="w-full">Edit Templates</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'insurance',
      title: 'Insurance & Claims Management',
      description: 'Policy tracking and claims processing',
      icon: Shield,
      status: 'active',
      policies: 156,
      component: <InsuranceManager />
    },
    {
      id: 'fleet',
      title: 'Fleet Management',
      description: 'Vehicle tracking, maintenance, and monitoring',
      icon: Truck,
      status: 'active',
      vehicles: 89,
      component: <FleetManagement />
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enterprise Features</h1>
          <p className="text-muted-foreground">
            Comprehensive enterprise logistics management platform
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          <Activity className="h-4 w-4 mr-2" />
          All Systems Active
        </Badge>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tenants">Multi-Tenant</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="api">API Gateway</TabsTrigger>
          <TabsTrigger value="whitelabel">White-label</TabsTrigger>
          <TabsTrigger value="insurance">Insurance</TabsTrigger>
          <TabsTrigger value="fleet">Fleet</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setActiveTab(feature.id)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Icon className="h-8 w-8 text-primary" />
                      <Badge variant={feature.status === 'active' ? 'default' : 'secondary'}>
                        {feature.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {feature.companies && `${feature.companies} Companies`}
                        {feature.reports && `${feature.reports} Reports`}
                        {feature.integrations && `${feature.integrations} Integrations`}
                        {feature.brands && `${feature.brands} Brands`}
                        {feature.policies && `${feature.policies} Policies`}
                        {feature.vehicles && `${feature.vehicles} Vehicles`}
                      </span>
                      <Button variant="ghost" size="sm">
                        Configure →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-sm text-muted-foreground">Active Tenants</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">89</p>
                    <p className="text-sm text-muted-foreground">Fleet Vehicles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">156</p>
                    <p className="text-sm text-muted-foreground">Insurance Policies</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Plug className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">8</p>
                    <p className="text-sm text-muted-foreground">API Integrations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Feature-specific tabs */}
        {features.map((feature) => (
          <TabsContent key={feature.id} value={feature.id}>
            {feature.component}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};