import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DiasporaDonations: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to diaspora dashboard with donations tab active
    navigate('/diaspora?tab=donations');
  }, [navigate]);

  return null;
};

export default DiasporaDonations;