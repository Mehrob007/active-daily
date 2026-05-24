'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Clock, ChevronLeft, ChevronRight, CheckCircle2, GraduationCap, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { testsService } from './services/tests-service';
import OperatorTestsView from './components/OperatorTestsView';
import { PageContainer } from '@/widgets/page-container/PageContainer';

const QUESTION_TYPE_LABELS: Record<string, string> = {
  single_choice: 'Одиночный выбор',
  multiple_choice: 'Множественный выбор',
  text: 'Текстовый ответ',
};

export default function TestsPage() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const [viewMode, setViewMode] = useState<'worker' | 'operator'>('worker');
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [test, setTest] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Check management roles: 5 (Director), 9 (Chairman), 31/32 (Admin)
  const canManage = user?.roleIds?.some(id => [5, 9, 31, 32].includes(id)) || [5, 9, 31, 32].includes(user?.role as number);

  const checkAllowed = useCallback(async () => {
    const isAllowed = await testsService.checkAllowed();
    setAllowed(isAllowed);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      checkAllowed();
      if (canManage) setViewMode('operator');
    }
  }, [isAuthenticated, canManage, checkAllowed]);

  // Timer logic
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || !test) return;
    const intervalId = setInterval(() => {
      setTimeLeft(prev => prev !== null ? prev - 1 : null);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft, test]);

  // Handle timeout
  useEffect(() => {
    if (timeLeft === 0 && test) {
      toast({
        title: "Время вышло!",
        description: "Ваши ответы будут отправлены автоматически.",
        variant: "destructive"
      });
      handleSubmit(test);
    }
  }, [timeLeft, test]);

  const startTest = async () => {
    setLoading(true);
    try {
      const data = await testsService.getWorkerTest();
      setTest(data);
      
      const initial: Record<number, any> = {};
      data.Questions?.forEach((q: any) => {
        initial[q.ID] = {
          test_id: data.ID,
          question_id: q.ID,
          type: q.type,
          text_answer: '',
          SelectedOptions: [],
        };
      });
      
      setAnswers(initial);
      if (data.time_limit) {
        setTimeLeft(data.time_limit * 60);
      }
    } catch (err: any) {
      toast({ title: "Ошибка", description: "Не удалось начать тест", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: number, payload: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], ...payload },
    }));
  };

  const isAllAnswered = () => {
    if (!test) return false;
    return test.Questions?.every((q: any) => {
      const a = answers[q.ID];
      if (!a) return false;
      if (q.type === 'text') return a.text_answer?.trim() !== '';
      if (q.type === 'single_choice') return a.SelectedOptions.length === 1;
      if (q.type === 'multiple_choice') return a.SelectedOptions.length > 0;
      return false;
    });
  };

  const handleSubmit = async (testData = test) => {
    if (!testData) return;
    const payload = testData.Questions?.map((q: any) => answers[q.ID]);
    try {
      await testsService.submitAnswers(payload);
      toast({ title: "Успешно!", description: "Ответы успешно отправлены." });
      setAllowed(false);
      setTest(null);
    } catch (err) {
      toast({ title: "Ошибка", description: "Не удалось отправить ответы", variant: "destructive" });
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (viewMode === 'operator' && canManage) {
    return (
      <PageContainer title="Управление тестами" subtitle="Создание и редактирование ежемесячных тестов">
        <div className="mb-4 flex gap-2">
           <Button variant={viewMode === 'operator' ? 'default' : 'ghost'} onClick={() => setViewMode('operator')} size="sm" className="gap-2">
             <Settings className="size-4" /> Управление
           </Button>
           <Button variant={viewMode === 'worker' ? 'default' : 'ghost'} onClick={() => setViewMode('worker')} size="sm" className="gap-2">
             <GraduationCap className="size-4" /> Пройти тест
           </Button>
        </div>
        <OperatorTestsView />
      </PageContainer>
    );
  }

  if (allowed === null) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (allowed === false) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto bg-emerald-50 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <CardTitle>Тест уже пройден</CardTitle>
            <CardDescription>
              Вы уже проходили тест в этом месяце. Ответить снова можно будет через месяц.
            </CardDescription>
          </CardHeader>
          {canManage && (
            <CardFooter className="justify-center">
              <Button variant="outline" onClick={() => setViewMode('operator')}>Вернуться к управлению</Button>
            </CardFooter>
          )}
        </Card>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="flex h-full items-center justify-center p-6 bg-muted/10">
        <Card className="max-w-xl w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Ежемесячный тест</CardTitle>
            <CardDescription className="text-base mt-2">
              Тест можно пройти только один раз в месяц. 
              <br/><br/>
              <strong>Внимание:</strong> Во время прохождения теста запрещено выходить со страницы или обновлять её — в противном случае все ответы будут утеряны.
            </CardDescription>
          </CardHeader>
          <CardFooter className="gap-2">
            <Button onClick={startTest} disabled={loading} size="lg" className="bg-bank-red hover:bg-bank-red/90">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Начать тест
            </Button>
            {canManage && (
              <Button variant="outline" onClick={() => setViewMode('operator')} size="lg">Управление</Button>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  const currentQuestion = test.Questions?.[currentQuestionIdx];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-xl font-bold">{test.Title}</h2>
          <p className="text-sm text-muted-foreground">{test.description}</p>
        </div>
        {timeLeft !== null && (
          <div className="flex items-center gap-2 text-lg font-mono font-medium bg-primary/10 text-primary px-4 py-2 rounded-md">
            <Clock className="h-5 w-5" />
            <span className={timeLeft < 60 ? "text-destructive animate-pulse" : ""}>
              {formatTime(timeLeft)}
            </span>
          </div>
        )}
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Вопрос {currentQuestionIdx + 1} из {test.Questions?.length || 0}
            </span>
            <Badge variant="outline" className="bg-white">
              {QUESTION_TYPE_LABELS[currentQuestion?.type] || currentQuestion?.type}
            </Badge>
          </div>
          <CardTitle className="text-2xl mt-4 leading-relaxed font-bold text-slate-900">
            {currentQuestion?.text}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-8">
          {currentQuestion?.type === 'single_choice' && (
            <RadioGroup
              value={answers[currentQuestion.ID]?.SelectedOptions[0]?.option_id?.toString()}
              onValueChange={(val) => {
                handleAnswer(currentQuestion.ID, {
                  SelectedOptions: [{ option_id: parseInt(val) }]
                });
              }}
              className="space-y-4"
            >
              {currentQuestion.Options?.map((opt: any) => (
                <div key={opt.ID} className="flex items-center space-x-3 p-4 rounded-xl hover:bg-bank-active border border-slate-100 hover:border-bank-red/20 transition-all">
                  <RadioGroupItem value={opt.ID.toString()} id={`opt-${opt.ID}`} className="border-slate-300 text-bank-red" />
                  <Label htmlFor={`opt-${opt.ID}`} className="flex-1 cursor-pointer text-base font-medium leading-relaxed text-slate-700">
                    {opt.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {currentQuestion?.type === 'multiple_choice' && (
            <div className="space-y-4">
              {currentQuestion.Options?.map((opt: any) => {
                const currentSelections = answers[currentQuestion.ID]?.SelectedOptions || [];
                const isChecked = currentSelections.some((o: any) => o.option_id === opt.ID);
                
                return (
                  <div key={opt.ID} className="flex items-center space-x-3 p-4 rounded-xl hover:bg-bank-active border border-slate-100 hover:border-bank-red/20 transition-all">
                    <Checkbox 
                      id={`opt-${opt.ID}`} 
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        let newSelected;
                        if (checked) {
                          newSelected = [...currentSelections, { option_id: opt.ID }];
                        } else {
                          newSelected = currentSelections.filter((o: any) => o.option_id !== opt.ID);
                        }
                        handleAnswer(currentQuestion.ID, { SelectedOptions: newSelected });
                      }}
                      className="border-slate-300 data-[state=checked]:bg-bank-red"
                    />
                    <Label htmlFor={`opt-${opt.ID}`} className="flex-1 cursor-pointer text-base font-medium leading-relaxed text-slate-700">
                      {opt.text}
                    </Label>
                  </div>
                );
              })}
            </div>
          )}

          {currentQuestion?.type === 'text' && (
            <div className="mt-2">
              <Textarea 
                placeholder="Введите ваш ответ здесь..."
                className="min-h-[200px] text-lg resize-none p-6 border-slate-200 focus:border-bank-red/50 focus:ring-bank-red/20"
                value={answers[currentQuestion.ID]?.text_answer || ''}
                onChange={(e) => handleAnswer(currentQuestion.ID, { text_answer: e.target.value })}
              />
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t p-6 flex justify-between bg-slate-50">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIdx === 0}
            className="px-8"
          >
            <ChevronLeft className="h-5 w-5 mr-2" /> Назад
          </Button>
          
          {currentQuestionIdx < (test.Questions?.length || 0) - 1 ? (
            <Button
              size="lg"
              onClick={() => setCurrentQuestionIdx(prev => Math.min((test.Questions?.length || 0) - 1, prev + 1))}
              className="px-8"
            >
              Дальше <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={() => handleSubmit()}
              disabled={!isAllAnswered()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-10"
            >
              Отправить ответы
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
