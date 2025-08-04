import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Users, 
  MapPin, 
  Clock, 
  Star,
  Flag,
  Award,
  Settings,
  Filter,
  Eye,
  Bell
} from 'lucide-react';
import { EventCalendar } from '@/components/events/EventCalendar';
import { EventCalendarFilters } from '@/components/events/EventCalendarFilters';
import { useAuth } from '@/contexts/AuthContext';

interface EventFilters {
  region?: string;
  event_type?: string;
  organizer_type?: string;
  civic_tags?: string[];
  verified_only?: boolean;
  official_only?: boolean;
}

const EventCalendarPage = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<EventFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (newFilters: EventFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
  };

  const activeFiltersCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof EventFilters];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== false;
  }).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <CalendarIcon className="w-8 h-8 text-primary" />
              <Flag className="w-6 h-6 text-emerald-600" />
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Civic Event Calendar
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Your comprehensive view of civic events, national holidays, and community activities across Cameroon
            </p>
            
            {/* Quick Stats */}
            <div className="flex items-center justify-center gap-6 mt-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span>Civic Events</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Political</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span>Education</span>
              </div>
              <div className="flex items-center gap-2">
                <Flag className="w-3 h-3 text-red-500" />
                <span>National Holidays</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-3 h-3 text-yellow-500" />
                <span>Official Events</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <EventCalendarFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Calendar */}
          <div className="lg:col-span-3 space-y-6">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden flex items-center justify-between">
              <h2 className="text-xl font-semibold">Calendar View</h2>
              <Dialog open={showFilters} onOpenChange={setShowFilters}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Event Filters</DialogTitle>
                  </DialogHeader>
                  <EventCalendarFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={clearFilters}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {/* Calendar Component */}
            <EventCalendar />

            {/* Additional Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {/* Upcoming National Holidays */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Flag className="w-4 h-4 text-red-500" />
                    Upcoming National Holidays
                  </CardTitle>
                  <CardDescription>
                    Plan around Cameroon's national celebrations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b">
                    <div>
                      <div className="font-medium text-sm">Youth Day</div>
                      <div className="text-xs text-muted-foreground">February 11, 2024</div>
                    </div>
                    <Badge variant="outline" className="text-xs">National</Badge>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <div>
                      <div className="font-medium text-sm">Labour Day</div>
                      <div className="text-xs text-muted-foreground">May 1, 2024</div>
                    </div>
                    <Badge variant="outline" className="text-xs">National</Badge>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <div className="font-medium text-sm">National Day</div>
                      <div className="text-xs text-muted-foreground">May 20, 2024</div>
                    </div>
                    <Badge variant="outline" className="text-xs">National</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Calendar Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Calendar Features
                  </CardTitle>
                  <CardDescription>
                    Make the most of your civic calendar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium text-sm">Multiple Views</div>
                      <div className="text-xs text-muted-foreground">Month, week, and agenda views</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Bell className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-sm">Smart Notifications</div>
                      <div className="text-xs text-muted-foreground">Get reminded of RSVP'd events</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Filter className="w-4 h-4 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-sm">Advanced Filtering</div>
                      <div className="text-xs text-muted-foreground">Filter by region, type, and more</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Award className="w-4 h-4 text-purple-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-sm">Certificate Tracking</div>
                      <div className="text-xs text-muted-foreground">See certificate-eligible events</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCalendarPage;