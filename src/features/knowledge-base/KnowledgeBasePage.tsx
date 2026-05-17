'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function KnowledgeBasePage() {
  const [bases, setBases] = useState<any[]>([]);
  const [selectedBaseId, setSelectedBaseId] = useState<number | null>(null);
  const [baseData, setBaseData] = useState<any>(null);
  
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://10.65.10.20:7575';
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  useEffect(() => {
    if (!token) return;
    fetch(`${baseURL}/knowledge/bases`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.statusText)))
      .then((data) => {
        setBases(data);
        if (data && data.length > 0) {
          setSelectedBaseId(data[0].ID);
        }
      })
      .catch((err) => console.error('Error fetching bases:', err));
  }, [baseURL, token]);

  useEffect(() => {
    if (!selectedBaseId || !token) {
      setBaseData(null);
      return;
    }
    fetch(`${baseURL}/knowledge/bases/${selectedBaseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.statusText)))
      .then(setBaseData)
      .catch((err) => console.error('Error fetching base data:', err));
  }, [selectedBaseId, baseURL, token]);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Sidebar for bases */}
      <aside className="w-64 border-r bg-card">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg">Базы знаний</h3>
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="p-2 space-y-1">
            {bases.map((b) => (
              <button
                key={b.ID}
                onClick={() => setSelectedBaseId(b.ID)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  b.ID === selectedBaseId
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'hover:bg-muted text-muted-foreground'
                }`}
              >
                {b.title}
              </button>
            ))}
            {bases.length === 0 && (
              <p className="text-sm text-muted-foreground p-3">Загрузка...</p>
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {baseData ? (
          <KnowledgeBaseDetail data={baseData} baseURL={baseURL} token={token} />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            {bases.length > 0 ? 'Загрузка данных базы...' : 'Выберите базу знаний'}
          </div>
        )}
      </main>
    </div>
  );
}

function KnowledgeBaseDetail({ data, baseURL, token }: { data: any, baseURL: string, token: string | null }) {
  const [filter, setFilter] = useState('');
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState<number | null>(null);
  
  // Set default selected knowledge
  useEffect(() => {
    if (data?.knowledge?.length > 0 && selectedKnowledgeId === null) {
      setSelectedKnowledgeId(data.knowledge[0].ID);
    }
  }, [data, selectedKnowledgeId]);

  const docs =
    data.knowledge?.find((k: any) => k.ID === selectedKnowledgeId)?.knowledge_docs || [];

  const filteredDocs = filter.trim().length > 0
    ? docs.filter((e: any) => e.title.toLowerCase().includes(filter.toLowerCase()))
    : docs;

  return (
    <div className="flex h-full flex-col">
      <div className="p-6 border-b bg-card">
        <h2 className="text-2xl font-bold mb-4">{data.title}</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {data.knowledge?.map((item: any) => (
            <Card
              key={item.ID}
              className={`min-w-[250px] cursor-pointer transition-all ${
                item.ID === selectedKnowledgeId ? 'border-primary shadow-sm' : 'hover:border-primary/50'
              }`}
              onClick={() => setSelectedKnowledgeId(item.ID)}
            >
              <CardHeader className="p-4">
                <CardTitle className="text-sm">{item.title}</CardTitle>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Docs list */}
        <div className="w-80 border-r bg-card flex flex-col">
          <div className="p-4 border-b">
            <Input
              placeholder="Поиск документов..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full"
            />
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              <KnowledgeDocsList docs={filteredDocs} baseURL={baseURL} token={token} />
            </div>
          </ScrollArea>
        </div>

        {/* Selected doc viewer */}
        <div className="flex-1 bg-muted/20" id="pdf-viewer-container">
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Выберите документ из списка для просмотра
          </div>
        </div>
      </div>
    </div>
  );
}

function KnowledgeDocsList({ docs, baseURL, token }: { docs: any[], baseURL: string, token: string | null }) {
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);

  const handleDownload = async (doc: any, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const url = `${baseURL}/${doc.file_path.replace(/\\/g, '/')}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());

      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = doc.title || 'document.pdf';
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (e: any) {
      alert(`Не удалось скачать файл: ${e.message}`);
    }
  };

  const handleSelectDoc = (doc: any) => {
    setSelectedDocId(doc.ID);
    const url = `${baseURL}/${doc.file_path.replace(/\\/g, '/')}`;
    
    // Using iframe for PDF viewing instead of react-pdf-viewer to reduce dependencies
    const container = document.getElementById('pdf-viewer-container');
    if (container) {
      // Need to fetch and create object URL because it might need auth headers
      fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => res.blob())
      .then(blob => {
        const objectUrl = window.URL.createObjectURL(blob);
        container.innerHTML = `<iframe src="${objectUrl}" class="w-full h-full border-0" title="${doc.title}"></iframe>`;
      })
      .catch(err => {
        container.innerHTML = `<div class="flex h-full items-center justify-center text-destructive">Ошибка загрузки документа: ${err.message}</div>`;
      });
    }
  };

  if (!docs.length) {
    return <div className="p-4 text-center text-sm text-muted-foreground">Документы не найдены</div>;
  }

  return (
    <>
      {docs.map((doc) => (
        <div
          key={doc.ID}
          onClick={() => handleSelectDoc(doc)}
          className={`group flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
            doc.ID === selectedDocId
              ? 'bg-primary/10 text-primary font-medium'
              : 'hover:bg-muted'
          }`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <FileText className="h-5 w-5 flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-sm truncate">{doc.title}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => handleDownload(doc, e)}
            title="Скачать"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </>
  );
}
