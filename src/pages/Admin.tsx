import { useState } from "react";
import { ThemeManagement } from "@/components/Theme/ThemeManagement";
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
  Monitor
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  // Vendor Management
  const { data: vendors } = useQuery({
    queryKey: ["admin_vendors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_vendors")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      
      // Get profile data separately
      const vendorIds = data?.map(v => v.user_id) || [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, display_name")
        .in("user_id", vendorIds);
        
      // Combine the data
      return data?.map(vendor => ({
        ...vendor,
        profile: profiles?.find(p => p.user_id === vendor.user_id)
      })) || [];
    },
    enabled: !!userRole,
  });

  // Update vendor verification
  const updateVendorMutation = useMutation({
    mutationFn: async ({ vendorId, status }: { vendorId: string; status: string }) => {
      const { error } = await supabase
        .from("marketplace_vendors")
        .update({ verification_status: status })
        .eq("id", vendorId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_vendors"] });
      toast({ title: "Vendor status updated successfully" });
    },
    onError: () => {
      toast({ title: "Error updating vendor status", variant: "destructive" });
    },
  });

  // News Articles Management
  const [newsDialog, setNewsDialog] = useState(false);
  const [editingNews, setEditingNews] = useState<any>(null);
  const [newsForm, setNewsForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    source_name: "",
    source_url: "",
    image_url: "",
    sentiment_label: "neutral",
    is_pinned: false
  });

  const { data: newsArticles } = useQuery({
    queryKey: ["admin_news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_articles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userRole,
  });

  const createNewsMutation = useMutation({
    mutationFn: async (formData: any) => {
      const { error } = await supabase
        .from("news_articles")
        .insert([formData]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_news"] });
      setNewsDialog(false);
      setNewsForm({
        title: "",
        excerpt: "",
        content: "",
        source_name: "",
        source_url: "",
        image_url: "",
        sentiment_label: "neutral",
        is_pinned: false
      });
      toast({ title: "News article created successfully" });
    },
  });

  const updateNewsMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: any }) => {
      const { error } = await supabase
        .from("news_articles")
        .update(formData)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_news"] });
      setNewsDialog(false);
      setEditingNews(null);
      toast({ title: "News article updated successfully" });
    },
  });

  const deleteNewsMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("news_articles")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_news"] });
      toast({ title: "News article deleted successfully" });
    },
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

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { variant: "secondary" as const, icon: Clock },
      verified: { variant: "default" as const, icon: CheckCircle },
      rejected: { variant: "destructive" as const, icon: XCircle }
    };
    const config = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <AppLayout showMobileNav={false}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage platform content and users</p>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <ScrollArea className="w-full">
              <TabsList className="mb-8 flex-wrap h-auto p-1">
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
                <TabsTrigger value="marketplace" className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Marketplace
                </TabsTrigger>
                <TabsTrigger value="messaging" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Messaging
                </TabsTrigger>
                <TabsTrigger value="pulse-feed" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Pulse & Forums
                </TabsTrigger>
                <TabsTrigger value="themes" className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Thèmes
                </TabsTrigger>
                <TabsTrigger value="ai-control" className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  Politica AI
                </TabsTrigger>
                <TabsTrigger value="plugins" className="flex items-center gap-2">
                  <Puzzle className="h-4 w-4" />
                  Plugins
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
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
                <TabsTrigger value="logs" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Logs & Backups
                </TabsTrigger>
                <TabsTrigger value="api" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  API & Dev
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
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>New vendor application approved</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4 text-blue-600" />
                          <span>AI verified 12 political profiles</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span>Payment received: Party claim</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Newspaper className="h-4 w-4 text-orange-600" />
                          <span>3 news articles auto-imported</span>
                        </div>
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
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <Lock className="h-8 w-8 mx-auto mb-2 text-green-600" />
                            <h3 className="font-semibold">2FA Status</h3>
                            <p className="text-sm text-muted-foreground">Enabled</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <Activity className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                            <h3 className="font-semibold">Active Sessions</h3>
                            <p className="text-sm text-muted-foreground">3 logged in</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                            <h3 className="font-semibold">Failed Logins</h3>
                            <p className="text-sm text-muted-foreground">0 today</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Admin Actions</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button variant="outline" className="h-auto p-4 justify-start">
                          <Ban className="h-4 w-4 mr-2" />
                          <div>
                            <div className="font-medium">Suspend User</div>
                            <div className="text-sm text-muted-foreground">Temporarily disable account</div>
                          </div>
                        </Button>
                        <Button variant="outline" className="h-auto p-4 justify-start">
                          <Unlock className="h-4 w-4 mr-2" />
                          <div>
                            <div className="font-medium">Reset Password</div>
                            <div className="text-sm text-muted-foreground">Force password reset</div>
                          </div>
                        </Button>
                        <Button variant="outline" className="h-auto p-4 justify-start">
                          <Monitor className="h-4 w-4 mr-2" />
                          <div>
                            <div className="font-medium">View Login Logs</div>
                            <div className="text-sm text-muted-foreground">Track login activity</div>
                          </div>
                        </Button>
                        <Button variant="outline" className="h-auto p-4 justify-start">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          <div>
                            <div className="font-medium">Security Alerts</div>
                            <div className="text-sm text-muted-foreground">View suspicious activity</div>
                          </div>
                        </Button>
                      </div>
                    </div>
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
                      Politicians & Political Parties
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Politician Management</h3>
                        <div className="space-y-3">
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center">
                                <span>Total Politicians</span>
                                <Badge>300+</Badge>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center">
                                <span>Claimed Profiles</span>
                                <Badge variant="secondary">14</Badge>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center">
                                <span>Pending Claims</span>
                                <Badge variant="outline">3</Badge>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <Button variant="outline" className="w-full justify-start">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Politician Data
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve Claims (500,000 FCFA)
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Upload className="h-4 w-4 mr-2" />
                            Attach Missing Data
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">Political Party Management</h3>
                        <div className="space-y-3">
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center">
                                <span>Total Parties</span>
                                <Badge>14</Badge>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center">
                                <span>AI Imported</span>
                                <Badge variant="secondary">14</Badge>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center">
                                <span>Claimed Parties</span>
                                <Badge variant="outline">0</Badge>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <Button variant="outline" className="w-full justify-start">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Party Data
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve Claims (1,000,000 FCFA)
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Bot className="h-4 w-4 mr-2" />
                            Trigger AI Re-scan
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
                          <Ban className="h-4 w-4 mr-2" />
                          <div>
                            <div className="font-medium">Suspend Fraudulent Vendors</div>
                            <div className="text-sm text-muted-foreground">Security actions</div>
                          </div>
                        </Button>
                      </div>
                    </div>

                    {/* Existing vendor list */}
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-4">Recent Vendor Applications</h3>
                      <div className="space-y-4">
                        {vendors?.map((vendor) => (
                          <div key={vendor.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h3 className="font-semibold">{vendor.business_name}</h3>
                              <p className="text-sm text-muted-foreground">
                                Vendor ID: {vendor.vendor_id} • Owner: @{vendor.profile?.username || "Unknown"}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">{vendor.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(vendor.verification_status || "pending")}
                              <Select
                                value={vendor.verification_status || "pending"}
                                onValueChange={(value) => 
                                  updateVendorMutation.mutate({ vendorId: vendor.id, status: value })
                                }
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="verified">Verified</SelectItem>
                                  <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 6. CAMERAMESSENGER CONTROLS */}
            <TabsContent value="messaging">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      CamerMessenger Controls
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">1,200</div>
                          <p className="text-sm text-muted-foreground">Total Messages</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-red-600">3</div>
                          <p className="text-sm text-muted-foreground">Flagged Chats</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">Active</div>
                          <p className="text-sm text-muted-foreground">Encryption</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Moderation Tools</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button variant="outline" className="h-auto p-4 justify-start">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          <div>
                            <div className="font-medium">View Flagged Conversations</div>
                            <div className="text-sm text-muted-foreground">Review reported content</div>
                          </div>
                        </Button>
                        <Button variant="outline" className="h-auto p-4 justify-start">
                          <Ban className="h-4 w-4 mr-2" />
                          <div>
                            <div className="font-medium">Suspend Spammers</div>
                            <div className="text-sm text-muted-foreground">Block abusive users</div>
                          </div>
                        </Button>
                        <Button variant="outline" className="h-auto p-4 justify-start">
                          <Upload className="h-4 w-4 mr-2" />
                          <div>
                            <div className="font-medium">File Sharing Controls</div>
                            <div className="text-sm text-muted-foreground">Manage uploads & expiration</div>
                          </div>
                        </Button>
                        <Button variant="outline" className="h-auto p-4 justify-start">
                          <Settings className="h-4 w-4 mr-2" />
                          <div>
                            <div className="font-medium">Encryption Settings</div>
                            <div className="text-sm text-muted-foreground">PGP configuration</div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* THEMES MANAGEMENT */}
            <TabsContent value="themes">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Theme Management</h2>
                    <p className="text-muted-foreground">Manage visual themes and platform appearance</p>
                  </div>
                  <Button variant="outline">
                    <Monitor className="h-4 w-4 mr-2" />
                    Preview Mode
                  </Button>
                </div>
                <ThemeManagement />
              </div>
            </TabsContent>

            {/* 7. PULSE FEED & FORUM MODERATION */}
            <TabsContent value="pulse-feed">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Pulse Feed & Forum Moderation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">{stats?.posts || 0}</div>
                          <p className="text-sm text-muted-foreground">Pulse Posts</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-orange-600">5</div>
                          <p className="text-sm text-muted-foreground">Flagged Posts</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">12</div>
                          <p className="text-sm text-muted-foreground">Active Forums</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-purple-600">Positive</div>
                          <p className="text-sm text-muted-foreground">Overall Sentiment</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Content Moderation</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button variant="outline" className="h-auto p-4 justify-start">
                          <Eye className="h-4 w-4 mr-2" />
                          <div>
                            <div className="font-medium">Review Flagged Posts</div>
                            <div className="text-sm text-muted-foreground">Political speech moderation</div>
                          </div>
                        </Button>
                        <Button variant="outline" className="h-auto p-4 justify-start">
                          <Trash2 className="h-4 w-4 mr-2" />
                          <div>
                            <div className="font-medium">Remove Hate Speech</div>
                            <div className="text-sm text-muted-foreground">Delete harmful content</div>
                          </div>
                        </Button>
                        <Button variant="outline" className="h-auto p-4 justify-start">
                          <Plus className="h-4 w-4 mr-2" />
                          <div>
                            <div className="font-medium">Manage Forum Categories</div>
                            <div className="text-sm text-muted-foreground">Professional groups setup</div>
                          </div>
                        </Button>
                        <Button variant="outline" className="h-auto p-4 justify-start">
                          <UserCheck className="h-4 w-4 mr-2" />
                          <div>
                            <div className="font-medium">Assign Forum Admins</div>
                            <div className="text-sm text-muted-foreground">Delegate moderation</div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 8. PLUGIN MANAGEMENT */}
            <TabsContent value="plugins">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Puzzle className="h-5 w-5" />
                      Plugin Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-muted-foreground">Toggle platform modules on/off with one click</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h3 className="font-semibold">CamerDirectory</h3>
                              <p className="text-sm text-muted-foreground">Business & professional directory</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h3 className="font-semibold">CamerMessenger</h3>
                              <p className="text-sm text-muted-foreground">Encrypted messaging system</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h3 className="font-semibold">CamerForums</h3>
                              <p className="text-sm text-muted-foreground">Professional discussion groups</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h3 className="font-semibold">CamerHouses</h3>
                              <p className="text-sm text-muted-foreground">Real estate marketplace</p>
                            </div>
                            <Switch />
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h3 className="font-semibold">MBOA Tracker</h3>
                              <p className="text-sm text-muted-foreground">Government project monitoring</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h3 className="font-semibold">CamerNews Blog</h3>
                              <p className="text-sm text-muted-foreground">Auto news aggregation</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h3 className="font-semibold">Donations System</h3>
                              <p className="text-sm text-muted-foreground">Platform funding & support</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h3 className="font-semibold">Advertising System</h3>
                              <p className="text-sm text-muted-foreground">Monetization & ads</p>
                            </div>
                            <Switch />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 10. FINANCE & PAYMENTS */}
            <TabsContent value="finance">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Payments, Finance & Donations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">2.5M</div>
                          <p className="text-sm text-muted-foreground">FCFA Revenue</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">45</div>
                          <p className="text-sm text-muted-foreground">Transactions</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-orange-600">3</div>
                          <p className="text-sm text-muted-foreground">Pending Claims</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-purple-600">125K</div>
                          <p className="text-sm text-muted-foreground">Donations</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Financial Management</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button variant="outline" className="h-auto p-4 justify-start">
                          <CreditCard className="h-4 w-4 mr-2" />
                          <div>
                            <div className="font-medium">View All Transactions</div>
                            <div className="text-sm text-muted-foreground">Claims, marketplace, donations</div>
                          </div>
                        </Button>
                        <Button variant="outline" className="h-auto p-4 justify-start">
                          <Download className="h-4 w-4 mr-2" />
                          <div>
                            <div className="font-medium">Generate Reports</div>
                            <div className="text-sm text-muted-foreground">PDF/CSV financial exports</div>
                          </div>
                        </Button>
                        <Button variant="outline" className="h-auto p-4 justify-start">
                          <DollarSign className="h-4 w-4 mr-2" />
                          <div>
                            <div className="font-medium">Manage Escrow</div>
                            <div className="text-sm text-muted-foreground">Release payments & disputes</div>
                          </div>
                        </Button>
                        <Button variant="outline" className="h-auto p-4 justify-start">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          <div>
                            <div className="font-medium">Process Refunds</div>
                            <div className="text-sm text-muted-foreground">Failed payment handling</div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 11. ANALYTICS DASHBOARD */}
            <TabsContent value="analytics">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Platform Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">User Analytics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Daily Active</span>
                              <span className="font-bold">1,250</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Weekly Active</span>
                              <span className="font-bold">5,400</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Growth Rate</span>
                              <span className="font-bold text-green-600">+12%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Political Engagement</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Top Politician</span>
                              <span className="font-bold">Paul Biya</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Most Discussed</span>
                              <span className="font-bold">CPDM</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Sentiment</span>
                              <span className="font-bold text-green-600">Positive</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Marketplace Stats</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Total Orders</span>
                              <span className="font-bold">2,350</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Top Vendor</span>
                              <span className="font-bold">CM-0000001</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Revenue</span>
                              <span className="font-bold text-green-600">2.5M FCFA</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 12. PLATFORM SETTINGS */}
            <TabsContent value="settings">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Platform Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">General Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Platform Name</label>
                            <Input defaultValue="CamerPulse" />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Default Language</label>
                            <Select defaultValue="en">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-lg font-semibold mb-4">Pricing Configuration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Politician Claim Fee</label>
                            <Input defaultValue="500000" />
                            <p className="text-xs text-muted-foreground">Amount in FCFA</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Party Claim Fee</label>
                            <Input defaultValue="1000000" />
                            <p className="text-xs text-muted-foreground">Amount in FCFA</p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-lg font-semibold mb-4">System Controls</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">Maintenance Mode</h4>
                              <p className="text-sm text-muted-foreground">Temporarily disable platform access</p>
                            </div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">New User Registration</h4>
                              <p className="text-sm text-muted-foreground">Allow new account creation</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 13. LOGS & BACKUPS */}
            <TabsContent value="logs">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Logs & Backups
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Activity Logs</h3>
                        <div className="space-y-3">
                          <Button variant="outline" className="w-full justify-start">
                            <Activity className="h-4 w-4 mr-2" />
                            Admin Activity Logs
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Bot className="h-4 w-4 mr-2" />
                            Politica AI Logs
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Payment Logs
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Shield className="h-4 w-4 mr-2" />
                            Security Logs
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">Backup Management</h3>
                        <div className="space-y-3">
                          <div className="p-4 border rounded-lg">
                            <div className="flex justify-between items-center">
                              <span>Last Backup</span>
                              <Badge>2 hours ago</Badge>
                            </div>
                          </div>
                          <Button variant="outline" className="w-full justify-start">
                            <Download className="h-4 w-4 mr-2" />
                            Download Full Backup
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule Auto-Backup
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Database className="h-4 w-4 mr-2" />
                            Database Backup
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 14. API & DEVELOPER CONTROLS */}
            <TabsContent value="api">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      Developer & API Controls
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">API Management</h3>
                        <div className="space-y-4">
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center">
                                <span>Vendor Verification API</span>
                                <Badge variant="default">Active</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">Rate: 1000/hour</p>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center">
                                <span>Politica AI Data API</span>
                                <Badge variant="default">Active</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">Rate: 500/hour</p>
                            </CardContent>
                          </Card>

                          <Button variant="outline" className="w-full justify-start">
                            <Plus className="h-4 w-4 mr-2" />
                            Generate New API Key
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">Usage Monitoring</h3>
                        <div className="space-y-4">
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">2,450</div>
                                <p className="text-sm text-muted-foreground">API Calls Today</p>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Button variant="outline" className="w-full justify-start">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Usage Analytics
                          </Button>
                          
                          <Button variant="outline" className="w-full justify-start">
                            <Ban className="h-4 w-4 mr-2" />
                            Revoke API Keys
                          </Button>
                          
                          <Button variant="outline" className="w-full justify-start">
                            <Settings className="h-4 w-4 mr-2" />
                            Configure Rate Limits
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="news">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>News Management</CardTitle>
                  <Dialog open={newsDialog} onOpenChange={setNewsDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Article
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{editingNews ? "Edit Article" : "Create Article"}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Article title"
                          value={newsForm.title}
                          onChange={(e) => setNewsForm(prev => ({ ...prev, title: e.target.value }))}
                        />
                        <Textarea
                          placeholder="Article excerpt"
                          value={newsForm.excerpt}
                          onChange={(e) => setNewsForm(prev => ({ ...prev, excerpt: e.target.value }))}
                        />
                        <Textarea
                          placeholder="Article content"
                          value={newsForm.content}
                          onChange={(e) => setNewsForm(prev => ({ ...prev, content: e.target.value }))}
                          rows={6}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            placeholder="Source name"
                            value={newsForm.source_name}
                            onChange={(e) => setNewsForm(prev => ({ ...prev, source_name: e.target.value }))}
                          />
                          <Input
                            placeholder="Source URL"
                            value={newsForm.source_url}
                            onChange={(e) => setNewsForm(prev => ({ ...prev, source_url: e.target.value }))}
                          />
                        </div>
                        <Input
                          placeholder="Image URL"
                          value={newsForm.image_url}
                          onChange={(e) => setNewsForm(prev => ({ ...prev, image_url: e.target.value }))}
                        />
                        <Select
                          value={newsForm.sentiment_label}
                          onValueChange={(value) => setNewsForm(prev => ({ ...prev, sentiment_label: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="positive">Positive</SelectItem>
                            <SelectItem value="neutral">Neutral</SelectItem>
                            <SelectItem value="negative">Negative</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="pinned"
                            checked={newsForm.is_pinned}
                            onChange={(e) => setNewsForm(prev => ({ ...prev, is_pinned: e.target.checked }))}
                          />
                          <label htmlFor="pinned" className="text-sm font-medium">Pin article</label>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              if (editingNews) {
                                updateNewsMutation.mutate({ id: editingNews.id, formData: newsForm });
                              } else {
                                createNewsMutation.mutate(newsForm);
                              }
                            }}
                            className="flex-1"
                          >
                            {editingNews ? "Update" : "Create"} Article
                          </Button>
                          <Button variant="outline" onClick={() => setNewsDialog(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {newsArticles?.map((article) => (
                      <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{article.title}</h3>
                            {article.is_pinned && <Badge variant="secondary">Pinned</Badge>}
                            <Badge className={
                              article.sentiment_label === "positive" ? "bg-green-100 text-green-800" :
                              article.sentiment_label === "negative" ? "bg-red-100 text-red-800" :
                              "bg-gray-100 text-gray-800"
                            }>
                              {article.sentiment_label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{article.excerpt}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Source: {article.source_name} • Created: {new Date(article.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingNews(article);
                              setNewsForm({
                                title: article.title,
                                excerpt: article.excerpt || "",
                                content: article.content || "",
                                source_name: article.source_name || "",
                                source_url: article.source_url || "",
                                image_url: article.image_url || "",
                                sentiment_label: article.sentiment_label || "neutral",
                                is_pinned: article.is_pinned || false
                              });
                              setNewsDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteNewsMutation.mutate(article.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai-control">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      Politica AI Control Panel
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Power className="h-4 w-4" />
                          <h3 className="font-semibold">Master AI Switch</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Enable or disable all Politica AI operations
                        </p>
                      </div>
                      <Switch
                        checked={aiConfig?.ai_enabled || false}
                        onCheckedChange={(checked) => 
                          updateAIConfigMutation.mutate({ key: "ai_enabled", value: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          <h3 className="font-semibold">Auto Import</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Automatically import parties from government sources
                        </p>
                      </div>
                      <Switch
                        checked={aiConfig?.auto_import_enabled || false}
                        disabled={!aiConfig?.ai_enabled}
                        onCheckedChange={(checked) => 
                          updateAIConfigMutation.mutate({ key: "auto_import_enabled", value: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          <h3 className="font-semibold">Auto Verification</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Automatically verify political data using AI
                        </p>
                      </div>
                      <Switch
                        checked={aiConfig?.auto_verification_enabled || false}
                        disabled={!aiConfig?.ai_enabled}
                        onCheckedChange={(checked) => 
                          updateAIConfigMutation.mutate({ key: "auto_verification_enabled", value: checked })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      AI Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className={`text-2xl font-bold ${aiConfig?.ai_enabled ? 'text-green-600' : 'text-red-600'}`}>
                          {aiConfig?.ai_enabled ? 'ACTIVE' : 'DISABLED'}
                        </div>
                        <p className="text-sm text-muted-foreground">Main AI Status</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className={`text-2xl font-bold ${aiConfig?.auto_import_enabled && aiConfig?.ai_enabled ? 'text-green-600' : 'text-gray-400'}`}>
                          {aiConfig?.auto_import_enabled && aiConfig?.ai_enabled ? 'ON' : 'OFF'}
                        </div>
                        <p className="text-sm text-muted-foreground">Auto Import</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className={`text-2xl font-bold ${aiConfig?.auto_verification_enabled && aiConfig?.ai_enabled ? 'text-green-600' : 'text-gray-400'}`}>
                          {aiConfig?.auto_verification_enabled && aiConfig?.ai_enabled ? 'ON' : 'OFF'}
                        </div>
                        <p className="text-sm text-muted-foreground">Auto Verification</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default Admin;