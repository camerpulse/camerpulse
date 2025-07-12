import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Layout/Header";
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
  AlertTriangle
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  if (!userRole) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-8 text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">You don't have admin privileges to access this page.</p>
            </CardContent>
          </Card>
        </main>
      </div>
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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage platform content and users</p>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="vendors">Vendors</TabsTrigger>
              <TabsTrigger value="news">News</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.users || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.vendors || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Polls</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.polls || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pulse Posts</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.posts || 0}</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="vendors">
              <Card>
                <CardHeader>
                  <CardTitle>Vendor Management</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
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
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Admin;