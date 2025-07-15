import { useState } from "react";
import { ThemeManagement } from "@/components/Theme/ThemeManagement";
import PanAfricaAdminPanel from "@/components/AI/PanAfricaAdminPanel";
import CivicViewControlPanel from "@/components/AI/CivicViewControlPanel";
import { PoliticalImportDashboard } from "@/components/Politics/PoliticalImportDashboard";
import { BulkImportButton } from "@/components/AI/BulkImportButton";
import { PoliticaAIDashboard } from "@/components/AI/PoliticaAIDashboard";
import { CivicAlertBot } from "@/components/AI/CivicAlertBot";
import { DailyReportGenerator } from "@/components/AI/DailyReportGenerator";
import { CivicAlertSystem } from "@/components/Security/CivicAlertSystem";
import { RoleControlSystem } from "@/components/Security/RoleControlSystem";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/Layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Bot,
  Power,
  Settings,
  Shield,
  DollarSign,
  BarChart3,
  Database,
  Key,
  MessageSquare,
  Newspaper,
  FileText,
  Lock,
  Activity,
  Globe,
  Puzzle,
  Mail,
  CreditCard,
  Download,
  Upload,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  UserCheck,
  Ban,
  Unlock,
  Monitor,
  Building2,
  Star
} from "lucide-react";
import PartyDirectorySync from "@/components/AI/PartyDirectorySync";
import MinisterDirectorySync from "@/components/AI/MinisterDirectorySync";
import SenateDirectorySync from "@/components/AI/SenateDirectorySync";
import { MPDirectorySync } from "@/components/AI/MPDirectorySync";
import { PartyAffiliationResolver } from "@/components/AI/PartyAffiliationResolver";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import TermOfOfficeValidator from "@/components/AI/TermOfOfficeValidator";

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("overview");

  // Check if user is admin
  const { data: userRole } = useQuery({
    queryKey: ["user_role", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!user?.id,
  });

  // Dashboard Statistics
  const { data: stats } = useQuery({
    queryKey: ["admin_stats"],
    queryFn: async () => {
      const [users, vendors, polls, posts] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("marketplace_vendors").select("id", { count: "exact" }),
        supabase.from("polls").select("id", { count: "exact" }),
        supabase.from("pulse_posts").select("id", { count: "exact" })
      ]);

      return {
        users: users.count || 0,
        vendors: vendors.count || 0,
        polls: polls.count || 0,
        posts: posts.count || 0
      };
    },
    enabled: !!userRole,
  });

  // AI Control Management
  const { data: aiConfig } = useQuery({
    queryKey: ["ai_config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("politica_ai_config")
        .select("*")
        .in("config_key", ["ai_enabled", "auto_import_enabled", "auto_verification_enabled"]);
      if (error) throw error;
      
      const configMap: Record<string, boolean> = {};
      data?.forEach(item => {
        configMap[item.config_key] = item.config_value === "true" || item.config_value === true;
      });
      return configMap;
    },
    enabled: !!userRole,
  });

  const updateAIConfigMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: boolean }) => {
      const { error } = await supabase
        .from("politica_ai_config")
        .update({ 
          config_value: value.toString(),
          updated_at: new Date().toISOString()
        })
        .eq("config_key", key);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai_config"] });
      toast({ title: "AI configuration updated successfully" });
    },
    onError: () => {
      toast({ title: "Error updating AI configuration", variant: "destructive" });
    },
  });

  if (!userRole) {
    return (
      <AppLayout showMobileNav={false}>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-8 text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">You don't have admin privileges to access this page.</p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showMobileNav={false}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Complete platform management and control center</p>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <ScrollArea className="w-full">
              <TabsList className="mb-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-1 h-auto p-1">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="politicians" className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Politicians
                </TabsTrigger>
                <TabsTrigger value="term-validation" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Term Validation
                </TabsTrigger>
                <TabsTrigger value="marketplace" className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Marketplace
                </TabsTrigger>
                <TabsTrigger value="ai-control" className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  Politica AI
                </TabsTrigger>
                <TabsTrigger value="civic-intelligence" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Civic Intelligence
                </TabsTrigger>
                <TabsTrigger value="news" className="flex items-center gap-2">
                  <Newspaper className="h-4 w-4" />
                  News
                </TabsTrigger>
                <TabsTrigger value="finance" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Finance
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="themes" className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Themes
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  System Settings
                </TabsTrigger>
                <TabsTrigger value="pan-africa" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Pan-Africa
                </TabsTrigger>
                <TabsTrigger value="civic-control" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Portal Control
                </TabsTrigger>
              </TabsList>
            </ScrollArea>

            {/* 1. OVERVIEW DASHBOARD */}
            <TabsContent value="overview">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.users || 0}</div>
                      <p className="text-xs text-muted-foreground">+2.1% from last month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
                      <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.vendors || 0}</div>
                      <p className="text-xs text-muted-foreground">CM-ID System Active</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Politicians</CardTitle>
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">300+</div>
                      <p className="text-xs text-muted-foreground">14 claimed profiles</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">AI Status</CardTitle>
                      <Bot className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${aiConfig?.ai_enabled ? 'text-green-600' : 'text-red-600'}`}>
                        {aiConfig?.ai_enabled ? 'ACTIVE' : 'OFFLINE'}
                      </div>
                      <p className="text-xs text-muted-foreground">Politica AI Scanner</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Platform Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span>Database Status</span>
                          <Badge variant="default">Online</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Marketplace</span>
                          <Badge variant="default">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>AI Scanner</span>
                          <Badge variant={aiConfig?.ai_enabled ? "default" : "secondary"}>
                            {aiConfig?.ai_enabled ? "Running" : "Stopped"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Security</span>
                          <Badge variant="default">Protected</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" size="sm" onClick={() => setSelectedTab("security")}>
                          <Shield className="h-4 w-4 mr-2" />
                          Security Center
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setSelectedTab("ai-control")}>
                          <Bot className="h-4 w-4 mr-2" />
                          AI Control
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setSelectedTab("civic-intelligence")}>
                          <Activity className="h-4 w-4 mr-2" />
                          Civic Intelligence
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setSelectedTab("civic-control")}>
                          <Eye className="h-4 w-4 mr-2" />
                          Portal Control
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* 2. SECURITY & ACCESS CONTROL */}
            <TabsContent value="security">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Security Control Center
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CivicAlertSystem />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Role Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RoleControlSystem />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 3. USER MANAGEMENT */}
            <TabsContent value="users">
              <div className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      User Management
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Search className="h-4 w-4 mr-2" />
                        Search Users
                      </Button>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{stats?.users || 0}</div>
                            <p className="text-sm text-muted-foreground">Total Users</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">85%</div>
                            <p className="text-sm text-muted-foreground">Verified</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600">12</div>
                            <p className="text-sm text-muted-foreground">Diaspora</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-red-600">3</div>
                            <p className="text-sm text-muted-foreground">Suspended</p>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="border rounded-lg">
                        <div className="p-4 border-b">
                          <h3 className="font-semibold">User Actions</h3>
                        </div>
                        <div className="p-4 space-y-3">
                          <Button variant="outline" className="w-full justify-start">
                            <UserCheck className="h-4 w-4 mr-2" />
                            Approve KYC Documents
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Ban className="h-4 w-4 mr-2" />
                            Suspend/Ban Users
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Unlock className="h-4 w-4 mr-2" />
                            Reset User Passwords
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Mail className="h-4 w-4 mr-2" />
                            Send Warnings/Notifications
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 4. POLITICIANS & PARTIES */}
            <TabsContent value="politicians">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5" />
                      Politicians & Parties Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                     <Tabs defaultValue="politicians" className="w-full">
                       <TabsList className="grid w-full grid-cols-7">
                         <TabsTrigger value="politicians">Politicians</TabsTrigger>
                         <TabsTrigger value="ministers">Ministers</TabsTrigger>
                         <TabsTrigger value="senators">Senators</TabsTrigger>
                         <TabsTrigger value="mps">MPs</TabsTrigger>
                         <TabsTrigger value="parties">Parties</TabsTrigger>
                         <TabsTrigger value="affiliations">Party Links</TabsTrigger>
                         <TabsTrigger value="party-sync">MINAT Sync</TabsTrigger>
                       </TabsList>
                      
                      <TabsContent value="politicians" className="space-y-4">
                        <PoliticalImportDashboard />
                      </TabsContent>
                      
                      <TabsContent value="ministers" className="space-y-4">
                        <MinisterDirectorySync />
                      </TabsContent>
                      
                       <TabsContent value="senators" className="space-y-4">
                         <SenateDirectorySync />
                       </TabsContent>
                       
                       <TabsContent value="mps" className="space-y-4">
                         <MPDirectorySync />
                       </TabsContent>
                       
                       <TabsContent value="affiliations" className="space-y-4">
                         <PartyAffiliationResolver />
                       </TabsContent>
                       
                       <TabsContent value="parties" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-primary" />
                                <span className="text-sm">Total Parties</span>
                              </div>
                              <div className="text-2xl font-bold mt-2">19</div>
                              <p className="text-xs text-muted-foreground">vs 330 in MINAT</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-green-600" />
                                <span className="text-sm">Auto-imported</span>
                              </div>
                              <div className="text-2xl font-bold mt-2">15</div>
                              <p className="text-xs text-muted-foreground">MINAT sourced</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-yellow-600" />
                                <span className="text-sm">With Ratings</span>
                              </div>
                              <div className="text-2xl font-bold mt-2">0</div>
                              <p className="text-xs text-muted-foreground">Citizen rated</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2">
                                <UserCheck className="h-4 w-4 text-blue-600" />
                                <span className="text-sm">Claimed</span>
                              </div>
                              <div className="text-2xl font-bold mt-2">0</div>
                              <p className="text-xs text-muted-foreground">Verified parties</p>
                            </CardContent>
                          </Card>
                        </div>
                        
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Incomplete Directory:</strong> Only 19 of 330 registered political parties are currently in the database. 
                            Use the MINAT Sync feature to import all official parties from the Ministry of Territorial Administration.
                          </AlertDescription>
                        </Alert>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Button className="gap-2" onClick={() => window.open('/political-parties', '_blank')}>
                            <Eye className="h-4 w-4" />
                            View Public Directory
                          </Button>
                          <Button variant="outline" className="gap-2">
                            <Download className="h-4 w-4" />
                            Export Party Data
                          </Button>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="party-sync">
                        <PartyDirectorySync />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TERM VALIDATION */}
            <TabsContent value="term-validation">
              <div className="space-y-6">
                <TermOfOfficeValidator />
              </div>
            </TabsContent>

            {/* 5. MARKETPLACE MANAGEMENT */}
            <TabsContent value="marketplace">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5" />
                      Marketplace Management (Multivendor)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{stats?.vendors || 0}</div>
                            <p className="text-sm text-muted-foreground">Total Vendors</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">150</div>
                            <p className="text-sm text-muted-foreground">Products Listed</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">23</div>
                            <p className="text-sm text-muted-foreground">Active Orders</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="mt-6 space-y-4">
                      <h3 className="text-lg font-semibold">Vendor Management Actions</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button variant="outline" className="h-auto p-4 justify-start">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          <div>
                            <div className="font-medium">Approve Vendor KYC</div>
                            <div className="text-sm text-muted-foreground">Verify business documents</div>
                          </div>
                        </Button>
                        <Button variant="outline" className="h-auto p-4 justify-start">
                          <CreditCard className="h-4 w-4 mr-2" />
                          <div>
                            <div className="font-medium">Generate CM-ID Cards</div>
                            <div className="text-sm text-muted-foreground">Digital vendor verification</div>
                          </div>
                        </Button>
                        <Button variant="outline" className="h-auto p-4 justify-start">
                          <DollarSign className="h-4 w-4 mr-2" />
                          <div>
                            <div className="font-medium">Manage Escrow</div>
                            <div className="text-sm text-muted-foreground">Payment releases & disputes</div>
                          </div>
                        </Button>
                        <Button variant="outline" className="h-auto p-4 justify-start">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          <div>
                            <div className="font-medium">Sales Analytics</div>
                            <div className="text-sm text-muted-foreground">Revenue & performance metrics</div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 6. AI CONTROL PANEL */}
            <TabsContent value="ai-control">
              <div className="space-y-6">
                <PoliticaAIDashboard />
              </div>
            </TabsContent>

            {/* 7. CIVIC INTELLIGENCE CONTROL */}
            <TabsContent value="civic-intelligence">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Civic Intelligence & Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CivicAlertBot />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Daily Report Generator
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DailyReportGenerator />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 8. NEWS MANAGEMENT */}
            <TabsContent value="news">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Newspaper className="h-5 w-5" />
                      News Content Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">127</div>
                          <p className="text-sm text-muted-foreground">Published Articles</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-orange-600">5</div>
                          <p className="text-sm text-muted-foreground">Pending Review</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">98%</div>
                          <p className="text-sm text-muted-foreground">AI Accuracy</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button variant="outline" className="h-auto p-4 justify-start">
                        <Plus className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">Create Article</div>
                          <div className="text-sm text-muted-foreground">Manually add news content</div>
                        </div>
                      </Button>
                      <Button variant="outline" className="h-auto p-4 justify-start">
                        <Upload className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">Import RSS</div>
                          <div className="text-sm text-muted-foreground">Auto-import from sources</div>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 9. FINANCE MANAGEMENT */}
            <TabsContent value="finance">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Financial Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">2.4M</div>
                          <p className="text-sm text-muted-foreground">Total Revenue (FCFA)</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">45</div>
                          <p className="text-sm text-muted-foreground">Claims Processed</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-orange-600">12</div>
                          <p className="text-sm text-muted-foreground">Pending Payments</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-purple-600">180</div>
                          <p className="text-sm text-muted-foreground">Total Donations</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Process Pending Claims
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Export Financial Reports
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Revenue Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 10. ANALYTICS */}
            <TabsContent value="analytics">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Platform Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">12.5K</div>
                          <p className="text-sm text-muted-foreground">Monthly Visitors</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">3.2min</div>
                          <p className="text-sm text-muted-foreground">Avg Session Time</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-orange-600">67%</div>
                          <p className="text-sm text-muted-foreground">Return Rate</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-purple-600">4.8</div>
                          <p className="text-sm text-muted-foreground">Pages/Session</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button variant="outline" className="h-auto p-4 justify-start">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">User Engagement</div>
                          <div className="text-sm text-muted-foreground">Detailed user behavior analytics</div>
                        </div>
                      </Button>
                      <Button variant="outline" className="h-auto p-4 justify-start">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">Growth Metrics</div>
                          <div className="text-sm text-muted-foreground">Platform growth and adoption</div>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 11. THEMES MANAGEMENT */}
            <TabsContent value="themes">
              <div className="space-y-6">
                <ThemeManagement />
              </div>
            </TabsContent>

            {/* 12. SETTINGS & CONFIGURATION */}
            <TabsContent value="settings">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      System Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Platform Configuration</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">Maintenance Mode</div>
                              <div className="text-sm text-muted-foreground">Disable public access</div>
                            </div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">Registration</div>
                              <div className="text-sm text-muted-foreground">Allow new user signups</div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">Email Verification</div>
                              <div className="text-sm text-muted-foreground">Require email confirmation</div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">Force 2FA</div>
                              <div className="text-sm text-muted-foreground">Require two-factor authentication</div>
                            </div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">Session Timeout</div>
                              <div className="text-sm text-muted-foreground">Auto-logout after inactivity</div>
                            </div>
                            <Select defaultValue="24h">
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1h">1 hour</SelectItem>
                                <SelectItem value="24h">24 hours</SelectItem>
                                <SelectItem value="7d">7 days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Feature Toggles</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Marketplace</div>
                            <div className="text-sm text-muted-foreground">Enable vendor marketplace</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Political Claims</div>
                            <div className="text-sm text-muted-foreground">Allow profile claiming</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Pulse Feed</div>
                            <div className="text-sm text-muted-foreground">Social content sharing</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Donations</div>
                            <div className="text-sm text-muted-foreground">Accept platform donations</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 13. PAN-AFRICA EXPANSION */}
            <TabsContent value="pan-africa">
              <div className="space-y-6">
                <PanAfricaAdminPanel />
              </div>
            </TabsContent>

            {/* 14. CIVIC VIEW CONTROL PANEL */}
            <TabsContent value="civic-control">
              <div className="space-y-6">
                <CivicViewControlPanel />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default Admin;