'use client';

import React, { useState, useMemo } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { KPICard, StatusBadge } from '@/components/banking';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Download,
  Eye,
  FileText,
  File,
  FileSpreadsheet,
  ImageIcon,
  FolderOpen,
  Clock,
  Upload,
  User,
  HardDrive,
  AlertTriangle,
  CheckCircle2,
  Filter,
} from 'lucide-react';

type DocumentCategory = 'passport' | 'contract' | 'application' | 'statement';
type FileExtension = 'PDF' | 'DOC' | 'XLS' | 'IMG';

interface ClientDocument {
  id: string;
  name: string;
  category: DocumentCategory;
  fileType: FileExtension;
  fileSize: string;
  uploadDate: string;
  uploadedBy: string;
  verified: boolean;
}

const MOCK_DOCUMENTS: ClientDocument[] = [
  { id: 'DOC-001', name: 'Паспорт гражданина РК (разворот)', category: 'passport', fileType: 'IMG', fileSize: '2.4 МБ', uploadDate: '2025-05-14', uploadedBy: 'Каримова Г.А.', verified: true },
  { id: 'DOC-002', name: 'Паспорт (регистрация)', category: 'passport', fileType: 'IMG', fileSize: '1.8 МБ', uploadDate: '2025-05-14', uploadedBy: 'Каримова Г.А.', verified: true },
  { id: 'DOC-003', name: 'ИИН (СНИЛС)', category: 'passport', fileType: 'PDF', fileSize: '340 КБ', uploadDate: '2025-05-14', uploadedBy: 'Каримова Г.А.', verified: true },
  { id: 'DOC-004', name: 'Договор банковского обслуживания', category: 'contract', fileType: 'PDF', fileSize: '1.2 МБ', uploadDate: '2025-03-10', uploadedBy: 'Система', verified: true },
  { id: 'DOC-005', name: 'Договор на выпуск карты Visa Platinum', category: 'contract', fileType: 'PDF', fileSize: '890 КБ', uploadDate: '2025-03-10', uploadedBy: 'Система', verified: true },
  { id: 'DOC-006', name: 'Договор вклада «Надёжный» 12 мес.', category: 'contract', fileType: 'PDF', fileSize: '1.1 МБ', uploadDate: '2025-04-02', uploadedBy: 'Система', verified: true },
  { id: 'DOC-007', name: 'Договор ипотечного кредитования', category: 'contract', fileType: 'DOC', fileSize: '2.3 МБ', uploadDate: '2025-04-15', uploadedBy: 'Система', verified: true },
  { id: 'DOC-008', name: 'Заявка на выпуск карты', category: 'application', fileType: 'PDF', fileSize: '520 КБ', uploadDate: '2025-05-14', uploadedBy: 'Агент: Абдуллаев М.К.', verified: true },
  { id: 'DOC-009', name: 'Заявка на потребительский кредит', category: 'application', fileType: 'PDF', fileSize: '640 КБ', uploadDate: '2025-05-15', uploadedBy: 'Агент: Рахимова Д.У.', verified: false },
  { id: 'DOC-010', name: 'Заявка на изменение лимитов', category: 'application', fileType: 'DOC', fileSize: '310 КБ', uploadDate: '2025-05-15', uploadedBy: 'Агент: Турсунов Б.Р.', verified: false },
  { id: 'DOC-011', name: 'Заявка на перевод счёта', category: 'application', fileType: 'PDF', fileSize: '280 КБ', uploadDate: '2025-05-10', uploadedBy: 'Агент: Абдуллаев М.К.', verified: true },
  { id: 'DOC-012', name: 'Выписка по текущему счёту (март)', category: 'statement', fileType: 'PDF', fileSize: '450 КБ', uploadDate: '2025-04-01', uploadedBy: 'Система', verified: true },
  { id: 'DOC-013', name: 'Выписка по картсчёту (апрель)', category: 'statement', fileType: 'XLS', fileSize: '1.6 МБ', uploadDate: '2025-05-01', uploadedBy: 'Система', verified: true },
  { id: 'DOC-014', name: 'Выписка по депозитному счёту', category: 'statement', fileType: 'PDF', fileSize: '380 КБ', uploadDate: '2025-05-01', uploadedBy: 'Система', verified: true },
  { id: 'DOC-015', name: 'Справка о доходах 2-НДФЛ', category: 'passport', fileType: 'PDF', fileSize: '720 КБ', uploadDate: '2025-05-12', uploadedBy: 'Каримова Г.А.', verified: false },
];

