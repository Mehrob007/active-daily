import React, { Suspense } from 'react';
import { AccountOperationsPage } from '@/features/account-operations/AccountOperationsPage';
import { Loader2 } from 'lucide-react';

export default function Page() {
  return (
    <Suspense fallback={<div className="flex h-[40vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <AccountOperationsPage />
    </Suspense>
  );
}
