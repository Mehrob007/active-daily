'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit2, Trash2, ChevronRight, Clock, HelpCircle, CheckCircle2, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

// Dummy data
const initialTests = [
  { id: 1, title: 'Аттестация по продуктам', description: 'Обязательный тест для новых сотрудников', active: true },
  { id: 2, title: 'Правила безопасности', description: 'Ежегодный срез знаний по ИБ', active: true },
];

const initialQuestions = {
  1: [
    { 
      id: 101, 
      text: 'Какие продукты входят в базовый пакет?', 
      type: 'multiple_choice',
      time_limit: 120000,
      options: [
        { id: 1001, text: 'Кредитная карта', is_correct: true },
        { id: 1002, text: 'Дебетовая карта', is_correct: true },
        { id: 1003, text: 'Ипотека', is_correct: false },
      ]
    },
    { 
      id: 102, 
      text: 'Максимальный лимит по кредитной карте?', 
      type: 'single_choice',
      time_limit: 60000,
      options: [
        { id: 1004, text: '500 000 ₸', is_correct: false },
        { id: 1005, text: '1 000 000 ₸', is_correct: true },
        { id: 1006, text: '3 000 000 ₸', is_correct: false },
      ]
    }
  ]
};

export function OperatorTestsPage() {
  const [tests, setTests] = useState<any[]>(initialTests);
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  
  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [modalEntity, setModalEntity] = useState<'test' | 'question' | 'option'>('test');
  const [formData, setFormData] = useState<any>({});

  const selectedTest = tests.find(t => t.id === selectedTestId);
  const questions = selectedTestId ? (initialQuestions as any)[selectedTestId] || [] : [];

  const openModal = (entity: 'test' | 'question' | 'option', mode: 'create' | 'edit', data: any = {}) => {
    setModalEntity(entity);
    setModalMode(mode);
    setFormData(data);
    setModalOpen(true);
  };

  const handleSave = () => {
    toast.success(`${modalEntity === 'test' ? 'Тест' : modalEntity === 'question' ? 'Вопрос' : 'Вариант'} успешно сохранен!`);
    setModalOpen(false);
  };

  const handleDelete = (entity: string, id: number) => {
    if (confirm('Вы уверены, что хотите удалить этот элемент?')) {
      toast.success(`${entity} удален.`);
    }
  };

  return (
    <PageContainer
      title="Конструктор тестов"
      subtitle="Управление аттестационными тестами, вопросами и ответами сотрудников"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
        
        {/* Left Panel: Tests List */}
        <Card className="md:col-span-4 flex flex-col h-full">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <CardTitle>Список тестов</CardTitle>
              <Button size="sm" onClick={() => openModal('test', 'create')}>
                <Plus className="h-4 w-4 mr-2" /> Создать
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-2 pb-4">
                {tests.map(test => (
                  <div
                    key={test.id}
                    onClick={() => setSelectedTestId(test.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors border ${selectedTestId === test.id ? 'bg-primary/10 border-primary/50' : 'hover:bg-muted border-transparent'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-sm leading-tight">{test.title}</h4>
                      <div className="flex gap-1 ml-2">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); openModal('test', 'edit', test); }}>
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete('Тест', test.id); }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{test.description}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right Panel: Test Details & Constructor */}
        <Card className="md:col-span-8 flex flex-col h-full">
          {selectedTest ? (
            <>
              <CardHeader className="border-b bg-muted/20 pb-4">
                <CardTitle>{selectedTest.title}</CardTitle>
                <CardDescription>{selectedTest.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden">
                <Tabs defaultValue="constructor" className="h-full flex flex-col">
                  <div className="px-6 py-2 border-b">
                    <TabsList>
                      <TabsTrigger value="constructor">Конструктор вопросов</TabsTrigger>
                      <TabsTrigger value="results">Результаты (Ответы)</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="constructor" className="flex-1 overflow-hidden m-0 data-[state=active]:flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center bg-muted/10">
                      <h3 className="font-medium text-sm">Вопросы теста ({questions.length})</h3>
                      <Button size="sm" onClick={() => openModal('question', 'create', { test_id: selectedTest.id })}>
                        <Plus className="h-4 w-4 mr-2" /> Добавить вопрос
                      </Button>
                    </div>
                    <ScrollArea className="flex-1 p-6">
                      <div className="space-y-6 pb-10">
                        {questions.map((q: any, i: number) => (
                          <div key={q.id} className="border rounded-lg p-4 bg-card shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="font-semibold flex items-center gap-2">
                                  <span className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs">{i + 1}</span>
                                  {q.text}
                                </h4>
                                <div className="flex gap-4 mt-2 text-xs text-muted-foreground ml-8">
                                  <span className="flex items-center gap-1">
                                    <HelpCircle className="h-3 w-3" />
                                    {q.type === 'single_choice' ? 'Одиночный выбор' : q.type === 'multiple_choice' ? 'Множественный выбор' : 'Текст'}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {q.time_limit / 1000} сек
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openModal('question', 'edit', q)}>
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-8 w-8 text-destructive border-destructive/30" onClick={() => handleDelete('Вопрос', q.id)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>

                            <div className="ml-8 pl-4 border-l-2 border-muted space-y-2">
                              {q.options?.map((opt: any) => (
                                <div key={opt.id} className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50 group">
                                  <div className="flex items-center gap-2">
                                    {opt.is_correct ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <div className="h-4 w-4 border rounded-full border-muted-foreground/30" />}
                                    <span className={`text-sm ${opt.is_correct ? 'font-medium' : ''}`}>{opt.text}</span>
                                  </div>
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openModal('option', 'edit', opt)}>
                                      <Edit2 className="h-3 w-3" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete('Вариант', opt.id)}>
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                              <Button variant="ghost" size="sm" className="text-xs mt-2 w-full border border-dashed" onClick={() => openModal('option', 'create', { question_id: q.id })}>
                                <Plus className="h-3 w-3 mr-2" /> Добавить вариант ответа
                              </Button>
                            </div>
                          </div>
                        ))}
                        {questions.length === 0 && (
                          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                            Нет вопросов в этом тесте. Создайте первый вопрос.
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="results" className="flex-1 overflow-hidden m-0 p-6 data-[state=active]:flex flex-col">
                    <div className="text-center py-12 text-muted-foreground">
                      Модуль проверки ответов сотрудников находится в разработке (переносится логика расчета баллов).
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <GraduationCap className="h-16 w-16 mb-4 opacity-20" />
              <p>Выберите тест из списка слева для управления</p>
            </div>
          )}
        </Card>
      </div>

      {/* CRUD Dialogs */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalMode === 'create' ? 'Создать ' : 'Редактировать '}
              {modalEntity === 'test' ? 'тест' : modalEntity === 'question' ? 'вопрос' : 'вариант ответа'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {modalEntity === 'test' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Название теста</label>
                  <Input 
                    value={formData.title || ''} 
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Например: Аттестация 2025"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Описание</label>
                  <Input 
                    value={formData.description || ''} 
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Описание теста..."
                  />
                </div>
              </>
            )}

            {modalEntity === 'question' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Текст вопроса</label>
                  <Input 
                    value={formData.text || ''} 
                    onChange={e => setFormData({ ...formData, text: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Тип вопроса</label>
                    <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single_choice">Одиночный выбор</SelectItem>
                        <SelectItem value="multiple_choice">Множественный выбор</SelectItem>
                        <SelectItem value="text">Текстовый ответ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Время (сек)</label>
                    <Input 
                      type="number"
                      value={formData.time_limit ? formData.time_limit / 1000 : ''} 
                      onChange={e => setFormData({ ...formData, time_limit: Number(e.target.value) * 1000 })}
                    />
                  </div>
                </div>
              </>
            )}

            {modalEntity === 'option' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Текст варианта ответа</label>
                  <Input 
                    value={formData.text || ''} 
                    onChange={e => setFormData({ ...formData, text: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <Checkbox 
                    id="is_correct" 
                    checked={formData.is_correct || false}
                    onCheckedChange={checked => setFormData({ ...formData, is_correct: checked })}
                  />
                  <label htmlFor="is_correct" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Это правильный ответ
                  </label>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Отмена</Button>
            <Button onClick={handleSave}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

// Ensure GraduationCap is exported from lucide-react, if not used already
import { GraduationCap as GradCapIcon } from 'lucide-react';
