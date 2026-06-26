import React from 'react';
import ApplicationFormPage from '@/features/agent/ApplicationFormPage';

export default function EditCardApplication({ params }: { params: { id: string } }) {
  return <ApplicationFormPage type="card" id={params.id} />;
}
