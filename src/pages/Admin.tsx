import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/Layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Users, 
  ShoppingBag, 
  Bot,
  AlertTriangle,
  Shield,
  BarChart3,
  ExternalLink,
  Eye
} from "lucide-react";
import { Link } from "react-router-dom";

const Admin = () => {
  const { user } = useAuth();

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
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-civic/10 border-primary/20 hover:shadow-elegant transition-all duration-300">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                Admin Dashboard Migration
              </CardTitle>
              <CardDescription>
                The admin dashboard has been migrated to a new unified system with enhanced features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats?.users || 0}</div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{stats?.vendors || 0}</div>
                    <p className="text-sm text-muted-foreground">Active Vendors</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">300+</div>
                    <p className="text-sm text-muted-foreground">Politicians</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className={`text-2xl font-bold ${aiConfig?.ai_enabled ? 'text-green-600' : 'text-red-600'}`}>
                      {aiConfig?.ai_enabled ? 'ACTIVE' : 'OFFLINE'}
                    </div>
                    <p className="text-sm text-muted-foreground">Politica AI</p>
                  </CardContent>
                </Card>
              </div>

              {/* Migration Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">New Features in Unified Admin</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-cm-green" />
                    <span>Enhanced User Management</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <BarChart3 className="h-4 w-4 text-cm-red" />
                    <span>Real-time Analytics</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Bot className="h-4 w-4 text-cm-yellow" />
                    <span>AI Intelligence Panel</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span>Advanced Security Controls</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span>Political Management Tools</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-gray-600" />
                    <span>System Management Console</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild variant="patriotic" className="flex-1">
                  <Link to="/admin/core" className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Launch Unified Admin Dashboard
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/admin/core?module=welcome" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    View Welcome Tour
                  </Link>
                </Button>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> All admin functionality has been migrated to the new unified system. 
                  Legacy admin features are now accessible through organized modules in the new interface.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Admin;