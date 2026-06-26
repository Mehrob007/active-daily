import React from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ApplicationFormPageProps {
  type: 'card' | 'credit' | 'deposit';
  id?: string;
}

export default function ApplicationFormPage({ type, id }: ApplicationFormPageProps) {
  const isEdit = !!id;

  return (
    <PageContainer
      title={isEdit ? `Редактирование заявки #${id}` : `Новая заявка (${type})`}
      subtitle="Заполните данные для оформления заявки"
      backUrl={`/${type}-apps/list`}
    >
      <Card>
        <CardHeader>
          <CardTitle>Данные клиента</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <h3 className="text-lg font-medium">Форма в разработке</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">
              Здесь будет полноценная форма со всеми полями из старого проекта: 
              проверка по террористам, поиск по АБС, загрузка паспорта, SMS-уведомления и т.д.
            </p>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
