import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { PollEmbedWidget } from '@/components/Polls/PollEmbedWidget';

const PollEmbedViewerPage: React.FC = () => {
  const { poll_id } = useParams<{ poll_id: string }>();
  const [searchParams] = useSearchParams();
  
  if (!poll_id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Invalid Poll ID</h1>
          <p className="text-gray-600 mt-2">The poll ID provided is not valid.</p>
        </div>
      </div>
    );
  }

  // Parse configuration from URL parameters
  const configParam = searchParams.get('config');
  let config = {};
  
  if (configParam) {
    try {
      config = JSON.parse(decodeURIComponent(configParam));
    } catch (error) {
      console.error('Error parsing embed config:', error);
    }
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="container mx-auto p-4">
        <PollEmbedWidget
          pollId={poll_id}
          {...config}
        />
      </div>
    </div>
  );
};

export default PollEmbedViewerPage;