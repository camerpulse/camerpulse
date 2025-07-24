import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, FileText, Users, Gavel } from 'lucide-react';
import { Link } from 'react-router-dom';

const JudiciaryPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">⚖️ Judicial Transparency</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Promoting transparency and accountability in Cameroon's judicial system through civic engagement and monitoring.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Court Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">2,456</div>
            <p className="text-sm text-muted-foreground">Tracked cases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Judgments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">1,890</div>
            <p className="text-sm text-muted-foreground">Public judgments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Judges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">340</div>
            <p className="text-sm text-muted-foreground">Tracked judges</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gavel className="h-5 w-5" />
              Court Transparency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">72%</div>
            <p className="text-sm text-muted-foreground">Transparency score</p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Judicial Monitoring System</h2>
        <p className="text-muted-foreground mb-6">
          Our judicial transparency platform is being developed to track court proceedings, judicial performance, and promote accountability in the justice system.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to="/auth">Join Platform</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/about">Learn More</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JudiciaryPage;