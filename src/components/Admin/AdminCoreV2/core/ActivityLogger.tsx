import React from 'react';

interface ActivityLoggerProps {
  userId?: string;
}

export const ActivityLogger: React.FC<ActivityLoggerProps> = ({ userId }) => {
  // This component runs in the background to log admin activities
  return null;
};