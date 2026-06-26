import React from 'react';
import ApplicationFormPage from '@/features/agent/ApplicationFormPage';

export default function EditDepositApplication({ params }: { params: { id: string } }) {
  return <ApplicationFormPage type="deposit" id={params.id} />;
}
