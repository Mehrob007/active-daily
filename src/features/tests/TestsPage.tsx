'use client';

import React, { useEffect, useState } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Edit, Trash2, CheckCircle2, XCircle, FileText, Settings2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const QUESTION_TYPE_LABELS: Record<string, string> = {
  single_choice: "Одиночный выбор",
  multiple_choice: "Множественный выбор",
  text: "Текстовый ответ",
};

export function TestsPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [testDetail, setTestDetail] = useState<any>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [answers, setAnswers] = useState<any[]>([]);

  const [loadingTests, setLoadingTests] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingAnswers, setLoadingAnswers] = useState(false);

  const [modal, setModal] = useState({
    open: false,
    entity: "",
    mode: "",
    data: null as any,
  });

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoadingTests(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${baseURL}/tests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      setTests(data || []);
    } catch (err) {
      console.warn('Failed to fetch tests', err);
      setTests([{ ID: 1, Title: 'Мок тест', description: 'Описание мок теста' }]);
    } finally {
      setLoadingTests(false);
    }
  };

  const fetchTestDetail = async (id: number) => {
    setLoadingDetail(true);
    setShowAnswers(false);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${baseURL}/tests/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      setTestDetail(data);
    } catch (err) {
      console.warn('Failed to fetch test detail', err);
      setTestDetail({
        ID: id, Title: 'Мок тест', description: 'Описание', Questions: [
          { ID: 101, text: 'Какой цвет неба?', type: 'single_choice', time_limit: 60000, Options: [{ ID: 1001, text: 'Синий', is_correct: true }, { ID: 1002, text: 'Зеленый', is_correct: false }] }
        ]
      });
    } finally {
      setLoadingDetail(false);
    }
  };

  const fetchAnswers = async (testId: number) => {
    setLoadingAnswers(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${baseURL}/tests/answers/${testId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      setAnswers(data || []);
    } catch (err) {
      console.warn('Failed to fetch answers', err);
      setAnswers([]);
    } finally {
      setLoadingAnswers(false);
    }
  };

  const openModal = (entity: string, mode: string, data: any = null) => {
    setModal({ open: true, entity, mode, data });
  };

  const closeModal = () => {
    setModal({ open: false, entity: "", mode: "", data: null });
  };

  const handleSave = async (entity: string, mode: string, payload: any, id: number | null = null) => {
    const token = localStorage.getItem("access_token");
    let method = mode === "create" ? "POST" : "PATCH";
    let url = "";

    if (entity === "test") {
      url = mode === "create" ? `${baseURL}/tests` : `${baseURL}/tests/${id}`;
    } else if (entity === "question") {
      url = mode === "create" ? `${baseURL}/tests/questions/${payload.test_id}` : `${baseURL}/tests/questions/${id}`;
    } else if (entity === "option") {
      url = mode === "create" ? `${baseURL}/tests/questions/options/${payload.question_id}` : `${baseURL}/tests/questions/options/${id}`;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) throw new Error('Ошибка сохранения');
      
      toast.success('Успешно сохранено');
      closeModal();
      
      if (entity === "test") {
        fetchTests();
      } else if (selectedTestId) {
        fetchTestDetail(selectedTestId);
      }
    } catch (error) {
      toast.error('Произошла ошибка при сохранении');
    }
  };

  const handleDelete = async (entity: string, id: number) => {
    if (!window.confirm("Удалить элемент?")) return;

    const token = localStorage.getItem("access_token");
    let url = "";
    if (entity === "test") url = `${baseURL}/tests/${id}`;
    if (entity === "question") url = `${baseURL}/tests/questions/${id}`;
    if (entity === "option") url = `${baseURL}/tests/questions/options/${id}`;

    try {
      const res = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Ошибка удаления');
      
      toast.success('Успешно удалено');
      if (entity === "test") {
        fetchTests();
        if (selectedTestId === id) {
          setSelectedTestId(null);
          setTestDetail(null);
        }
      } else if (selectedTestId) {
        fetchTestDetail(selectedTestId);
      }
    } catch (error) {
      toast.error('Произошла ошибка при удалении');
    }
  };

  return (
    <PageContainer
      title="Управление Тестами"
      description="Конструктор тестов и просмотр ответов пользователей."
    >
      <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-12rem)] min-h-[700px]">
        {/* Левая панель: Список Тестов */}
        <Card className="w-full md:w-80 shrink-0 flex flex-col overflow-hidden">
          <CardHeader className="pb-3 border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Тесты
              </CardTitle>
              <Button size="icon" variant="ghost" onClick={() => openModal("test", "create")} title="Добавить тест">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            {loadingTests ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : tests.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground text-center">Нет доступных тестов</div>
            ) : (
              <div className="flex flex-col p-2 gap-1">
                {tests.map((t) => (
                  <div
                    key={t.ID}
                    onClick={() => {
                      setSelectedTestId(t.ID);
                      fetchTestDetail(t.ID);
                    }}
                    className={cn(
                      "group flex items-center justify-between px-3 py-3 rounded-md text-sm font-medium transition-colors cursor-pointer border",
                      t.ID === selectedTestId 
                        ? "bg-primary text-primary-foreground border-primary" 
                        : "hover:bg-muted text-muted-foreground hover:text-foreground border-transparent bg-card"
                    )}
                  >
                    <span className="truncate flex-1">{t.Title}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); openModal("test", "edit", t); }}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-500" onClick={(e) => { e.stopPropagation(); handleDelete("test", t.ID); }}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Центральная часть: Детали Теста */}
        <Card className="flex-1 flex flex-col overflow-hidden bg-muted/5 border-dashed">
          {loadingDetail ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : !testDetail ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Выберите тест слева
            </div>
          ) : (
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">{testDetail.Title}</h2>
                    <p className="text-muted-foreground mt-1">{testDetail.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => openModal("question", "create", { test_id: testDetail.ID })}>
                      <Plus className="w-4 h-4 mr-2" /> Добавить вопрос
                    </Button>
                    <Button variant={showAnswers ? "secondary" : "default"} onClick={() => {
                      if (!showAnswers) fetchAnswers(testDetail.ID);
                      setShowAnswers(!showAnswers);
                    }}>
                      <Users className="w-4 h-4 mr-2" />
                      {showAnswers ? "Скрыть ответы" : "Показать ответы"}
                    </Button>
                  </div>
                </div>

                {showAnswers ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Ответы пользователей</h3>
                    {loadingAnswers ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : answers.length === 0 ? (
                      <p className="text-muted-foreground">Нет ответов</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {answers.map(a => (
                          <Card key={a.ID} className={cn("border-l-4", a.is_correct_answer ? "border-l-green-500" : "border-l-red-500")}>
                            <CardContent className="p-4 space-y-2">
                              <div className="flex justify-between">
                                <strong className="text-sm">{a.user?.full_name || "Неизвестный"}</strong>
                                <span className="text-xs text-muted-foreground">{QUESTION_TYPE_LABELS[a.type]}</span>
                              </div>
                              <p className="text-sm font-medium">{a.question?.text}</p>
                              
                              {a.type === "single_choice" || a.type === "text" ? (
                                <div className="text-sm">
                                  <p className="text-muted-foreground">Ответ: <span className="text-foreground">{a.text_answer || "Нет"}</span></p>
                                </div>
                              ) : (
                                <div className="text-sm">
                                  <p className="text-muted-foreground">Выбрано:</p>
                                  <ul className="list-disc pl-4 text-foreground">
                                    {a.multi_answers?.map((opt: any) => <li key={opt.ID}>{opt.text}</li>)}
                                  </ul>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {testDetail.Questions?.length === 0 && (
                      <div className="text-center p-8 border rounded-lg border-dashed bg-card">
                        <p className="text-muted-foreground">В этом тесте пока нет вопросов.</p>
                      </div>
                    )}
                    
                    {testDetail.Questions?.map((q: any, i: number) => (
                      <Card key={q.ID} className="relative group">
                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openModal("question", "edit", q)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleDelete("question", q.ID)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex gap-2">
                            <span className="text-muted-foreground">{i + 1}.</span> {q.text}
                          </CardTitle>
                          <CardDescription>
                            Тип: {QUESTION_TYPE_LABELS[q.type]} | Лимит: {q.time_limit ? q.time_limit / 60000 + ' мин' : 'Нет'}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="space-y-3">
                          {/* Опции для выборов */}
                          {["single_choice", "multiple_choice"].includes(q.type) && (
                            <div className="space-y-2">
                              {q.Options?.map((o: any) => (
                                <div key={o.ID} className={cn("flex items-center justify-between p-2 rounded border", o.is_correct ? "bg-green-500/10 border-green-500/50" : "bg-card")}>
                                  <div className="flex items-center gap-2 text-sm">
                                    {o.is_correct ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-muted-foreground" />}
                                    {o.text}
                                  </div>
                                  <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openModal("option", "edit", o)}>
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleDelete("option", o.ID)}>
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                              <Button variant="secondary" size="sm" className="w-full mt-2" onClick={() => openModal("option", "create", { question_id: q.ID })}>
                                <Plus className="w-4 h-4 mr-1" /> Добавить вариант
                              </Button>
                            </div>
                          )}

                          {/* Для текста */}
                          {q.type === "text" && (
                            <div className="space-y-2">
                              {q.Options?.[0]?.correct_text ? (
                                <div className="flex items-center justify-between p-3 rounded border bg-blue-500/5 border-blue-500/20">
                                  <div className="text-sm">
                                    <span className="text-muted-foreground">Правильный ответ:</span> <strong className="text-blue-600">{q.Options[0].correct_text}</strong>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openModal("option", "edit", { ...q.Options[0], question_id: q.ID })}>
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleDelete("option", q.Options[0].ID)}>
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <Button variant="secondary" size="sm" className="w-full" onClick={() => openModal("option", "create", { question_id: q.ID })}>
                                  <Plus className="w-4 h-4 mr-1" /> Добавить правильный ответ
                                </Button>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </Card>
      </div>

      {modal.open && (
        <CrudModal modal={modal} onClose={closeModal} onSave={handleSave} />
      )}
    </PageContainer>
  );
}

function CrudModal({ modal, onClose, onSave }: any) {
  const [form, setForm] = useState(modal.data || {});
  const [errors, setErrors] = useState<any>({});

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let newErrors: any = {};
    if (modal.entity === "test") {
      if (!form.Title || !form.Title.trim()) newErrors.Title = "Обязательно";
      if (!form.description || !form.description.trim()) newErrors.description = "Обязательно";
    }
    if (modal.entity === "question") {
      if (!form.text || !form.text.trim()) newErrors.text = "Обязательно";
      if (!form.type) newErrors.type = "Обязательно";
    }
    if (modal.entity === "option") {
      if (!form.text || !form.text.trim()) newErrors.text = "Обязательно";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const payload = { ...form };
    
    if (modal.entity === "option") {
      payload.is_correct = payload.is_correct === "true" || payload.is_correct === true;
    }
    if (modal.entity === "question" && payload.time_limit) {
      payload.time_limit = Number(payload.time_limit) * 60 * 1000;
    }
    onSave(modal.entity, modal.mode, payload, modal.data?.ID || payload.question_id || payload.test_id);
  };

  const title = modal.mode === "create" ? "Создать" : "Редактировать";
  const entityName = modal.entity === "question" ? "вопрос" : modal.entity === "option" ? "вариант" : "тест";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="font-semibold text-lg">{title} {entityName}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><XCircle className="w-5 h-5"/></button>
        </div>
        <div className="p-6 space-y-4">
          
          {modal.entity === "test" && (
            <>
              <div>
                <label className="text-sm font-medium mb-1 block">Название</label>
                <Input name="Title" value={form.Title || ""} onChange={handleChange} placeholder="Название теста" />
                {errors.Title && <span className="text-xs text-red-500">{errors.Title}</span>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Описание</label>
                <Input name="description" value={form.description || ""} onChange={handleChange} placeholder="Описание теста" />
                {errors.description && <span className="text-xs text-red-500">{errors.description}</span>}
              </div>
            </>
          )}

          {modal.entity === "question" && (
            <>
              <div>
                <label className="text-sm font-medium mb-1 block">Текст вопроса</label>
                <Input name="text" value={form.text || ""} onChange={handleChange} placeholder="Текст вопроса" />
                {errors.text && <span className="text-xs text-red-500">{errors.text}</span>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Лимит времени (минуты)</label>
                <Input name="time_limit" type="number" value={form.time_limit ? form.time_limit / 60000 : form.time_limit || ""} onChange={handleChange} placeholder="Например: 2" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Тип вопроса</label>
                <Select value={form.type || ""} onValueChange={(val) => handleChange({ target: { name: "type", value: val } })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single_choice">Одиночный выбор</SelectItem>
                    <SelectItem value="multiple_choice">Множественный выбор</SelectItem>
                    <SelectItem value="text">Текстовый ответ</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && <span className="text-xs text-red-500">{errors.type}</span>}
              </div>
            </>
          )}

          {modal.entity === "option" && (
            <>
              <div>
                <label className="text-sm font-medium mb-1 block">Текст варианта</label>
                <Input name="text" value={form.text || ""} onChange={handleChange} placeholder="Текст" />
                {errors.text && <span className="text-xs text-red-500">{errors.text}</span>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Правильный текст (для текстовых ответов)</label>
                <Input name="correct_text" value={form.correct_text || ""} onChange={handleChange} placeholder="Только для текстовых вопросов" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Является правильным?</label>
                <Select value={String(form.is_correct)} onValueChange={(val) => handleChange({ target: { name: "is_correct", value: val } })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Нет</SelectItem>
                    <SelectItem value="true">Да</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

        </div>
        <div className="px-6 py-4 border-t bg-muted/20 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleSubmit}>Сохранить</Button>
        </div>
      </div>
    </div>
  );
}
