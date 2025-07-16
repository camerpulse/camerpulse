import React from 'react';

interface NotificationCenterProps {
  notifications: any[];
  setNotifications: (notifications: any[]) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  setNotifications
}) => {
  // Background notification management
  return null;
};