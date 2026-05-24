'use client';

import React from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import OperatorTestsView from './components/OperatorTestsView';

export default function OperatorTestsPage() {
  return (
    <PageContainer 
      title="Управление тестами" 
      subtitle="Создание и редактирование ежемесячных тестов для сотрудников"
    >
      <OperatorTestsView />
    </PageContainer>
  );
}
