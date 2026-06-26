import React from 'react';
import ApplicationFormPage from '@/features/agent/ApplicationFormPage';

export default function EditCreditApplication({ params }: { params: { id: string } }) {
  return <ApplicationFormPage type="credit" id={params.id} />;
}
