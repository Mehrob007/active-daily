'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Building2, CreditCard, Percent, ShieldCheck, FileText, History, FileArchive, Search, Plus, Filter } from 'lucide-react';
import { toast } from 'sonner';

export function OperatorDataPage() {
  const [activeTab, setActiveTab] = useState('employees');
  const [searchQuery, setSearchQuery] = useState('');

  // Dummy action
  const handleAddNew = () => {
    toast.success('Открыто окно создания новой записи');
  };

  const EmptyState = ({ title, icon: Icon }: { title: string, icon: any }) => (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-muted/5 rounded-lg border border-dashed">
      <Icon className="h-16 w-16 mb-4 opacity-20" />
      <h3 className="text-lg font-medium text-foreground">{title}</h3>
      <p className="max-w-sm text-center mt-2 mb-6">
        Управление данным разделом оптимизировано и переведено в новый формат. Здесь вы сможете искать, редактировать и добавлять записи.
      </p>
      <Button onClick={handleAddNew}>
        <Plus className="mr-2 h-4 w-4" /> Добавить запись
      </Button>
    </div>
  );

  return (
    <PageContainer
      title="Справочники и Данные"
      subtitle="Централизованное управление системными справочниками, ролями и журналами"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Sidebar Tabs */}
        <Card className="lg:w-1/4 h-fit border-0 shadow-none bg-transparent lg:bg-card lg:border lg:shadow-sm">
          <CardContent className="p-0 lg:p-4">
            <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
              <Button 
                variant={activeTab === 'employees' ? 'default' : 'ghost'} 
                className="justify-start w-full whitespace-nowrap"
                onClick={() => setActiveTab('employees')}
              >
                <Users className="mr-2 h-4 w-4" /> Сотрудники
              </Button>
              <Button 
                variant={activeTab === 'office' ? 'default' : 'ghost'} 
                className="justify-start w-full whitespace-nowrap"
                onClick={() => setActiveTab('office')}
              >
                <Building2 className="mr-2 h-4 w-4" /> Отделения
              </Button>
              <Button 
                variant={activeTab === 'prices' ? 'default' : 'ghost'} 
                className="justify-start w-full whitespace-nowrap"
                onClick={() => setActiveTab('prices')}
              >
                <CreditCard className="mr-2 h-4 w-4" /> Цены на карты
              </Button>
              <Button 
                variant={activeTab === 'margents' ? 'default' : 'ghost'} 
                className="justify-start w-full whitespace-nowrap"
                onClick={() => setActiveTab('margents')}
              >
                <Percent className="mr-2 h-4 w-4" /> Маржа по картам
              </Button>
              <div className="h-px bg-border my-2 hidden lg:block" />
              <Button 
                variant={activeTab === 'roles' ? 'default' : 'ghost'} 
                className="justify-start w-full whitespace-nowrap"
                onClick={() => setActiveTab('roles')}
              >
                <ShieldCheck className="mr-2 h-4 w-4" /> Роли и Доступы
              </Button>
              <Button 
                variant={activeTab === 'role_logs' ? 'default' : 'ghost'} 
                className="justify-start w-full whitespace-nowrap"
                onClick={() => setActiveTab('role_logs')}
              >
                <History className="mr-2 h-4 w-4" /> Логи ролей
              </Button>
              <Button 
                variant={activeTab === 'journal' ? 'default' : 'ghost'} 
                className="justify-start w-full whitespace-nowrap"
                onClick={() => setActiveTab('journal')}
              >
                <FileText className="mr-2 h-4 w-4" /> Журнал операций
              </Button>
              <Button 
                variant={activeTab === 'user_documents' ? 'default' : 'ghost'} 
                className="justify-start w-full whitespace-nowrap"
                onClick={() => setActiveTab('user_documents')}
              >
                <FileArchive className="mr-2 h-4 w-4" /> База документов
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Content Area */}
        <Card className="flex-1">
          <CardHeader className="pb-4 border-b bg-muted/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>
                  {activeTab === 'employees' && 'Управление сотрудниками'}
                  {activeTab === 'office' && 'Справочник отделений'}
                  {activeTab === 'prices' && 'Стоимость выпуска карт'}
                  {activeTab === 'margents' && 'Маржинальность по картам'}
                  {activeTab === 'roles' && 'Управление ролями пользователей'}
                  {activeTab === 'role_logs' && 'Журнал изменения прав'}
                  {activeTab === 'journal' && 'Глобальный журнал операций'}
                  {activeTab === 'user_documents' && 'Архив документов'}
                </CardTitle>
                <CardDescription className="mt-1">
                  Используйте поиск и фильтры для быстрого нахождения нужных записей.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 bg-background"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            
            {activeTab === 'employees' && <EmptyState title="База сотрудников" icon={Users} />}
            {activeTab === 'office' && <EmptyState title="Отделения банка" icon={Building2} />}
            {activeTab === 'prices' && <EmptyState title="Тарифы на карты" icon={CreditCard} />}
            {activeTab === 'margents' && <EmptyState title="Настройки маржи" icon={Percent} />}
            
            {activeTab === 'roles' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Список ролей</h3>
                  <Button onClick={handleAddNew} size="sm"><Plus className="mr-2 h-4 w-4"/>Создать роль</Button>
                </div>
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="p-3 font-medium">ID</th>
                        <th className="p-3 font-medium">Название роли</th>
                        <th className="p-3 font-medium">Пользователей</th>
                        <th className="p-3 font-medium text-right">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t hover:bg-muted/30">
                        <td className="p-3 text-muted-foreground">1</td>
                        <td className="p-3 font-medium">Администратор</td>
                        <td className="p-3">3</td>
                        <td className="p-3 text-right"><Button variant="ghost" size="sm">Настроить</Button></td>
                      </tr>
                      <tr className="border-t hover:bg-muted/30">
                        <td className="p-3 text-muted-foreground">2</td>
                        <td className="p-3 font-medium">Менеджер</td>
                        <td className="p-3">45</td>
                        <td className="p-3 text-right"><Button variant="ghost" size="sm">Настроить</Button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'role_logs' && <EmptyState title="Логи изменения ролей" icon={History} />}
            {activeTab === 'journal' && <EmptyState title="Журнал операций" icon={FileText} />}
            {activeTab === 'user_documents' && <EmptyState title="Документы пользователей" icon={FileArchive} />}

          </CardContent>
        </Card>

      </div>
    </PageContainer>
  );
}
