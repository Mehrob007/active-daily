"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { AtmTable } from './components/AtmTable';
import { HardDrive } from 'lucide-react';

const AtmMap = dynamic(() => import('./components/AtmMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[40vh] w-full flex items-center justify-center bg-muted/50 rounded-xl border animate-pulse">
      <span className="text-muted-foreground font-medium flex items-center gap-2">
        <HardDrive className="h-5 w-5" />
        Загрузка карты...
      </span>
    </div>
  ),
});

export const AtmsPage = () => {
  return (
    <PageContainer
      title="Таблица банкоматов"
      description="Мониторинг состояния банкоматов, остатков и ошибок"
    >
      <div className="flex flex-col gap-6">
        <div className="w-full">
          <AtmMap />
        </div>
        <div className="w-full">
          <AtmTable />
        </div>
      </div>
    </PageContainer>
  );
};
