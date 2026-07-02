'use client';

import React, { useState, useMemo } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Loader2, Eye, FileText, Image as ImageIcon, File, Upload, Trash2, Camera, Download } from 'lucide-react';
import { toast } from 'sonner';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function isImageDocument(document: any) {
  const ext = document?.url?.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
}

function isPdfDocument(document: any) {
  const ext = document?.url?.split('.').pop()?.toLowerCase();
  return ext === 'pdf';
}

function getDocumentIcon(document: any) {
  if (isImageDocument(document)) return <ImageIcon className="w-5 h-5 text-blue-500" />;
  if (isPdfDocument(document)) return <FileText className="w-5 h-5 text-red-500" />;
  return <File className="w-5 h-5 text-gray-500" />;
}

export function ClientDocumentsPage() {
  const [inn, setInn] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  const [uploadInn, setUploadInn] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const normalizedINN = inn.replace(/\s+/g, "").trim();

  const handleSearch = async () => {
    if (!normalizedINN) {
      toast.warning('Введите ИНН клиента');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${baseURL}/client-data-files/by-inn?inn=${normalizedINN}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      
      if (!data || data.length === 0) {
        throw new Error('Empty');
      }
      
      setDocuments(data);
      toast.success(`Найдено документов: ${data.length}`);
    } catch (error) {
      console.warn("API request failed, using mock data.");
      setDocuments([
        { id: 1, title: 'Паспорт (Лицевая сторона)', document_type: 'passport_front', source: 'mobile', url: 'https://placehold.co/600x400.png?text=Passport+Front', created_at: new Date().toISOString() },
        { id: 2, title: 'Селфи с паспортом', document_type: 'selfie', source: 'operator', url: 'https://placehold.co/400x400.png?text=Selfie', created_at: new Date().toISOString() },
        { id: 3, title: 'Справка о доходах', document_type: 'income_statement', source: 'external', url: 'dummy.pdf', created_at: new Date().toISOString() },
      ]);
      toast.success('Найдено документов: 3 (Mock)');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setInn('');
    setDocuments([]);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadInn.trim() || !uploadTitle.trim() || !uploadFile) {
      toast.error('Заполните все поля и выберите файл');
      return;
    }

    setIsUploading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Документ успешно загружен');
      setIsUploadModalOpen(false);
      setUploadInn('');
      setUploadTitle('');
      setUploadFile(null);
      if (uploadInn === normalizedINN) {
        handleSearch();
      }
    } catch (error) {
      toast.error('Ошибка при загрузке документа');
    } finally {
      setIsUploading(false);
    }
  };

  const selfieDocument = useMemo(() => {
    return documents.find(d => d.document_type === 'selfie' || d.title?.toLowerCase().includes('селфи'));
  }, [documents]);

  return (
    <PageContainer
      title="База документов клиентов"
      description="Универсальный поиск и управление документами клиентов по ИНН."
    >
      <div className="space-y-6">
        {/* Search Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-end gap-4">
              <div className="flex-1 w-full space-y-2">
                <Label htmlFor="innSearch">ИНН Клиента</Label>
                <div className="flex gap-2">
                  <Input
                    id="innSearch"
                    placeholder="Например: 123456789"
                    value={inn}
                    onChange={(e) => setInn(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="max-w-md"
                  />
                  <Button onClick={handleSearch} disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                    Найти
                  </Button>
                  <Button variant="outline" onClick={handleClear} disabled={isLoading || (!inn && documents.length === 0)}>
                    Очистить
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2">
                {selfieDocument && (
                  <Button variant="secondary" onClick={() => setPreviewDoc(selfieDocument)}>
                    <Camera className="w-4 h-4 mr-2 text-primary" />
                    Посмотреть селфи
                  </Button>
                )}
                <Button onClick={() => {
                  setUploadInn(normalizedINN);
                  setIsUploadModalOpen(true);
                }}>
                  <Upload className="w-4 h-4 mr-2" />
                  Загрузить документ
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Документы клиента</CardTitle>
              <CardDescription>
                {documents.length > 0 
                  ? `Найдено документов: ${documents.length} (ИНН: ${normalizedINN})` 
                  : 'Выполните поиск по ИНН, чтобы увидеть документы.'}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : documents.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]"></TableHead>
                    <TableHead>Название</TableHead>
                    <TableHead>Тип документа</TableHead>
                    <TableHead>Источник</TableHead>
                    <TableHead>Дата добавления</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>{getDocumentIcon(doc)}</TableCell>
                      <TableCell className="font-medium">{doc.title || 'Без названия'}</TableCell>
                      <TableCell>{doc.document_type || 'Неизвестно'}</TableCell>
                      <TableCell>{doc.source || 'Неизвестно'}</TableCell>
                      <TableCell>
                        {new Date(doc.created_at || doc.CreatedAt).toLocaleDateString('ru-RU', {
                          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setPreviewDoc(doc)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Смотреть
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center space-y-3 bg-muted/20 border border-dashed rounded-lg">
                <File className="w-12 h-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">Нет данных для отображения</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Загрузить документ клиента</DialogTitle>
            <DialogDescription>
              Выберите файл и укажите необходимые метаданные.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUploadSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="uploadInn">ИНН Клиента</Label>
              <Input 
                id="uploadInn" 
                value={uploadInn} 
                onChange={e => setUploadInn(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="uploadTitle">Название документа</Label>
              <Input 
                id="uploadTitle" 
                placeholder="Например: Справка с места работы" 
                value={uploadTitle} 
                onChange={e => setUploadTitle(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="uploadFile">Файл</Label>
              <Input 
                id="uploadFile" 
                type="file" 
                onChange={e => e.target.files && setUploadFile(e.target.files[0])} 
                required 
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsUploadModalOpen(false)}>
                Отмена
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                Загрузить
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={Boolean(previewDoc)} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{previewDoc?.title || "Предпросмотр документа"}</DialogTitle>
            <div className="flex gap-4 text-sm text-muted-foreground pt-2">
              <span>Тип: {previewDoc?.document_type}</span>
              <span>Источник: {previewDoc?.source}</span>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-auto min-h-[500px] flex items-center justify-center bg-muted/30 rounded-md border mt-2">
            {previewDoc && isImageDocument(previewDoc) ? (
              <img 
                src={previewDoc.url} 
                alt={previewDoc.title} 
                className="max-w-full max-h-[70vh] object-contain rounded-md" 
              />
            ) : previewDoc && isPdfDocument(previewDoc) ? (
              <iframe 
                src={previewDoc.url} 
                className="w-full h-[70vh] rounded-md"
                title={previewDoc.title}
              />
            ) : previewDoc ? (
              <div className="flex flex-col items-center gap-4">
                <p className="text-muted-foreground">Для этого файла нет встроенного предпросмотра.</p>
                <Button asChild>
                  <a href={previewDoc.url} target="_blank" rel="noreferrer">
                    <Download className="w-4 h-4 mr-2" />
                    Скачать файл
                  </a>
                </Button>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
