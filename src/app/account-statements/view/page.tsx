import React from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent } from '@/components/ui/card';

export default function Page() {
  return (
    <PageContainer title="Выписки со счетов" subtitle="Просмотр и экспорт выписок">
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
          <div className="text-2xl font-semibold mb-2 text-foreground">Модуль в разработке</div>
          <p>Эта страница находится на стадии переноса со старой платформы.</p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
