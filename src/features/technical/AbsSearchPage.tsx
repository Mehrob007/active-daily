'use client';

import React from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Search, UserX } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

import { useAbsSearch } from './abs-search/hooks/useAbsSearch';
import { SearchForm } from './abs-search/components/SearchForm';
import { ClientSummary } from './abs-search/components/ClientSummary';
import { ClientTabs } from './abs-search/components/ClientTabs';

export default function AbsSearchPage() {
  const {
    searchType,
    setSearchType,
    searchQuery,
    setSearchQuery,
    isSearching,
    hasSearched,
    clients,
    selectedClientIndex,
    setSelectedClientIndex,
    accounts,
    cards,
    credits,
    deposits,
    isLoadingDetails,
    telegramData,
    isTelegramLoading,
    handleSearch,
    refreshClientData,
    deleteTelegramId,
  } = useAbsSearch();

  return (
    <PageContainer title="ABS поиск" subtitle="Поиск клиентов по банковской системе ABS">
      <SearchForm
        searchType={searchType}
        setSearchType={setSearchType}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearching={isSearching}
        onSearch={handleSearch}
      />

      <Separator className="mb-6" />

      {}
      {!hasSearched && !isSearching && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <div className="flex size-20 items-center justify-center rounded-full bg-bank-active mb-6">
            <Search className="size-10 text-bank-red" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Поиск клиента в ABS</h3>
          <p className="text-sm">Используйте поиск выше для нахождения информации о клиенте</p>
        </div>
      )}

      {}
      {isSearching && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <div className="size-10 animate-spin rounded-full border-2 border-bank-red/20 border-t-bank-red mb-4" />
          <p className="text-sm">Поиск в системе ABS...</p>
        </div>
      )}

      {}
      {hasSearched && !isSearching && clients.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <div className="flex size-20 items-center justify-center rounded-full bg-muted mb-6">
            <UserX className="size-10 text-muted-foreground/60" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Клиент не найден</h3>
          <p className="text-sm">Попробуйте изменить параметры поиска</p>
        </div>
      )}

      {}
      {clients.length > 0 && (
        <div className="space-y-6">

          {}
          {clients.length > 1 && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Найдено несколько клиентов ({clients.length}):</CardTitle>
              </CardHeader>
              <CardContent className="py-2 flex gap-2 overflow-x-auto">
                {clients.map((c, idx) => (
                  <Button 
                    key={idx} 
                    variant={selectedClientIndex === idx ? "default" : "outline"}
                    onClick={() => setSelectedClientIndex(idx)}
                    className="whitespace-nowrap"
                  >
                    {c.first_name || c.name || c.Client?.Name || `Клиент #${idx + 1}`}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}

          {}
          <ClientSummary 
            client={clients[selectedClientIndex]} 
            telegramData={telegramData}
            isTelegramLoading={isTelegramLoading}
            onDeleteTelegram={deleteTelegramId}
          />

          {}
          <ClientTabs 
            client={clients[selectedClientIndex]}
            accounts={accounts}
            cards={cards}
            credits={credits}
            deposits={deposits}
            isLoading={isLoadingDetails}
            onRefresh={refreshClientData}
          />

        </div>
      )}
    </PageContainer>
  );
}
