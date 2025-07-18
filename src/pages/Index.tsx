import React from 'react';
import { AppLayout } from "@/components/Layout/AppLayout";
import { CivicComplaintForm } from "@/components/Civic/CivicComplaintForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";

const Index = () => {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero content will go here */}
      </div>
      
      {/* Civic Engagement Section */}
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-gradient-civic/10 border-primary/20 hover:shadow-elegant transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Users className="h-8 w-8 text-primary" />
              Civic Engagement Platform
            </CardTitle>
            <CardDescription>
              Participate in democratic processes and make your voice heard in Cameroon's governance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="patriotic" className="w-full sm:w-auto">
              <Link to="/polls">
                Explore Polls & Surveys
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="container mx-auto px-4 py-8 space-y-12">
        <CivicComplaintForm />
      </div>
    </AppLayout>
  );
};

export default Index;
