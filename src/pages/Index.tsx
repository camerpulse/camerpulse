import React from 'react';
import { ThemeAwareHero } from "@/components/Homepage/ThemeAwareHero";
import { AppLayout } from "@/components/Layout/AppLayout";
import { LuxAeternaAchievements } from "@/components/Theme/LuxAeternaAchievements";
import { PatrioticDataVisualization } from "@/components/Theme/PatrioticDataVisualization";
import { CivicPollCreator } from "@/components/Polls/CivicPollCreator";
import { YouthPollCreator } from "@/components/Polls/YouthPollCreator";
import { PresidentialPollCreator } from "@/components/Polls/PresidentialPollCreator";
import { ElectricityPollCreator } from "@/components/Polls/ElectricityPollCreator";
import { RegionalSentimentPollCreator } from "@/components/Polls/RegionalSentimentPollCreator";
import { AutonomousPollAdmin } from "@/components/Admin/AutonomousPollAdmin";
import { CivicAIPollGenerator } from "@/components/AI/CivicAIPollGenerator";
import { CivicComplaintForm } from "@/components/Civic/CivicComplaintForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ShieldCheck, Users, BarChart3, Settings } from "lucide-react";

const Index = () => {
  return (
    <AppLayout>
      <ThemeAwareHero />
      <div className="container mx-auto px-4 py-8">
        <PatrioticDataVisualization />
      </div>
      
      {/* Quick Admin Access */}
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-gradient-civic/10 border-primary/20 hover:shadow-elegant transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <ShieldCheck className="h-8 w-8 text-primary" />
              CamerPulse Admin Core
            </CardTitle>
            <CardDescription>
              Comprehensive platform management and intelligence dashboard for administrators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-cm-green/10">
                <Users className="h-6 w-6 text-cm-green" />
                <div>
                  <p className="font-semibold text-sm">User Management</p>
                  <p className="text-xs text-muted-foreground">Manage citizens & officials</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-cm-red/10">
                <BarChart3 className="h-6 w-6 text-cm-red" />
                <div>
                  <p className="font-semibold text-sm">Analytics Dashboard</p>
                  <p className="text-xs text-muted-foreground">Real-time insights</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-cm-yellow/10">
                <Settings className="h-6 w-6 text-cm-yellow" />
                <div>
                  <p className="font-semibold text-sm">System Controls</p>
                  <p className="text-xs text-muted-foreground">Platform configuration</p>
                </div>
              </div>
            </div>
            <Button asChild variant="patriotic" className="w-full sm:w-auto">
              <Link to="/admin/core">
                Access Admin Core Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      {/* Polls CTA Section */}
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-gradient-flag/10 border-primary/20 hover:shadow-elegant transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <BarChart3 className="h-8 w-8 text-primary" />
              Pulse the Nation with Polls
            </CardTitle>
            <CardDescription>
              Capture real-time public opinion across Cameroon — giving every citizen a voice in governance and policy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-cm-green/10">
                <Users className="h-6 w-6 text-cm-green" />
                <div>
                  <p className="font-semibold text-sm">10 Premium Templates</p>
                  <p className="text-xs text-muted-foreground">From ballot-style to emoji polls</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-cm-red/10">
                <BarChart3 className="h-6 w-6 text-cm-red" />
                <div>
                  <p className="font-semibold text-sm">Real-time Analytics</p>
                  <p className="text-xs text-muted-foreground">Regional heatmaps & insights</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-cm-yellow/10">
                <Settings className="h-6 w-6 text-cm-yellow" />
                <div>
                  <p className="font-semibold text-sm">Advanced Features</p>
                  <p className="text-xs text-muted-foreground">Anonymous voting & QR sharing</p>
                </div>
              </div>
            </div>
            <Button asChild variant="patriotic" className="w-full sm:w-auto">
              <Link to="/polls">
                Explore All Polls & Templates
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="container mx-auto px-4 py-8 space-y-12">
        <CivicComplaintForm />
      </div>
      <LuxAeternaAchievements />
    </AppLayout>
  );
};

export default Index;