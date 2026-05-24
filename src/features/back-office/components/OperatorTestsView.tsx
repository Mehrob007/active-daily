'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  ChevronRight, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  Layout,
  MessageSquare,
  Eye,
  EyeOff,
  Clock,
  MoreVertical,
  User,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { testsService } from '../services/tests-service';
import { Test, Question, Option, UserAnswer } from '../types/tests';
import { toast } from '@/hooks/use-toast';

const QUESTION_TYPE_LABELS: Record<string, string> = {
  single_choice: "Одиночный выбор",
  multiple_choice: "Множественный выбор",
  text: "Текстовый ответ",
};

export default function OperatorTestsView() {
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [testDetail, setTestDetail] = useState<Test | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);

  const [modal, setModal] = useState({
    open: false,
    entity: "" as "test" | "question" | "option",
    mode: "" as "create" | "edit",
    data: null as any,
  });

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    setIsLoading(true);
    try {
      const data = await testsService.getTests();
      setTests(data);
    } catch (err) {
      toast({ title: "Ошибка", description: "Не удалось загрузить тесты", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTestDetail = async (id: number) => {
    try {
      const data = await testsService.getTestDetail(id);
      setTestDetail(data);
    } catch (err) {
      toast({ title: "Ошибка", description: "Не удалось загрузить детали теста", variant: "destructive" });
    }
  };

  const loadAnswers = async (id: number) => {
    try {
      const data = await testsService.getTestAnswers(id);
      setAnswers(data);
    } catch (err) {
      toast({ title: "Ошибка", description: "Не удалось загрузить ответы", variant: "destructive" });
    }
  };

  const openModal = (entity: any, mode: any, data = null) => {
    setModal({ open: true, entity, mode, data });
  };

  const closeModal = () => {
    setModal({ open: false, entity: "test", mode: "create", data: null });
  };

  const handleSave = async (payload: any) => {
    try {
      if (modal.entity === "test") {
        if (modal.mode === "create") await testsService.createTest(payload);
        else await testsService.updateTest(modal.data.ID, payload);
        loadTests();
      } else if (modal.entity === "question") {
        if (modal.mode === "create") await testsService.createQuestion({ ...payload, test_id: selectedTestId! });
        else await testsService.updateQuestion(modal.data.ID, payload);
        loadTestDetail(selectedTestId!);
      } else if (modal.entity === "option") {
        if (modal.mode === "create") await testsService.createOption(payload);
        else await testsService.updateOption(modal.data.ID, payload);
        loadTestDetail(selectedTestId!);
      }
      toast({ title: "Успешно", description: "Данные сохранены" });
      closeModal();
    } catch (err) {
      toast({ title: "Ошибка", description: "Не удалось сохранить данные", variant: "destructive" });
    }
  };

  const handleDelete = async (entity: string, id: number) => {
    if (!confirm("Вы уверены, что хотите удалить этот элемент?")) return;
    try {
      if (entity === "test") {
        await testsService.deleteTest(id);
        loadTests();
        if (selectedTestId === id) {
          setSelectedTestId(null);
          setTestDetail(null);
        }
      } else if (entity === "question") {
        await testsService.deleteQuestion(id);
        loadTestDetail(selectedTestId!);
      } else if (entity === "option") {
        await testsService.deleteOption(id);
        loadTestDetail(selectedTestId!);
      }
      toast({ title: "Успешно", description: "Элемент удален" });
    } catch (err) {
      toast({ title: "Ошибка", description: "Не удалось удалить элемент", variant: "destructive" });
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6 overflow-hidden">
      {/* Sidebar */}
      <Card className="w-80 flex flex-col shrink-0 overflow-hidden border-none shadow-sm bg-muted/20">
        <CardHeader className="px-4 py-4 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Layout className="size-4 text-bank-red" />
            Список тестов
          </CardTitle>
          <Button size="icon" variant="ghost" onClick={() => openModal("test", "create")} className="size-8 rounded-full bg-white shadow-sm hover:bg-bank-active text-bank-red">
            <Plus className="size-4" />
          </Button>
        </CardHeader>
        <Separator />
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {tests.map((t) => (
              <div
                key={t.ID}
                onClick={() => {
                  setSelectedTestId(t.ID);
                  loadTestDetail(t.ID);
                  setShowAnswers(false);
                }}
                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                  t.ID === selectedTestId 
                    ? "bg-white shadow-sm border-l-4 border-l-bank-red" 
                    : "hover:bg-white/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="text-sm font-medium truncate flex-1">{t.Title}</span>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="ghost" className="size-7" onClick={(e) => { e.stopPropagation(); openModal("test", "edit", t); }}>
                    <Pencil className="size-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="size-7 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete("test", t.ID); }}>
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
            ))}
            {!isLoading && tests.length === 0 && (
              <div className="py-10 text-center text-xs text-muted-foreground">Тестов пока нет</div>
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {testDetail ? (
          <ScrollArea className="flex-1">
            <div className="space-y-6 pb-20">
              {/* Test Header */}
              <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-slate-900">{testDetail.Title}</h1>
                    <p className="text-slate-500">{testDetail.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                      if (!showAnswers) loadAnswers(testDetail.ID);
                      setShowAnswers(!showAnswers);
                    }}>
                      {showAnswers ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      {showAnswers ? "Скрыть ответы" : "Результаты"}
                    </Button>
                    <Button size="sm" className="gap-2 bg-bank-red hover:bg-bank-red/90" onClick={() => openModal("question", "create")}>
                      <Plus className="size-4" /> Добавить вопрос
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <Badge variant="secondary" className="gap-1.5 py-1">
                    <HelpCircle className="size-3" /> {testDetail.Questions?.length || 0} вопросов
                  </Badge>
                  <Badge variant="secondary" className="gap-1.5 py-1">
                    <Clock className="size-3" /> {testDetail.time_limit} мин.
                  </Badge>
                </div>
              </div>

              {showAnswers ? (
                /* Answers View */
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 px-1">
                    <User className="size-5 text-bank-red" />
                    Ответы пользователей
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {answers.map((a) => (
                      <Card key={a.ID} className={`overflow-hidden border-l-4 ${a.is_correct_answer ? "border-l-emerald-500" : "border-l-rose-500"}`}>
                        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 bg-muted/10">
                          <div className="flex items-center gap-2">
                            <div className="size-8 rounded-full bg-white flex items-center justify-center border shadow-sm">
                              <User className="size-4 text-slate-500" />
                            </div>
                            <div>
                               <p className="text-xs font-bold leading-none">{a.user?.full_name || a.user_id}</p>
                               <p className="text-[10px] text-muted-foreground">@{a.user?.username}</p>
                            </div>
                          </div>
                          {a.is_correct_answer ? 
                            <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200">Верно</Badge> : 
                            <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-50 border-rose-200">Неверно</Badge>
                          }
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                          <div className="space-y-1">
                             <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Вопрос</p>
                             <p className="text-sm font-medium">{a.question?.text}</p>
                          </div>
                          <Separator className="opacity-50" />
                          <div className="space-y-1">
                             <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Ответ пользователя</p>
                             <p className="text-sm text-slate-700 italic">
                                {a.type === 'text' ? a.text_answer : 
                                 a.type === 'single_choice' ? a.text_answer : 
                                 a.multi_answers?.map(m => (m as any).text).join(', ')}
                             </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {answers.length === 0 && (
                      <div className="col-span-full py-20 text-center bg-white rounded-xl border border-dashed text-muted-foreground">
                        Ответов на этот тест пока нет
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Questions View */
                <div className="space-y-4">
                  {testDetail.Questions?.map((q, qIdx) => (
                    <Card key={q.ID} className="group overflow-hidden">
                      <CardHeader className="py-4 px-6 flex flex-row items-start justify-between space-y-0 bg-muted/5">
                        <div className="space-y-1 pr-10">
                          <div className="flex items-center gap-2">
                             <span className="flex items-center justify-center size-6 rounded-full bg-bank-red text-white text-[10px] font-bold">
                                {qIdx + 1}
                             </span>
                             <Badge variant="outline" className="text-[10px]">{QUESTION_TYPE_LABELS[q.type]}</Badge>
                          </div>
                          <CardTitle className="text-base font-semibold leading-tight pt-1">{q.text}</CardTitle>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 shrink-0">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openModal("question", "edit", q)}>
                              <Pencil className="size-3.5 mr-2" /> Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete("question", q.ID)}>
                              <Trash2 className="size-3.5 mr-2" /> Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardHeader>
                      <CardContent className="px-6 py-4 space-y-4">
                        {/* Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                           {q.Options?.map((o) => (
                             <div key={o.ID} className={`relative flex items-center justify-between p-3 rounded-lg border transition-all ${o.is_correct ? "bg-emerald-50/50 border-emerald-100" : "bg-slate-50/50"}`}>
                                <div className="flex items-center gap-3 pr-8">
                                   {o.is_correct && <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />}
                                   <span className={`text-sm ${o.is_correct ? "font-bold text-emerald-900" : "text-slate-700"}`}>{o.text}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button size="icon" variant="ghost" className="size-7 hover:bg-white" onClick={() => openModal("option", "edit", o)}>
                                    <Pencil className="size-3 text-slate-400" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="size-7 hover:bg-white text-destructive hover:text-destructive" onClick={() => handleDelete("option", o.ID)}>
                                    <Trash2 className="size-3" />
                                  </Button>
                                </div>
                             </div>
                           ))}
                        </div>

                        {q.type === 'text' && q.Options && q.Options[0]?.correct_text && (
                          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                             <div className="text-[10px] uppercase font-bold text-emerald-600 mb-1">Эталонный ответ</div>
                             <div className="text-sm font-bold text-emerald-900">{q.Options[0].correct_text}</div>
                          </div>
                        )}

                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full border border-dashed border-slate-200 hover:border-bank-red/50 hover:bg-bank-active text-muted-foreground hover:text-bank-red h-9"
                          onClick={() => openModal("option", "create", { question_id: q.ID })}
                        >
                          <Plus className="size-3.5 mr-2" /> Добавить вариант
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                  <Button variant="outline" className="w-full h-14 border-dashed border-2 hover:bg-bank-active hover:text-bank-red hover:border-bank-red/50 text-slate-400" onClick={() => openModal("question", "create")}>
                    <Plus className="size-5 mr-2" /> Добавить новый вопрос к тесту
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border border-dashed text-slate-400">
            <Layout className="size-16 mb-4 opacity-10" />
            <h2 className="text-xl font-bold">Выберите тест из списка</h2>
            <p>или создайте новый, нажав на кнопку "+" в сайдбаре</p>
          </div>
        )}
      </div>

      {/* CRUD Modal */}
      <Dialog open={modal.open} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modal.mode === "create" ? "Создание" : "Редактирование"} {
                modal.entity === "test" ? "теста" : modal.entity === "question" ? "вопроса" : "варианта ответа"
              }
            </DialogTitle>
            <DialogDescription>Заполните форму ниже и нажмите сохранить</DialogDescription>
          </DialogHeader>
          <CrudForm entity={modal.entity} mode={modal.mode} initialData={modal.data} onSave={handleSave} onCancel={closeModal} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CrudForm({ entity, mode, initialData, onSave, onCancel }: any) {
  const [form, setForm] = useState<any>(initialData || {});

  useEffect(() => {
    setForm(initialData || {});
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form };
    if (entity === 'question' && payload.time_limit) {
      // In reference project it's multiplied by 60 * 1000
      // but let's see if the backend expects minutes or ms.
      // Usually it's minutes for UI.
    }
    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {entity === "test" && (
        <>
          <div className="space-y-1.5">
            <Label>Название теста</Label>
            <Input required value={form.Title || ""} onChange={e => setForm({...form, Title: e.target.value})} />
          </div>
          <div className="space-y-1.5">
            <Label>Описание</Label>
            <Textarea required value={form.description || ""} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div className="space-y-1.5">
            <Label>Лимит времени (минуты)</Label>
            <Input type="number" value={form.time_limit || ""} onChange={e => setForm({...form, time_limit: parseInt(e.target.value)})} />
          </div>
        </>
      )}

      {entity === "question" && (
        <>
          <div className="space-y-1.5">
            <Label>Текст вопроса</Label>
            <Input required value={form.text || ""} onChange={e => setForm({...form, text: e.target.value})} />
          </div>
          <div className="space-y-1.5">
            <Label>Тип вопроса</Label>
            <Select value={form.type || ""} onValueChange={v => setForm({...form, type: v})}>
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
        </>
      )}

      {entity === "option" && (
        <>
          <div className="space-y-1.5">
            <Label>Текст варианта</Label>
            <Input required value={form.text || ""} onChange={e => setForm({...form, text: e.target.value})} />
          </div>
          {form.question_id && form.type === 'text' ? null : (
            <div className="space-y-1.5">
               <Label>Правильный ответ?</Label>
               <Select value={String(form.is_correct)} onValueChange={v => setForm({...form, is_correct: v === 'true'})}>
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="true">Да</SelectItem>
                   <SelectItem value="false">Нет</SelectItem>
                 </SelectContent>
               </Select>
            </div>
          )}
          {/* For text-type questions sometimes correct_text is used */}
          <div className="space-y-1.5">
            <Label>Эталонный текст (для текстовых вопросов)</Label>
            <Input value={form.correct_text || ""} onChange={e => setForm({...form, correct_text: e.target.value})} />
          </div>
          <input type="hidden" value={form.question_id || ""} />
        </>
      )}

      <DialogFooter className="pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>Отмена</Button>
        <Button type="submit" className="bg-bank-red hover:bg-bank-red/90 text-white">Сохранить</Button>
      </DialogFooter>
    </form>
  );
}
