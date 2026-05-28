'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Clock, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { testsService } from './services/tests-service';
import { Badge } from '@/components/ui/badge';

const QUESTION_TYPE_LABELS: Record<string, string> = {
  single_choice: 'Одиночный выбор',
  multiple_choice: 'Множественный выбор',
  text: 'Текстовый ответ',
};

interface Option {
  ID: number;
  text: string;
}

interface Question {
  ID: number;
  type: 'single_choice' | 'multiple_choice' | 'text' | string;
  text: string;
  Options?: Option[];
}

interface TestData {
  ID: number;
  Title: string;
  description: string;
  time_limit?: number;
  Questions?: Question[];
}

interface SelectedOption {
  option_id: number;
}

interface Answer {
  test_id: number;
  question_id: number;
  type: string;
  text_answer?: string;
  SelectedOptions: SelectedOption[];
}

export default function TestsPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [test, setTest] = useState<TestData | null>(null);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [loading, setLoading] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const checkAllowed = useCallback(async () => {
    try {
      const isAllowed = await testsService.checkAllowed();
      setAllowed(isAllowed);
    } catch (error) {
      console.error('Failed to check if test is allowed:', error);
      setAllowed(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        checkAllowed();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, checkAllowed]);

  async function handleSubmit(testData: TestData | null = test) {
    if (!testData) return;
    const payload = testData.Questions?.map((q) => answers[q.ID]) || [];
    try {
      await testsService.submitAnswers(payload);
      toast({ title: "Успешно!", description: "Ответы успешно отправлены." });
      setAllowed(false);
      setTest(null);
    } catch (err) {
      toast({ title: "Ошибка", description: "Не удалось отправить ответы", variant: "destructive" });
    }
  }

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || !test) return;
    const intervalId = setInterval(() => {
      setTimeLeft(prev => prev !== null ? prev - 1 : null);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft, test]);

  useEffect(() => {
    if (timeLeft === 0 && test) {
      toast({
        title: "Время вышло!",
        description: "Ваши ответы будут отправлены автоматически.",
        variant: "destructive"
      });
      const timer = setTimeout(() => {
        handleSubmit(test);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, test]);

  const startTest = async () => {
    setLoading(true);
    try {
      const data: TestData = await testsService.getWorkerTest();
      setTest(data);

      const initial: Record<number, Answer> = {};
      data.Questions?.forEach((q) => {
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
    } catch (err) {
      toast({ title: "Ошибка", description: "Не удалось начать тест", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: number, payload: Partial<Answer>) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], ...payload },
    }));
  };

  const isAllAnswered = () => {
    if (!test) return false;
    return test.Questions?.every((q) => {
      const a = answers[q.ID];
      if (!a) return false;
      if (q.type === 'text') return a.text_answer?.trim() !== '';
      if (q.type === 'single_choice') return a.SelectedOptions.length === 1;
      if (q.type === 'multiple_choice') return a.SelectedOptions.length > 0;
      return false;
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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
        <Card className="max-w-md w-full text-center shadow-lg border-none">
          <CardHeader>
            <div className="mx-auto bg-emerald-50 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <CardTitle className="text-xl">Тест уже пройден</CardTitle>
            <CardDescription className="text-base">
              Вы уже проходили тест в этом месяце. Ответить снова можно будет через месяц.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="flex h-full items-center justify-center p-6 bg-muted/10">
        <Card className="max-w-xl w-full shadow-lg border-none overflow-hidden">
          <div className="h-2 bg-bank-red" />
          <CardHeader className="pt-8 px-8">
            <CardTitle className="text-3xl font-bold">Ежемесячный тест</CardTitle>
            <CardDescription className="text-base mt-4 leading-relaxed">
              Тест можно пройти только один раз в месяц. 
              <br/><br/>
              <span className="p-3 rounded-lg bg-rose-50 text-rose-700 block border border-rose-100">
                <strong>Внимание:</strong> Во время прохождения теста запрещено выходить со страницы или обновлять её — в противном случае все ответы будут утеряны.
              </span>
            </CardDescription>
          </CardHeader>
          <CardFooter className="p-8 pt-4">
            <Button onClick={startTest} disabled={loading} size="lg" className="w-full h-14 text-lg bg-bank-red hover:bg-bank-red/90 text-white font-bold shadow-xl shadow-bank-red/20 transition-all active:scale-[0.98]">
              {loading ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : null}
              Начать прохождение теста
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const currentQuestion = test.Questions?.[currentQuestionIdx];

  return (
    <div className="p-4 md:p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 bg-white p-6 rounded-xl border shadow-sm border-slate-100">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">{test?.Title}</h2>
          <p className="text-sm text-slate-500 font-medium">{test?.description}</p>
        </div>
        {timeLeft !== null && (
          <div className="flex items-center gap-3 text-xl font-mono font-bold bg-slate-50 text-slate-900 px-5 py-3 rounded-xl border border-slate-200">
            <Clock className="h-6 w-6 text-bank-red" />
            <span className={timeLeft < 60 ? "text-destructive animate-pulse" : ""}>
              {formatTime(timeLeft)}
            </span>
          </div>
        )}
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden shadow-xl border-none">
        <CardHeader className="bg-slate-50/80 border-b border-slate-100 pt-8 px-8 pb-6">
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-white text-slate-600 border-slate-200 py-1.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
              Вопрос {currentQuestionIdx + 1} из {test?.Questions?.length || 0}
            </Badge>
            <Badge variant="outline" className="bg-white/50 text-bank-red border-bank-red/20">
              {currentQuestion?.type ? QUESTION_TYPE_LABELS[currentQuestion.type] || currentQuestion.type : ''}
            </Badge>
          </div>
          <CardTitle className="text-2xl leading-relaxed font-black text-slate-900">
            {currentQuestion?.text}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-8 bg-white">
          {currentQuestion?.type === 'single_choice' && (
            <RadioGroup
              value={answers[currentQuestion.ID]?.SelectedOptions[0]?.option_id?.toString()}
              onValueChange={(val) => {
                handleAnswer(currentQuestion.ID, {
                  SelectedOptions: [{ option_id: parseInt(val, 10) }]
                });
              }}
              className="space-y-4"
            >
              {currentQuestion.Options?.map((opt) => (
                <div key={opt.ID} className="flex items-center space-x-3 p-5 rounded-2xl hover:bg-bank-active border border-slate-100 hover:border-bank-red/20 transition-all group">
                  <RadioGroupItem value={opt.ID.toString()} id={`opt-${opt.ID}`} className="border-slate-300 text-bank-red size-5" />
                  <Label htmlFor={`opt-${opt.ID}`} className="flex-1 cursor-pointer text-lg font-semibold leading-relaxed text-slate-700 group-hover:text-slate-900">
                    {opt.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {currentQuestion?.type === 'multiple_choice' && (
            <div className="space-y-4">
              {currentQuestion.Options?.map((opt) => {
                const currentSelections = answers[currentQuestion.ID]?.SelectedOptions || [];
                const isChecked = currentSelections.some((o) => o.option_id === opt.ID);

                return (
                  <div key={opt.ID} className="flex items-center space-x-3 p-5 rounded-2xl hover:bg-bank-active border border-slate-100 hover:border-bank-red/20 transition-all group">
                    <Checkbox 
                      id={`opt-${opt.ID}`} 
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        let newSelected;
                        if (checked) {
                          newSelected = [...currentSelections, { option_id: opt.ID }];
                        } else {
                          newSelected = currentSelections.filter((o) => o.option_id !== opt.ID);
                        }
                        handleAnswer(currentQuestion.ID, { SelectedOptions: newSelected });
                      }}
                      className="border-slate-300 data-[state=checked]:bg-bank-red size-6 rounded-md"
                    />
                    <Label htmlFor={`opt-${opt.ID}`} className="flex-1 cursor-pointer text-lg font-semibold leading-relaxed text-slate-700 group-hover:text-slate-900">
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
                className="min-h-[250px] text-xl font-medium resize-none p-8 border-slate-200 focus:border-bank-red/50 focus:ring-bank-red/20 rounded-2xl shadow-inner bg-slate-50/30"
                value={answers[currentQuestion.ID]?.text_answer || ''}
                onChange={(e) => handleAnswer(currentQuestion.ID, { text_answer: e.target.value })}
              />
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t border-slate-100 p-8 flex justify-between bg-slate-50/50">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIdx === 0}
            className="px-10 h-14 text-lg font-bold rounded-xl border-slate-200"
          >
            <ChevronLeft className="h-6 w-6 mr-2" /> Назад
          </Button>

          {currentQuestionIdx < (test.Questions?.length || 0) - 1 ? (
            <Button
              size="lg"
              onClick={() => setCurrentQuestionIdx(prev => Math.min((test.Questions?.length || 0) - 1, prev + 1))}
              className="px-10 h-14 text-lg font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800"
            >
              Дальше <ChevronRight className="h-6 w-6 ml-2" />
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={() => handleSubmit()}
              disabled={!isAllAnswered()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 h-14 text-lg font-bold rounded-xl shadow-xl shadow-emerald-600/20 transition-all active:scale-[0.98]"
            >
              Отправить все ответы
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