const FILE_TYPE_CONFIG: Record<FileExtension, { label: string; icon: React.ReactNode; colorClass: string; bgClass: string }> = {
  PDF: {
    label: 'PDF',
    icon: <FileText className="size-4" />,
    colorClass: 'text-red-600',
    bgClass: 'bg-red-50',
  },
  DOC: {
    label: 'DOC',
    icon: <File className="size-4" />,
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-50',
  },
  XLS: {
    label: 'XLS',
    icon: <FileSpreadsheet className="size-4" />,
    colorClass: 'text-green-600',
    bgClass: 'bg-green-50',
  },
  IMG: {
    label: 'IMG',
    icon: <ImageIcon className="size-4" />,
    colorClass: 'text-purple-600',
    bgClass: 'bg-purple-50',
  },
};

const CATEGORY_CONFIG: Record<DocumentCategory, { label: string; badgeClass: string }> = {
  passport: { label: 'Паспорт', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  contract: { label: 'Договор', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  application: { label: 'Заявка', badgeClass: 'bg-violet-50 text-violet-700 border-violet-200' },
  statement: { label: 'Выписка', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

function DocumentCard({ doc }: { doc: ClientDocument }) {
  const fileConfig = FILE_TYPE_CONFIG[doc.fileType];
  const categoryConfig = CATEGORY_CONFIG[doc.category];

  return (
    <div className="group rounded-lg border border-border/60 bg-white p-4 shadow-sm hover:shadow-md transition-all hover:border-border">
      <div className="flex items-start gap-3 mb-3">
        {}
        <div
          className={`flex size-10 items-center justify-center rounded-lg shrink-0 ${fileConfig.bgClass} ${fileConfig.colorClass}`}
        >
          {fileConfig.icon}
        </div>

        {}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-foreground truncate leading-tight">
            {doc.name}
          </h4>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 font-medium border ${categoryConfig.badgeClass}`}
            >
              {categoryConfig.label}
            </Badge>
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 font-medium border ${fileConfig.bgClass} ${fileConfig.colorClass}`}
            >
              {fileConfig.label}
            </Badge>
          </div>
        </div>

        {}
        {doc.verified ? (
          <CheckCircle2 className="size-4 text-bank-success shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="size-4 text-bank-warning shrink-0 mt-0.5" />
        )}
      </div>

      {}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1">
          <HardDrive className="size-3" />
          {doc.fileSize}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="size-3" />
          {doc.uploadDate}
        </span>
        <span className="flex items-center gap-1">
          <Upload className="size-3" />
          {doc.uploadedBy}
        </span>
      </div>

      {}
      <div className="flex items-center gap-2 pt-3 border-t border-border/40">
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs flex-1"
          onClick={() => alert(`Предпросмотр: ${doc.name}`)}
        >
          <Eye className="size-3.5" />
          Просмотр
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs flex-1"
          onClick={() => alert(`Скачивание: ${doc.name}`)}
        >
          <Download className="size-3.5" />
          Скачать
        </Button>
      </div>
    </div>
  );
}

function PlaceholderState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
      <div className="flex size-20 items-center justify-center rounded-full bg-bank-active mb-6">
        <FolderOpen className="size-10 text-bank-red" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">
        Документы клиента
      </h3>
      <p className="text-sm max-w-md text-center">
        Введите ID клиента для просмотра загруженных документов и файлов
      </p>
    </div>
  );
}

export default function DocumentsPage() {
  const [clientId, setClientId] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const handleSearch = () => {
    if (!clientId.trim()) return;
    setIsLoaded(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const filteredDocuments = useMemo(() => {
    if (!isLoaded) return [];
    if (activeTab === 'all') return MOCK_DOCUMENTS;
    const tabToCategory: Record<string, DocumentCategory | undefined> = {
      passport: 'passport',
      contract: 'contract',
      application: 'application',
      statement: 'statement',
    };
    const cat = tabToCategory[activeTab];
    if (!cat) return MOCK_DOCUMENTS;
    return MOCK_DOCUMENTS.filter((d) => d.category === cat);
  }, [isLoaded, activeTab]);

  const stats = useMemo(() => {
    const total = MOCK_DOCUMENTS.length;
    const thisMonth = MOCK_DOCUMENTS.filter((d) => {
      const date = new Date(d.uploadDate);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
    const pending = MOCK_DOCUMENTS.filter((d) => !d.verified).length;
    return { total, thisMonth, pending };
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: MOCK_DOCUMENTS.length };
    for (const doc of MOCK_DOCUMENTS) {
      counts[doc.category] = (counts[doc.category] || 0) + 1;
    }
    return counts;
  }, []);

  return (
    <PageContainer
      title="Документы"
      subtitle="Просмотр и управление документами клиентов"
    >
      {}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <Label htmlFor="doc-client-id" className="text-sm font-medium mb-1.5 block">
              ID клиента
            </Label>
            <div className="relative">
              <User className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input
                id="doc-client-id"
                placeholder="CL-1042"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-10 pl-9"
              />
            </div>
          </div>
          <Button
            onClick={handleSearch}
            disabled={!clientId.trim()}
            className="h-10 gap-2 bg-bank-red text-white hover:bg-bank-red/90 shrink-0"
          >
            <Search className="size-4" />
            Найти
          </Button>
        </div>
      </div>

      {!isLoaded ? (
        <PlaceholderState />
      ) : (
        <div className="space-y-6">
          {}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KPICard
              title="Всего документов"
              value={stats.total}
              icon={FolderOpen}
              className="rounded-lg border border-border/60"
            />
            <KPICard
              title="Загружено за месяц"
              value={stats.thisMonth}
              change="+3"
              changeType="positive"
              icon={Upload}
              className="rounded-lg border border-border/60"
            />
            <KPICard
              title="Ожидают верификации"
              value={stats.pending}
              icon={AlertTriangle}
              className="rounded-lg border border-border/60"
            />
          </div>

          <Separator />

          {}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <TabsList className="h-10">
                <TabsTrigger value="all" className="gap-1.5 text-xs sm:text-sm px-3">
                  Все
                  <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1.5 text-[10px]">
                    {categoryCounts.all}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="passport" className="gap-1.5 text-xs sm:text-sm px-3">
                  Паспорт
                  <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1.5 text-[10px]">
                    {categoryCounts.passport || 0}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="contract" className="gap-1.5 text-xs sm:text-sm px-3">
                  Договоры
                  <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1.5 text-[10px]">
                    {categoryCounts.contract || 0}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="application" className="gap-1.5 text-xs sm:text-sm px-3">
                  Заявки
                  <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1.5 text-[10px]">
                    {categoryCounts.application || 0}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="statement" className="gap-1.5 text-xs sm:text-sm px-3">
                  Выписки
                  <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1.5 text-[10px]">
                    {categoryCounts.statement || 0}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="size-4" />
                <span>
                  {filteredDocuments.length}{' '}
                  {filteredDocuments.length === 1
                    ? 'документ'
                    : filteredDocuments.length < 5
                      ? 'документа'
                      : 'документов'}
                </span>
              </div>
            </div>

            {}
            <TabsContent value={activeTab} className="mt-0">
              {filteredDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <FolderOpen className="size-10 mb-3 opacity-40" />
                  <p className="text-sm">Нет документов в данной категории</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredDocuments.map((doc) => (
                    <DocumentCard key={doc.id} doc={doc} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </PageContainer>
  );
}
