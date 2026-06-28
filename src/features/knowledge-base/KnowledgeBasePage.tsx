'use client';

import React, { useEffect, useState } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Download, Search, FileText, BookOpen, Loader2, File } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Mock data as fallback
const MOCK_BASES = [
  { ID: 1, title: 'Регламенты работы' },
  { ID: 2, title: 'Инструкции для операторов' },
  { ID: 3, title: 'Документы по кредитам' }
];

const MOCK_BASE_DATA = {
  ID: 1,
  title: 'Регламенты работы',
  knowledge: [
    {
      ID: 101,
      title: 'Общие положения',
      description: 'Основные правила работы в системе',
      knowledge_docs: [
        { ID: 1001, title: 'Правила внутреннего распорядка.pdf', file_path: 'mock/path1.pdf' },
        { ID: 1002, title: 'Инструкция по безопасности.pdf', file_path: 'mock/path2.pdf' }
      ]
    },
    {
      ID: 102,
      title: 'Работа с клиентами',
      description: 'Скрипты и стандарты обслуживания',
      knowledge_docs: [
        { ID: 1003, title: 'Скрипт разговора.pdf', file_path: 'mock/path3.pdf' }
      ]
    }
  ]
};

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export function KnowledgeBasePage() {
  const [bases, setBases] = useState<any[]>([]);
  const [selectedBaseId, setSelectedBaseId] = useState<number | null>(null);
  const [baseData, setBaseData] = useState<any>(null);
  const [loadingBases, setLoadingBases] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  const [filter, setFilter] = useState('');
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState<number | null>(null);
  const [selectedDocUrl, setSelectedDocUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchBases = async () => {
      setLoadingBases(true);
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${baseURL}/knowledge/bases`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        setBases(data);
      } catch (err) {
        console.warn('Failed to fetch bases, using mock data');
        setBases(MOCK_BASES);
      } finally {
        setLoadingBases(false);
      }
    };
    fetchBases();
  }, []);

  useEffect(() => {
    if (bases.length > 0 && !selectedBaseId) {
      setSelectedBaseId(bases[0].ID);
    }
  }, [bases, selectedBaseId]);

  useEffect(() => {
    if (!selectedBaseId) {
      setBaseData(null);
      return;
    }

    const fetchBaseData = async () => {
      setLoadingData(true);
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${baseURL}/knowledge/bases/${selectedBaseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        setBaseData(data);
      } catch (err) {
        console.warn('Failed to fetch base data, using mock data');
        setBaseData(MOCK_BASE_DATA);
      } finally {
        setLoadingData(false);
        setSelectedKnowledgeId(null);
        setSelectedDocUrl(null);
      }
    };
    fetchBaseData();
  }, [selectedBaseId]);

  const handleDownload = async (doc: any, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (doc.file_path.startsWith('mock')) {
        toast.info('Скачивание недоступно для моковых данных');
        return;
      }
      const url = `${baseURL}/${doc.file_path.replace(/\\/g, "/")}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (!res.ok) throw new Error(await res.text());

      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = doc.title || "document.pdf";
      link.click();
      window.URL.revokeObjectURL(link.href);
      toast.success('Файл успешно скачан');
    } catch (e: any) {
      toast.error(`Не удалось скачать файл: ${e.message}`);
    }
  };

  const selectedKnowledge = baseData?.knowledge?.find((k: any) => k.ID === selectedKnowledgeId);
  const docs = selectedKnowledge?.knowledge_docs || [];
  const filteredDocs = filter.trim().length > 0 
    ? docs.filter((e: any) => e.title.toLowerCase().includes(filter.toLowerCase()))
    : docs;

  return (
    <PageContainer
      title="База знаний"
      description="Справочная информация, регламенты и инструкции."
    >
      <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-12rem)] min-h-[600px]">
        {/* Левая панель: Список баз знаний */}
        <Card className="w-full md:w-64 shrink-0 flex flex-col overflow-hidden">
          <CardHeader className="pb-3 border-b bg-muted/30">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Каталоги
            </CardTitle>
          </CardHeader>
          <ScrollArea className="flex-1">
            {loadingBases ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : bases.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground text-center">Нет доступных баз</div>
            ) : (
              <div className="flex flex-col p-2 gap-1">
                {bases.map((b) => (
                  <button
                    key={b.ID}
                    onClick={() => setSelectedBaseId(b.ID)}
                    className={cn(
                      "text-left px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      b.ID === selectedBaseId 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {b.title}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Центральная часть: Разделы и Документы */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          {loadingData ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : !baseData ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Выберите каталог слева
            </div>
          ) : (
            <>
              <CardHeader className="pb-4 border-b">
                <CardTitle>{baseData.title}</CardTitle>
                <div className="relative mt-4">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск документов в выбранном разделе..."
                    className="pl-8"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  />
                </div>
              </CardHeader>

              <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
                
                {/* Список разделов */}
                <div className="w-full lg:w-1/3 border-r flex flex-col overflow-hidden bg-muted/10">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-3">
                      {baseData.knowledge?.map((item: any) => (
                        <div
                          key={item.ID}
                          onClick={() => {
                            setSelectedKnowledgeId(item.ID);
                            setSelectedDocUrl(null);
                          }}
                          className={cn(
                            "p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50",
                            item.ID === selectedKnowledgeId ? "bg-primary/5 border-primary" : "bg-card"
                          )}
                        >
                          <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Список документов */}
                <div className="w-full lg:w-1/3 border-r flex flex-col overflow-hidden">
                  <ScrollArea className="flex-1 p-4">
                    {!selectedKnowledgeId ? (
                      <div className="h-full flex items-center justify-center text-sm text-muted-foreground text-center px-4">
                        Выберите раздел, чтобы увидеть список документов
                      </div>
                    ) : filteredDocs.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                        Документы не найдены
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredDocs.map((doc: any) => {
                          const url = doc.file_path.startsWith('mock') 
                            ? null 
                            : `${baseURL}/${doc.file_path.replace(/\\/g, "/")}`;
                          
                          const isSelected = selectedDocUrl && selectedDocUrl === url;

                          return (
                            <div
                              key={doc.ID}
                              onClick={() => url && setSelectedDocUrl(url)}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors border group",
                                isSelected ? "bg-muted border-primary/50" : "hover:bg-muted/50 border-transparent",
                                !url && "opacity-70 cursor-not-allowed"
                              )}
                            >
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                                <FileText className="w-4 h-4" />
                              </div>
                              <span className="flex-1 text-sm font-medium truncate" title={doc.title}>
                                {doc.title}
                              </span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="opacity-0 group-hover:opacity-100 h-8 w-8 transition-opacity"
                                onClick={(e) => handleDownload(doc, e)}
                                title="Скачать"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </div>

                {/* PDF Viewer */}
                <div className="w-full lg:w-1/3 bg-muted/20 flex flex-col items-center justify-center p-4">
                  {selectedDocUrl ? (
                    <iframe 
                      src={`${selectedDocUrl}#view=FitH`} 
                      className="w-full h-full rounded-md border shadow-sm bg-white"
                      title="PDF Viewer"
                    />
                  ) : (
                    <div className="text-center space-y-3 opacity-60">
                      <File className="w-12 h-12 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Выберите документ для просмотра
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}
