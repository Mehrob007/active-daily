'use client';

import React from 'react';
import { Construction } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function NotFound() {
  const pathname = usePathname();

  return (
    <div className="flex-1 bg-background p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Страница в разработке или не найдена
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Раздел «{pathname}» находится в стадии разработки
        </p>
      </div>
      <div className="rounded-lg bg-white p-4 md:p-6 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Construction className="h-12 w-12 mb-4" />
          <p className="text-lg font-medium">В разработке</p>
          <p className="text-sm">Данный раздел пока не перенесен или находится в стадии активной разработки.</p>
        </div>
      </div>
    </div>
  );
}
