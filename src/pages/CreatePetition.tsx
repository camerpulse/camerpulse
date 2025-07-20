import React from 'react';
import { CreatePetitionForm } from '@/components/petitions/CreatePetitionForm';
import { useNavigate } from 'react-router-dom';

export default function CreatePetition() {
  const navigate = useNavigate();

  const handleSubmit = (petitionId: string) => {
    navigate(`/petitions/${petitionId}`);
  };

  const handleCancel = () => {
    navigate('/petitions');
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <CreatePetitionForm 
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}