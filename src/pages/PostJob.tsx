import React from 'react';
import { JobPostingForm } from '@/components/jobs/JobPostingForm';

export default function PostJob() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Post a New Job</h1>
        <p className="text-muted-foreground mt-2">
          Create a job posting to find the perfect candidates for your role.
        </p>
      </div>
      
      <JobPostingForm 
        onSuccess={() => {
          window.location.href = '/jobs';
        }}
      />
    </div>
  );
}