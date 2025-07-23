import React from 'react';

interface TimelineProgressProps {
  currentStage: string;
  stages: string[];
  completedStages: string[];
  className?: string;
}

const TimelineProgress: React.FC<TimelineProgressProps> = ({
  currentStage,
  stages,
  completedStages,
  className = ''
}) => {
  const getCurrentStageIndex = () => {
    return stages.findIndex(stage => stage === currentStage);
  };

  const isStageCompleted = (stage: string) => {
    return completedStages.includes(stage);
  };

  const isCurrentStage = (stage: string) => {
    return stage === currentStage;
  };

  const getProgressPercentage = () => {
    const currentIndex = getCurrentStageIndex();
    const totalStages = stages.length;
    return ((currentIndex + 1) / totalStages) * 100;
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Progress Bar */}
      <div className="relative mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
        
        {/* Stage Indicators */}
        <div className="flex justify-between mt-2">
          {stages.map((stage, index) => (
            <div key={stage} className="flex flex-col items-center">
              <div 
                className={`
                  w-3 h-3 rounded-full border-2 transition-all duration-300
                  ${isStageCompleted(stage) 
                    ? 'bg-green-500 border-green-500' 
                    : isCurrentStage(stage)
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-white border-gray-300'
                  }
                `}
              />
              <span 
                className={`
                  text-xs mt-1 text-center max-w-20 break-words
                  ${isStageCompleted(stage) || isCurrentStage(stage) 
                    ? 'text-gray-900 font-medium' 
                    : 'text-gray-500'
                  }
                `}
              >
                {stage}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineProgress;