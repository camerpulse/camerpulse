import React from 'react';
import { CreatePetitionForm } from '@/components/petitions/CreatePetitionForm';
import { useNavigate } from 'react-router-dom';
import { URLBuilder } from '@/utils/slug';

export default function CreatePetition() {
  const navigate = useNavigate();

  const handleSubmit = (petitionId: string) => {
    navigate(URLBuilder.petitions.detail({ id: petitionId, title: 'petition' }));
  };

  const handleCancel = () => {
    navigate('/petitions');
  };

  return (
    <div className="min-h-screen bg-gradient-card">
      <div className="container mx-auto px-4 py-8">
        <CreatePetitionForm 
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}