'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { KPICard } from '@/components/banking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  Clock,
  FileQuestion,
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Shield,
  CreditCard,
  Landmark,
  Lock,
  ChevronRight,
  Timer,
  Target,
  BarChart3,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────

interface TestQuestion {
  id: number;
  text: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
}

interface TestData {
  id: string;
  title: string;
  description: string;
  category: string;
  questionCount: number;
  timeLimitMinutes: number;
  icon: React.ElementType;
  iconColor: string;
  questions: TestQuestion[];
}

type TestState = 'idle' | 'taking' | 'completed';

interface TestResult {
  testId: string;
  testTitle: string;
  score: number;
  total: number;
  correct: number;
  incorrect: number;
  passed: boolean;
  timeTaken: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────

const mockTests: TestData[] = [
  {
    id: 'test-1',
    title: 'Банковские продукты',
    description: 'Тест по знанию банковских продуктов и услуг: вклады, карты, переводы и страхование.',
    category: 'Продукты',
    questionCount: 5,
    timeLimitMinutes: 10,
    icon: Landmark,
    iconColor: 'text-bank-red',
    questions: [
      {
        id: 1,
        text: 'Какой минимальный срок вклада «Надёжный»?',
        options: [
          { id: 'a', text: '1 месяц' },
          { id: 'b', text: '3 месяца' },
          { id: 'c', text: '6 месяцев' },
          { id: 'd', text: '12 месяцев' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 2,
        text: 'Какая годовая ставка по дебетовой карте Visa Platinum?',
        options: [
          { id: 'a', text: '0%' },
          { id: 'b', text: '2,5%' },
          { id: 'c', text: '5%' },
          { id: 'd', text: '10%' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 3,
        text: 'Что такое кешбэк?',
        options: [
          { id: 'a', text: 'Штраф за снятие наличных' },
          { id: 'b', text: 'Возврат части суммы покупок' },
          { id: 'c', text: 'Процент по вкладу' },
          { id: 'd', text: 'Комиссия за перевод' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 4,
        text: 'Какой документ не требуется для оформления вклада?',
        options: [
          { id: 'a', text: 'Удостоверение личности' },
          { id: 'b', text: 'ИНН' },
          { id: 'c', text: 'СНИЛС' },
          { id: 'd', text: 'Справка о доходах' },
        ],
        correctOptionId: 'd',
      },
      {
        id: 5,
        text: 'Какой лимит снятия наличных по Visa Gold за сутки?',
        options: [
          { id: 'a', text: '500 000 ₸' },
          { id: 'b', text: '1 000 000 ₸' },
          { id: 'c', text: '2 000 000 ₸' },
          { id: 'd', text: '5 000 000 ₸' },
        ],
        correctOptionId: 'b',
      },
    ],
  },
  {
    id: 'test-2',
    title: 'KYC / AML',
    description: 'Комплаенс и противодействие отмыванию денег: идентификация клиентов, PIT/KYT, отчётность.',
    category: 'Комплаенс',
    questionCount: 5,
    timeLimitMinutes: 10,
    icon: Shield,
    iconColor: 'text-bank-warning',
    questions: [
      {
        id: 1,
        text: 'Что означает аббревиатура KYC?',
        options: [
          { id: 'a', text: 'Know Your Client' },
          { id: 'b', text: 'Keep Your Cash' },
          { id: 'c', text: 'Key Year Control' },
          { id: 'd', text: 'Know Your Code' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 2,
        text: 'Что такое PIT в контексте AML?',
        options: [
          { id: 'a', text: 'Проверка истории транзакций' },
          { id: 'b', text: 'Политика идентификации клиента' },
          { id: 'c', text: 'Программа информационного обмена' },
          { id: 'd', text: 'Процедура внутреннего контроля' },
        ],
        correctOptionId: 'a',
      },
      {
        id: 3,
        text: 'Какой порог суммы для обязательной PIT-проверки?',
        options: [
          { id: 'a', text: '500 000 ₸' },
          { id: 'b', text: '2 000 000 ₸' },
          { id: 'c', text: '5 000 000 ₸' },
          { id: 'd', text: '10 000 000 ₸' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 4,
        text: 'Когда необходимо обновлять KYC-данные клиента?',
        options: [
          { id: 'a', text: 'Каждые 6 месяцев' },
          { id: 'b', text: 'При каждой операции' },
          { id: 'c', text: 'При существенном изменении данных или по запросу' },
          { id: 'd', text: 'Только при закрытии счёта' },
        ],
        correctOptionId: 'c',
      },
      {
        id: 5,
        text: 'Что необходимо сделать при подозрении на отмывание денег?',
        options: [
          { id: 'a', text: 'Закрыть счёт клиента немедленно' },
          { id: 'b', text: 'Сообщить в FIU и задокументировать' },
          { id: 'c', text: 'Вернуть деньги отправителю' },
          { id: 'd', text: 'Уведомить клиента о подозрении' },
        ],
        correctOptionId: 'b',
      },
    ],
  },
  {
    id: 'test-3',
    title: 'Кредитование',
    description: 'Тест по кредитным продуктам: автокредиты, ипотека, потребкредиты, скоринг и оценка.',
    category: 'Кредиты',
    questionCount: 5,
    timeLimitMinutes: 10,
    icon: CreditCard,
    iconColor: 'text-bank-info',
    questions: [
      {
        id: 1,
        text: 'Что такое скоринг заёмщика?',
        options: [
          { id: 'a', text: 'Оценка финансового состояния банком' },
          { id: 'b', text: 'Балльная система оценки кредитоспособности' },
          { id: 'c', text: 'Проверка кредитной истории' },
          { id: 'd', text: 'Определение процентной ставки' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 2,
        text: 'Какой максимальный срок ипотечного кредита?',
        options: [
          { id: 'a', text: '10 лет' },
          { id: 'b', text: '15 лет' },
          { id: 'c', text: '20 лет' },
          { id: 'd', text: '25 лет' },
        ],
        correctOptionId: 'd',
      },
      {
        id: 3,
        text: 'Что такое аннуитетный платёж?',
        options: [
          { id: 'a', text: 'Платёж, уменьшающийся каждый месяц' },
          { id: 'b', text: 'Равный платёж на протяжении всего срока' },
          { id: 'c', text: 'Разовый платёж в конце срока' },
          { id: 'd', text: 'Платёж только по процентам' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 4,
        text: 'Какой первоначальный взнос минимально для ипотеки?',
        options: [
          { id: 'a', text: '5%' },
          { id: 'b', text: '10%' },
          { id: 'c', text: '15%' },
          { id: 'd', text: '20%' },
        ],
        correctOptionId: 'c',
      },
      {
        id: 5,
        text: 'Что происходит при просрочке платежа более 90 дней?',
        options: [
          { id: 'a', text: 'Начисляется штраф 0,1%' },
          { id: 'b', text: 'Кредит классифицируется как проблемный' },
          { id: 'c', text: 'Автоматически продлевается срок' },
          { id: 'd', text: 'Процентная ставка снижается' },
        ],
        correctOptionId: 'b',
      },
    ],
  },
  {
    id: 'test-4',
    title: 'Карточные операции',
    description: 'Операции с банковскими картами: эмиссия, перевыпуск, блокировка, диспуты и chargeback.',
    category: 'Карты',
    questionCount: 5,
    timeLimitMinutes: 10,
    icon: CreditCard,
    iconColor: 'text-bank-success',
    questions: [
      {
        id: 1,
        text: 'В какой срок осуществляется перевыпуск карты?',
        options: [
          { id: 'a', text: '1–2 рабочих дня' },
          { id: 'b', text: '3–5 рабочих дней' },
          { id: 'c', text: '7–10 рабочих дней' },
          { id: 'd', text: '14 рабочих дней' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 2,
        text: 'Что такое chargeback?',
        options: [
          { id: 'a', text: 'Бонус за покупки по карте' },
          { id: 'b', text: 'Возврат средств при оспаривании транзакции' },
          { id: 'c', text: 'Комиссия за обслуживание карты' },
          { id: 'd', text: 'Штраф за превышение лимита' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 3,
        text: 'Сколько попыток неверного PIN-кода допускается?',
        options: [
          { id: 'a', text: '2' },
          { id: 'b', text: '3' },
          { id: 'c', text: '5' },
          { id: 'd', text: '10' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 4,
        text: 'Какая международная платёжная система поддерживает 3D Secure?',
        options: [
          { id: 'a', text: 'Только Visa' },
          { id: 'b', text: 'Только Mastercard' },
          { id: 'c', text: 'Visa и Mastercard' },
          { id: 'd', text: 'Ни одна' },
        ],
        correctOptionId: 'c',
      },
      {
        id: 5,
        text: 'Что делать клиенту при утере карты?',
        options: [
          { id: 'a', text: 'Подождать 24 часа' },
          { id: 'b', text: 'Незамедлительно заблокировать карту через колл-центр' },
          { id: 'c', text: 'Написать заявление в офисе' },
          { id: 'd', text: 'Подождать автоматической блокировки' },
        ],
        correctOptionId: 'b',
      },
    ],
  },
  {
    id: 'test-5',
    title: 'Безопасность',
    description: 'Информационная безопасность в банке: фишинг, пароли, защита данных, внутренний контроль.',
    category: 'Безопасность',
    questionCount: 5,
    timeLimitMinutes: 10,
    icon: Lock,
    iconColor: 'text-bank-coal',
    questions: [
      {
        id: 1,
        text: 'Что такое фишинг?',
        options: [
          { id: 'a', text: 'Вид антивирусного ПО' },
          { id: 'b', text: 'Мошенничество с использованием поддельных сайтов и писем' },
          { id: 'c', text: 'Метод шифрования данных' },
          { id: 'd', text: 'Система резервного копирования' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 2,
        text: 'Как часто необходимо менять пароль сотруднику банка?',
        options: [
          { id: 'a', text: 'Раз в год' },
          { id: 'b', text: 'Раз в 90 дней' },
          { id: 'c', text: 'Раз в 30 дней' },
          { id: 'd', text: 'Каждый день' },
        ],
        correctOptionId: 'b',
      },
      {
        id: 3,
        text: 'Что такое двухфакторная аутентификация (2FA)?',
        options: [
          { id: 'a', text: 'Два пароля для входа' },
          { id: 'b', text: 'Вход с двух устройств одновременно' },
          { id: 'c', text: 'Дополнительная проверка через SMS или токен' },
          { id: 'd', text: 'Дублирование сессии' },
        ],
        correctOptionId: 'c',
      },
      {
        id: 4,
        text: 'Можно ли передавать пароль клиента третьим лицам?',
        options: [
          { id: 'a', text: 'Да, при наличии доверенности' },
          { id: 'b', text: 'Да, с разрешения руководителя' },
          { id: 'c', text: 'Нет, категорически запрещено' },
          { id: 'd', text: 'Да, в экстренных случаях' },
        ],
        correctOptionId: 'c',
      },
      {
        id: 5,
        text: 'Что делать при обнаружении подозрительной активности в системе?',
        options: [
          { id: 'a', text: 'Попробовать исправить самостоятельно' },
          { id: 'b', text: 'Немедленно сообщить службе ИБ' },
          { id: 'c', text: 'Записать и продолжить работу' },
          { id: 'd', text: 'Перезагрузить компьютер' },
        ],
        correctOptionId: 'b',
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    'Продукты': 'bg-bank-red/10 text-bank-red border-bank-red/20',
    'Комплаенс': 'bg-bank-warning/10 text-bank-warning border-bank-warning/20',
    'Кредиты': 'bg-bank-info/10 text-bank-info border-bank-info/20',
    'Карты': 'bg-bank-success/10 text-bank-success border-bank-success/20',
    'Безопасность': 'bg-bank-coal/10 text-bank-coal border-bank-coal/20',
  };
  return map[category] ?? 'bg-muted text-muted-foreground border-border/60';
}

// ─── Tests List (idle state) ─────────────────────────────────────────

function TestsList({ onStart }: { onStart: (test: TestData) => void }) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-bank-coal">Доступные тесты</h2>
        <p className="text-sm text-muted-foreground">
          Выберите тест для проверки знаний. Результаты сохраняются автоматически.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {mockTests.map((test) => {
          const Icon = test.icon;
          return (
            <Card
              key={test.id}
              className="group cursor-pointer border border-border/60 bg-white shadow-sm transition-all hover:border-bank-red/30 hover:shadow-md"
              onClick={() => onStart(test)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-bank-active">
                    <Icon className={cn('size-5', test.iconColor)} />
                  </div>
                  <Badge
                    variant="outline"
                    className={cn('text-xs font-medium border', getCategoryColor(test.category))}
                  >
                    {test.category}
                  </Badge>
                </div>
                <CardTitle className="mt-3 text-base">{test.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                  {test.description}
                </p>
                <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <FileQuestion className="size-3.5" />
                    <span>{test.questionCount} вопросов</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    <span>{test.timeLimitMinutes} мин</span>
                  </div>
                </div>
                <Button className="w-full bg-bank-red text-white hover:bg-bank-red/90">
                  Начать тест
                  <ChevronRight className="ml-1 size-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── Test Taking Interface ────────────────────────────────────────────

function TestTaking({
  test,
  onFinish,
}: {
  test: TestData;
  onFinish: (result: TestResult) => void;
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(test.timeLimitMinutes * 60);
  const startTimeRef = useRef<number>(Date.now());

  const questions = test.questions;
  const question = questions[currentQuestion];
  const progressPercent = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const allAnswered = Object.keys(answers).length === questions.length;

  const handleSubmit = useCallback(() => {
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const correct = questions.reduce((count, q) => {
      if (answers[q.id] === q.correctOptionId) count++;
      return count;
    }, 0);
    const incorrect = questions.length - correct;
    const score = Math.round((correct / questions.length) * 100);

    onFinish({
      testId: test.id,
      testTitle: test.title,
      score,
      total: questions.length,
      correct,
      incorrect,
      passed: score >= 70,
      timeTaken: formatTime(elapsed),
    });
  }, [answers, questions, test.id, test.title, onFinish]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, handleSubmit]);

  const isTimeLow = timeLeft < 60;

  return (
    <div>
      {/* Top bar: Timer + Progress */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-bank-coal">{test.title}</h2>
          <p className="text-sm text-muted-foreground">
            Вопрос {currentQuestion + 1} из {questions.length}
          </p>
        </div>

        <div
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-mono font-bold',
            isTimeLow
              ? 'bg-bank-red/10 text-bank-red'
              : 'bg-bank-coal/5 text-bank-coal'
          )}
        >
          <Timer className={cn('size-4', isTimeLow && 'animate-pulse')} />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress bar */}
      <Progress value={progressPercent} className="mb-6 h-2" />
      <div className="mb-6 flex justify-between text-xs text-muted-foreground">
        <span>Прогресс</span>
        <span>{Math.round(progressPercent)}%</span>
      </div>

      {/* Question Card */}
      <Card className="mb-6 border border-border/60 shadow-sm">
        <CardContent className="p-6">
          <div className="mb-5 flex items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-bank-active text-sm font-bold text-bank-red">
              {currentQuestion + 1}
            </span>
            <p className="text-base font-medium leading-relaxed">{question.text}</p>
          </div>

          <RadioGroup
            value={answers[question.id] ?? ''}
            onValueChange={handleSelectAnswer}
            className="space-y-3"
          >
            {question.options.map((option) => {
              const isSelected = answers[question.id] === option.id;
              return (
                <Label
                  key={option.id}
                  htmlFor={`option-${option.id}`}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all',
                    isSelected
                      ? 'border-bank-red bg-bank-active shadow-sm'
                      : 'border-border/60 hover:border-bank-red/30 hover:bg-muted/50'
                  )}
                >
                  <RadioGroupItem
                    value={option.id}
                    id={`option-${option.id}`}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors',
                      isSelected
                        ? 'border-bank-red bg-bank-red text-white'
                        : 'border-border/60 text-muted-foreground'
                    )}
                  >
                    {option.id.toUpperCase()}
                  </span>
                  <span className="text-sm">{option.text}</span>
                </Label>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
        >
          <ArrowLeft className="mr-1 size-4" />
          Назад
        </Button>

        {isLastQuestion ? (
          <Button
            className="bg-bank-red text-white hover:bg-bank-red/90"
            onClick={handleSubmit}
          >
            Завершить тест
          </Button>
        ) : (
          <Button
            className="bg-bank-red text-white hover:bg-bank-red/90"
            onClick={() => setCurrentQuestion((prev) => prev + 1)}
          >
            Далее
            <ArrowRight className="ml-1 size-4" />
          </Button>
        )}
      </div>

      {/* Question dots */}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {questions.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => setCurrentQuestion(idx)}
            className={cn(
              'flex size-8 items-center justify-center rounded-full text-xs font-medium transition-colors',
              idx === currentQuestion
                ? 'bg-bank-red text-white'
                : answers[q.id]
                  ? 'bg-bank-success/15 text-bank-success border border-bank-success/30'
                  : 'bg-muted text-muted-foreground border border-border/60 hover:bg-muted/80'
            )}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Results View ─────────────────────────────────────────────────────

function ResultsView({
  result,
  onReset,
}: {
  result: TestResult;
  onReset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg">
      {/* Result header */}
      <div className="mb-6 text-center">
        <div
          className={cn(
            'mx-auto mb-4 flex size-20 items-center justify-center rounded-full',
            result.passed ? 'bg-bank-success/10' : 'bg-bank-red/10'
          )}
        >
          {result.passed ? (
            <Trophy className="size-10 text-bank-success" />
          ) : (
            <XCircle className="size-10 text-bank-red" />
          )}
        </div>
        <h2 className="text-xl font-bold text-bank-coal">
          {result.passed ? 'Тест пройден!' : 'Тест не пройден'}
        </h2>
        <p className="text-sm text-muted-foreground">{result.testTitle}</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-4 text-center">
            <Target className="mx-auto mb-2 size-5 text-bank-info" />
            <p className="text-2xl font-bold text-foreground">{result.score}%</p>
            <p className="text-xs text-muted-foreground">Результат</p>
          </CardContent>
        </Card>
        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-4 text-center">
            <Timer className="mx-auto mb-2 size-5 text-bank-warning" />
            <p className="text-2xl font-bold text-foreground">{result.timeTaken}</p>
            <p className="text-xs text-muted-foreground">Затраченное время</p>
          </CardContent>
        </Card>
        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="mx-auto mb-2 size-5 text-bank-success" />
            <p className="text-2xl font-bold text-bank-success">{result.correct}</p>
            <p className="text-xs text-muted-foreground">Правильных</p>
          </CardContent>
        </Card>
        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-4 text-center">
            <XCircle className="mx-auto mb-2 size-5 text-bank-red" />
            <p className="text-2xl font-bold text-bank-red">{result.incorrect}</p>
            <p className="text-xs text-muted-foreground">Неправильных</p>
          </CardContent>
        </Card>
      </div>

      {/* Pass / Fail badge */}
      <div className="mb-6 flex items-center justify-center">
        <Badge
          className={cn(
            'px-4 py-1.5 text-sm font-semibold',
            result.passed
              ? 'bg-bank-success/15 text-bank-success border-bank-success/30'
              : 'bg-bank-red/15 text-bank-red border-bank-red/30'
          )}
          variant="outline"
        >
          {result.passed ? '✓ Сдано (≥70%)' : '✗ Не сдано (<70%)'}
        </Badge>
      </div>

      <div className="text-center">
        <Button variant="outline" onClick={onReset}>
          <RotateCcw className="mr-2 size-4" />
          Вернуться к списку тестов
        </Button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────

export default function TestsPage() {
  const [state, setState] = useState<TestState>('idle');
  const [activeTest, setActiveTest] = useState<TestData | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);
  const [completedTests, setCompletedTests] = useState<TestResult[]>([]);

  const handleStartTest = (test: TestData) => {
    setActiveTest(test);
    setState('taking');
  };

  const handleFinish = (testResult: TestResult) => {
    setResult(testResult);
    setCompletedTests((prev) => [...prev, testResult]);
    setState('completed');
  };

  const handleReset = () => {
    setActiveTest(null);
    setResult(null);
    setState('idle');
  };

  const avgScore =
    completedTests.length > 0
      ? Math.round(
          completedTests.reduce((sum, r) => sum + r.score, 0) /
            completedTests.length
        )
      : 0;

  return (
    <PageContainer
      title="Тесты"
      subtitle="Тестирование знаний и аттестация сотрудников"
    >
      {/* KPI row */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <KPICard
          title="Доступных тестов"
          value={mockTests.length}
          icon={BookOpen}
          change={`${completedTests.length} пройдено`}
          changeType="positive"
        />
        <KPICard
          title="Средний балл"
          value={avgScore > 0 ? `${avgScore}%` : '—'}
          icon={BarChart3}
          change={completedTests.length > 0 ? 'Последний результат' : 'Пройдите первый тест'}
          changeType={avgScore >= 70 ? 'positive' : avgScore > 0 ? 'negative' : 'neutral'}
        />
        <KPICard
          title="Успешных попыток"
          value={completedTests.filter((r) => r.passed).length}
          icon={Trophy}
          change={completedTests.length > 0 ? `из ${completedTests.length}` : 'Нет данных'}
          changeType={completedTests.filter((r) => r.passed).length > 0 ? 'positive' : 'neutral'}
        />
      </div>

      {/* Conditional rendering based on state */}
      {state === 'idle' && <TestsList onStart={handleStartTest} />}
      {state === 'taking' && activeTest && (
        <TestTaking test={activeTest} onFinish={handleFinish} />
      )}
      {state === 'completed' && result && (
        <ResultsView result={result} onReset={handleReset} />
      )}
    </PageContainer>
  );
}
