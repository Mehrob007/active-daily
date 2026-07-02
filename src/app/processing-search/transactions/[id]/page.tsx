import React from 'react';
import { TransactionsSearchPage } from '@/features/processing-search/TransactionsSearchPage';

export default function Page({ params }: { params: { id: string } }) {
  return <TransactionsSearchPage initialCardId={params.id} />;
}
