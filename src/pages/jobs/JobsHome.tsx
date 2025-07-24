import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Building, Users, TrendingUp } from 'lucide-react';
import { CamerJobsLayout } from '@/components/Layout/CamerJobsLayout';

const JobsHome = () => {
  return (
    <CamerJobsLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">
            CamerPulse Jobs
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with opportunities across Cameroon. Find jobs, hire talent, and build your career.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Companies</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">342</div>
              <p className="text-xs text-muted-foreground">
                +5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Job Seekers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8,967</div>
              <p className="text-xs text-muted-foreground">
                +23% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Placements</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">456</div>
              <p className="text-xs text-muted-foreground">
                +18% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Find Jobs
              </CardTitle>
              <CardDescription>
                Discover thousands of job opportunities across Cameroon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <a href="/jobs/board">Browse Jobs</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                For Employers
              </CardTitle>
              <CardDescription>
                Post jobs and find qualified candidates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <a href="/jobs/company">Post a Job</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Sponsor Analytics
              </CardTitle>
              <CardDescription>
                Track hiring impact and view sponsor performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full" asChild>
                <a href="/jobs/analytics">View Analytics</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Featured Campaign */}
        <Card className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎯 Featured Campaign: STEM 500 Initiative
            </CardTitle>
            <CardDescription>UNDP Cameroon is hiring 500 STEM professionals across 10 regions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">212</div>
                  <p className="text-xs text-muted-foreground">Hired</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">500</div>
                  <p className="text-xs text-muted-foreground">Target</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">42%</div>
                  <p className="text-xs text-muted-foreground">Complete</p>
                </div>
              </div>
              <Button asChild>
                <a href="/jobs/campaigns">View Campaign</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Live Leaderboard Preview */}
        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🏆 Regional Hiring Leaderboard
            </CardTitle>
            <CardDescription>See which regions are leading in job creation this week - updated live!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <TrendingUp className="h-8 w-8 mx-auto mb-3 text-primary" />
              <p className="mb-4 text-muted-foreground">Real-time hiring activity across Cameroon's regions</p>
              <Button asChild>
                <a href="/jobs/leaderboard">View Live Leaderboard</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Jobs Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Job Openings</CardTitle>
            <CardDescription>Latest opportunities posted on CamerPulse Jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-4">
                <Button asChild>
                  <a href="/jobs/board">View All Jobs</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </CamerJobsLayout>
  );
};

export default JobsHome;