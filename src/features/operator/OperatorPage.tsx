'use client';

import React from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface OperatorPageProps {
  title: string;
  subtitle: string;
}

export function OperatorPage({ title, subtitle }: OperatorPageProps) {
  return (
    <PageContainer title={title} subtitle={subtitle}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            Этот модуль оператора находится в процессе миграции.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-12 text-muted-foreground border rounded-lg border-dashed">
            <p>Здесь будет отображаться функционал: {title}</p>
            <p className="text-xs mt-2 opacity-50">Компонент находится в стадии переноса (Stage 5).</p>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
