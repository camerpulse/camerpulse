import React from 'react';
import { useParams } from 'react-router-dom';
import { EmbedCodeGenerator } from '@/components/Polls/PollEmbedWidget';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Share2, Globe } from 'lucide-react';

const PollEmbedGeneratorPage: React.FC = () => {
  const { poll_id } = useParams<{ poll_id: string }>();
  
  if (!poll_id) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-red-600">Invalid Poll ID</h1>
          <p className="text-gray-600 mt-2">The poll ID provided is not valid.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Poll Embed Generator</h1>
          <p className="text-muted-foreground">
            Generate embeddable widgets for your polls
          </p>
        </div>
        <EmbedCodeGenerator pollId={poll_id} />
      </div>
    </AppLayout>
  );
};

export default PollEmbedGeneratorPage;