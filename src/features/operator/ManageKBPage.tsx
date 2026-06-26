'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Edit2, Trash2, FileText, Download, Folder } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'; // Adjust based on your setup

export function ManageKBPage() {
  const [bases, setBases] = useState<any[]>([]);
  const [selectedBaseId, setSelectedBaseId] = useState<number | null>(null);
  const [baseData, setBaseData] = useState<any>(null);
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState<number | null>(null);
  const [selectedDocUrl, setSelectedDocUrl] = useState<string | null>(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{ entity: string; data: any; mode: 'create' | 'edit' }>({ entity: '', data: null, mode: 'create' });

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formFile, setFormFile] = useState<File | null>(null);
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';

  useEffect(() => {
    loadBases();
  }, []);

  useEffect(() => {
    if (selectedBaseId) {
      loadBaseData(selectedBaseId);
    } else {
      setBaseData(null);
      setSelectedKnowledgeId(null);
      setSelectedDocUrl(null);
    }
  }, [selectedBaseId]);

  const loadBases = async () => {
    try {
      const res = await fetch(`${baseURL}/knowledge/bases`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Не удалось загрузить базы знаний');
      const data = await res.json();
      setBases(data || []);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const loadBaseData = async (id: number) => {
    try {
      const res = await fetch(`${baseURL}/knowledge/bases/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Не удалось загрузить данные базы');
      const data = await res.json();
      setBaseData(data);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const openModal = (entity: string, mode: 'create' | 'edit', data: any = null) => {
    setModalConfig({ entity, mode, data });
    setFormTitle(data?.title || '');
    setFormDescription(data?.description || '');
    setFormFile(null);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      let endpoint = '';
      let method = modalConfig.mode === 'create' ? 'POST' : 'PATCH';
      let headers: any = { Authorization: `Bearer ${token}` };
      let body: any;

      if (modalConfig.entity === 'base') {
        endpoint = modalConfig.mode === 'create' ? '/knowledge/bases' : `/knowledge/bases/${modalConfig.data.ID}`;
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({ title: formTitle });
      } else if (modalConfig.entity === 'knowledge') {
        endpoint = modalConfig.mode === 'create' ? '/knowledge' : `/knowledge/${modalConfig.data.ID}`;
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({ 
          title: formTitle, 
          description: formDescription,
          knowledge_base_id: selectedBaseId
        });
      } else if (modalConfig.entity === 'doc') {
        endpoint = modalConfig.mode === 'create' ? '/knowledge/docs' : `/knowledge/docs/${modalConfig.data.ID}`;
        const formData = new FormData();
        formData.append('title', formTitle);
        formData.append('knowledge_id', selectedKnowledgeId?.toString() || '');
        if (formFile) {
          formData.append('file', formFile);
        }
        body = formData;
      }

      const res = await fetch(`${baseURL}${endpoint}`, { method, headers, body });
      if (!res.ok) throw new Error('Ошибка сохранения');
      
      toast.success('Успешно сохранено');
      setModalOpen(false);
      
      if (modalConfig.entity === 'base') {
        loadBases();
        if (modalConfig.mode === 'edit' && selectedBaseId === modalConfig.data.ID) {
          loadBaseData(selectedBaseId);
        }
      } else {
        if (selectedBaseId) loadBaseData(selectedBaseId);
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (entity: string, id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот элемент?')) return;
    
    try {
      let endpoint = '';
      if (entity === 'base') endpoint = `/knowledge/bases/${id}`;
      else if (entity === 'knowledge') endpoint = `/knowledge/${id}`;
      else if (entity === 'doc') endpoint = `/knowledge/docs/${id}`;

      const res = await fetch(`${baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Ошибка удаления');
      
      toast.success('Успешно удалено');
      
      if (entity === 'base') {
        if (selectedBaseId === id) setSelectedBaseId(null);
        loadBases();
      } else {
        if (selectedBaseId) loadBaseData(selectedBaseId);
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDownload = async (doc: any) => {
    try {
      const url = `${baseURL}/${doc.file_path.replace(/\\/g, '/')}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Ошибка скачивания файла');
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = doc.title || 'document';
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const selectedKnowledge = baseData?.knowledge?.find((k: any) => k.ID === selectedKnowledgeId);
  const docs = selectedKnowledge?.knowledge_docs || [];

  return (
    <PageContainer title="Управление Базой Знаний" subtitle="Редактирование статей и материалов базы знаний">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-180px)]">
        
        {/* Sidebar for Bases */}
        <Card className="md:col-span-3 flex flex-col h-full overflow-hidden">
          <CardHeader className="pb-4 flex flex-row items-center justify-between space-y-0 px-4">
            <CardTitle className="text-lg">Базы знаний</CardTitle>
            <Button size="icon" variant="ghost" onClick={() => openModal('base', 'create')}>
              <Plus className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="px-2 pb-4 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-1 px-2">
                {bases.map((base) => (
                  <div
                    key={base.ID}
                    onClick={() => setSelectedBaseId(base.ID)}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors group ${
                      selectedBaseId === base.ID ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Folder className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate text-sm font-medium">{base.title}</span>
                    </div>
                    <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${selectedBaseId === base.ID ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                      <button onClick={(e) => { e.stopPropagation(); openModal('base', 'edit', base); }} className="p-1 hover:text-foreground">
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete('base', base.ID); }} className="p-1 hover:text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <Card className="md:col-span-9 flex flex-col h-full overflow-hidden">
          {selectedBaseId && baseData ? (
            <div className="flex flex-col h-full overflow-hidden">
              <CardHeader className="pb-2 border-b flex flex-row items-center justify-between space-y-0 px-6">
                <div>
                  <CardTitle className="text-xl">{baseData.title}</CardTitle>
                  <CardDescription>Статьи и материалы раздела</CardDescription>
                </div>
                <Button onClick={() => openModal('knowledge', 'create')} size="sm">
                  <Plus className="h-4 w-4 mr-2" /> Добавить статью
                </Button>
              </CardHeader>
              <CardContent className="flex-1 p-0 flex flex-col md:flex-row overflow-hidden">
                
                {/* Articles List */}
                <div className="w-full md:w-1/3 border-r flex flex-col h-full bg-muted/20">
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-3">
                      {(baseData.knowledge || []).map((item: any) => (
                        <div
                          key={item.ID}
                          onClick={() => {
                            setSelectedKnowledgeId(item.ID);
                            setSelectedDocUrl(null);
                          }}
                          className={`p-3 rounded-lg border cursor-pointer transition-all group ${
                            selectedKnowledgeId === item.ID ? 'bg-background border-primary shadow-sm' : 'bg-background hover:border-muted-foreground/30'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium text-sm line-clamp-2">{item.title}</h4>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground">
                              <button onClick={(e) => { e.stopPropagation(); openModal('knowledge', 'edit', item); }} className="p-1 hover:text-foreground">
                                <Edit2 className="h-3 w-3" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleDelete('knowledge', item.ID); }} className="p-1 hover:text-destructive">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                          {item.knowledge_docs?.length > 0 && (
                            <div className="mt-2 text-[10px] bg-muted inline-block px-2 py-0.5 rounded-full text-muted-foreground">
                              Документов: {item.knowledge_docs.length}
                            </div>
                          )}
                        </div>
                      ))}
                      {(!baseData.knowledge || baseData.knowledge.length === 0) && (
                        <div className="text-center p-6 text-muted-foreground text-sm">
                          В этой базе нет статей
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                {/* Docs and Viewer */}
                <div className="w-full md:w-2/3 flex flex-col h-full bg-background overflow-hidden">
                  {selectedKnowledgeId ? (
                    <>
                      <div className="p-4 border-b flex justify-between items-center bg-muted/10">
                        <h3 className="font-medium text-sm">Документы статьи</h3>
                        <Button variant="outline" size="sm" onClick={() => openModal('doc', 'create')}>
                          <Plus className="h-3 w-3 mr-1" /> Добавить
                        </Button>
                      </div>
                      <div className="p-4 border-b bg-muted/5 flex gap-2 overflow-x-auto">
                        {docs.length === 0 ? (
                          <div className="text-sm text-muted-foreground py-2">Нет прикрепленных документов</div>
                        ) : (
                          docs.map((doc: any) => {
                            const url = `${baseURL}/${doc.file_path.replace(/\\/g, '/')}`;
                            const isSelected = selectedDocUrl === url;
                            return (
                              <div
                                key={doc.ID}
                                onClick={() => setSelectedDocUrl(url)}
                                className={`flex items-center gap-2 p-2 border rounded-md cursor-pointer whitespace-nowrap group ${
                                  isSelected ? 'border-primary bg-primary/5' : 'bg-background hover:bg-muted/50'
                                }`}
                              >
                                <FileText className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                                <span className="text-sm font-medium truncate max-w-[150px]">{doc.title}</span>
                                <div className="flex items-center ml-2">
                                  <button onClick={(e) => { e.stopPropagation(); openModal('doc', 'edit', doc); }} className="p-1 text-muted-foreground hover:text-foreground">
                                    <Edit2 className="h-3 w-3" />
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); handleDownload(doc); }} className="p-1 text-muted-foreground hover:text-primary">
                                    <Download className="h-3 w-3" />
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); handleDelete('doc', doc.ID); }} className="p-1 text-muted-foreground hover:text-destructive">
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                      <div className="flex-1 bg-muted/10 p-4 overflow-hidden relative">
                        {selectedDocUrl ? (
                          <iframe 
                            src={selectedDocUrl} 
                            className="w-full h-full border rounded-md bg-white"
                            title="Document Viewer"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <FileText className="h-12 w-12 mb-4 opacity-20" />
                            <p>Выберите документ для просмотра</p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
                      <Folder className="h-12 w-12 mb-4 opacity-20" />
                      <p>Выберите статью слева, чтобы увидеть её документы</p>
                    </div>
                  )}
                </div>

              </CardContent>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-12 text-center">
              <Folder className="h-16 w-16 mb-4 opacity-20" />
              <h3 className="text-lg font-medium mb-2 text-foreground">База знаний не выбрана</h3>
              <p>Выберите базу из списка слева или создайте новую</p>
            </div>
          )}
        </Card>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalConfig.mode === 'create' ? 'Создать' : 'Редактировать'} {' '}
              {modalConfig.entity === 'base' ? 'базу знаний' : modalConfig.entity === 'knowledge' ? 'статью' : 'документ'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Название</label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Введите название..." />
            </div>
            
            {modalConfig.entity === 'knowledge' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Описание</label>
                <Textarea 
                  value={formDescription} 
                  onChange={(e) => setFormDescription(e.target.value)} 
                  placeholder="Краткое описание статьи..."
                  rows={4}
                />
              </div>
            )}

            {modalConfig.entity === 'doc' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Файл (PDF)</label>
                <Input 
                  type="file" 
                  accept=".pdf"
                  onChange={(e) => setFormFile(e.target.files?.[0] || null)} 
                />
                {modalConfig.mode === 'edit' && !formFile && (
                  <p className="text-xs text-muted-foreground">Оставьте пустым, если не хотите менять текущий файл</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Отмена</Button>
            <Button onClick={handleSubmit}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
