import React from 'react';
import { Check, Clock, AlertCircle, Award } from 'lucide-react';

interface TenderTimelineProps {
  status: string;
  created_at: string;
  deadline: string;
  awarded_at?: string;
  stages?: {
    stage: string;
    date?: string;
    completed: boolean;
    current: boolean;
  }[];
}

const TenderTimeline: React.FC<TenderTimelineProps> = ({ 
  status, 
  created_at, 
  deadline, 
  awarded_at, 
  stages 
}) => {
  const getStatusIcon = (stage: string, completed: boolean, current: boolean) => {
    if (completed) return <Check className="w-4 h-4 text-green-600" />;
    if (current) return <Clock className="w-4 h-4 text-blue-600" />;
    return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
  };

  const getStatusColor = (stage: string, completed: boolean, current: boolean) => {
    if (completed) return 'bg-green-600';
    if (current) return 'bg-blue-600';
    return 'bg-gray-300';
  };

  const defaultStages = [
    {
      stage: 'Published',
      date: created_at,
      completed: true,
      current: false
    },
    {
      stage: 'Bidding Open',
      date: created_at,
      completed: status !== 'draft',
      current: status === 'active'
    },
    {
      stage: 'Evaluation',
      date: deadline,
      completed: ['evaluated', 'awarded', 'completed'].includes(status),
      current: status === 'under_review'
    },
    {
      stage: 'Award',
      date: awarded_at,
      completed: ['awarded', 'completed'].includes(status),
      current: status === 'awarded'
    },
    {
      stage: 'Completed',
      date: awarded_at,
      completed: status === 'completed',
      current: false
    }
  ];

  const timelineStages = stages || defaultStages;

  const getProgressPercentage = () => {
    const completedCount = timelineStages.filter(stage => stage.completed).length;
    return (completedCount / timelineStages.length) * 100;
  };

  const isOverdue = new Date(deadline) < new Date() && !['awarded', 'completed', 'cancelled'].includes(status);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Tender Progress</span>
          <span>{Math.round(getProgressPercentage())}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              isOverdue ? 'bg-red-500' : 'bg-blue-600'
            }`}
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
        {isOverdue && (
          <div className="flex items-center mt-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 mr-1" />
            <span>This tender is overdue</span>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300" />
        
        {timelineStages.map((stage, index) => (
          <div key={index} className="relative flex items-start mb-6 last:mb-0">
            {/* Icon */}
            <div className={`
              relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 border-white
              ${getStatusColor(stage.stage, stage.completed, stage.current)}
            `}>
              {getStatusIcon(stage.stage, stage.completed, stage.current)}
            </div>
            
            {/* Content */}
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <h3 className={`
                  text-lg font-semibold
                  ${stage.completed ? 'text-green-700' : stage.current ? 'text-blue-700' : 'text-gray-500'}
                `}>
                  {stage.stage}
                </h3>
                {stage.date && (
                  <span className="text-sm text-gray-500">
                    {new Date(stage.date).toLocaleDateString()}
                  </span>
                )}
              </div>
              
              <div className="mt-1 text-sm text-gray-600">
                {stage.stage === 'Published' && 'Tender has been published and is visible to bidders'}
                {stage.stage === 'Bidding Open' && 'Bidders can submit their proposals'}
                {stage.stage === 'Evaluation' && 'Proposals are being reviewed and evaluated'}
                {stage.stage === 'Award' && 'Winning bidder has been selected'}
                {stage.stage === 'Completed' && 'Project has been completed successfully'}
              </div>
              
              {stage.current && (
                <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  <Clock className="w-3 h-3 mr-1" />
                  Current Stage
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Status Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900">Current Status</h4>
            <p className="text-sm text-gray-600 capitalize">{status.replace('_', ' ')}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">
              {status === 'active' && `${Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining`}
              {status === 'completed' && 'Tender completed'}
              {status === 'awarded' && 'Contract awarded'}
              {status === 'cancelled' && 'Tender cancelled'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenderTimeline;