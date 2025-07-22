import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/Layout/AppLayout';
import { useSenator, useSenatorRatings } from '@/hooks/useSenators';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

// Import all the new profile components
import { SenatorHeaderCard } from '@/components/Senators/Profile/SenatorHeaderCard';
import { ContactInfoBlock } from '@/components/Senators/Profile/ContactInfoBlock';
import { BioAndCareer } from '@/components/Senators/Profile/BioAndCareer';
import { LegislationPanel } from '@/components/Senators/Profile/LegislationPanel';
import { CivicRatingsWidget } from '@/components/Senators/Profile/CivicRatingsWidget';
import { CitizenFeedbackWall } from '@/components/Senators/Profile/CitizenFeedbackWall';
import { SenatorBadgesDisplay } from '@/components/Senators/Profile/SenatorBadgesDisplay';
import { RelatedEntities } from '@/components/Senators/Profile/RelatedEntities';
import { SenatorRatingForm } from '@/components/Senators/SenatorRatingForm';

export default function SenatorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: senator, isLoading } = useSenator(id!);
  const { data: ratings } = useSenatorRatings(id!);

  // Mock pro membership check - replace with actual user membership logic
  const hasProAccess = true; // This should come from user context/subscription

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!senator) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Senator Not Found</h1>
            <Link to="/senators">
              <Button>Back to Senators</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const handleFollow = () => {
    // Implement follow/unfollow logic
    console.log('Follow senator:', senator.id);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Link to="/senators">
            <Button variant="ghost" className="mb-6 hover:bg-muted/50">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Senators
            </Button>
          </Link>

          {/* Senator Header */}
          <div className="mb-8">
            <SenatorHeaderCard senator={senator} />
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main Content - 2/3 width */}
            <div className="xl:col-span-2 space-y-8">
              {/* Bio and Career */}
              <BioAndCareer senator={senator} />
              
              {/* Legislative Performance */}
              <LegislationPanel senator={senator} />
              
              {/* Citizen Feedback */}
              <CitizenFeedbackWall senator={senator} ratings={ratings || []} />
              
              {/* Badges */}
              <SenatorBadgesDisplay senator={senator} />
            </div>

            {/* Sidebar - 1/3 width */}
            <div className="space-y-6">
              {/* Civic Ratings */}
              <CivicRatingsWidget senator={senator} />
              
              {/* Contact Info (Pro only) */}
              <ContactInfoBlock senator={senator} hasProAccess={hasProAccess} />
              
              {/* Rating Form */}
              <SenatorRatingForm senatorId={senator.id} />
              
              {/* Related Entities */}
              <RelatedEntities senator={senator} />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}