'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Clock, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const QUESTION_TYPE_LABELS: Record<string, string> = {
  single_choice: 'Одиночный выбор',
  multiple_choice: 'Множественный выбор',
  text: 'Текстовый ответ',
};

export default function TestsPage() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [test, setTest] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://10.65.10.20:7575';
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  useEffect(() => {
    if (!token) return;
    
    fetch(`${baseURL}/tests/answers/allow`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (r.status === 200) setAllowed(true);
        else setAllowed(false);
      })
      .catch((err) => {
        console.error(err);
        setAllowed(false);
      });
  }, [baseURL, token]);

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
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/worker/tests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Не удалось загрузить тесты');
      
      const data = await res.json();
      setTest(data);
      
      const initial: Record<number, any> = {};
      data.Questions.forEach((q: any) => {
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
        const seconds = data.time_limit * 60;
        setTimeLimit(seconds);
        setTimeLeft(seconds);
      }
    } catch (err: any) {
      toast({
        title: "Ошибка",
        description: err.message || "Не удалось начать тест",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: number, payload: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        ...payload,
      },
    }));
  };

  const isAllAnswered = () => {
    if (!test) return false;
    return test.Questions.every((q: any) => {
      const a = answers[q.ID];
      if (!a) return false;
      if (q.type === 'text') return a.text_answer?.trim() !== '';
      if (q.type === 'single_choice') return a.SelectedOptions.length === 1;
      if (q.type === 'multiple_choice') return a.SelectedOptions.length > 0;
      return false;
    });
  };

  const handleSubmit = async (testData = test) => {
    if (!token || !testData) return;
    
    const payload = testData.Questions.map((q: any) => answers[q.ID]);

    try {
      const res = await fetch(`${baseURL}/tests/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) throw new Error('Ошибка отправки');
      
      toast({
        title: "Успешно!",
        description: "Ответы успешно отправлены.",
      });
      setAllowed(false);
      setTest(null);
    } catch (err) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить ответы",
        variant: "destructive"
      });
    }
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
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto bg-muted rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Тест уже пройден</CardTitle>
            <CardDescription>
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
        <Card className="max-w-xl w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Ежемесячный тест</CardTitle>
            <CardDescription className="text-base mt-2">
              Тест можно пройти только один раз в месяц. 
              <br/><br/>
              <strong>Внимание:</strong> Во время прохождения теста запрещено выходить со страницы или обновлять её — в противном случае все ответы будут утеряны.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={startTest} disabled={loading} size="lg" className="w-full sm:w-auto">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Начать тест
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const currentQuestion = test.Questions[currentQuestionIdx];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 bg-card p-4 rounded-lg border shadow-sm">
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

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Вопрос {currentQuestionIdx + 1} из {test.Questions.length}
            </span>
            <span className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground">
              {QUESTION_TYPE_LABELS[currentQuestion.type] || currentQuestion.type}
            </span>
          </div>
          <CardTitle className="text-xl mt-4 leading-relaxed">
            {currentQuestion.text}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6">
          {currentQuestion.type === 'single_choice' && (
            <RadioGroup
              value={answers[currentQuestion.ID]?.SelectedOptions[0]?.option_id?.toString()}
              onValueChange={(val) => {
                handleAnswer(currentQuestion.ID, {
                  SelectedOptions: [{ option_id: parseInt(val) }]
                });
              }}
              className="space-y-4"
            >
              {currentQuestion.Options.map((opt: any) => (
                <div key={opt.ID} className="flex items-center space-x-3 p-3 rounded-md hover:bg-muted/50 border border-transparent hover:border-border transition-colors">
                  <RadioGroupItem value={opt.ID.toString()} id={`opt-${opt.ID}`} />
                  <Label htmlFor={`opt-${opt.ID}`} className="flex-1 cursor-pointer text-base leading-relaxed">
                    {opt.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {currentQuestion.type === 'multiple_choice' && (
            <div className="space-y-4">
              {currentQuestion.Options.map((opt: any) => {
                const currentSelections = answers[currentQuestion.ID]?.SelectedOptions || [];
                const isChecked = currentSelections.some((o: any) => o.option_id === opt.ID);
                
                return (
                  <div key={opt.ID} className="flex items-center space-x-3 p-3 rounded-md hover:bg-muted/50 border border-transparent hover:border-border transition-colors">
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
                    />
                    <Label htmlFor={`opt-${opt.ID}`} className="flex-1 cursor-pointer text-base leading-relaxed">
                      {opt.text}
                    </Label>
                  </div>
                );
              })}
            </div>
          )}

          {currentQuestion.type === 'text' && (
            <div className="mt-2">
              <Textarea 
                placeholder="Введите ваш ответ здесь..."
                className="min-h-[150px] text-base resize-none"
                value={answers[currentQuestion.ID]?.text_answer || ''}
                onChange={(e) => handleAnswer(currentQuestion.ID, { text_answer: e.target.value })}
              />
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t p-4 flex justify-between bg-muted/10">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIdx === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" /> Назад
          </Button>
          
          {currentQuestionIdx < test.Questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestionIdx(prev => Math.min(test.Questions.length - 1, prev + 1))}
            >
              Дальше <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => handleSubmit()}
              disabled={!isAllAnswered()}
              className="bg-primary hover:bg-primary/90"
            >
              Отправить ответы
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
