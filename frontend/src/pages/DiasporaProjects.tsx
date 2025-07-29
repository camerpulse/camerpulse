import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DiasporaProjects: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to diaspora dashboard with projects tab active
    navigate('/diaspora?tab=projects');
  }, [navigate]);

  return null;
};

export default DiasporaProjects;