import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DiasporaEvents: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to diaspora dashboard with events tab active
    navigate('/diaspora?tab=events');
  }, [navigate]);

  return null;
};

export default DiasporaEvents;